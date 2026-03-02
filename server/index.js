// Override system DNS to use Google/Cloudflare — fixes ECONNREFUSED on querySrv
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'onefine_secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'onefine';
const MONGODB_URI = process.env.MONGODB_URI;

// ── MongoDB Connection ────────────────────────────────────────────────────────
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing from environment variables!');
}

// Disable buffering globally so queries fail fast if DB is disconnected
mongoose.set('bufferCommands', false);

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Kill connection attempt after 5s
    socketTimeoutMS: 45000,        // Close sockets after 45s of inactivity
  })
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    try {
      await seedDefaults();
    } catch (seedErr) {
      console.error('⚠️ Seeding failed:', seedErr.message);
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.message.includes('buffering timed out') || err.message.includes('selection timed out')) {
      console.error('👉 Suggestion: Check if your MongoDB Atlas IP Whitelist allows all connections (0.0.0.0/0)');
    }
  });

// Monitor connection
mongoose.connection.on('error', err => {
  console.error('🚨 Mongoose connection error event:', err.message || err);
});

async function seedDefaults() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      {
        name: 'Custom Name Insulated Bottle',
        price: 'Rs. 4,950',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Executive Corporate Gift Set',
        price: 'Rs. 12,500',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Premium Desk Essentials Kit',
        price: 'Rs. 9,900',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Luxgear Edition Bottle',
        price: 'Rs. 4,950',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      },
    ]);
    console.log('\uD83C\uDF31 Seeded default products with Luxgear');
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://onefine.lk',
    'https://www.onefine.lk',
    'https://venujageenodh.github.io',
    /\.loca\.lt$/,
  ],
}));
app.use(express.json());

// ── File Upload Setup ─────────────────────────────────────────────────────────
const uploadDir = path.resolve(__dirname, '..', 'uploads');

// Ensure directory exists with better logging
try {
  if (!fs.existsSync(uploadDir)) {
    console.log('📦 Creating uploads directory at:', uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
  } else {
    console.log('✅ Uploads directory found at:', uploadDir);
  }
} catch (e) {
  console.warn('⚠️ Could not create uploads directory (expected on serverless):', e.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Fallback to /tmp on Vercel if root is read-only
    const dest = process.env.VERCEL ? '/tmp/uploads' : uploadDir;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

app.use('/uploads', express.static(uploadDir));

// Also serve /tmp/uploads if on Vercel
if (process.env.VERCEL) {
  app.use('/uploads', express.static('/tmp/uploads'));
}

// ── Auth Middleware ───────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorised' });
  }
  try {
    req.admin = jwt.verify(authHeader.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Auth Routes ───────────────────────────────────────────────────────────────
// GET /api/health (public)
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.json({
    status: 'ok',
    message: 'Backend is running',
    database: dbStatusMap[dbStatus] || 'unknown',
    uri_configured: Boolean(MONGODB_URI),
    uri_preview: MONGODB_URI ? `${MONGODB_URI.substring(0, 15)}...` : 'none',
    time: new Date().toISOString()
  });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  return res.json({ token });
});

// ── Product Routes ────────────────────────────────────────────────────────────
// GET /api/products  (public)
app.get('/api/products', async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products  (protected)
app.post('/api/products', requireAuth, async (req, res) => {
  try {
    const { name, price, rating, image } = req.body;
    const product = await Product.create({ name, price, rating: rating ?? 5, image });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id  (protected)
app.put('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const { name, price, rating, image } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, rating, image },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:id  (protected)
app.delete('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/upload  (protected)
app.post('/api/upload', requireAuth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({ error: `Multer Error: ${err.message}` });
    } else if (err) {
      console.error('❌ Upload error:', err);
      return res.status(500).json({ error: `Server Error: ${err.message}` });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    console.log('✅ File uploaded successfully:', req.file.filename);
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });
});

// Error handling middleware for all routes
app.use((err, req, res, next) => {
  console.error('🚨 Global server error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;
