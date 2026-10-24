import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env file if present without requiring external dotenv dependency
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }
}

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL?.trim();
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN?.trim();
const isTurso = Boolean(TURSO_DATABASE_URL && TURSO_AUTH_TOKEN);

// Convert libsql:// to https:// for Turso HTTP v2 Pipeline API
const getTursoHttpUrl = (url) => {
  const normalized = url.replace(/^libsql:\/\//i, 'https://').replace(/\/+$/, '');
  return `${normalized}/v2/pipeline`;
};

const encodeTursoArg = (arg) => {
  if (arg === null || arg === undefined) return { type: 'null' };
  if (typeof arg === 'number') {
    if (Number.isInteger(arg)) return { type: 'integer', value: String(arg) };
    return { type: 'float', value: arg };
  }
  return { type: 'text', value: String(arg) };
};

const decodeTursoCell = (cell) => {
  if (!cell || cell.type === 'null') return null;
  if (cell.type === 'integer' || cell.type === 'float') return Number(cell.value);
  return cell.value ?? null;
};

async function executeTurso(sql, args = []) {
  const endpoint = getTursoHttpUrl(TURSO_DATABASE_URL);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TURSO_AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql,
            args: args.map(encodeTursoArg)
          }
        },
        { type: 'close' }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Turso HTTP error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const firstResult = data?.results?.[0];
  if (firstResult?.type === 'error') {
    throw new Error(`Turso SQL error: ${firstResult.error?.message || JSON.stringify(firstResult.error)}`);
  }

  const execResult = firstResult?.response?.result;
  const cols = execResult?.cols || [];
  const rawRows = execResult?.rows || [];

  const rows = rawRows.map((row) => {
    const obj = {};
    cols.forEach((col, idx) => {
      obj[col.name] = decodeTursoCell(row[idx]);
    });
    return obj;
  });

  return {
    rows,
    changes: execResult?.affected_row_count ?? 0,
    lastInsertRowid: execResult?.last_insert_rowid ?? null
  };
}

// Local SQLite fallback when TURSO_DATABASE_URL is not configured
let localSqlite = null;
let localDbPath = path.resolve(__dirname, 'database.sqlite');

async function getLocalSqlite() {
  if (localSqlite) return localSqlite;
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
    localDbPath = tmpPath;
  }

  const { default: Database } = await import('better-sqlite3');
  localSqlite = new Database(localDbPath);
  localSqlite.pragma('journal_mode = WAL');
  return localSqlite;
}

const db = {
  isTurso,
  name: isTurso ? `Turso Cloud (${TURSO_DATABASE_URL})` : localDbPath,

  async get(sql, ...params) {
    const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    if (isTurso) {
      const { rows } = await executeTurso(sql, flatParams);
      return rows[0];
    }
    const sqlite = await getLocalSqlite();
    return sqlite.prepare(sql).get(...flatParams);
  },

  async all(sql, ...params) {
    const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    if (isTurso) {
      const { rows } = await executeTurso(sql, flatParams);
      return rows;
    }
    const sqlite = await getLocalSqlite();
    return sqlite.prepare(sql).all(...flatParams);
  },

  async run(sql, ...params) {
    const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    if (isTurso) {
      return await executeTurso(sql, flatParams);
    }
    const sqlite = await getLocalSqlite();
    return sqlite.prepare(sql).run(...flatParams);
  },

  async exec(sqlBatch) {
    if (isTurso) {
      const statements = sqlBatch
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
      for (const stmt of statements) {
        await executeTurso(stmt, []);
      }
      return;
    }
    const sqlite = await getLocalSqlite();
    sqlite.exec(sqlBatch);
  }
};

const SCHEMA_SQL = `
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
    plan TEXT NOT NULL,
    status TEXT NOT NULL,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    invoice_no TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
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
`;

export async function initDatabase() {
  try {
    await db.exec(SCHEMA_SQL);

    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (!userCount || Number(userCount.count) === 0) {
      console.log('🌱 Seeding initial database data...');

      await db.run(
        `INSERT INTO users (id, username, email, avatar_url, role, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now', '-30 days'))`,
        'admin-id',
        'SaaS Administrator',
        'admin@arkdevpro.com',
        'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
        'admin'
      );

      await db.run(
        `INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
         VALUES (?, ?, ?)`,
        'admin-id',
        'github',
        '123456'
      );

      const sampleUsers = [
        { id: 'u1', username: 'Alex Rivers', email: 'alex@rivers.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', plan: 'diamond', price: 5999, daysAgo: 25 },
        { id: 'u2', username: 'Sarah Chen', email: 'sarah@chencode.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', plan: 'gold', price: 2999, daysAgo: 18 },
        { id: 'u3', username: 'Marcus Aurelius', email: 'marcus@stoic.net', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus', plan: 'silver', price: 999, daysAgo: 10 },
        { id: 'u4', username: 'Emily Watson', email: 'emily@watson.co.uk', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', plan: 'diamond', price: 5999, daysAgo: 5 },
        { id: 'u5', username: 'Dev Patel', email: 'dev@patel.in', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev', plan: 'gold', price: 2999, daysAgo: 1 }
      ];

      const components = ['Ferrofluid', 'DotField', 'LightPillar', 'ASCIIText', 'StaggeredMenu', 'ModelViewer'];

      for (const user of sampleUsers) {
        const userTime = `datetime('now', '-${user.daysAgo} days')`;
        await db.run(
          `INSERT INTO users (id, username, email, avatar_url, role, created_at)
           VALUES (?, ?, ?, ?, 'user', ${userTime})`,
          user.id,
          user.username,
          user.email,
          user.avatar
        );

        await db.run(
          `INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
           VALUES (?, ?, ?)`,
          user.id,
          'github',
          'seed_' + user.id
        );

        const invoiceNo = `INV-2026-${1000 + user.daysAgo}`;
        await db.run(
          `INSERT INTO subscriptions (id, user_id, plan, status, price, invoice_no, created_at)
           VALUES (?, ?, ?, 'active', ?, ?, ${userTime})`,
          'sub_' + user.id,
          user.id,
          user.plan,
          user.price,
          invoiceNo
        );

        await db.run(
          `INSERT INTO payments (id, user_id, order_id, amount, status, plan, created_at)
           VALUES (?, ?, ?, ?, 'captured', ?, ${userTime})`,
          'pay_' + user.id,
          user.id,
          'order_' + user.id,
          user.price,
          user.plan
        );

        for (let i = 0; i < Math.floor(Math.random() * 8) + 2; i++) {
          const comp = components[Math.floor(Math.random() * components.length)];
          await db.run(
            `INSERT INTO downloads (user_id, component_name, ip_address, browser, created_at)
             VALUES (?, ?, '127.0.0.1', 'Chrome', datetime('now', '-${Math.floor(Math.random() * user.daysAgo)} days'))`,
            user.id,
            comp
          );
        }
      }
    }
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
}

export default db;

