const express = require('express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;
const { getPool, query, ensureMigrationsTable } = require('./scripts/db');

const defaultsPath = path.join(__dirname, 'config', 'sigme.defaults.json');
const overridesPath = path.join(__dirname, 'config', 'sigme.overrides.json');
const openapiPath = path.join(__dirname, 'api', 'openapi.yaml');

function readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read JSON:', filePath, e.message);
    return null;
  }
}

function writeJsonSafe(filePath, obj) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
    return true;
  } catch (e) {
    console.error('Failed to write JSON:', filePath, e.message);
    return false;
  }
}

function deepMerge(base, extra) {
  if (Array.isArray(base) || Array.isArray(extra)) return extra ?? base;
  if (base && typeof base === 'object' && extra && typeof extra === 'object') {
    const out = { ...base };
    for (const k of Object.keys(extra)) {
      out[k] = deepMerge(base[k], extra[k]);
    }
    return out;
  }
  return extra !== undefined ? extra : base;
}

function getConfig() {
  const defaults = readJsonSafe(defaultsPath) || {};
  const overrides = readJsonSafe(overridesPath) || {};
  return deepMerge(defaults, overrides);
}

function setByPath(obj, pathStr, value) {
  const parts = pathStr.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!curr[p] || typeof curr[p] !== 'object') curr[p] = {};
    curr = curr[p];
  }
  curr[parts[parts.length - 1]] = value;
}

app.get('/', (req, res) => {
  res.type('html').send(`<!doctype html>
  <html><head><meta charset="utf-8"><title>RSPrólipsi Admin API</title>
  <style>body{font-family:system-ui,Segoe UI,Arial;margin:40px}code{background:#f4f4f4;padding:2px 4px;border-radius:4px}</style>
  </head><body>
  <h1>RSPrólipsi Admin/API</h1>
  <p>Status: online. Veja <code>/health</code>, <code>/admin/rules</code>, <code>/openapi.yaml</code>.</p>
  </body></html>`);
});

app.get('/health', (req, res) => {
  const db = !!getPool();
  res.json({ ok: true, db, ts: new Date().toISOString() });
});

app.get('/openapi.yaml', (req, res) => {
  try {
    const text = fs.readFileSync(openapiPath, 'utf8');
    // validate YAML
    yaml.load(text);
    res.type('text/yaml').send(text);
  } catch (e) {
    res.status(404).json({ error: 'OpenAPI not found', detail: e.message });
  }
});

// Admin rules
app.get('/admin/rules', (req, res) => {
  res.json(getConfig());
});

app.put('/admin/rules', (req, res) => {
  const current = getConfig();
  const editable = (current.admin && Array.isArray(current.admin.editable)) ? current.admin.editable : [];
  const body = req.body || {};
  const overrides = readJsonSafe(overridesPath) || {};

  let changed = 0;
  for (const key of Object.keys(body)) {
    if (!editable.includes(key)) continue; // ignore non-editable keys
    setByPath(overrides, key, body[key]);
    changed++;
  }

  if (!changed) {
    return res.status(400).json({ error: 'Nenhuma chave editável encontrada no payload', editable });
  }

  const ok = writeJsonSafe(overridesPath, overrides);
  if (!ok) return res.status(500).json({ error: 'Falha ao salvar overrides' });
  res.json(getConfig());
});

// Events (stubs) – accept and ack for now
app.post('/events/activation', (req, res) => {
  const { event_id, user_id, period_month, amount, sponsor_id } = req.body || {};
  if (!event_id || !user_id || !period_month || amount == null) {
    return res.status(400).json({ error: 'Campos obrigatórios: event_id, user_id, period_month, amount' });
  }
  console.log('activation event', { event_id, user_id, period_month, amount, sponsor_id });
  const pool = getPool();
  if (!pool) return res.status(202).json({ accepted: true, note: 'no DB configured' });
  (async () => {
    try {
      await query('BEGIN');
      // idempotence: log event if new
      await query('INSERT INTO event_logs(event_id, event_type, payload_json, payload_hash) VALUES ($1,$2,$3,$4) ON CONFLICT (event_id) DO NOTHING', [
        event_id, 'activation', req.body, String(event_id)
      ]);
      // ensure user
      await query('INSERT INTO users(id, sponsor_id) VALUES ($1,$2) ON CONFLICT (id) DO UPDATE SET sponsor_id = COALESCE(users.sponsor_id,$2)', [user_id, sponsor_id || null]);
      // month floor to first day
      const month = new Date(period_month);
      const period = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
      // upsert activation
      await query('INSERT INTO activations(user_id, period_month, amount, valid) VALUES ($1,$2,$3,$4)
                  ON CONFLICT (user_id, period_month) DO UPDATE SET amount=EXCLUDED.amount, valid=EXCLUDED.valid', [
        user_id, period, amount, amount >= (getConfig().matrix?.activation_min_value || 60)
      ]);
      await query('COMMIT');
      res.status(202).json({ accepted: true });
    } catch (e) {
      await query('ROLLBACK');
      console.error('activation error', e);
      res.status(500).json({ error: 'DB error', detail: e.message });
    }
  })();
});

