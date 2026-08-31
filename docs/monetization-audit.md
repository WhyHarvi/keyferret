# KeyFerret Monetization Audit

Generated 2026-08-31 by the `money-thinker` agent.

## Money Map

```text
Current revenue sources: None live in production. AdSense wiring exists (ads.txt has a real publisher ID pub-2019414791707130, AdSlot component + 3 placements + loader script all built) but NEXT_PUBLIC_ADSENSE_CLIENT_ID is absent from the deployed Cloudflare Worker's secrets (`wrangler secret list` only shows DATABASE_URL, IGDB_CLIENT_ID, IGDB_CLIENT_SECRET, NEXT_PUBLIC_SITE_URL) — so every AdSlot on the live site is almost certainly rendering the "Ad space" placeholder, not a real ad.

Current high-intent user actions: Clicking "Get deal" / "View deal" on a game's price-comparison list (LivePriceCompare, StickyPriceBar), a homepage/trending deal card (DealListingCard, DealCard), or a /deals grid item. Every one of these is already instrumented with sendBeacon-based click tracking (offer_click / deal_click, with dealId, price, storeName in metadata) and rel="sponsored" — this is a fully built, high-quality conversion-tracking layer with nothing paying into it yet.

Existing monetizable assets:
 - lib/pricing/cheapshark.ts + lib/pricing/pricing.service.ts: DB-cached Offer/Store data with per-store purchaseUrl, refreshed hourly, for every game with confirmed offers.
 - Full click-tracking pipeline (lib/analytics-client.ts → app/api/analytics/route.ts → AnalyticsEvent table → app/analytics dashboard) already answering "which store, which price, how many clicks" — exactly what's needed to prove affiliate/ad ROI.
 - A fully built price-alert email system (prisma PriceAlert model, lib/alerts/service.ts, lib/alerts/email.ts via Resend, verify/unsubscribe pages, app/api/cron/price-alerts/route.ts) — the only owned-audience mechanism on the site.
 - SEO surface already invested in: sitemap.ts only indexes games with confirmed offers, /deals/[filter] pages, /genre pages — decent programmatic-SEO discipline already in place.
 - Terms of Service already contains affiliate-disclosure language ("Some outbound deal links may include affiliate or referral parameters...") — legal groundwork for affiliate monetization is done and just waiting on actual affiliate links.

Biggest current revenue leak: Every single outbound "buy" click — the site's only commercial-intent action — routes through https://www.cheapshark.com/redirect?dealID=... , CheapShark's own tracked redirect, not a KeyFerret-owned affiliate link. Several of the 14 stores CheapShark aggregates for this catalog (GreenManGaming, Fanatical, GOG, Humble Store, Gamesplanet) run real, well-documented affiliate programs (GreenManGaming: 2–6% via CJ Affiliate, 30-day cookie; Fanatical: 2–6%+ via CJ Affiliate, 30-day cookie) — commission that currently accrues to CheapShark, not KeyFerret, on 100% of clicks.

Runner-up leak: the price-alert pipeline is fully coded but operationally dead — RESEND_API_KEY is unset both locally and in production (every send silently no-ops with a console.warn), and there is no Cloudflare Cron Trigger configured anywhere (wrangler.jsonc has no triggers.crons block) to ever call /api/cron/price-alerts. Anyone who signs up today never receives the verification email, so never gets verified, so never gets a price-drop email. The site's only retention/re-engagement asset is inert.

Fastest path to first/next dollar: Fix the AdSense production deploy (config-only, hours) → apply to/verify affiliate programs for the top stores and wrap purchaseUrl (external approval lead time, but zero new UI) → resurrect the price-alert email pipeline (config-only, hours) as the foundation for a compounding owned-audience channel.
```

## Top Opportunities

