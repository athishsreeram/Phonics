# Phonics Hub — Full-Stack Interactive Learning App

**Version:** 2.0.0 — Full API Integration  
**Status:** Production Ready  
**Demo:** https://phonics77-app.vercel.app/

---

## System Architecture

Three apps, one backend, fully wired:

```
phonics77-app (Vercel)          →  App 1: Learning frontend
phonics-admin (GitHub Pages)    →  App 2: Admin dashboard
phonics-api (Render)            →  App 3: Backend API + PostgreSQL (Neon)
```

Data flow:

```
Parent opens phonics77-app
       ↓  POST /api/users/register        →  users table
       ↓  POST /api/events                →  events table (every page, every activity)
       ↓  POST /api/emails                →  email_leads table
       ↓  POST /api/subscriptions/checkout →  Stripe checkout
       ↓  GET  /api/stories               →  stories table (Story Time)

Admin opens phonics-admin
       ↓  POST /api/admin/login           →  JWT token
       ↓  GET  /api/admin/overview        →  live KPIs
       ↓  CRUD /api/stories               →  manage story library
```

---

## Live URLs

| App | URL | Host |
|-----|-----|------|
| Learning App | https://phonics77-app.vercel.app | Vercel |
| Admin Dashboard | https://athishsreeram.github.io/phonics-admin | GitHub Pages |
| Backend API | https://phonics-api-k43i.onrender.com | Render |
| API Health | https://phonics-api-k43i.onrender.com/health | — |

---

## Quick Start

```bash
git clone https://github.com/athishsreeram/phonics77-app.git
cd phonics77-app
npm install
npm run dev
# Visit http://localhost:8000
```

The app works offline-first. All API calls are fire-and-forget — everything degrades gracefully if the backend is unreachable.

---

## Project Structure

```
phonics77-app/
├── index.html                     # Home — activity grid, onboarding, progress widget
├── story.html                     # Story Time — loads stories from API dynamically
├── parent-dashboard.html          # Parent view — syncs profile + premium from API
├── listen-choose.html             # Free: Sound Matching
├── alphabet.html                  # Free: Letter Recognition
├── phonic-set1.html               # Free: Blending Intro
├── digraphs.html                  # Premium: Digraph Practice
├── vowels.html                    # Premium: Vowel Blends
├── cvc.html                       # Premium: CVC Words
├── sight-words.html               # Premium: Sight Words
├── read.html                      # Premium: Sentence Reading
├── rhyme.html                     # Premium: Word Families
├── consonant-blend.html           # Premium: Consonant Blends
├── phonic-set2.html               # Premium: R-Controlled Vowels
├── magic-e.html                   # Premium: Silent E Words
├── digraph_fill.html              # Premium: Vowel Digraphs
├── phkids.html                    # Premium: Phonics Review
├── word-match.html                # Premium: Word Match
├── word-explore.html              # Premium: Word Explorer
├── trace.html                     # Premium: Alphabet Tracing
├── alphabet-ballon-pop.html       # Premium: Balloon Pop
├── read2.html                     # Premium: Reading Level 2
│
├── pages/
│   ├── success.html               # Post-payment — verifies session via API
│   ├── progress.html              # Progress view — syncs premium status from API
│   └── onboarding.html            # Onboarding flow
│
├── js/
│   ├── config.js                  # API base URL — only file to edit when URL changes
│   ├── api.js                     # ★ NEW: Central API client for all Render operations
│   ├── analytics.js               # Event tracking → POST /api/events
│   ├── payment.js                 # Stripe checkout → POST /api/subscriptions/checkout
│   ├── activity-gating.js         # Free/premium access control
│   ├── onboarding.js              # Onboarding → POST /api/users/register
│   ├── progress.js                # Progress widget (index page)
│   ├── audio.js                   # Text-to-speech manager
│   ├── materials.js               # Phonics data (alphabet, words)
│   └── ui.js                      # Shared UI helpers
│
├── css/
│   ├── style.css                  # Index page styles
│   ├── shared.css                 # Activity page styles
│   └── payment.css                # Payment modal styles
│
├── api/                           # Vercel serverless functions (all proxy to Render)
│   ├── create-subscription.js     # → POST /api/subscriptions/checkout
│   ├── verify-subscription.js     # → GET  /api/subscriptions/verify
│   ├── log-events.js              # → POST /api/events
│   └── capture-email.js           # → POST /api/emails + /api/users/register
│
├── vercel.json
├── package.json
└── README.md
```

