import http from 'http';
import nacl from 'tweetnacl';

// In-memory tx feed (demo only)
const txEvents = [];
const MAX_EVENTS = 1000;
let routingWeights = { rpc: 50, jito: 40, sender: 10 };
let adminNonce = Math.random().toString(36).slice(2);
let lastAdmin = null;

function sendJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type' });
  res.end(JSON.stringify(obj));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch (_) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type' });
    res.end();
    return;
  }

  if (req.url === '/metrics') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('# HELP surebid_dummy 1\n# TYPE surebid_dummy gauge\nsurebid_dummy 1\n');
    return;
  }
  if (req.url === '/admin/routing' && req.method === 'GET') {
    return sendJson(res, 200, { weights: routingWeights });
  }
  if (req.url === '/admin/challenge' && req.method === 'GET') {
    return sendJson(res, 200, { nonce: adminNonce, lastAdmin });
  }
  if (req.url === '/admin/routing' && req.method === 'POST') {
    const body = await parseBody(req);
    const { rpc, jito, sender, admin, signature, nonce } = body || {};
    if (!admin || !signature || nonce !== adminNonce) return sendJson(res, 401, { ok: false, error: 'auth required' });
    try {
      const msg = new TextEncoder().encode(`${nonce}|${rpc},${jito},${sender}`);
      const sigBytes = Buffer.from(signature, 'base64');
      const pub = Buffer.from((await import('bs58')).default.decode(admin));
      const ok = nacl.sign.detached.verify(msg, sigBytes, pub);
      if (!ok) return sendJson(res, 401, { ok: false, error: 'invalid signature' });
    } catch {
      return sendJson(res, 401, { ok: false, error: 'verification error' });
    }
    const sum = Number(rpc) + Number(jito) + Number(sender);
    if (!Number.isFinite(sum) || sum !== 100) return sendJson(res, 400, { ok: false, error: 'weights must sum to 100' });
    routingWeights = { rpc: Number(rpc), jito: Number(jito), sender: Number(sender) };
    lastAdmin = admin;
    adminNonce = Math.random().toString(36).slice(2);
    return sendJson(res, 200, { ok: true, weights: routingWeights, lastAdmin });
  }
  if (req.url?.startsWith('/metrics/json') && req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    const windowParam = url.searchParams.get('window') || '5m';
    const now = Date.now();
    const ms = windowParam.endsWith('h') ? Number(windowParam.slice(0, -1)) * 3600000 : windowParam.endsWith('m') ? Number(windowParam.slice(0, -1)) * 60000 : 300000;
    const from = now - ms;
    const slice = txEvents.filter((e) => e.timeSent >= from);
    const total = slice.length || 1;
    const failed = slice.filter((e) => e.status === 'failed').length;
    const confirmTimes = slice
      .filter((e) => typeof e.timeConfirmed === 'number')
      .map((e) => Math.max(0, (e.timeConfirmed || e.timeSent) - e.timeSent))
      .sort((a, b) => a - b);
    const median = confirmTimes.length ? confirmTimes[Math.floor(confirmTimes.length / 2)] : 0;
    const avgCost = slice.reduce((acc, e) => acc + (e.costLamports || 0), 0) / total;
    const refundCount = slice.filter((e) => (e.refundLamports || 0) > 0).length;
    const refundTotal = slice.reduce((acc, e) => acc + (e.refundLamports || 0), 0);
    return sendJson(res, 200, {
      window: windowParam,
      failed_tx_rate: failed / total,
      median_confirmation_time_ms: median,
      avg_cost_per_tx_lamports: avgCost,
      jito_refund_count: refundCount,
      jito_refund_total_lamports: refundTotal
    });
  }
  if (req.url === '/tx' && req.method === 'POST') {
    const body = await parseBody(req);
    const entry = {
      signature: body.signature || '',
      options: body.options || {},
      response: body.response || {},
      jitoTipRange: body.jitoTipRange,
      cuPriceRange: body.cuPriceRange,
      route: body.route || 'unknown',
      timeSent: body.timeSent || Date.now(),
      status: body.status || 'pending'
    };
    txEvents.unshift(entry);
    if (txEvents.length > MAX_EVENTS) txEvents.length = MAX_EVENTS;
    return sendJson(res, 200, { ok: true });
  }
  if (req.url === '/feed' && req.method === 'GET') {
    return sendJson(res, 200, { items: txEvents.slice(0, 200) });
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true }));
});

const port = process.env.PORT || 8787;
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`backend listening on :${port}`);
});

