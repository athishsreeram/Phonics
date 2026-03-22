// api/create-subscription.js
// Proxies to Render API — keeps Vercel as the frontend host
// while all business logic lives in phonics-api on Render.

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const RENDER_API = process.env.PHONICS_API_BASE || 'https://phonics-api-k43i.onrender.com';

  try {
    const upstream = await fetch(`${RENDER_API}/api/subscriptions/checkout`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('[create-subscription proxy]', err.message);
    res.status(500).json({ error: err.message });
  }
};
