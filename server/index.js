// Allow IPv4 first for generic DNS issues (safe on Vercel)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
// Force Google DNS to bypass potential local ISP/router SRV lookup blocks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('⚠️ Could not set custom DNS servers:', e.message);
}

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const Product = require('./models/Product');
const Order = require('./models/Order');
const Collection = require('./models/Collection');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'onefine_secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'onefine';
const MONGODB_URI = process.env.MONGODB_URI;

// ── MongoDB Connection ────────────────────────────────────────────────────────
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing from environment variables!');
}

// Enable buffering so Mongoose waits for connection before throwing errors
mongoose.set('bufferCommands', true);

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
        collectionSlug: 'luxgear-bottles',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      },
    ]);
    console.log('\uD83C\uDF31 Seeded default products');
  }

  // Seed default collections
  const colCount = await Collection.countDocuments();
  if (colCount === 0) {
    await Collection.insertMany([
      {
        name: 'LUXGEAR Bottles',
        slug: 'luxgear-bottles',
        description: 'Premium double-wall insulated bottles, custom-branded for leading automotive and corporate brands.',
        coverImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
        sortOrder: 1,
      },
      {
        name: 'Tissue Boxes',
        slug: 'tissue-boxes',
        description: 'Premium branded tissue boxes available in multiple brand editions, perfect for corporate gifting.',
        coverImage: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=800&auto=format&fit=crop&q=80',
        sortOrder: 2,
      },
    ]);
    console.log('\u{1F4E6} Seeded default collections');
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
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

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

// ── Cloudinary Configuration ───────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'onefine-products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    public_id: (_req, file) => {
      const safe = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9.\-_]/g, '_');
      return `${Date.now()}-${safe}`;
    },
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // Increased to 25MB
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
    const { name, price, rating, image, isBestSeller } = req.body;
    const product = await Product.create({ name, price, rating: rating ?? 5, image, isBestSeller });
    res.status(201).json(product);
  } catch (err) {
    console.error('❌ Error creating product:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id  (protected)
app.put('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const { name, price, rating, image, isBestSeller, collectionSlug } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, rating, image, isBestSeller, collectionSlug },
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

// ── Collection Routes ─────────────────────────────────────────────────────────

// GET /api/collections  (public)
app.get('/api/collections', async (_req, res) => {
  try {
    const collections = await Collection.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/collections/:slug/products  (public)
app.get('/api/collections/:slug/products', async (req, res) => {
  try {
    const { slug } = req.params;
    // Products with matching collectionSlug OR (legacy) name containing the slug keyword
    const keyword = slug.replace(/-/g, ' ').replace('bottles', '').trim();
    const products = await Product.find({
      $or: [
        { collectionSlug: slug },
        { collectionSlug: '', name: { $regex: keyword, $options: 'i' } },
      ]
    }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections  (admin)
app.post('/api/collections', requireAuth, async (req, res) => {
  try {
    const { name, slug, description, coverImage, isActive, sortOrder } = req.body;
    const col = await Collection.create({ name, slug, description, coverImage, isActive, sortOrder });
    res.status(201).json(col);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/collections/:id  (admin)
app.put('/api/collections/:id', requireAuth, async (req, res) => {
  try {
    const { name, slug, description, coverImage, isActive, sortOrder } = req.body;
    const col = await Collection.findByIdAndUpdate(
      req.params.id,
      { name, slug, description, coverImage, isActive, sortOrder },
      { new: true, runValidators: true }
    );
    if (!col) return res.status(404).json({ error: 'Collection not found' });
    res.json(col);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/collections/:id  (admin)
app.delete('/api/collections/:id', requireAuth, async (req, res) => {
  try {
    const col = await Collection.findByIdAndDelete(req.params.id);
    if (!col) return res.status(404).json({ error: 'Collection not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/upload  (protected)
app.post('/api/upload', requireAuth, (req, res) => {
  console.log('🚀 Upload request received');
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('❌ Multer error:', err.code, err.message);
      return res.status(400).json({ error: `Multer Error: ${err.message}` });
    } else if (err) {
      console.error('❌ Upload error:', err);
      return res.status(500).json({ error: `Server Error: ${err.message}` });
    }

    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('✅ File uploaded to Cloudinary Successfully:', req.file.path);
    res.json({ url: req.file.path });
  });
});

// ── Order Routes ──────────────────────────────────────────────────────────────

// POST /api/orders  (public – create a new order)
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerName, customerPhone, customerAddress, customerCity,
      customerNotes, items, subtotal, deliveryCharge, total, paymentMethod,
    } = req.body;

    if (!customerName || !customerPhone || !customerAddress || !customerCity || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const order = await Order.create({
      customerName, customerPhone, customerAddress, customerCity,
      customerNotes: customerNotes || '',
      items,
      subtotal: Number(subtotal),
      deliveryCharge: Number(deliveryCharge ?? 350),
      total: Number(total),
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Pending',
    });

    res.status(201).json({ success: true, orderId: order._id, order });
  } catch (err) {
    console.error('❌ Error creating order:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders  (admin protected)
app.get('/api/orders', requireAuth, async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status  (admin protected)
app.put('/api/orders/:id/status', requireAuth, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const update = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/payhere/notify  (PayHere payment notification webhook – public)
app.post('/api/payhere/notify', async (req, res) => {
  try {
    const { order_id, status_code, md5sig, merchant_id, payhere_amount, payhere_currency } = req.body;
    console.log('💳 PayHere Notify:', { order_id, status_code });

    // status_code: 2 = Success, 0 = Pending, -1 = Cancelled, -2 = Failed, -3 = Charged-Back
    let paymentStatus = 'Pending';
    if (status_code === '2') paymentStatus = 'Paid';
    else if (status_code === '-1' || status_code === '-2') paymentStatus = 'Failed';

    if (order_id) {
      await Order.findByIdAndUpdate(order_id, { paymentStatus });
    }

    res.send('OK');
  } catch (err) {
    console.error('❌ PayHere notify error:', err.message);
    res.status(500).send('Error');
  }
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
