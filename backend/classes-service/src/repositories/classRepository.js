const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'boxing_classes',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function query(sql, params) {
  return pool.query(sql, params);
}

async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS training_classes (
      id SERIAL PRIMARY KEY,
      title VARCHAR(120) NOT NULL,
      coach VARCHAR(120) NOT NULL,
      class_date TIMESTAMP NOT NULL,
      capacity INT NOT NULL,
      intensity VARCHAR(40) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  const result = await query('SELECT COUNT(*) AS total FROM training_classes');
  if (Number(result.rows[0].total) === 0) {
    await create({
      title: 'Tecnica de saco',
      coach: 'Andres Vega',
      classDate: new Date(Date.now() + 86400000).toISOString(),
      capacity: 14,
      intensity: 'Media'
    });
    await create({
      title: 'Sparring controlado',
      coach: 'Camila Torres',
      classDate: new Date(Date.now() + 172800000).toISOString(),
      capacity: 10,
      intensity: 'Alta'
    });
  }
}

async function findAll() {
  const result = await query('SELECT * FROM training_classes ORDER BY class_date ASC');
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM training_classes WHERE id = $1', [id]);
  return result.rows[0];
}

async function create(trainingClass) {
  const result = await query(
    `INSERT INTO training_classes (title, coach, class_date, capacity, intensity)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      trainingClass.title,
      trainingClass.coach,
      trainingClass.classDate,
      trainingClass.capacity,
      trainingClass.intensity
    ]
  );
  return result.rows[0];
}

async function update(id, trainingClass) {
  const result = await query(
    `UPDATE training_classes
     SET title = $1, coach = $2, class_date = $3, capacity = $4, intensity = $5
     WHERE id = $6
     RETURNING *`,
    [
      trainingClass.title,
      trainingClass.coach,
      trainingClass.classDate,
      trainingClass.capacity,
      trainingClass.intensity,
      id
    ]
  );
  return result.rows[0];
}

async function remove(id) {
  const result = await query('DELETE FROM training_classes WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = { initializeDatabase, findAll, findById, create, update, remove };
