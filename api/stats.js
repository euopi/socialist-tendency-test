/* GET: the tally of top results, most common first. */
const { TA, KEY, redis } = require('./_lib');

module.exports = async (req, res) => {
  try {
    const flat = (await redis(['HGETALL', KEY])) || [];
    const counts = {};
    for (let i = 0; i < flat.length; i += 2) counts[flat[i]] = parseInt(flat[i + 1], 10) || 0;
    const fams = {};
    TA.families.forEach((f) => { fams[f.id] = f.n; });
    const rows = TA.tendencies.map((t) => ({ id: t.id, name: t.n, family: fams[t.fam], count: counts[t.id] || 0 }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const total = rows.reduce((s, r) => s + r.count, 0);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ total, rows });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};
