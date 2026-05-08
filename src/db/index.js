const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

async function initDB() {
  const schema = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
  await pool.query(schema);
  // Migrations incrementais (idempotentes)
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(64)`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT false`);
  console.log('✅ Banco de dados inicializado');
}

module.exports = { pool, initDB };
