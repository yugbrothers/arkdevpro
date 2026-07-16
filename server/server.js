import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from './db.js';
import { emailService } from './emailService.js';

const app = express();
const PORT = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || 'arkdevpro-super-secret-key-1357';

// Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Simple Rate Limiter Middleware
const rateLimits = {};
const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  if (!rateLimits[ip]) {
    rateLimits[ip] = [];
  }
  rateLimits[ip] = rateLimits[ip].filter(timestamp => now - timestamp < 60000); // 1 minute window
  if (rateLimits[ip].length >= 100) { // Limit to 100 requests per minute
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  rateLimits[ip].push(now);
  next();
};
app.use(rateLimiter);

// Helper: Get Logged In User from JWT
const getAuthenticatedUser = (req) => {
  const token = req.cookies.token;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// Authentication Middleware
const authenticate = (req, res, next) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(418).json({ error: 'Unauthorized. Sign-in required.' });
  }
  req.user = user;
  next();
};

// ==========================================
// AUTHENTICATION API
// ==========================================

// Mock/Simulated OAuth Login (For development, testing, and sandbox out-of-the-box)
app.post('/api/auth/mock-login', (req, res) => {
  const { username, email, provider } = req.body;
  if (!username || !email) {
    return res.status(400).json({ error: 'Missing username or email.' });
  }

  const userId = 'u_' + crypto.createHash('md5').update(email).digest('hex').slice(0, 8);
  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;

  // Find or Create user in database
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  let isNew = false;
  if (!user) {
    db.prepare('INSERT INTO users (id, username, email, avatar_url) VALUES (?, ?, ?, ?)')
      .run(userId, username, email, avatarUrl);
    db.prepare('INSERT INTO oauth_accounts (user_id, provider, provider_user_id) VALUES (?, ?, ?)')
      .run(userId, provider || 'github', 'mock_' + userId);
    user = { id: userId, username, email, avatar_url: avatarUrl, role: 'user' };
    isNew = true;
  }

  // Record login history
  const userAgent = req.headers['user-agent'] || 'Unknown';
  db.prepare('INSERT INTO login_history (user_id, ip_address, browser) VALUES (?, ?, ?)')
    .run(user.id, req.ip, userAgent);

  // Send admin notification on registration / login
  emailService.notifyAdminOnLogin(
    { username: user.username, email: user.email, provider: provider || 'github', isNew },
    req.ip,
    userAgent
  ).catch(console.error);

  // Create JWT Token and Set in Cookie
  const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Get active subscription if any
  const subscription = db.prepare("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'").get(user.id);

  res.json({ user, subscription });
});

// Get Current User Session Info
app.get('/api/auth/me', (req, res) => {
  const authedUser = getAuthenticatedUser(req);
  if (!authedUser) {
    return res.json({ user: null, subscription: null });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(authedUser.id);
  if (!user) {
    return res.json({ user: null, subscription: null });
  }

  const subscription = db.prepare("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'").get(user.id);
  res.json({ user, subscription });
});

// Logout User
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// ==========================================
// PAYMENTS & SUBSCRIPTIONS API
// ==========================================

// Create Payment Order
app.post('/api/payments/create-order', authenticate, (req, res) => {
  const { plan } = req.body;
  if (!plan) return res.status(400).json({ error: 'Plan is required.' });

  let amount = 999;
  if (plan === 'gold') amount = 2999;
  if (plan === 'diamond') amount = 5999;

  const orderId = 'order_' + crypto.randomBytes(8).toString('hex');
  res.json({
    order_id: orderId,
    amount,
    currency: 'INR',
    plan
  });
});

// Verify Payment and Activate Subscription
app.post('/api/payments/verify', authenticate, async (req, res) => {
  const { payment_id, order_id, plan, amount } = req.body;
  const user = req.user;

  // Insert payment into database
  const finalPaymentId = payment_id || 'pay_' + crypto.randomBytes(8).toString('hex');
  db.prepare(`
    INSERT INTO payments (id, user_id, order_id, amount, currency, status, plan)
    VALUES (?, ?, ?, ?, 'INR', 'captured', ?)
  `).run(finalPaymentId, user.id, order_id, amount, plan);

  // Generate Invoice Number
  const invoiceNo = `INV-2026-${crypto.randomInt(1000, 9999)}`;

  // Create active subscription
  const subId = 'sub_' + crypto.randomBytes(8).toString('hex');
  db.prepare(`
    INSERT INTO subscriptions (id, user_id, plan, status, price, invoice_no)
    VALUES (?, ?, ?, 'active', ?, ?)
  `).run(subId, user.id, plan, amount, invoiceNo);

  // Fetch full user record
  const fullUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);

  // Send email confirmations (non-blocking)
  emailService.notifyAdminOnPayment(fullUser, { id: finalPaymentId, order_id, amount, currency: 'INR', plan })
    .catch(console.error);

  emailService.sendInvoiceToCustomer(fullUser, { id: finalPaymentId, amount, currency: 'INR', plan }, invoiceNo)
    .catch(console.error);

  res.json({
    success: true,
    subscription: { id: subId, plan, status: 'active', invoice_no: invoiceNo }
  });
});

