// api/log-events.js
// Proxies analytics events to Render API.

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const RENDER_API = process.env.PHONICS_API_BASE || 'https://phonics-api-k43i.onrender.com';

  try {
    const upstream = await fetch(`${RENDER_API}/api/events`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(200).json(data);
  } catch (err) {
    // Fire-and-forget — always return ok to client
    res.status(200).json({ ok: true });
  }
};
