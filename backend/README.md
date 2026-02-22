# Juni Backend

Node.js + TypeScript REST API powering the Juni B2C platform.

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ |
| Language | TypeScript (strict mode) |
| Framework | Express 4 |
| ORM | Prisma 6 + PostgreSQL |
| Auth | JWT (access + refresh tokens), bcrypt |
| Email | SendGrid |
| Payments | Stripe (subscriptions + Connect payouts) |
| Background checks | Checkr |
| SMS / Masked calls | Twilio + Twilio Proxy |
| File storage | AWS S3 (presigned URLs) |
| AI | Anthropic Claude (Daily Bloom, visit insights) |
| Logging | Winston |
| Validation | Zod |

## Security

- JWT access tokens (15 min) + httpOnly cookie refresh tokens (30 days)
- Refresh token rotation — each use issues a new pair and revokes the old one
- bcrypt password hashing (cost factor 12)
- Webhook signature verification (Stripe `stripe-signature`, Checkr HMAC-SHA256)
- Rate limiting: 10 req/15min for auth, 100 req/min for API
- Helmet security headers (CSP, HSTS, noSniff)
- Strict CORS — only `FRONTEND_URL` origin allowed
- Presigned S3 URLs — files never flow through the backend
- All tokens stored hashed in DB

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Accounts with Checkr, Stripe, SendGrid, Twilio, AWS, Anthropic

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your real values — see notes below for each service
```

### 3. Set up the database

```bash
# Create the database (PostgreSQL)
createdb juni_dev

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed demo data
npm run db:seed
```

### 4. Start the server

```bash
npm run dev   # Development (hot reload)
npm run build && npm start  # Production
```

Server starts on `http://localhost:3001`.

Health check: `GET http://localhost:3001/health`

---

## Third-Party Account Setup

### Checkr (Background Checks)

> **Required before accepting companion applications.**

