# Monetization System

This module implements a 3-tier report monetization system with Pro upsells, affiliate placements, referral unlocks, and B2B inquiry capture.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client (React)                             │
├─────────────────────────────────────────────────────────────────────┤
│  ProUpsell  │  AffiliateBlock  │  ReferralShare  │  B2BInquiry     │
│  Component  │  Component       │  Component      │  Component       │
├─────────────────────────────────────────────────────────────────────┤
│                    useMonetization() Hook                            │
│         (fetches flags, pricing, entitlements from API)              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           Server (Express)                           │
├─────────────────────────────────────────────────────────────────────┤
│                         API Routes                                   │
│  /api/monetization/*  │  /api/checkout/*  │  /api/webhooks/stripe   │
├─────────────────────────────────────────────────────────────────────┤
│                      Business Logic                                  │
│  config.ts  │  entitlement.ts  │  pro-report.ts  │  types.ts        │
├─────────────────────────────────────────────────────────────────────┤
│                      Data Layer (db.ts)                              │
│  purchases  │  entitlements  │  referrals  │  affiliate_offers     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Stripe API                                  │
│              Checkout Sessions  │  Webhooks                          │
└─────────────────────────────────────────────────────────────────────┘
```

## Feature Flags

All monetization features are gated behind environment variables. **All flags default to OFF (false)**.

| Flag | Description | Default |
|------|-------------|---------|
| `MONETIZATION_ENABLED` | Master switch - required for any monetization | `false` |
| `PRO_REPORT_ENABLED` | Enable Pro Report upsell and checkout | `false` |
| `PREMIUM_TOOLKIT_ENABLED` | Enable Premium tier (stub) | `false` |
| `AFFILIATE_BLOCK_ENABLED` | Show affiliate offers in reports | `false` |
| `REFERRAL_UNLOCK_ENABLED` | Enable referral-to-unlock system | `false` |
| `B2B_INQUIRY_ENABLED` | Enable enterprise inquiry form | `false` |

### Enabling Features

```bash
# Enable all monetization features
MONETIZATION_ENABLED=true
PRO_REPORT_ENABLED=true
AFFILIATE_BLOCK_ENABLED=true
REFERRAL_UNLOCK_ENABLED=true
B2B_INQUIRY_ENABLED=true

# Stripe configuration (required for payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pricing (optional - defaults shown)
PRO_REPORT_PRICE_CENTS=999        # $9.99
PRO_REPORT_CURRENCY=usd

# Referral (optional)
REFERRAL_REWARD_THRESHOLD=1       # Referrals needed for reward
```

## Tier System

| Tier | Price | Features |
|------|-------|----------|
| **FREE** | $0 | Base report, income projection, basic tips |
| **PRO** | $9.99 | + Stability Score, Approval Readiness, Leverage Moves, 30-Day Plan |
| **PREMIUM** | TBD | + Templates, Monthly Refresh (stub) |

## Database Tables

### purchases
Tracks payment transactions.

```sql
CREATE TABLE purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT NOT NULL,
  report_id TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'PRO',
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_ref TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### entitlements
Grants access to report tiers.

```sql
CREATE TABLE entitlements (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'FREE',
  source_purchase_id TEXT,
  source_referral_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);
```

### referrals
Tracks referral codes.

```sql
CREATE TABLE referrals (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  owner_report_id TEXT NOT NULL,
  owner_user_id TEXT,
  owner_email TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  reward_granted INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### affiliate_offers
Configurable affiliate products.

```sql
CREATE TABLE affiliate_offers (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### partner_inquiries
B2B lead capture.

```sql
CREATE TABLE partner_inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  volume TEXT,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/monetization/flags` | Get feature flags |
| GET | `/api/monetization/pricing` | Get pricing info |
| GET | `/api/monetization/entitlement/:reportId` | Get entitlement status |
| GET | `/api/monetization/affiliate-offers` | Get affiliate offers |
| GET | `/r/:slug` | Affiliate redirect with tracking |

### Checkout Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/checkout/pro-report` | Create Stripe checkout session |
| GET | `/api/checkout/success` | Validate checkout completion |
| POST | `/api/webhooks/stripe` | Handle Stripe webhook events |

### Referral Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/monetization/referral/create` | Create referral code |
| POST | `/api/monetization/referral/track` | Track referral conversion |
| GET | `/api/monetization/referral/:reportId` | Get referral status |

### B2B Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/partner` | Submit enterprise inquiry |
| GET | `/api/partner/inquiries` | List inquiries (admin) |

## Stripe Integration

### Webhook Setup

1. Create webhook in Stripe Dashboard pointing to: `https://yourdomain.com/api/webhooks/stripe`
2. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
3. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Testing Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Note the webhook signing secret (whsec_...)
```

## Rollback Plan

### Immediate Disable (No Code Deploy)

Set environment variable and restart:

```bash
MONETIZATION_ENABLED=false
```

This immediately:
- Hides all monetization UI
- Disables checkout endpoints
- Returns FREE tier for all entitlement checks
- Existing purchases remain in database (not affected)

### Partial Disable

Disable specific features:

```bash
MONETIZATION_ENABLED=true          # Keep master on
PRO_REPORT_ENABLED=false           # Disable Pro purchases
AFFILIATE_BLOCK_ENABLED=false      # Hide affiliate links
REFERRAL_UNLOCK_ENABLED=false      # Disable referral system
B2B_INQUIRY_ENABLED=false          # Hide B2B form
```

### Full Rollback (Code Removal)

If needed to completely remove:

1. Remove routes from `server/routes.ts`:
   ```typescript
   // Comment out these lines
   // app.use("/api/monetization", monetizationRoutes);
   // app.use("/api/checkout", monetizationRoutes);
   // ...
   ```

2. Database tables can remain (no impact on existing functionality)

3. Client components are conditionally rendered based on flags - no changes needed

## Testing

Run unit tests:

```bash
# Entitlement tests
npx tsx server/monetization/__tests__/entitlement.test.ts

# Config tests
npx tsx server/monetization/__tests__/config.test.ts
```

## File Structure

```
server/monetization/
├── __tests__/
│   ├── config.test.ts      # Config/flag tests
│   └── entitlement.test.ts # Tier logic tests
├── config.ts               # Feature flags and pricing config
├── db.ts                   # Database tables and operations
├── entitlement.ts          # Entitlement resolver
├── index.ts                # Module entry point
├── pro-report.ts           # Pro report content generator
├── routes.ts               # API routes
├── types.ts                # TypeScript types
└── README.md               # This file

client/src/
├── components/monetization/
│   ├── affiliate-block.tsx
│   ├── b2b-inquiry.tsx
│   ├── index.ts
│   ├── pro-upsell.tsx
│   └── referral-share.tsx
├── hooks/
│   └── use-monetization.ts
└── lib/
    └── monetization.ts
```

## Security Considerations

1. **Price Validation**: Server always determines price from config, never trusts client
2. **Entitlement Source of Truth**: Server-side entitlement resolver, never client
3. **Webhook Verification**: Stripe signature verification on all webhook events
4. **Duplicate Prevention**: Checks for existing purchases before creating checkout
5. **Referral Fraud Prevention**: Fingerprint hashing, rate limiting, duplicate checks

## Compliance Notes

- No financial guarantees or promises of returns in copy
- Affiliate disclosure included in report
- Clear pricing shown before checkout
- Refund handling via Stripe Dashboard