| Priority | Idea | Revenue Model | Why It Fits | Effort | Speed to Revenue | Revenue Potential |
|---|---|---|---|---|---|---|
| P0 | Fix AdSense production deploy (bake `NEXT_PUBLIC_ADSENSE_CLIENT_ID` into the build, replace fake `slotId` placeholders with real AdSense ad-unit IDs) | Display ads | 3 placements, loader script, ads.txt, and a real publisher ID already exist in the repo — this is a broken pipe, not a missing feature | Very low (config only) | Hours–1 day | Low–moderate at current traffic; scales with sessions |
| P0 | Direct affiliate links on outbound offer/deal clicks (replace CheapShark's redirect with KeyFerret's own affiliate-tagged link for stores with real programs) | Affiliate commission | Click funnel, tracking (`offer_click`/`deal_click`), and legal disclosure are 100% built; only the destination URL and a network account are missing | Moderate (backend link-resolution logic) + external approval (days–weeks) | 1–3 weeks (approval-gated) | Highest ceiling — direct % of every game-key sale, $5–$70 AOV, 30-day cookies |
| P0 | Restore the price-alert email pipeline (set `RESEND_API_KEY`, add a Cloudflare Cron Trigger for `/api/cron/price-alerts`) | Enables recurring revenue (email = future affiliate/digest revenue) | Feature is fully coded and silently dead; fixing it is pure config | Very low (config only) | Hours | Indirect but foundational — unlocks the digest idea below |
| P1 | Sitewide "cheapest deals this week" email digest (new capture point on homepage/footer/deals pages, weekly cron reusing `getCheapSharkDeals`) | Affiliate + eventual sponsorship | Reuses Resend infra from the alert fix and the deals feed already powering `/deals`; turns SEO traffic into an owned, repeatable channel | Moderate (new capture UI + Subscriber model + weekly cron) | 2–4 weeks | Compounds with affiliate revenue over time |
| P1 | Tie Watchlist to price alerts (bulk "email me on any drop" instead of per-game opt-in) | Lead capture → recurring | Watchlist today is anonymous localStorage-only, a dead end; alerts are per-game only — merging them raises alert signup rate | Low–moderate | 1–2 weeks | Increases the email list that the digest and affiliate emails monetize |
| P2 | Sponsored/featured placement in `HeroCarousel` or `TrendingRow` for a specific store/publisher | Direct sponsorship | Slot already exists visually; needs a sales relationship, not new code | Low (code) / High (BD) | Needs real traffic + a sales conversation first | Meaningful only once traffic is provable |
| P3 | Paid API / data product on top of `Game`/`Offer` tables | Data licensing | Data is real and structured, but sourced from IGDB (Twitch ToS) and CheapShark (free public API) — redistribution terms need checking before this is safe to build | High + legal risk | Slow | Unproven; don't build before validating ToS allows resale |

## Best 3 Actions

### 1. Replace CheapShark's redirect with direct affiliate links on outbound clicks

**Why:**
This is the only place on the site with clear purchase intent, and it's already fully wired for tracking and disclosure — the money is being left on the table at the exact moment a user is about to spend $5–$70 on a game key. CheapShark's `/redirect?dealID=` endpoint is CheapShark's own tracked link; nothing indicates their free public API passes any commission share to consumers of the API. Real affiliate programs with meaningful commissions exist for several of the 14 active CheapShark-tracked stores this catalog surfaces: GreenManGaming and Fanatical both run 2–6% (CJ Affiliate, 30-day cookie), GOG runs an Awin-based program, Humble Store has its own Partner Program, and Gamesplanet runs its own affiliate program. Steam and Epic don't have consumer affiliate programs, so those clicks stay as-is.

