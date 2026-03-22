// api/verify-subscription.js
// Proxies to Render API.

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

  const RENDER_API = process.env.PHONICS_API_BASE || 'https://phonics-api-k43i.onrender.com';

  try {
    const upstream = await fetch(`${RENDER_API}/api/subscriptions/verify?session_id=${session_id}`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
