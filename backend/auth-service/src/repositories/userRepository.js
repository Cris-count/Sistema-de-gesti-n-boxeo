const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

function pgSsl() {
  const v = String(process.env.DB_SSL || '').toLowerCase();
  return v === 'true' || v === '1' ? { rejectUnauthorized: false } : undefined;
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'boxing_auth',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: pgSsl()
});

async function query(sql, params) {
  return pool.query(sql, params);
}

async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ringbox.local';
  const existing = await findByEmail(adminEmail);
  if (!existing) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123', 10);
    await createUser({
      name: 'Administrador',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN'
    });
  }
}

async function createUser({ name, email, passwordHash, role }) {
  const result = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email.toLowerCase(), passwordHash, role]
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return result.rows[0];
}

async function findById(id) {
  const result = await query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = { initializeDatabase, createUser, findByEmail, findById };