**Implementation:**
- Apply to CJ Affiliate (for GreenManGaming + Fanatical), Awin (for GOG / Gamesplanet), and the Humble Partner Program.
- Add `lib/affiliate/` with a store-name → network config (affiliate ID/tracking template per store), mirroring the existing `Store` model's `provider`/`externalId`/`name` fields — no schema change needed, just a lookup keyed on `store.name` or `store.externalId`.
- In `lib/pricing/cheapshark.ts` (`getCheapSharkOffers`, `getCheapSharkDeals`) and `lib/pricing/pricing.service.ts`, when an offer's store has an affiliate mapping, wrap the resolved destination in the network's deep-link/tracking URL instead of leaving CheapShark's redirect as `purchaseUrl`; fall back to the current CheapShark redirect for stores without a program (Steam, Epic, GamersGate, etc.) so nothing breaks.
- Update `app/privacy/page.tsx` and confirm `app/terms/page.tsx`'s existing affiliate clause still matches reality once links go live (it already says commissions "never affect the price you pay" — keep that true).
- No changes needed to `components/LivePriceCompare.tsx`, `StickyPriceBar.tsx`, or `DealListingCard.tsx` — they already track `offer_click`/`deal_click` with `storeName`/`dealId`/`price` metadata; just add an `affiliate: true/false` flag to that metadata so revenue can be attributed later.

**Tracking:** Existing `offer_click`/`deal_click` events, extended with `affiliate: boolean` in `metadata`. Cross-reference against each network's own dashboard (clicks, conversions, EPC) using `dealId`/`storeName` as the join key.

**Success metric:** First confirmed affiliate conversion within 30 days of going live; EPC (earnings per click) per store visible in the `/analytics` dashboard's "top clicked stores" breakdown once affiliate revenue is reconciled against click volume.

**Revenue path:** User clicks "Get deal" on GreenManGaming/Fanatical/GOG/Humble → lands on the affiliate-tagged URL instead of CheapShark's → completes purchase within the cookie window → KeyFerret earns 2–6%+ commission, credited by the network.

### 2. Fix the AdSense production deploy

**Why:** This is the fastest path to first dollar and requires no new feature work — it's a broken pipe, not a missing one. `public/ads.txt` already contains a real publisher ID (`pub-2019414791707130`), `app/layout.tsx` conditionally loads the AdSense script, and `components/AdSlot.tsx` is already placed in `app/page.tsx` (homepage banner), `components/DealsPage.tsx` (rectangle), and `components/GamePage.tsx` (banner). But `wrangler secret list` shows production has only `DATABASE_URL`, `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`, `NEXT_PUBLIC_SITE_URL` — `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is missing. Since it's a `NEXT_PUBLIC_*` variable, it must be baked in at `next build` time (the `opennextjs-cloudflare build` step), not just set as a `wrangler secret` at runtime — setting it as a Worker secret alone will not fix this.

