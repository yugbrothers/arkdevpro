import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db, { initDatabase } from './db.js';
import { emailService } from './emailService.js';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check for Firebase Admin credentials
let firebaseAdminApp = null;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || path.resolve(__dirname, 'firebase-service-account.json');
const hasFirebaseAdminConfig = fs.existsSync(serviceAccountPath) || !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (hasFirebaseAdminConfig) {
  try {
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }

    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('🔥 Firebase Admin SDK initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', err.message);
  }
} else {
  console.log('⚠️ Firebase Admin SDK config not found. Running in mock fallback validation mode.');
}

const app = express();
const PORT = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || 'arkdevpro-super-secret-key-1357';
const isProd = process.env.NODE_ENV === 'production';

// Ensure DB schema & seed data are initialized once
let dbInitPromise = null;
const ensureDbInitialized = () => {
  if (!dbInitPromise) {
    dbInitPromise = initDatabase();
  }
  return dbInitPromise;
};

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ensure database is ready before handling /api routes
app.use('/api', async (req, res, next) => {
  try {
    await ensureDbInitialized();
    next();
  } catch (err) {
    next(err);
  }
});

// Simple Rate Limiter Middleware
const rateLimits = {};
const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  if (!rateLimits[ip]) {
    rateLimits[ip] = [];
  }
  rateLimits[ip] = rateLimits[ip].filter((timestamp) => now - timestamp < 60000); // 1 minute window
  if (rateLimits[ip].length >= 100) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  rateLimits[ip].push(now);
  next();
};
app.use(rateLimiter);

