const express = require('express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;

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
  res.json({ ok: true, ts: new Date().toISOString() });
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
  const { event_id, user_id, period_month, amount } = req.body || {};
  if (!event_id || !user_id || !period_month || amount == null) {
    return res.status(400).json({ error: 'Campos obrigatórios: event_id, user_id, period_month, amount' });
  }
  console.log('activation event', { event_id, user_id, period_month, amount });
  res.status(202).json({ accepted: true });
});

app.post('/events/drop-sale', (req, res) => {
  const { event_id, user_id, period_month, units, unit_price } = req.body || {};
  if (!event_id || !user_id || !period_month || units == null || unit_price == null) {
    return res.status(400).json({ error: 'Campos obrigatórios: event_id, user_id, period_month, units, unit_price' });
  }
  console.log('drop-sale event', { event_id, user_id, period_month, units, unit_price });
  res.status(202).json({ accepted: true });
});

app.post('/marte/events/network-cycle', (req, res) => {
  const { event_id, origin_user_id, occurred_at, base_amount } = req.body || {};
  if (!event_id || !origin_user_id || !occurred_at || base_amount == null) {
    return res.status(400).json({ error: 'Campos obrigatórios: event_id, origin_user_id, occurred_at, base_amount' });
  }
  console.log('marte network-cycle', { event_id, origin_user_id, occurred_at, base_amount });
  res.status(202).json({ accepted: true });
});

// Reports (stubs)
app.get('/reports/matrix', (req, res) => res.json({ ok: true, items: [] }));
app.get('/reports/career', (req, res) => res.json({ ok: true, items: [] }));
app.get('/reports/top-sigme', (req, res) => res.json({ ok: true, items: [] }));
app.get('/reports/marte/month', (req, res) => res.json({ ok: true, items: [] }));
app.get('/reports/marte/quarter', (req, res) => res.json({ ok: true, items: [] }));

// User extract/status (stubs)
app.get('/users/:id/extract', (req, res) => res.json({ ok: true, user_id: req.params.id, items: [] }));
app.get('/users/:id/marte/status', (req, res) => res.json({ ok: true, user_id: req.params.id, quarter: req.query.quarter || null, status: {} }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erro interno' });
});

app.listen(PORT, () => {
  console.log(`RSPrólipsi Admin/API listening on :${PORT}`);
});

