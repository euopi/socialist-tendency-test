/* POST {"t": "<tendency id>"}: adds one to that tendency's tally.
   Only the tendency id is stored. Nothing about the visitor is kept. */
const { KEY, IDS, redis } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Use POST' }); }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const id = body && body.t;
  if (typeof id !== 'string' || !IDS.has(id)) return res.status(400).json({ error: 'Unknown tendency' });
  try {
    await redis(['HINCRBY', KEY, id, 1]);
    return res.status(204).end();
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};