**Implementation:**
- Confirm which CI/build environment actually runs `opennextjs-cloudflare build` (there's no CI config file in the repo — check whatever external pipeline deploys this, e.g. Cloudflare Pages build settings) and set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` there as a build-time variable.
- Log into the AdSense dashboard for `pub-2019414791707130`, confirm the site/account is approved, create real ad units, and replace the placeholder `slotId` values (`"0000000001"`, `"0000000002"`, `"0000000003"` in `app/page.tsx`, `components/DealsPage.tsx`, `components/GamePage.tsx`) with the real ad-unit slot IDs — the current values look like dummy placeholders, not real 10-digit AdSense slot IDs, and would no-fill even with a valid client ID.
- Redeploy; verify with AdSense's own "Ad review center" / a live page check that impressions register.

**Tracking:** Add an `ad_impression`/`ad_click` pair to `lib/analytics/types.ts`'s `ANALYTICS_EVENT_TYPES` if session-level ad performance needs to live in the same `/analytics` dashboard; otherwise rely on AdSense's own reporting (RPM, CTR, viewability) as the source of truth.

**Success metric:** Non-zero AdSense revenue reported for 7 consecutive days after deploy; no measurable Core Web Vitals regression on `/`, `/deals`, `/game/[slug]` (check via the `web-perf` skill before/after).

**Revenue path:** Real ad impressions render in the 3 already-placed slots → AdSense pays out per-impression/per-click RPM, no code changes needed once the pipeline is fixed.

### 3. Restore the price-alert email pipeline, then extend it into a sitewide deals digest

**Why:** The price-alert feature — signup form, DB schema, verify/unsubscribe flow, Resend email templates, and a cron-protected checker route — is fully built and completely inert in production: `RESEND_API_KEY` is unset everywhere (every send silently no-ops), and `wrangler.jsonc` has no `triggers.crons` block, so `app/api/cron/price-alerts/route.ts` is never invoked by anything. This is the site's only owned-audience mechanism, and right now anyone who signs up gets nothing — not even the verification email. Fixing it is prerequisite, near-zero-effort work that unlocks a second, higher-leverage feature: a weekly digest email (not tied to one game) that reuses the same Resend infrastructure and the deal feed already powering `/deals`, monetized by the affiliate links from Action #1.

**Implementation (restore, do first):**
- Create a Resend account, set `RESEND_API_KEY` and `ALERTS_FROM_EMAIL` as production secrets (`wrangler secret put`).
- Add a `triggers.crons` block to `wrangler.jsonc` (e.g. `"triggers": { "crons": ["0 */6 * * *"] }`) and route the scheduled event to `checkPriceAlerts()` from `lib/alerts/service.ts` — OpenNext/Cloudflare's scheduled-handler pattern, or an external scheduler hitting `/api/cron/price-alerts` with the `CRON_SECRET` bearer token that's already implemented and just needs an actual caller.
- Verify end-to-end: sign up on `app/game/[slug]` via `components/PriceAlertForm.tsx`, confirm the verification email arrives, confirm a price drop triggers `sendPriceDropEmail`.

**Implementation (extend, after restore):**
- Add a lightweight `Subscriber` concept (or reuse `PriceAlert` with a nullable `gameSlug` for "all deals" subscriptions) and a global capture form in `components/Footer.tsx` / homepage.
- Add a weekly cron entry point (same pattern as `app/api/cron/price-alerts/route.ts`) that pulls `getCheapSharkDeals(POPULAR_DEALS_FILTER.query)` from `lib/pricing/cheapshark.ts` and sends a "this week's cheapest deals" email via `lib/alerts/email.ts`, using the affiliate-wrapped `purchaseUrl`s from Action #1.

**Tracking:** `email_signup` event (new, alongside existing `search`/`game_view`/`deal_click`/`offer_click` in `lib/analytics/types.ts`); verified-alert rate (`verifiedAt` not null ÷ total `PriceAlert` rows); digest open/click rate from Resend's own dashboard.

**Success metric:** Verification emails actually delivered (currently 0%); verified-alert rate > 50% of signups within a week of the fix; digest email list reaches a size worth sending weekly (e.g., 100+ verified subscribers) within 60 days.

**Revenue path:** Restored alerts → users trust the site enough to keep giving their email → digest list grows → each digest carries affiliate-tagged deal links → weekly recurring affiliate revenue instead of one-off session-based clicks.

## Quick Wins

- Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` as a build-time variable in whatever pipeline runs `opennextjs-cloudflare build`, and swap the three placeholder `slotId` values for real AdSense ad-unit IDs.
- Set `RESEND_API_KEY` + `ALERTS_FROM_EMAIL` as production secrets — resurrects a feature that's already 100% coded.
- Add a `triggers.crons` entry to `wrangler.jsonc` so `checkPriceAlerts()` actually runs on a schedule.
- Add `affiliate: boolean` to the `metadata` already passed into `trackEvent` calls in `LivePriceCompare.tsx`, `StickyPriceBar.tsx`, and `DealListingCard.tsx` — free future attribution, zero UX change.

## Experiments

```text
Hypothesis: GreenManGaming and Fanatical clicks convert well enough through their own affiliate programs to beat CheapShark's redirect economics (which pay KeyFerret $0).
Change: Wrap only those two stores' purchaseUrl in affiliate links first (smallest surface area, both on the same CJ Affiliate network, both already confirmed to run real programs), leaving every other store on the current CheapShark redirect.
Metric: Affiliate network's own conversion count vs. offer_click volume for those two storeName values, over 30 days.
Success threshold: At least 1 confirmed conversion and a measurable EPC > $0.
Decision after test: If EPC is meaningfully positive, extend the same wrapper to GOG (Awin) and Humble (Partner Program) next; if conversions are near zero even with real click volume, investigate attribution/cookie issues before assuming the model doesn't work.
```

```text
Hypothesis: The AdSense pipeline is genuinely broken in production (not just low-traffic), and fixing the build-time env var alone restores real ad rendering.
Change: Deploy NEXT_PUBLIC_ADSENSE_CLIENT_ID at build time with one placeholder-but-syntactically-valid slot ID, then inspect the live page's rendered HTML for a populated <ins class="adsbygoogle"> instead of the dashed-border placeholder div.
Metric: Presence of a filled ad slot (or Google's "no-fill" state, which still proves the pipe works) vs. the current permanent placeholder.
Success threshold: The placeholder div disappears from the rendered DOM on the live site.
Decision after test: If it renders (even unfilled), proceed to real slot IDs. If it still shows the placeholder, the build pipeline itself (not just the secret) needs investigation.
```

## Avoid

- **Building a paid API or data-licensing product on `Game`/`Offer` data right now.** The underlying data comes from IGDB (Twitch-governed ToS) and CheapShark's free public API — redistribution/resale terms for either haven't been verified here, and this would require legal review before any engineering. It's also a P2/P3 idea that needs an already-proven traffic base to be worth the risk; premature at this stage.
- **A premium/ad-free subscription tier.** There's no account system anywhere in the codebase (watchlist and alerts are both intentionally anonymous/email-only), and the core value prop — comparing already-free public prices — doesn't obviously justify a paywall. Building auth + billing before affiliate/ad revenue is proven would be solving the wrong problem first.
- **Adding more ad placements before fixing the existing three.** Piling on inventory while the pipeline is broken (or before slot IDs are real) won't produce revenue and risks Core Web Vitals regressions on pages (`/game/[slug]`) that already carry heavy GSAP/motion/three.js animation work.
- **Marketplace/commission model.** KeyFerret has no supply-side (no sellers, no listings creation) — this doesn't fit the current product shape at all and would be a multi-month rebuild for a feature not implied anywhere in the existing code.

## Files Referenced

- `prisma/schema.prisma` — `Game`, `Store`, `Offer`, `AnalyticsEvent`, `PriceAlert` models
- `lib/pricing/cheapshark.ts`, `lib/pricing/pricing.service.ts` — where `purchaseUrl` is set to CheapShark's redirect; where affiliate wrapping would go
- `components/LivePriceCompare.tsx`, `components/StickyPriceBar.tsx`, `components/DealListingCard.tsx` — existing outbound-click tracking (`offer_click`/`deal_click`)
- `lib/analytics-client.ts`, `app/api/analytics/route.ts`, `lib/analytics/log.ts` — click-tracking pipeline
- `components/AdSlot.tsx`, `app/layout.tsx`, `public/ads.txt` — AdSense wiring (built but not deployed)
- `lib/alerts/service.ts`, `lib/alerts/email.ts`, `app/api/cron/price-alerts/route.ts` — price-alert pipeline (built but operationally inert)
- `wrangler.jsonc` — missing `triggers.crons` block
- `app/terms/page.tsx`, `app/privacy/page.tsx` — existing affiliate/AdSense disclosure language
- `lib/watchlist.ts` — anonymous localStorage-only watchlist, currently disconnected from email capture

## Confidence Note

CheapShark's public docs don't explicitly state whether its `/redirect` endpoint carries CheapShark's own affiliate tag or whether third-party API consumers get any revenue share — this could not be confirmed as a documented fact, so treat "KeyFerret currently earns $0 per click" as a high-confidence inference (consistent with how CheapShark's free API and business model are generally understood), not a directly documented fact. The GreenManGaming/Fanatical commission rates and cookie windows, by contrast, are corroborated by multiple independent affiliate-program listing sites.
