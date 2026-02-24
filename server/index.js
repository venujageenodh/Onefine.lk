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
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedDefaults();
  })
  .catch((err) => console.error('❌ MongoDB error:', err));

async function seedDefaults() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      {
        name: 'Custom Name Insulated Bottle',
        price: 'Rs. 4,950',
        rating: 5,
        image:
          'https://images.pexels.com/photos/3259629/pexels-photo-3259629.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Executive Corporate Gift Set',
        price: 'Rs. 12,500',
        rating: 5,
        image:
          'https://images.pexels.com/photos/4065405/pexels-photo-4065405.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Premium Desk Essentials Kit',
        price: 'Rs. 9,900',
        rating: 5,
        image:
          'https://images.pexels.com/photos/3787321/pexels-photo-3787321.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
    ]);
    console.log('🌱 Seeded default products');
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://venujageenodh.github.io',
    /\.loca\.lt$/,
  ],
}));
app.use(express.json());

// ── File Upload Setup ─────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({ storage });

app.use('/uploads', express.static(uploadDir));

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
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
