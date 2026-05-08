const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'boxing_members',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'mysql',
  waitForConnections: true,
  connectionLimit: 10
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(140) NOT NULL,
      phone VARCHAR(40),
      plan VARCHAR(60) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
      weight_kg DECIMAL(5,2),
      level VARCHAR(40) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM members');
  if (rows[0].total === 0) {
    await create({
      fullName: 'Laura Martinez',
      phone: '3001234567',
      plan: 'Mensual',
      status: 'ACTIVO',
      weightKg: 61.5,
      level: 'Intermedio'
    });
    await create({
      fullName: 'Carlos Rios',
      phone: '3015559090',
      plan: 'Trimestral',
      status: 'ACTIVO',
      weightKg: 78,
      level: 'Avanzado'
    });
  }
}

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM members ORDER BY id DESC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);
  return rows[0];
}

async function create(member) {
  const [result] = await pool.query(
    `INSERT INTO members (full_name, phone, plan, status, weight_kg, level)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [member.fullName, member.phone, member.plan, member.status, member.weightKg, member.level]
  );
  return findById(result.insertId);
}

async function update(id, member) {
  await pool.query(
    `UPDATE members
     SET full_name = ?, phone = ?, plan = ?, status = ?, weight_kg = ?, level = ?
     WHERE id = ?`,
    [member.fullName, member.phone, member.plan, member.status, member.weightKg, member.level, id]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM members WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { initializeDatabase, findAll, findById, create, update, remove };
