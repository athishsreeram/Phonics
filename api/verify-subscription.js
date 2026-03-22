// api/verify-subscription.js - Vercel Serverless Function
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, sessionId } = req.body;

    let isPaid = false;
    let subscriptionId = null;
    let customerId = null;

    // If session ID provided, check checkout session
    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        isPaid = session.payment_status === 'paid';
        subscriptionId = session.subscription;
        customerId = session.customer;
      } catch (err) {
        console.error('Session lookup error:', err);
      }
    }

    return res.status(200).json({
      userId,
      isPaid,
      subscriptionId,
      customerId,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ 
      isPaid: false, 
      error: error.message 
    });
  }
}
