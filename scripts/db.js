const { Pool } = require('pg');

let pool = null;
function getPool() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (pool) return pool;
  pool = new Pool({ connectionString: url, ssl: process.env.DATABASE_SSL?.toLowerCase() === 'true' ? { rejectUnauthorized: false } : undefined });
  return pool;
}

async function query(text, params) {
  const p = getPool();
  if (!p) throw new Error('DB unavailable: set DATABASE_URL');
  return p.query(text, params);
}

async function ensureMigrationsTable() {
  const p = getPool();
  if (!p) return;
  await p.query(`CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    applied_at TIMESTAMP NOT NULL DEFAULT now()
  )`);
}

module.exports = { getPool, query, ensureMigrationsTable };