app.post('/events/drop-sale', (req, res) => {
  const { event_id, user_id, period_month, units, unit_price } = req.body || {};
  if (!event_id || !user_id || !period_month || units == null || unit_price == null) {
    return res.status(400).json({ error: 'Campos obrigatórios: event_id, user_id, period_month, units, unit_price' });
  }
  const cfg = getConfig();
  console.log('drop-sale event', { event_id, user_id, period_month, units, unit_price });
  const pool = getPool();
  if (!pool) return res.status(202).json({ accepted: true, note: 'no DB configured' });
  (async () => {
    try {
      await query('BEGIN');
      await query('INSERT INTO event_logs(event_id, event_type, payload_json, payload_hash) VALUES ($1,$2,$3,$4) ON CONFLICT (event_id) DO NOTHING', [
        event_id, 'drop_sale', req.body, String(event_id)
      ]);
      await query('INSERT INTO users(id) VALUES ($1) ON CONFLICT (id) DO NOTHING', [user_id]);
      const month = new Date(period_month); const period = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
      // determine tier percent
      const tiers = (cfg.drop?.tiers || []).slice().sort((a,b)=> (a.min||0)-(b.min||0));
      let percent = 0;
      for (const t of tiers) {
        const min = t.min ?? 0; const max = t.max ?? Infinity;
        if (units >= min && units <= max) { percent = t.percent; break; }
        if (units >= min && max === Infinity) { percent = t.percent; }
      }
      const payoutAmount = Math.round(units * unit_price * percent * 100) / 100;
      // check active in month
      let active = true;
      if (cfg.drop?.active_required) {
        const r = await query('SELECT 1 FROM activations WHERE user_id=$1 AND period_month=$2 AND valid=true', [user_id, period]);
        active = r.rowCount > 0;
      }
      await query('INSERT INTO drop_sales(user_id, period_month, units, unit_price, tier_percent, payout_amount) VALUES ($1,$2,$3,$4,$5,$6)', [
        user_id, period, units, unit_price, percent, active ? payoutAmount : 0
      ]);
      if (active && payoutAmount > 0) {
        await query('INSERT INTO payouts(user_id, type, amount, label, source_event_id, period_month) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING', [
          user_id, 'DROP', payoutAmount, 'DROP', event_id, period
        ]);
      }
      await query('COMMIT');
      res.status(202).json({ accepted: true, active, payoutAmount });
    } catch (e) {
      await query('ROLLBACK');
      console.error('drop-sale error', e);
      res.status(500).json({ error: 'DB error', detail: e.message });
    }
  })();
});