1. Sign up at [checkr.com](https://checkr.com) → request a business account
2. Dashboard → **Settings → API Keys** → copy your test API key
3. Dashboard → **Webhooks → Add Endpoint**
   - URL: `https://your-domain.com/webhooks/checkr`
   - Events: Select all `report.*`, `invitation.*`, `screening.*`
   - Copy the webhook secret
4. Dashboard → **Packages** → create two packages:
   - `juni_fellow_standard` — SSN trace, criminal, sex offender, federal, county, watchlist
   - `juni_fellow_enhanced` — above + MVR, education verification, personal reference
5. Set in `.env`:
   ```
   CHECKR_API_KEY=your_test_api_key
   CHECKR_WEBHOOK_SECRET=your_webhook_secret
   ```

---

### Stripe (Payments & Companion Payouts)

> **Required before accepting family subscriptions or companion payouts.**

1. Sign up at [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Developers → API Keys** → copy Secret Key (`sk_test_...`)
3. **Products** → create 3 products with monthly prices:
   - **Essentials** — $640/mo (8 hrs/mo)
   - **Premium** — $1,280/mo (16 hrs/mo)
   - **Legacy** — $2,400/mo (24+ hrs/mo)
4. **Developers → Webhooks → Add Endpoint**:
   - URL: `https://your-domain.com/webhooks/stripe`
   - Events: `customer.subscription.*`, `invoice.payment_succeeded`, `invoice.payment_failed`, `account.updated`, `transfer.*`
   - Copy webhook signing secret (`whsec_...`)
5. **Connect** → Enable Stripe Connect (Express accounts for companion payouts)
6. Set in `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_ESSENTIALS=price_...
   STRIPE_PRICE_PREMIUM=price_...
   STRIPE_PRICE_LEGACY=price_...
   ```
7. For local webhook testing:
   ```bash
   stripe listen --forward-to localhost:3001/webhooks/stripe
   ```

---

### SendGrid (Transactional Email)

> **Required for account verification and notifications.**

1. Sign up at [app.sendgrid.com](https://app.sendgrid.com)
2. **Settings → API Keys** → Create API Key (Full Access) → copy
3. **Settings → Sender Authentication** → verify your sending domain
4. **Email API → Dynamic Templates** → create 7 templates (copy IDs):
   - Welcome — Family
   - Welcome — Companion
   - Email Verification
   - Password Reset
   - Visit Reminder
   - Daily Bloom Digest
   - Background Check Complete
5. Set in `.env`:
   ```
   SENDGRID_API_KEY=SG.your_key
   SENDGRID_FROM_EMAIL=no-reply@your-domain.com
   SENDGRID_TEMPLATE_WELCOME_FAMILY=d-...
   SENDGRID_TEMPLATE_WELCOME_COMPANION=d-...
   SENDGRID_TEMPLATE_VERIFY_EMAIL=d-...
   SENDGRID_TEMPLATE_PASSWORD_RESET=d-...
   SENDGRID_TEMPLATE_VISIT_REMINDER=d-...
   SENDGRID_TEMPLATE_BLOOM_DIGEST=d-...
   SENDGRID_TEMPLATE_BG_CHECK_COMPLETE=d-...
   ```

---

### Twilio (SMS + Masked Phone Numbers)

> **Required for visit notifications and companion↔family masked calling.**

1. Sign up at [console.twilio.com](https://console.twilio.com)
2. **Account Info** → copy Account SID and Auth Token
3. **Phone Numbers → Buy a Number** — choose a US number
4. **Proxy → Services → Create Service** → copy Service SID (`KS...`)
   - This powers masked phone numbers so families and companions never see each other's real numbers
5. Set in `.env`:
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1555...
   TWILIO_PROXY_SERVICE_SID=KS...
   ```

---

### AWS S3 (File Storage)

> **Required for document uploads and Legacy Vault (audio/photos/stories).**

1. Sign up at [aws.amazon.com](https://aws.amazon.com)
2. **IAM → Users → Create User** (programmatic access)
3. Attach policy: `AmazonS3FullAccess` (tighten to specific bucket in production)
4. Copy Access Key ID and Secret
5. **S3 → Create Bucket** → name it `juni-production` (or similar)
   - Block all public access ✓
   - Enable server-side encryption (AES-256) ✓
   - Set CORS policy:
     ```json
     [{"AllowedHeaders":["*"],"AllowedMethods":["PUT","GET"],"AllowedOrigins":["https://your-domain.com"],"MaxAgeSeconds":3600}]
     ```
6. Set in `.env`:
   ```
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=juni-production
   ```

---

### Anthropic Claude (AI — Daily Bloom & Insights)

> **Required for AI-powered Daily Bloom and companion visit prep.**

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. **API Keys → Create Key** → copy
3. Set in `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
The backend uses `claude-sonnet-4-6` for Daily Bloom generation and `claude-haiku-4-5-20251001` for visit prep (faster/cheaper).

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register/family` | None | Register family account |
| POST | `/api/auth/register/companion` | None | Submit companion application |
| POST | `/api/auth/login` | None | Login → returns access token + sets refresh cookie |
| POST | `/api/auth/refresh` | Cookie | Rotate tokens |
| POST | `/api/auth/logout` | Bearer | Revoke refresh token |
| POST | `/api/auth/verify-email` | None | Verify email address |
| POST | `/api/auth/forgot-password` | None | Request password reset email |
| POST | `/api/auth/reset-password` | None | Complete password reset |
| GET | `/api/auth/me` | Bearer | Current user info |

### Families
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/families/me` | Full family profile + seniors + subscription |
| PATCH | `/api/families/me` | Update profile |
| GET | `/api/families/seniors` | List seniors |
| GET | `/api/families/seniors/:id` | Senior detail + matches + visits |
| PATCH | `/api/families/seniors/:id` | Update senior / save vibe check |
| POST | `/api/families/seniors/:id/request-matches` | Run Kindred matching |
| POST | `/api/families/matches/:matchId/accept` | Accept a proposed match |
| POST | `/api/families/matches/:matchId/reject` | Reject a proposed match |
| GET | `/api/families/seniors/:id/visits` | Visit history |
| POST | `/api/families/seniors/:id/visits` | Request a visit |

### Companions
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/companions/me` | Profile + seniors + payouts |
| PATCH | `/api/companions/me` | Update profile |
| POST | `/api/companions/me/background-check/initiate` | Start Checkr screening |
| GET | `/api/companions/me/background-check/status` | Screening status |
| PATCH | `/api/companions/me/training` | Update training module % |
| GET | `/api/companions/me/seniors/:id/visit-prep` | AI visit prep hints |
| GET | `/api/companions/me/visits` | Visit schedule |
| GET | `/api/companions/me/payouts` | Payout history |
| POST | `/api/companions/me/stripe-connect/onboard` | Start Stripe KYC |

### Visits
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/visits/:id` | Visit detail |
| POST | `/api/visits/:id/check-in` | GPS check-in |
| POST | `/api/visits/:id/check-out` | Submit notes → triggers AI Bloom |
| POST | `/api/visits/:id/cancel` | Cancel a visit |
| GET | `/api/visits/seniors/:id/trends` | AI 30-day trend analysis |

### Billing
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/billing/checkout` | Create Stripe Checkout session |
| POST | `/api/billing/portal` | Open Stripe Customer Portal |
| GET | `/api/billing/subscription` | Current subscription |
| GET | `/api/billing/invoices` | Invoice history |
| POST | `/api/billing/payouts/run` | *(Admin)* Run bi-weekly payouts |

### Webhooks
| Method | Path | Description |
|--------|------|-------------|
| POST | `/webhooks/stripe` | Stripe event handler |
| POST | `/webhooks/checkr` | Checkr event handler |