// Razorpay Webhooks Endpoint
app.post('/api/payments/webhook', (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  console.log('🔔 Received Razorpay Webhook Event:', req.body.event);
  
  // Respond instantly to Razorpay
  res.status(200).json({ status: 'ok' });
});

// ==========================================
// TELEMETRY & TRACKING API
// ==========================================

// Track download clicks
app.post('/api/downloads/track', (req, res) => {
  const { component_name } = req.body;
  if (!component_name) return res.status(400).json({ error: 'Component name required.' });

  const authedUser = getAuthenticatedUser(req);
  const userId = authedUser ? authedUser.id : 'guest';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  db.prepare(`
    INSERT INTO downloads (user_id, component_name, ip_address, browser)
    VALUES (?, ?, ?, ?)
  `).run(userId, component_name, req.ip, userAgent);

  res.json({ success: true });
});

// Get User Profile stats & downloads
app.get('/api/profile/details', authenticate, (req, res) => {
  const user = req.user;

  const downloads = db.prepare(`
    SELECT component_name, ip_address, browser, created_at 
    FROM downloads 
    WHERE user_id = ? 
    ORDER BY created_at DESC LIMIT 10
  `).all(user.id);

  const loginHistory = db.prepare(`
    SELECT ip_address, browser, created_at 
    FROM login_history 
    WHERE user_id = ? 
    ORDER BY created_at DESC LIMIT 5
  `).all(user.id);

  const invoices = db.prepare(`
    SELECT id as payment_id, order_id, amount, currency, plan, created_at 
    FROM payments 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `).all(user.id);

  // Get invoice number from subscriptions for each payment
  const invoicesWithNo = invoices.map(inv => {
    const sub = db.prepare('SELECT invoice_no FROM subscriptions WHERE user_id = ? AND plan = ? LIMIT 1').get(user.id, inv.plan);
    return {
      ...inv,
      invoice_no: sub ? sub.invoice_no : 'INV-2026-MOCK'
    };
  });

  res.json({ downloads, loginHistory, invoices: invoicesWithNo });
});

// ==========================================
// ADMIN DASHBOARD API
// ==========================================

app.get('/api/admin/stats', authenticate, (req, res) => {
  // Protect with admin role check
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }

  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const totalRevenue = db.prepare("SELECT SUM(amount) as sum FROM payments WHERE status = 'captured'").get().sum || 0;
  
  const planStats = db.prepare(`
    SELECT plan, COUNT(*) as count 
    FROM subscriptions 
    WHERE status = 'active' 
    GROUP BY plan
  `).all();

  // Recent payments
  const recentPayments = db.prepare(`
    SELECT p.id as payment_id, p.amount, p.plan, p.created_at, u.username, u.email 
    FROM payments p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC LIMIT 10
  `).all();

  // Recent users
  const recentUsers = db.prepare(`
    SELECT username, email, role, created_at 
    FROM users 
    ORDER BY created_at DESC LIMIT 10
  `).all();

  // Downloads analytics
  const totalDownloads = db.prepare('SELECT COUNT(*) as count FROM downloads').get().count;
  const popularComponents = db.prepare(`
    SELECT component_name, COUNT(*) as count 
    FROM downloads 
    GROUP BY component_name 
    ORDER BY count DESC LIMIT 5
  `).all();

  res.json({
    totalUsers,
    totalRevenue,
    totalDownloads,
    planStats,
    recentPayments,
    recentUsers,
    popularComponents
  });
});

app.post('/api/debug-log', (req, res) => {
  console.log("FRONTEND ERROR REPORTED:", req.body.error, req.body.info);
  res.sendStatus(200);
});

// Start Server
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
    🚀 ===============================================
    🚀 ArkDev Pro SaaS Backend is running!
    🚀 Port: ${PORT}
    🚀 Mode: Development (SQLite DB active)
    🚀 Live active database: ${db.name}
    🚀 ===============================================
    `);
  });
}

export default app;
