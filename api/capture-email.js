// api/capture-email.js – saves email leads to a JSON log
// In production: replace with Mailchimp / ConvertKit / Resend API call

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, name, ts, source, profile } = req.body || {};
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' });

    // Log to Vercel console (visible in Vercel Dashboard → Functions → Logs)
    console.log('[EMAIL_LEAD]', JSON.stringify({ email, name, source, ts, profile }));

    // ── Mailchimp integration (uncomment + add env vars to enable) ─────────
    // const MC_KEY      = process.env.MAILCHIMP_API_KEY;   // e.g. abc123-us1
    // const MC_LIST_ID  = process.env.MAILCHIMP_LIST_ID;   // from Audience settings
    // const MC_DC       = MC_KEY?.split('-')[1];            // e.g. 'us1'
    // if (MC_KEY && MC_LIST_ID) {
    //   await fetch(`https://${MC_DC}.api.mailchimp.com/3.0/lists/${MC_LIST_ID}/members`, {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Basic ${Buffer.from(`anystring:${MC_KEY}`).toString('base64')}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       email_address: email,
    //       status: 'subscribed',
    //       merge_fields: { FNAME: name || '', SOURCE: source || 'app' },
    //       tags: ['phonics-hub', source || 'app'],
    //     }),
    //   });
    // }

    // ── ConvertKit integration (uncomment + add env vars to enable) ────────
    // const CK_KEY     = process.env.CONVERTKIT_API_KEY;
    // const CK_FORM_ID = process.env.CONVERTKIT_FORM_ID;
    // if (CK_KEY && CK_FORM_ID) {
    //   await fetch(`https://api.convertkit.com/v3/forms/${CK_FORM_ID}/subscribe`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ api_key: CK_KEY, email, first_name: name || '' }),
    //   });
    // }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Email capture error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
