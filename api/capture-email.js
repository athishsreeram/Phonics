// api/capture-email.js
// Proxies email leads to Render API.

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const { email, name, ts, source, profile } = req.body || {};
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' });

  const RENDER_API = process.env.PHONICS_API_BASE || 'https://phonics-api-k43i.onrender.com';

  try {
    // Send to Render API
    await fetch(`${RENDER_API}/api/emails`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, name, source }),
    });

    // Also register as user
    await fetch(`${RENDER_API}/api/users/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, child_name: profile?.childName || null }),
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[capture-email proxy]', err.message);
    res.status(200).json({ ok: true }); // always ok to client
  }
};
