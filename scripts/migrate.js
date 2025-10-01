const fs = require('fs');
const path = require('path');
const { getPool, ensureMigrationsTable } = require('./db');

async function run() {
  const pool = getPool();
  if (!pool) {
    console.log('[migrate] DATABASE_URL not set; skipping migrations');
    return;
  }
  await ensureMigrationsTable();
  const dir = path.join(__dirname, '..', 'migrations');
  if (!fs.existsSync(dir)) {
    console.log('[migrate] no migrations dir');
    return;
  }
  const files = fs.readdirSync(dir).filter(f => f.match(/^\d+_.*\.sql$/)).sort();
  for (const file of files) {
    const name = file;
    const { rows } = await pool.query('SELECT 1 FROM _migrations WHERE name=$1', [name]);
    if (rows.length) {
      console.log(`[migrate] skip ${name}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`[migrate] applying ${name} ...`);
    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO _migrations(name) VALUES ($1)', [name]);
      await pool.query('COMMIT');
      console.log(`[migrate] done ${name}`);
    } catch (e) {
      await pool.query('ROLLBACK');
      console.error(`[migrate] failed ${name}:`, e.message);
      throw e;
    }
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