---

## API Integration (js/api.js)

All API operations are centralised in `js/api.js`. Every page loads it after `config.js`.

| Method | Endpoint | Triggered by | When |
|--------|----------|-------------|------|
| `POST` | `/api/events` | Every page | Auto on load (page_view) |
| `POST` | `/api/events` | Every activity | activityStart, activityComplete, upgradeClick |
| `POST` | `/api/users/ping` | Every page | Auto on load (last_seen update) |
| `POST` | `/api/users/register` | Onboarding, email modal | User provides email |
| `GET`  | `/api/users/me` | parent-dashboard, progress | Premium status sync from server |
| `POST` | `/api/emails` | Email capture widget | User subscribes to tips |
| `GET`  | `/api/stories` | story.html | Page load — replaces hardcoded stories |
| `POST` | `/api/subscriptions/checkout` | Any upgrade button | User clicks Go Premium |
| `GET`  | `/api/subscriptions/verify` | pages/success.html | After Stripe payment |

### Using the API client

```javascript
// Available on window.PhonicsAPI (loaded via js/api.js)

PhonicsAPI.logEvent('custom_event', { extra: 'data' });

await PhonicsAPI.registerUser('parent@email.com', 'Emma', 5);

const user = await PhonicsAPI.getUser();
// user.status: 'free' | 'trialing' | 'active'

await PhonicsAPI.captureEmail('parent@email.com', 'Jane', 'homepage');

const stories = await PhonicsAPI.getStories();

await PhonicsAPI.startCheckout(successUrl, cancelUrl);

const result = await PhonicsAPI.verifySession(sessionId);
```

---

## Activity Tracking

Every activity page fires start on load and complete on exit/finish:

```javascript
analytics.trackActivityStart('sound-matching');    // auto on load
analytics.trackActivityComplete('sound-matching', score, total); // on game end
```

| Page | Activity ID |
|------|-------------|
| listen-choose.html | `sound-matching` |
| alphabet.html | `letter-recognition` |
| phonic-set1.html | `blending-intro` |
| digraphs.html | `digraph-practice` |
| vowels.html | `vowel-blends` |
| cvc.html | `cvc-words` |
| sight-words.html | `sight-words` |
| read.html | `sentence-reading` |
| rhyme.html | `word-families` |
| consonant-blend.html | `consonant-blends` |
| phonic-set2.html | `r-controlled-vowels` |
| magic-e.html | `silent-e-words` |
| digraph_fill.html | `vowel-digraphs` |
| phkids.html | `phonics-review` |
| word-match.html | `word-match` |
| word-explore.html | `word-explorer` |
| story.html | `story-time` |
| trace.html | `alphabet-tracing` |
| alphabet-ballon-pop.html | `balloon-pop` |
| read2.html | `reading-level-2` |

---

## Environment Variables

All secrets live in **Render** only. App 1 (Vercel) has no secrets.

### Vercel (App 1)

| Key | Value |
|-----|-------|
| `PHONICS_API_BASE` | `https://phonics-api-k43i.onrender.com` |

### Render (App 3 — phonics-api)

| Key | Required | Description |
|-----|----------|-------------|
| `DATABASE_URL` | Optional | Neon connection string. Omit for in-memory fallback. |
| `JWT_SECRET` | Yes | `openssl rand -hex 32` |
| `ADMIN_EMAIL` | Yes | Admin login email for phonics-admin |
| `ADMIN_PASSWORD` | Yes | Admin login password |
| `ALLOWED_ORIGINS` | Yes | `https://phonics77-app.vercel.app,https://athishsreeram.github.io` |
| `STRIPE_SECRET_KEY` | No | Stripe Dashboard → API Keys |
| `STRIPE_PRICE_ID` | No | Stripe Dashboard → Products |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe Dashboard → Webhooks |
| `NODE_ENV` | Yes | `production` |