app.post('/marte/events/network-cycle', (req, res) => {
  const { event_id, origin_user_id, occurred_at, base_amount } = req.body || {};
  if (!event_id || !origin_user_id || !occurred_at || base_amount == null) {
    return res.status(400).json({ error: 'Campos obrigatórios: event_id, origin_user_id, occurred_at, base_amount' });
  }
  console.log('marte network-cycle', { event_id, origin_user_id, occurred_at, base_amount });
  const cfg = getConfig();
  const pool = getPool();
  if (!pool) return res.status(202).json({ accepted: true, note: 'no DB configured' });
  (async () => {
    try {
      await query('BEGIN');
      await query('INSERT INTO marte_network_cycles(event_id, origin_user_id, occurred_at, base_amount) VALUES ($1,$2,$3,$4) ON CONFLICT (event_id) DO NOTHING', [
        event_id, origin_user_id, new Date(occurred_at), base_amount
      ]);
      // ensure origin user exists
      await query('INSERT INTO users(id) VALUES ($1) ON CONFLICT (id) DO NOTHING', [origin_user_id]);
      // fetch sponsor chain
      const l1r = await query('SELECT sponsor_id FROM users WHERE id=$1', [origin_user_id]);
      const l1 = l1r.rows[0]?.sponsor_id || null;
      let l2 = null, l3 = null;
      if (l1) {
        const l2r = await query('SELECT sponsor_id FROM users WHERE id=$1', [l1]);
        l2 = l2r.rows[0]?.sponsor_id || null;
      }
      if (l2) {
        const l3r = await query('SELECT sponsor_id FROM users WHERE id=$1', [l2]);
        l3 = l3r.rows[0]?.sponsor_id || null;
      }
      const parts = (new Date(occurred_at));
      const period = new Date(Date.UTC(parts.getUTCFullYear(), parts.getUTCMonth(), 1));
      const payouts = [];
      const perc = cfg.marte?.network_payouts || { l1: 0.05, l2: 0.03, l3: 0.02 };
      const chain = [l1, l2, l3];
      for (let i = 0; i < chain.length; i++) {
        const uid = chain[i];
        if (!uid) continue;
        // qualification: active in month
        let active = true;
        if (cfg.marte?.active_required_for_monthly_payouts) {
          const r = await query('SELECT 1 FROM activations WHERE user_id=$1 AND period_month=$2 AND valid=true', [uid, period]);
          active = r.rowCount > 0;
        }
        // qualification: required one direct ever active
        let hasDirect = true;
        if (cfg.marte?.required_one_direct_ever_active) {
          const r = await query(`SELECT 1 FROM users d
                                 JOIN activations a ON a.user_id = d.id AND a.valid=true
                                 WHERE d.sponsor_id = $1 LIMIT 1`, [uid]);
          hasDirect = r.rowCount > 0;
        }
        if (!active || !hasDirect) continue;
        const p = i === 0 ? perc.l1 : i === 1 ? perc.l2 : perc.l3;
        const amt = Math.round(base_amount * p * 100) / 100;
        if (amt <= 0) continue;
        await query('INSERT INTO payouts(user_id, type, amount, label, source_event_id, period_month) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING', [
          uid, i===0?'MARTE_L1':i===1?'MARTE_L2':'MARTE_L3', amt, 'MARTE', event_id, period
        ]);
        const col = i===0?'cycles_l1':i===1?'cycles_l2':'cycles_l3';
        await query(`INSERT INTO marte_month_progress(user_id, period_month, ${col}) VALUES ($1,$2,1)
                     ON CONFLICT (user_id, period_month) DO UPDATE SET ${col} = marte_month_progress.${col} + 1, updated_at = now()`, [uid, period]);
        payouts.push({ user_id: uid, amount: amt, level: i+1 });
      }
      await query('COMMIT');
      res.status(202).json({ accepted: true, payouts });
    } catch (e) {
      await query('ROLLBACK');
      console.error('marte network-cycle error', e);
      res.status(500).json({ error: 'DB error', detail: e.message });
    }
  })();
});

// Reports (DB-backed when available)
app.get('/reports/matrix', async (req, res) => {
  if (!getPool()) return res.json({ ok: true, items: [] });
  const { rows } = await query('SELECT * FROM cycles ORDER BY created_at DESC LIMIT 50');
  res.json({ ok: true, items: rows });
});
app.get('/reports/career', async (req, res) => {
  if (!getPool()) return res.json({ ok: true, items: [] });
  const { rows } = await query('SELECT * FROM career_progress ORDER BY updated_at DESC LIMIT 50');
  res.json({ ok: true, items: rows });
});
app.get('/reports/top-sigme', async (req, res) => {
  if (!getPool()) return res.json({ ok: true, items: [] });
  const { rows } = await query('SELECT * FROM top_sigme_rank ORDER BY rank_position ASC LIMIT 50');
  res.json({ ok: true, items: rows });
});
app.get('/reports/marte/month', async (req, res) => {
  if (!getPool()) return res.json({ ok: true, items: [] });
  const { rows } = await query('SELECT * FROM marte_month_progress ORDER BY updated_at DESC LIMIT 50');
  res.json({ ok: true, items: rows });
});
app.get('/reports/marte/quarter', async (req, res) => {
  if (!getPool()) return res.json({ ok: true, items: [] });
  const { rows } = await query('SELECT * FROM marte_quarter_progress ORDER BY updated_at DESC LIMIT 50');
  res.json({ ok: true, items: rows });
});

// User extract/status (stubs)
app.get('/users/:id/extract', (req, res) => res.json({ ok: true, user_id: req.params.id, items: [] }));
app.get('/users/:id/marte/status', (req, res) => res.json({ ok: true, user_id: req.params.id, quarter: req.query.quarter || null, status: {} }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erro interno' });
});

app.listen(PORT, () => {
  const db = getPool();
  if (db) {
    require('./scripts/migrate');
  } else {
    console.log('[startup] DATABASE_URL not set; running without DB');
  }
  console.log(`RSPrólipsi Admin/API listening on :${PORT}`);
});
