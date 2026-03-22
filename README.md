# Phonics Hub - Interactive Learning App

**Version:** 1.0.0 with Payment System  
**Status:** Week 1 Deployment Ready  
**Demo:** https://phonics77-app.vercel.app/

---

## Overview

Phonics Hub is an interactive phonics learning application for children ages 3-7. It features:

- ✅ 3 free phonics activities
- ✅ 16+ premium activities (paid tier)
- ✅ Stripe payment integration
- ✅ Privacy-first analytics
- ✅ Offline-capable design
- ✅ Mobile responsive
- ✅ No ads or tracking

---

## Quick Start

### Prerequisites
- Node.js 18+
- Stripe account (test or live keys)
- Vercel account for deployment

### Installation

```bash
# Clone the repository
git clone https://github.com/athishsreeram/phonics77-app.git
cd phonics77-app

# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:8000
```

### Environment Setup

1. **Create `.env` file** (copy from `.env.example`):
```bash
cp .env.example .env
```

2. **Add your Stripe keys:**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
```

3. **Deploy to Vercel:**
```bash
npm install -g vercel
vercel
```

---

## Project Structure

```
phonics77-app/
├── index.html                    # Main application page
├── pages/
│   └── success.html             # Post-purchase success page
├── js/
│   ├── payment.js               # Stripe integration
│   ├── activity-gating.js       # Free/paid activity logic
│   └── analytics.js             # Privacy-first tracking
├── css/
│   ├── style.css               # Main styles
│   └── payment.css             # Payment UI styles
├── api/
│   ├── create-subscription.js   # Vercel function for checkout
│   ├── verify-subscription.js   # Verify subscription status
│   └── log-events.js           # Analytics endpoint
├── .env.example                # Environment template
├── vercel.json                 # Vercel configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## Features

### Free Tier (3 Activities)
1. Sound Matching - Match letters to sounds
2. Letter Recognition - Identify letters
3. Blending Intro - Introduction to blending

### Premium Tier (16+ Activities)
- Digraph Practice
- Vowel Blends
- CVC Words
- Sight Words
- Sentence Reading
- Word Families
- Consonant Blends
- R-Controlled Vowels
- Silent E Words
- Vowel Digraphs
- Phonics Review
- Assessment Level 1
- Assessment Level 2
- Story Time
- Parent Dashboard
- Progress Tracker

### Payment System
- **Provider:** Stripe
- **Price:** $9.99/month
- **Trial:** 7 days (no credit card required)
- **Mode:** Subscription with automatic renewal

### Analytics
- Privacy-first (no 3rd party tracking)
- Client-side event collection
- Session tracking
- Conversion monitoring

---

## Configuration

### Stripe Setup

1. **Create Stripe Account:**
   - Go to https://stripe.com
   - Sign up for free account

2. **Create Product:**
   - Products → Create
   - Name: "Phonics Hub Premium"
   - Type: Service
   - Price: $9.99 USD/month

3. **Get Keys:**
   - Settings → API Keys
   - Copy Publishable Key (pk_...)
   - Copy Secret Key (sk_...)

4. **Add to Environment:**
   - Vercel Dashboard → Settings → Environment Variables
   - Add: `STRIPE_SECRET_KEY=sk_...`
   - Add: `STRIPE_PUBLIC_KEY=pk_...`
   - Redeploy

### Activity Configuration

Edit `js/activity-gating.js` to customize free/paid split:

```javascript
const ACTIVITY_TIERS = {
  free: [
    'sound-matching',
    'letter-recognition',
    'blending-intro'
  ],
  paid: [
    // All other activities
  ]
};
```

---

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# Then redeploy
vercel --prod
```

### GitHub Pages

For static hosting without payment processing:
```bash
npm run build
# Push to gh-pages branch
```

---

## Testing

### Local Testing
```bash
npm run dev
# Visit http://localhost:8000
```

### Payment Testing
Use Stripe test card:
```
Number: 4242 4242 4242 4242
Exp: 12/25
CVC: 123
```

### Mobile Testing
- Test on iPhone: https://phonics77-app.vercel.app/
- Test on Android: https://phonics77-app.vercel.app/
- Check responsive design

---

## Monitoring

### Stripe Dashboard
- Monitor subscriptions: https://dashboard.stripe.com/subscriptions
- View transactions: https://dashboard.stripe.com/transactions
- Check webhooks: https://dashboard.stripe.com/webhooks

### Vercel Analytics
- Function logs: https://vercel.com/dashboard
- Deployment history: View deployments tab
- Environment variables: Settings → Environment Variables

---

## Support

**Email:** startdreamhere123@gmail.com  
**GitHub Issues:** https://github.com/athishsreeram/phonics77-app/issues  
**Stripe Support:** https://support.stripe.com

---

## Security

- ✅ API keys stored in Vercel environment variables (not in code)
- ✅ CORS enabled for API endpoints
- ✅ HTTPS only (Vercel handles SSL)
- ✅ No sensitive data in localStorage
- ✅ Privacy-first analytics (no 3rd party tracking)

---

## Performance

- ✅ Single page load
- ✅ Fast payment checkout (<1s redirect)
- ✅ Minimal JavaScript (no heavy frameworks)
- ✅ Optimized images
- ✅ Cache-friendly structure

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Roadmap

**Phase 1:** ✅ Payment system (CURRENT)  
**Phase 2:** Analytics + onboarding (Week 2-3)  
**Phase 3:** Blog + SEO + launch prep (Week 3-4)  
**Phase 4:** ProductHunt launch (Week 4+)  
**Phase 5:** Scale to $5k MRR (Month 6+)  

---

## License

MIT License - See LICENSE file for details

---

## Author

**Athish Sreeram**  
- GitHub: https://github.com/athishsreeram
- Portfolio: https://athishsreeram.github.io/

---

## Changelog

### v1.0.0 (March 2026)
- ✅ Initial release with payment system
- ✅ Stripe integration
- ✅ Activity gating (free/paid)
- ✅ Analytics tracking
- ✅ Vercel deployment
- ✅ Mobile responsive

---

## Questions?

Email support@startdreamhere123.gmail.com or open an issue on GitHub.

**Ready to launch? Deploy to Vercel and start taking payments!** 🚀
