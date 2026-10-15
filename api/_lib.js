/* Shared helpers for the result tally. Storage is an Upstash Redis database
   connected to the Vercel project (Storage -> Upstash for Redis), reached
   through its REST API so no packages need installing. */
require('../site/js/data-meta.js');
require('../site/js/data-tendencies.js');
const TA = globalThis.TA;

const KEY = 'marxistaxes:results';
const IDS = new Set(TA.tendencies.map((t) => t.id));

function creds() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function redis(command) {
  const c = creds();
  if (!c) { const e = new Error('Storage is not connected'); e.status = 503; throw e; }
  const r = await fetch(c.url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!r.ok) { const e = new Error('Storage error ' + r.status); e.status = 502; throw e; }
  return (await r.json()).result;
}

module.exports = { TA, KEY, IDS, redis };
