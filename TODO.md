# Autolytiqs Outstanding Tasks

## Email Setup
- [ ] Setup Resend inbound email - Add MX record (`inbound-smtp.resend.com`, priority 10) and webhook to forward to Gmail

## GA4 Setup (G-LHXY6T7KSK)

### Key Events to Mark (Admin → Events → Toggle "Mark as key event")
- [ ] `calculation_complete` - User completes income calculation
- [ ] `budget_complete` - User finishes budget builder
- [ ] `affiliate_click` - User clicks affiliate link
- [ ] `newsletter_signup` - User submits exit popup

### Audiences to Create (Admin → Audiences → New audience)
- [ ] **Calculators** - Event: `calculation_complete`
- [ ] **Budgeters** - Event: `budget_complete`
- [ ] **High Earners** - Event: `calculation_complete` + param `annual_income` > 75000
- [ ] **Affiliate Clickers** - Event: `affiliate_click`
- [ ] **Newsletter Subscribers** - Event: `newsletter_signup`
- [ ] **Engaged Users** - Session duration > 2 min OR 3+ page views
- [ ] **Return Visitors** - Session count > 1

### Consent Settings (for GDPR/CCPA compliance)
1. **Enable Consent Mode in GA4:**
   - Admin → Data Streams → Web stream → Configure tag settings
   - Enable "Consent mode"

2. **Add consent defaults before gtag loads (in index.html):**
   ```js
   gtag('consent', 'default', {
     'analytics_storage': 'denied',
     'ad_storage': 'denied',
     'wait_for_update': 500
   });
   ```

3. **Update consent when user accepts (call from cookie banner):**
   ```js
   gtag('consent', 'update', {
     'analytics_storage': 'granted',
     'ad_storage': 'granted'
   });
   ```

4. **Cookie banner options:**
   - Cookiebot (free up to 100 pages)
   - Osano (free tier available)
   - Custom banner component

5. **GA4 Admin settings:**
   - Admin → Data Settings → Data Collection → Enable "Consent mode"
   - Admin → Data Settings → Data Retention → Set to 14 months

## Testing & Verification
- [ ] Test admin dashboard at https://autolytiqs.com/admin (password: `autolytiq2025`)
- [ ] Test PWA install on mobile and desktop
- [ ] Test exit intent popup on desktop browser
- [ ] Verify GA4 data appearing in Google Analytics (G-LHXY6T7KSK)

## Content
- [ ] Add more blog articles for SEO content (in `client/src/pages/blog/`)

## Monetization - Affiliate Signups
- [ ] Sign up for Credit Karma affiliate: https://www.creditkarma.com/partner
- [ ] Sign up for LendingTree affiliate: https://www.lendingtree.com/affiliates
- [ ] Sign up for SoFi affiliate: https://www.sofi.com/affiliate
- [ ] Sign up for NerdWallet affiliate (via ShareASale)
- [ ] Sign up for Robinhood affiliate: https://robinhood.com/us/en/about/affiliates
- [ ] Update `client/src/components/affiliate-section.tsx` with real referral tracking URLs

## Completed
- [x] Google Analytics 4 (G-LHXY6T7KSK) - GA4 only, GTM removed for simplicity
- [x] Resend email sending (noreply@autolytiqs.com)
- [x] Admin dashboard created
- [x] Blog section with 2 articles
- [x] PWA manifest and service worker
- [x] Exit intent popup component
- [x] Expanded affiliate section
