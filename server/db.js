import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbPath;
if (process.env.VERCEL) {
  const tmpPath = '/tmp/database.sqlite';
  const originalPath = path.resolve(__dirname, 'database.sqlite');
  
  if (!fs.existsSync(tmpPath)) {
    try {
      if (fs.existsSync(originalPath)) {
        fs.copyFileSync(originalPath, tmpPath);
      } else {
        fs.writeFileSync(tmpPath, '');
      }
    } catch (err) {
      console.error('Failed to copy database to /tmp:', err);
    }
  }
  dbPath = tmpPath;
} else {
  dbPath = path.resolve(__dirname, 'database.sqlite');
}

const db = new Database(dbPath);

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS oauth_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    access_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(provider, provider_user_id)
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan TEXT NOT NULL, -- 'silver', 'gold', 'diamond'
    status TEXT NOT NULL, -- 'active', 'cancelled'
    price REAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    invoice_no TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY, -- payment_id
    user_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL,
    plan TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    component_name TEXT NOT NULL,
    ip_address TEXT,
    browser TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    ip_address TEXT,
    browser TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Seed default data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  console.log('🌱 Seeding initial mock database data...');
  
  // Seed an admin user
  db.prepare(`
    INSERT INTO users (id, username, email, avatar_url, role, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', '-30 days'))
  `).run('admin-id', 'SaaS Administrator', 'admin@arkdevpro.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', 'admin');

  db.prepare(`
    INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
    VALUES (?, ?, ?)
  `).run('admin-id', 'github', '123456');

  // Seed sample users with subscriptions, payments, and downloads
  const sampleUsers = [
    { id: 'u1', username: 'Alex Rivers', email: 'alex@rivers.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', plan: 'diamond', price: 5999, daysAgo: 25 },
    { id: 'u2', username: 'Sarah Chen', email: 'sarah@chencode.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', plan: 'gold', price: 2999, daysAgo: 18 },
    { id: 'u3', username: 'Marcus Aurelius', email: 'marcus@stoic.net', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus', plan: 'silver', price: 999, daysAgo: 10 },
    { id: 'u4', username: 'Emily Watson', email: 'emily@watson.co.uk', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', plan: 'diamond', price: 5999, daysAgo: 5 },
    { id: 'u5', username: 'Dev Patel', email: 'dev@patel.in', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev', plan: 'gold', price: 2999, daysAgo: 1 }
  ];

  for (const user of sampleUsers) {
    const userTime = `datetime('now', '-${user.daysAgo} days')`;
    db.prepare(`
      INSERT INTO users (id, username, email, avatar_url, role, created_at)
      VALUES (?, ?, ?, ?, 'user', ${userTime})
    `).run(user.id, user.username, user.email, user.avatar);

    db.prepare(`
      INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
      VALUES (?, ?, ?)
    `).run(user.id, 'github', 'seed_' + user.id);

    const invoiceNo = `INV-2026-${1000 + user.daysAgo}`;
    db.prepare(`
      INSERT INTO subscriptions (id, user_id, plan, status, price, invoice_no, created_at)
      VALUES (?, ?, ?, 'active', ?, ?, ${userTime})
    `).run('sub_' + user.id, user.id, user.plan, user.price, invoiceNo);

    db.prepare(`
      INSERT INTO payments (id, user_id, order_id, amount, status, plan, created_at)
      VALUES (?, ?, ?, ?, 'captured', ?, ${userTime})
    `).run('pay_' + user.id, user.id, 'order_' + user.id, user.price, user.plan);

    // Add some downloads
    const components = ['Ferrofluid', 'DotField', 'LightPillar', 'ASCIIText', 'StaggeredMenu', 'ModelViewer'];
    for (let i = 0; i < Math.floor(Math.random() * 8) + 2; i++) {
      const comp = components[Math.floor(Math.random() * components.length)];
      db.prepare(`
        INSERT INTO downloads (user_id, component_name, ip_address, browser, created_at)
        VALUES (?, ?, '127.0.0.1', 'Chrome', datetime('now', '-${Math.floor(Math.random() * user.daysAgo)} days'))
      `).run(user.id, comp);
    }
  }
}

export default db;