---

## Payment System

- **Provider:** Stripe
- **Price:** $9.99/month with 7-day free trial
- **Flow:** Upgrade button → `PhonicsAPI.startCheckout()` → Render API → Stripe → `pages/success.html` → `PhonicsAPI.verifySession()` → premium unlocked in localStorage

### Stripe Webhook

Endpoint: `https://phonics-api-k43i.onrender.com/api/subscriptions/webhook`

Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

### Test card

```
Number: 4242 4242 4242 4242
Exp: 12/25  CVC: 123
```

---

## Database Tables (Neon PostgreSQL)

| Table | Populated by |
|-------|-------------|
| `users` | `POST /api/users/register` — onboarding + email capture |
| `events` | `POST /api/events` — every page load and activity |
| `email_leads` | `POST /api/emails` — email capture widget |
| `stories` | Seeded via `seed.sql` or Admin Dashboard CRUD |
| `subscriptions` | Stripe webhook |

Seed initial data by running `seed.sql` in the Neon SQL Editor.

---

## Local Storage Keys

| Key | Value |
|-----|-------|
| `ph_premium` | `'true'` if premium active |
| `ph_email` | Parent email |
| `ph_user` | Cached user object from API |
| `ph_profile` | Child name, age, goals |
| `ph_session` | Session ID |
| `ph_progress` | Activity scores |
| `ph_streak` | Streak count + last date |
| `ph_onboarded` | `'true'` after onboarding |
| `alpha_mastered` | Mastered letter indices |

---

## Local Development

```bash
npm run dev   # http://localhost:8000

# To use local API, edit js/config.js:
window.PHONICS_API_BASE = 'http://localhost:3001';

# Restore production:
window.PHONICS_API_BASE = 'https://phonics-api-k43i.onrender.com';
```

---

## Deployment

### App 1 — Vercel (auto-deploys on push)

```bash
git add -A
git commit -m "your message"
git push
```

### App 3 — Render (after first deploy, run once)

```bash
# In Render Shell:
node src/db/migrate-standalone.js
```

---

## API Testing

```bash
# Health check
curl https://phonics-api-k43i.onrender.com/health

# Full test suite (in phonics-api repo)
bash test/curl-tests.sh
```

---

## Admin Dashboard

URL: https://athishsreeram.github.io/phonics-admin

Login with `ADMIN_EMAIL` + `ADMIN_PASSWORD` from Render env vars.

Tabs: Overview (KPIs) · Stories (CRUD) · Events · Leads · Users

---

## Browser Support

Chrome, Firefox, Safari, Edge (latest). iOS Safari and Chrome Android.

---

## Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Done | Payment system + Stripe |
| 2 | ✅ Done | Full API integration — users, events, stories, subscriptions |
| 3 | 🔜 Next | Blog + SEO + launch prep |
| 4 | 🔜 Next | ProductHunt launch |
| 5 | 🔜 Next | Scale to $5k MRR |

---

## Support

**Email:** startdreamhere123@gmail.com  
**Issues:** https://github.com/athishsreeram/phonics77-app/issues

---

## Author

**Athish Sreeram** · https://github.com/athishsreeram · https://athishsreeram.github.io

---

## Changelog

### v2.0.0 (March 2026)
- ✅ `js/api.js` — central API client, loaded on all 25 pages
- ✅ Users table populated via onboarding + email capture
- ✅ Events fired on every page load and activity start/complete
- ✅ Story Time fetches stories from API (hardcoded fallback if offline)
- ✅ Premium status verified server-side via `GET /api/users/me`
- ✅ Stripe checkout routed through Render API
- ✅ Vercel API functions proxy to Render backend
- ✅ Admin dashboard with stories CRUD
- ✅ `trackActivityComplete` on all 20 activity pages

### v1.0.0 (March 2026)
- ✅ Initial release with Stripe payment system
- ✅ Activity gating (free/premium)
- ✅ Client-side analytics
- ✅ Vercel deployment
- ✅ Mobile responsive