// Cookie options supporting both local dev and cross-origin production (Render + Cloudflare Pages)
const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Helper: Get Logged In User from JWT (Cookie or x-session-token / Authorization header)
const getAuthenticatedUser = (req) => {
  const bearerToken =
    req.path !== '/api/auth/firebase-login' &&
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.split('Bearer ')[1]
      : null;
  const token = req.cookies.token || req.headers['x-session-token'] || bearerToken;
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

// Health Check Endpoint (for Render & monitoring)
app.get('/api/health', async (req, res) => {
  try {
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    res.json({
      status: 'ok',
      database: db.isTurso ? 'turso-cloud-sqlite' : 'local-sqlite',
      dbName: db.name,
      users: Number(userCount?.count ?? 0)
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// ==========================================
// AUTHENTICATION API
// ==========================================

// Firebase OAuth Token Verification and Database Registration
app.post('/api/auth/firebase-login', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split('Bearer ')[1];
    const { provider } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Missing authorization token.' });
    }

    let email, username, avatarUrl, providerUserId;
    let isVerified = false;

    // 1. Verify token
    if (firebaseAdminApp && hasFirebaseAdminConfig) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        email = decodedToken.email;
        username = decodedToken.name || decodedToken.email.split('@')[0];
        avatarUrl = decodedToken.picture || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;
        providerUserId = decodedToken.uid;
        isVerified = true;
      } catch (err) {
        console.error('❌ Firebase token verification failed:', err.message);
        return res.status(401).json({ error: 'Invalid or expired authentication token.' });
      }
    } else {
      // Graceful fallback mock verification mode
      console.warn('⚠️ Running mock token verification fallback.');
      if (token.startsWith('mock_') || token.length > 10) {
        providerUserId = 'mock_fb_' + crypto.createHash('md5').update(token).digest('hex').slice(0, 8);
        username = `OAuth Developer (${provider || 'google'})`;
        email = `${provider || 'google'}_user@gmail.com`;
        avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;
        isVerified = true;
      } else {
        return res.status(401).json({ error: 'Token verification failed in fallback mode.' });
      }
    }

    if (!isVerified || !email) {
      return res.status(401).json({ error: 'Authentication failed.' });
    }

    // 2. Find or create user in database
    const userId = 'u_' + crypto.createHash('md5').update(email).digest('hex').slice(0, 8);
    let user = await db.get('SELECT * FROM users WHERE email = ?', email);
    let isNew = false;

    if (!user) {
      await db.run(
        'INSERT INTO users (id, username, email, avatar_url) VALUES (?, ?, ?, ?)',
        userId,
        username,
        email,
        avatarUrl
      );
      await db.run(
        'INSERT OR IGNORE INTO oauth_accounts (user_id, provider, provider_user_id) VALUES (?, ?, ?)',
        userId,
        provider || 'google',
        providerUserId
      );
      user = { id: userId, username, email, avatar_url: avatarUrl, role: 'user' };
      isNew = true;
    } else {
      await db.run('UPDATE users SET username = ?, avatar_url = ? WHERE id = ?', username, avatarUrl, user.id);
    }

    // 3. Record login history
    const userAgent = req.headers['user-agent'] || 'Unknown';
    await db.run('INSERT INTO login_history (user_id, ip_address, browser) VALUES (?, ?, ?)', user.id, req.ip, userAgent);

    // 4. Send admin notification email to admin@arkdevpro.com
    emailService
      .notifyAdminOnLogin({ username: user.username, email: user.email, provider: provider || 'google', isNew }, req.ip, userAgent)
      .catch(console.error);

    // 5. Create JWT Token and Set in Cookie
    const sessionToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('token', sessionToken, getCookieOptions());

    // 6. Get active subscription if any
    const subscription = await db.get("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'", user.id);

    res.json({ user, subscription, token: sessionToken });
  } catch (err) {
    console.error('❌ Firebase login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Mock/Simulated OAuth Login (For development, testing, and sandbox out-of-the-box)
app.post('/api/auth/mock-login', async (req, res) => {
  try {
    const { username, email, provider } = req.body;
    if (!username || !email) {
      return res.status(400).json({ error: 'Missing username or email.' });
    }

    const userId = 'u_' + crypto.createHash('md5').update(email).digest('hex').slice(0, 8);
    const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;

    // Find or Create user in database
    let user = await db.get('SELECT * FROM users WHERE email = ?', email);
    let isNew = false;
    if (!user) {
      await db.run(
        'INSERT INTO users (id, username, email, avatar_url) VALUES (?, ?, ?, ?)',
        userId,
        username,
        email,
        avatarUrl
      );
      await db.run(
        'INSERT OR IGNORE INTO oauth_accounts (user_id, provider, provider_user_id) VALUES (?, ?, ?)',
        userId,
        provider || 'github',
        'mock_' + userId
      );
      user = { id: userId, username, email, avatar_url: avatarUrl, role: 'user' };
      isNew = true;
    }

    // Record login history
    const userAgent = req.headers['user-agent'] || 'Unknown';
    await db.run('INSERT INTO login_history (user_id, ip_address, browser) VALUES (?, ?, ?)', user.id, req.ip, userAgent);

    // Send admin notification on registration / login
    emailService
      .notifyAdminOnLogin({ username: user.username, email: user.email, provider: provider || 'github', isNew }, req.ip, userAgent)
      .catch(console.error);

    // Create JWT Token and Set in Cookie
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('token', token, getCookieOptions());

    // Get active subscription if any
    const subscription = await db.get("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'", user.id);

    res.json({ user, subscription, token });
  } catch (err) {
    console.error('❌ Mock login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Get Current User Session Info
app.get('/api/auth/me', async (req, res) => {
  try {
    const authedUser = getAuthenticatedUser(req);
    if (!authedUser) {
      return res.json({ user: null, subscription: null });
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', authedUser.id);
    if (!user) {
      return res.json({ user: null, subscription: null });
    }

    const subscription = await db.get("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'", user.id);
    res.json({ user, subscription });
  } catch (err) {
    console.error('❌ Auth /me error:', err);
    res.json({ user: null, subscription: null });
  }
});

// Logout User
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
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
  try {
    const { payment_id, order_id, plan, amount } = req.body;
    const user = req.user;

    // Insert payment into database
    const finalPaymentId = payment_id || 'pay_' + crypto.randomBytes(8).toString('hex');
    await db.run(
      `INSERT INTO payments (id, user_id, order_id, amount, currency, status, plan)
       VALUES (?, ?, ?, ?, 'INR', 'captured', ?)`,
      finalPaymentId,
      user.id,
      order_id,
      amount,
      plan
    );

    // Generate Invoice Number
    const invoiceNo = `INV-2026-${crypto.randomInt(1000, 9999)}`;

    // Create active subscription
    const subId = 'sub_' + crypto.randomBytes(8).toString('hex');
    await db.run(
      `INSERT INTO subscriptions (id, user_id, plan, status, price, invoice_no)
       VALUES (?, ?, ?, 'active', ?, ?)`,
      subId,
      user.id,
      plan,
      amount,
      invoiceNo
    );

    // Fetch full user record
    const fullUser = await db.get('SELECT * FROM users WHERE id = ?', user.id);

    // Send email confirmations (non-blocking)
    emailService
      .notifyAdminOnPayment(fullUser, { id: finalPaymentId, order_id, amount, currency: 'INR', plan })
      .catch(console.error);

    emailService
      .sendInvoiceToCustomer(fullUser, { id: finalPaymentId, amount, currency: 'INR', plan }, invoiceNo)
      .catch(console.error);

    res.json({
      success: true,
      subscription: { id: subId, plan, status: 'active', invoice_no: invoiceNo }
    });
  } catch (err) {
    console.error('❌ Payment verify error:', err);
    res.status(500).json({ error: 'Payment verification failed.' });
  }
});

// Razorpay Webhooks Endpoint
app.post('/api/payments/webhook', (req, res) => {
  console.log('🔔 Received Razorpay Webhook Event:', req.body.event);
  res.status(200).json({ status: 'ok' });
});

// ==========================================
// TELEMETRY & TRACKING API
// ==========================================

// Track download clicks
app.post('/api/downloads/track', async (req, res) => {
  try {
    const { component_name } = req.body;
    if (!component_name) return res.status(400).json({ error: 'Component name required.' });

    const authedUser = getAuthenticatedUser(req);
    const userId = authedUser ? authedUser.id : 'guest';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await db.run(
      `INSERT INTO downloads (user_id, component_name, ip_address, browser)
       VALUES (?, ?, ?, ?)`,
      userId,
      component_name,
      req.ip,
      userAgent
    );

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Download track error:', err);
    res.status(500).json({ error: 'Failed to track download.' });
  }
});

// Get User Profile stats & downloads
app.get('/api/profile/details', authenticate, async (req, res) => {
  try {
    const user = req.user;

    const downloads = await db.all(
      `SELECT component_name, ip_address, browser, created_at 
       FROM downloads 
       WHERE user_id = ? 
       ORDER BY created_at DESC LIMIT 10`,
      user.id
    );

    const loginHistory = await db.all(
      `SELECT ip_address, browser, created_at 
       FROM login_history 
       WHERE user_id = ? 
       ORDER BY created_at DESC LIMIT 5`,
      user.id
    );

    const invoices = await db.all(
      `SELECT id as payment_id, order_id, amount, currency, plan, created_at 
       FROM payments 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      user.id
    );

    // Get invoice number from subscriptions for each payment
    const invoicesWithNo = await Promise.all(
      invoices.map(async (inv) => {
        const sub = await db.get(
          'SELECT invoice_no FROM subscriptions WHERE user_id = ? AND plan = ? LIMIT 1',
          user.id,
          inv.plan
        );
        return {
          ...inv,
          invoice_no: sub ? sub.invoice_no : 'INV-2026-MOCK'
        };
      })
    );

    res.json({ downloads, loginHistory, invoices: invoicesWithNo });
  } catch (err) {
    console.error('❌ Profile details error:', err);
    res.status(500).json({ error: 'Failed to load profile details.' });
  }
});

// ==========================================
// ADMIN DASHBOARD API
// ==========================================

app.get('/api/admin/stats', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }

    const totalUsersRow = await db.get('SELECT COUNT(*) as count FROM users');
    const totalUsers = Number(totalUsersRow?.count || 0);

    const totalRevenueRow = await db.get("SELECT SUM(amount) as sum FROM payments WHERE status = 'captured'");
    const totalRevenue = Number(totalRevenueRow?.sum || 0);

    const planStats = await db.all(`
      SELECT plan, COUNT(*) as count 
      FROM subscriptions 
      WHERE status = 'active' 
      GROUP BY plan
    `);

    const recentPayments = await db.all(`
      SELECT p.id as payment_id, p.amount, p.plan, p.created_at, u.username, u.email 
      FROM payments p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC LIMIT 10
    `);

    const recentUsers = await db.all(`
      SELECT username, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC LIMIT 10
    `);

    const totalDownloadsRow = await db.get('SELECT COUNT(*) as count FROM downloads');
    const totalDownloads = Number(totalDownloadsRow?.count || 0);

    const popularComponents = await db.all(`
      SELECT component_name, COUNT(*) as count 
      FROM downloads 
      GROUP BY component_name 
      ORDER BY count DESC LIMIT 5
    `);

    res.json({
      totalUsers,
      totalRevenue,
      totalDownloads,
      planStats,
      recentPayments,
      recentUsers,
      popularComponents
    });
  } catch (err) {
    console.error('❌ Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch admin telemetry.' });
  }
});

app.post('/api/debug-log', (req, res) => {
  console.log('FRONTEND ERROR REPORTED:', req.body.error, req.body.info);
  res.sendStatus(200);
});

// Serve static frontend build in production if dist/ exists
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Start Server (both local development and Render production)
if (!process.env.VERCEL) {
  ensureDbInitialized().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
    🚀 ===============================================
    🚀 ArkDev Pro SaaS Backend is running!
    🚀 Port: ${PORT}
    🚀 Database Mode: ${db.isTurso ? 'Turso Cloud SQLite (Persistent)' : 'Local SQLite'}
    🚀 Active DB: ${db.name}
    🚀 ===============================================
      `);
    });
  });
}

export default app;

