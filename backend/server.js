/**
 * Élite Estudiantil — servidor propio mínimo (Node 18+, sin dependencias)
 *
 *   ADMIN_TOKEN=clave-larga  WRITE_TOKEN=token-publico  ALLOWED_ORIGIN=https://tusitio.com  node server.js
 *
 * POST /api/support        -> guarda un apoyo        (requiere X-Write-Token si WRITE_TOKEN está definido)
 * POST /api/suggestion     -> guarda una sugerencia
 * GET  /api/export/:kind   -> CSV (requiere cabecera Authorization: Bearer <ADMIN_TOKEN>)
 *
 * Los datos se guardan en data/*.jsonl. Haz respaldos y define quién los administra.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const WRITE_TOKEN = process.env.WRITE_TOKEN || '';
const ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const DIR = path.join(__dirname, 'data');
fs.mkdirSync(DIR, { recursive: true });

const SCHEMA = {
  support: ['id', 'createdAt', 'name', 'grade', 'shift', 'interest', 'contact'],
  suggestion: ['id', 'createdAt', 'topic', 'text']
};
const hits = new Map(); // límite simple por IP: 20 envíos / 10 min

function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < 600000);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 20;
}
function send(res, code, obj, type = 'application/json') {
  res.writeHead(code, {
    'Content-Type': type + '; charset=utf-8',
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, X-Write-Token, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  res.end(typeof obj === 'string' ? obj : JSON.stringify(obj));
}
const csv = v => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '');
  const url = new URL(req.url, 'http://x');
  const m = url.pathname.match(/^\/api\/(support|suggestion)$/);

  if (req.method === 'POST' && m) {
    const kind = m[1];
    const ip = req.socket.remoteAddress;
    if (limited(ip)) return send(res, 429, { ok: false, error: 'rate limit' });
    if (WRITE_TOKEN && req.headers['x-write-token'] !== WRITE_TOKEN) return send(res, 401, { ok: false });
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 8000) req.destroy(); });
    req.on('end', () => {
      try {
        const d = JSON.parse(raw);
        const rec = {};
        for (const k of SCHEMA[kind]) rec[k] = String(d[k] ?? '').slice(0, k === 'text' ? 1000 : 150);
        rec.receivedAt = new Date().toISOString();
        fs.appendFileSync(path.join(DIR, kind + '.jsonl'), JSON.stringify(rec) + '\n');
        send(res, 200, { ok: true });
      } catch { send(res, 400, { ok: false }); }
    });
    return;
  }

  const ex = url.pathname.match(/^\/api\/export\/(support|suggestion)$/);
  if (req.method === 'GET' && ex) {
    if (!ADMIN_TOKEN || req.headers.authorization !== 'Bearer ' + ADMIN_TOKEN) return send(res, 401, { ok: false });
    const file = path.join(DIR, ex[1] + '.jsonl');
    const rows = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
    const cols = [...SCHEMA[ex[1]], 'receivedAt'];
    const out = '﻿' + [cols.map(csv).join(','), ...rows.map(r => cols.map(c => csv(r[c])).join(','))].join('\r\n');
    return send(res, 200, out, 'text/csv');
  }

  send(res, 404, { ok: false });
}).listen(PORT, () => console.log('Élite Estudiantil API en puerto ' + PORT));
