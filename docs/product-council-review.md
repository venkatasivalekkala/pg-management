# Product Council Review — PG Management SaaS

**Date**: April 5, 2026
**Document under review**: `enterprise-saas-upgrade-plan-v3.md` (v4)
**Codebase**: 34 API routes, 18 Prisma models, 33 dashboard pages, Next.js 16 + React 19

---

## 1. PRINCIPAL ENGINEER — Architecture & Systems Design

### APPROVED
- **Next.js App Router monolith** is the right choice for this stage. SSR for public discovery pages + client SPA for dashboards is exactly what Next.js does well. No need for microservices until 10K+ properties.
- **PostgreSQL as single DB** is correct. PG data is highly relational (bookings→rooms→properties→owners). NoSQL would be painful here.
- **Prisma ORM** — good dev productivity for the 30-model schema. Type safety catches errors at build time.
- **State machine diagrams (PART F)** — Booking (7 states), Payment (8 states), Complaint (7 states) are well-designed with proper transition rules. No impossible states.
- **JWT auth with `jose`** — edge-compatible, correct choice for Next.js middleware.

### CONCERNS

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| PE-1 | **No database indexing strategy** | HIGH | Schema has 30 models but ZERO explicit indexes. Queries like `WHERE propertyId AND status AND dueDate` will table-scan at scale. Need composite indexes on: `Payment(bookingId, status, dueDate)`, `Booking(guestId, status)`, `Complaint(propertyId, status, priority)`, `Room(propertyId, status)`, `AuditLog(userId, createdAt)`, `Notification(userId, isRead)`. |
| PE-2 | **Cron job orchestration undefined** | HIGH | Plan mentions 6+ cron jobs (auto-rent, reminders, SLA check, no-show, late fees, recurring issues) but doesn't specify WHERE they run. Vercel Cron has a 10-second execution limit. Need: dedicated cron API routes with idempotency keys, or use Trigger.dev / Inngest for background jobs. |
| PE-3 | **N+1 query risk** | MEDIUM | Prisma `include` on nested relations (booking → room → property → owner) can cause N+1. Need: selective `include`, `relationJoins` preview feature, or query batching. |
| PE-4 | **No database migration strategy** | MEDIUM | `prisma db push` is used now (destructive). Production needs `prisma migrate deploy` with versioned migrations. Need a migration runbook before Phase 1. |
| PE-5 | **Hardcoded JWT secret** | HIGH | `"dev-secret-change-in-production"` in both `auth.ts` and `middleware.ts`. If `NEXTAUTH_SECRET` env var is missing, it falls back to a known string. This is a production vulnerability, not just bad practice. |
| PE-6 | **Single point of failure on Prisma client** | LOW | Global singleton is fine for serverless, but connection pool defaults (5 connections) will exhaust under load. Need `connection_limit` in DATABASE_URL. |
| PE-7 | **No API contract specification** | MEDIUM | 34 routes with no OpenAPI/Swagger spec. Hard for frontend team to know exact request/response shapes. Need: Zod schemas that auto-generate OpenAPI docs. |
| PE-8 | **Optimistic locking adds complexity** | LOW | `version` field on 4 models is good, but consider if the admin concurrency problem is real at MVP scale. Could defer to Phase 6+. |

### RECOMMENDED CHANGES
1. Add `@@index` directives to schema.prisma for top 10 hot query paths (Sprint 1).
2. Use Inngest or Trigger.dev for background jobs instead of Vercel Cron (Sprint 1).
3. Add `?connection_limit=10&pool_timeout=30` to DATABASE_URL for production.
4. Remove hardcoded fallback secret — fail hard if env var is missing.
5. Generate OpenAPI spec from Zod schemas using `zod-to-openapi` (Sprint 1).

---

## 2. SENIOR PRODUCT MANAGER — Product Strategy & Prioritization

### APPROVED
- **99 feature gaps mapped to 100 design use cases** — comprehensive coverage, nothing in the design document is missed.
- **6-sprint (12-week) timeline** — aggressive but achievable for a focused team.
- **Role-based lifecycle thinking** — walking through each role's complete journey (Prospective Guest → Current Guest → Owner → Admin → Staff → Platform) is the right approach.
- **Business rules codified (PART H)** — prorated rent, cancellation policy, late fees, deposit refund. These are the rules that cause real disputes in PGs.

### CONCERNS

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| PM-1 | **No MVP definition** | HIGH | If you must ship in 6 weeks, what's the core? Suggest: **MVP = Admin can manage rooms + Guest can book & pay + Owner sees dashboard**. Everything else (map search, meal management, visitor logs, reviews, staff tasks) is Phase 2. |
| PM-2 | **No subscription tier details** | HIGH | Plan mentions FREE/PRO/ENTERPRISE gates but never defines: What's FREE? How many properties? What features? Suggest: FREE = 1 property, 10 rooms, basic dashboard. PRO = 5 properties, all features except API/white-label. ENTERPRISE = unlimited, API keys, webhooks, white-label, SSO. |
| PM-3 | **No onboarding flow specified** | MEDIUM | Plan mentions "guided property setup wizard" but doesn't detail the first-time experience for EACH role. What does an Owner see after signup? Empty dashboard with no guidance is a churn moment. Need: Step-by-step onboarding checklist ("Add your first property → Add rooms → Invite your admin → Share listing link"). |
| PM-4 | **No success metrics / KPIs** | MEDIUM | Plan has no definition of success. Suggest per role: Owner = time to first rent collection < 7 days, Guest = booking-to-checkin conversion > 70%, Admin = complaint resolution < 24h avg, Platform = owner NPS > 40. |
| PM-5 | **Competitive differentiation unclear** | MEDIUM | Stanza/Zolo/Colive are B2C brands that OWN properties. This is a SaaS tool for INDEPENDENT PG owners. The USP should be: "The Shopify of PG management" — any owner can digitize in 30 minutes. Plan doesn't articulate this positioning. |
| PM-6 | **No referral program design** | LOW | G64 mentions referral but no mechanics. Suggest: Owner refers owner = 1 month free on PRO. Guest refers guest = ₹500 off first month rent. Tracking via referralCode on User model. |
| PM-7 | **Growth loops missing** | MEDIUM | No viral mechanics designed. Each PG listing should be a public SEO page that drives guest discovery. Guest reviews create social proof. Owner success stories create case studies. None of this is structured in the plan. |

### RECOMMENDED CHANGES
1. Add explicit MVP scope as "Phase 0.5" — shippable subset in 6 weeks.
2. Define subscription tiers with exact feature gates and pricing (₹0 / ₹999/mo / ₹4,999/mo suggested).
3. Add per-role onboarding checklist components to Sprint 1 UI work.
4. Define 5 north-star metrics and instrument them from day 1.
5. Add "Growth" section to plan with SEO + referral + social proof loops.

---

## 3. SENIOR SECURITY ENGINEER — Security & Compliance

### CRITICAL VULNERABILITIES (Must fix before ANY deployment)

| # | Vulnerability | OWASP | Detail |
|---|--------------|-------|--------|
| SEC-1 | **16 API routes have ZERO authentication** | A01:2021 (Broken Access Control) | `GET /api/bookings`, `GET /api/payments`, `GET /api/complaints`, `GET /api/meals`, `GET /api/visitors`, `GET /api/rooms`, `POST /api/bookings`, `POST /api/payments` — all return full data to ANY requester. Middleware checks page routes but API routes bypass it when called directly. |
| SEC-2 | **Hardcoded JWT secret fallback** | A02:2021 (Crypto Failure) | `"dev-secret-change-in-production"` means anyone who reads the source code can forge JWT tokens for any user. Both `auth.ts:23` and `middleware.ts:5` have this. |
| SEC-3 | **No CSRF protection** | A01:2021 | JWT in cookies without `SameSite=Strict` and no CSRF token. State-changing POST requests from malicious sites could execute with the user's session. |
| SEC-4 | **No input sanitization on user content** | A03:2021 (Injection) | Reviews, complaints, announcements store user text verbatim. If rendered with `dangerouslySetInnerHTML` or in contexts without React's auto-escaping, XSS is possible. |
| SEC-5 | **POST /api/bookings accepts arbitrary guestId** | A01:2021 | A guest can create bookings for OTHER guests by passing a different `guestId` in the body. The route never checks `guestId === authenticatedUser.id`. |

### CONCERNS

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| SEC-6 | **JWT 7-day expiry, no refresh token** | HIGH | If a token is stolen, it's valid for a week. No way to revoke it. Need: short-lived access token (15 min) + refresh token (7 days) with rotation. |
| SEC-7 | **KYC document storage** | HIGH | Aadhaar/PAN numbers are Sensitive Personal Data under DPDP Act. Must: encrypt at rest (AES-256), encrypt in transit (TLS), access-log every retrieval, auto-delete after verification, never display full number in UI (mask as XXXX-XXXX-1234). |
| SEC-8 | **No rate limiting exists** | HIGH | Auth endpoints (send-otp, verify-otp) have no rate limiting. Brute force on 6-digit OTP (1M combinations) is trivial without rate limits. |
| SEC-9 | **Cookie settings not specified** | MEDIUM | Token cookie must be: `HttpOnly: true`, `Secure: true`, `SameSite: Strict`, `Path: /`, `Max-Age: 604800`. Currently not verified in code. |
| SEC-10 | **No Content Security Policy** | MEDIUM | No CSP headers. If XSS occurs, there's no mitigation layer. Add via `next.config.ts` security headers. |
| SEC-11 | **Razorpay webhook verification** | HIGH | Plan mentions Razorpay but doesn't specify webhook signature verification. Without verifying `X-Razorpay-Signature`, attackers can fake payment confirmations. |
| SEC-12 | **Audit log doesn't capture auth failures** | MEDIUM | Failed login attempts, invalid OTPs, 403s — none are logged. Critical for detecting credential stuffing. |
| SEC-13 | **No dependency vulnerability scanning** | MEDIUM | No Dependabot, no `npm audit` in CI. 25+ dependencies with no automated CVE checking. |
| SEC-14 | **File upload risks** | HIGH | Plan adds file uploads but doesn't specify: file type validation (only allow jpg/png/pdf), file size limits, virus scanning (ClamAV), no executable uploads. |

### REQUIRED FIXES (Before Launch)
1. Add `verifyAuth()` to ALL 16 unprotected routes + enforce data scoping (Sprint 1, non-negotiable).
2. Remove hardcoded secret fallback — crash on missing env var.
3. Set cookie attributes: `HttpOnly`, `Secure`, `SameSite=Strict`.
4. Add rate limiting to auth endpoints immediately (5 attempts/15 min).
5. Implement short-lived access token (15 min) + refresh token rotation.
6. Add CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy headers.
7. KYC documents: encrypt at rest, mask in UI, access-log retrieval.
8. Razorpay webhook: verify HMAC signature on every callback.
9. Add `npm audit` and Dependabot to CI pipeline.

---

## 4. SENIOR FRONTEND ENGINEER — Architecture & DX

### APPROVED
- **React 19 + Next.js 16 App Router** — latest stable, good choice.
- **Tailwind CSS 4** with CSS variable-based theming — clean, maintainable.
- **Custom components** over Shadcn/UI — acceptable since the component set is small (18) and purpose-built. Adding Radix primitives for accessibility (Dialog, Popover, Sheet) is the right call.
- **useApi hook pattern** — simple and effective for REST calls with loading/error states.
- **React Hook Form + Zod** — excellent for form validation consistency.

### CONCERNS

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| FE-1 | **No server-side data fetching** | HIGH | ALL dashboard pages use `useApi` (client-side `fetch` in `useEffect`). This means: no SSR, no streaming, empty page on initial load, waterfall requests. Should use React Server Components for initial data load, `useApi` only for mutations and refetches. |
| FE-2 | **No caching/deduplication layer** | HIGH | Every page component independently fetches data. Navigate away and back = re-fetch. No stale-while-revalidate. Replace `useApi` with TanStack Query (React Query) for: caching, deduplication, background refetch, optimistic updates, infinite scroll. |
| FE-3 | **No testing infrastructure** | HIGH | Zero tests. No test runner configured. Need: Vitest for unit/integration, Playwright for E2E, React Testing Library for component tests. Add to Sprint 1 as non-negotiable. |
| FE-4 | **No ESLint/Prettier configuration** | MEDIUM | No `.eslintrc`, no `.prettierrc`, no `lint-staged`, no Husky pre-commit hooks. With 33+ pages and multiple developers, code style will diverge quickly. |
| FE-5 | **Bundle size unmonitored** | MEDIUM | No `@next/bundle-analyzer` configured. Adding 17 new packages (Radix, Recharts, Leaflet, react-day-picker, etc.) without monitoring could bloat bundles. |
| FE-6 | **17 new UI components is a lot** | MEDIUM | Plan proposes 17 new components (bottom-nav, sheet, fab, skeleton, etc.) in Sprint 1. That's aggressive. Prioritize: skeleton, sheet, responsive-table, bottom-nav. Defer: pull-to-refresh, trust-badge, wizard-form to Sprint 3+. |
| FE-7 | **No error boundary setup** | MEDIUM | No `error.tsx` files in any route segment. A single API failure crashes the entire page. Need `error.tsx` in `(dashboard)/` and each role segment. |
| FE-8 | **Responsive table → card conversion** | LOW | Good idea but complex. Each table has different columns/actions. Need a generic `<ResponsiveTable>` component that accepts `renderCard` and `columns` props. Design this API carefully. |
| FE-9 | **Dark mode across 33 pages** | LOW | Adding dark mode means auditing every page for hardcoded colors. Currently `globals.css` uses CSS variables but many components use direct Tailwind classes like `bg-white`, `text-slate-900`, `border-slate-200`. These won't respond to dark mode. Need to replace with `bg-background`, `text-foreground`, `border-border` semantic classes. |

### RECOMMENDED CHANGES
1. Replace `useApi` with TanStack Query for all data fetching (Sprint 1).
2. Add Vitest + Playwright to project, write tests alongside implementation.
3. Add ESLint (flat config) + Prettier + lint-staged + Husky in Sprint 1.
4. Convert dashboard pages to use Server Components for initial data load.
5. Add `@next/bundle-analyzer` and set 250KB/route budget.
6. Add `error.tsx` and `loading.tsx` to every route segment.

---

## 5. SENIOR UX/UI DESIGNER — Design System & User Experience

### APPROVED
- **Indigo primary color** — professional, trustworthy. Good for a SaaS tool managing money/housing.
- **Mobile-first bottom navigation for Guest/Staff** — correct pattern. These users are on their phones.
- **Sidebar for Admin/Owner** — correct. Desktop-heavy workflows need persistent navigation.
- **Bottom sheet modals on mobile** — modern pattern, better than centered modals.
- **Color-coded room grid** — immediately communicable status at a glance.
- **Guest dashboard layout** (room card + payment banner + quick actions) — good information hierarchy.

### CONCERNS

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| UX-1 | **5-tab bottom nav for Guest is borderline** | MEDIUM | Home, Pay, Help, Meals, More — "More" is a UX anti-pattern (dumping ground). Consider: 4 tabs = Home, Pay, Services (complaints + meals + visitors), Profile. Or use Home as hub with quick-action cards instead of separate tabs. |
| UX-2 | **No design tokens for spacing** | MEDIUM | Plan defines typography scale but no spacing scale. Need: `space-1` through `space-16` mapped to Tailwind defaults. Consistent padding/margin across all 33+ pages. |
| UX-3 | **No motion/animation system** | MEDIUM | Plan mentions "transitions" but no animation guidelines. Need: `transition-duration: 150ms` for hover, `200ms` for open/close, `300ms` for page transitions. Easing: `ease-out` for entrances, `ease-in` for exits. Use Tailwind `transition-*` classes consistently. |
| UX-4 | **Complaint wizard is 4 steps — too many for mobile** | MEDIUM | Category → Description+Photo → Priority → Confirmation. Combine: Step 1: Category + Description + Photo (all on one screen). Step 2: Confirm (show summary + submit). Priority auto-set by category, admin can override. |
| UX-5 | **No loading state design specified** | HIGH | Skeleton components are planned but no design for: shimmer animation, skeleton shapes per component, loading spinner vs skeleton decision (when to use which). Rule: skeleton for known layouts, spinner for unknown/short waits. |
| UX-6 | **No notification center design** | MEDIUM | Bell icon exists in header but no notification panel design. Need: slide-out panel with grouped notifications (Today, Yesterday, Earlier), read/unread states, quick actions from notification (e.g., "Approve" from booking notification). |
| UX-7 | **Admin dashboard "action required" section undefined** | MEDIUM | Plan says "cards needing attention" but doesn't specify: what triggers an action card? Suggest: pending bookings > 0, overdue payments > 0, unresolved complaints > SLA threshold, rooms in maintenance > 3 days. |
| UX-8 | **No empty state illustrations** | LOW | Plan mentions "empty state illustrations with CTAs" but doesn't specify per page. Key ones: "No properties yet — Add your first PG", "No complaints — Your guests are happy!", "No payments due — All caught up". |
| UX-9 | **Dark mode color palette not tested** | MEDIUM | The CSS variable swap is defined but dark mode needs careful attention to: card elevation (use subtle borders not shadows), text readability (don't use pure white on dark bg — use slate-100), chart colors (adjust for dark backgrounds). |
| UX-10 | **No multi-language UI layout impact** | LOW | Hindi/Telugu text is typically 20-30% longer than English. UI must accommodate: text wrapping in buttons, flexible card heights, no fixed-width label columns. |

### RECOMMENDED CHANGES
1. Reduce Guest bottom nav to 4 tabs. Make Home a hub with quick-action grid.
2. Define spacing scale and enforce via custom Tailwind config.
3. Reduce complaint wizard from 4 steps to 2.
4. Design notification center as a slide-out panel.
5. Create empty state illustrations for top 10 pages.
6. Test dark mode palette against WCAG contrast requirements (4.5:1 for text).

---

## 6. DATA & ANALYTICS ENGINEER — Data Architecture & Reporting

### APPROVED
- **AuditLog model** — captures who/what/when for compliance.
- **Recharts** for in-app visualization — sufficient for planned reports (occupancy trends, revenue charts, complaint metrics).
- **Report types planned**: P&L, occupancy heatmap, payment collection rate, complaint resolution, guest demographics — covers key business needs.

### CONCERNS

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| DA-1 | **No analytics event tracking** | HIGH | No product analytics (PostHog, Mixpanel, Amplitude). Can't answer: "Which features are used most?", "Where do users drop off in booking flow?", "What's our DAU/MAU ratio?". Add PostHog (self-hostable, GDPR-friendly) from day 1. |
| DA-2 | **No reporting DB separation** | MEDIUM | Complex reports (P&L across properties, occupancy heatmaps over 12 months) will hammer the primary DB. At 100+ properties, add a read replica for reporting queries. Not needed for MVP but plan the connection string abstraction now. |
| DA-3 | **No data retention policy** | MEDIUM | AuditLogs, notifications, OTP records will grow unbounded. Define: OTP records = delete after 24h. Notifications = archive after 90 days. AuditLogs = keep 2 years then archive to cold storage. Payment records = keep 7 years (tax compliance). |
| DA-4 | **Missing timestamp dimensions** | MEDIUM | Schema has `createdAt`/`updatedAt` but no `checkedInAt`, `resolvedAt`, `paidAt` on many models where duration matters. Payment model has `paidAt` but Complaint doesn't have `assignedAt`, `escalatedAt` — can't calculate assignment-to-resolution time accurately. |
| DA-5 | **Predictive analytics (Phase 9) needs more data** | LOW | Churn prediction needs: login frequency (not tracked), feature usage (not tracked), complaint sentiment (not analyzed). LTV needs: total revenue per guest (calculable but slow without materialized views). Add these tracking fields early. |
| DA-6 | **No dashboard refresh strategy** | MEDIUM | Stat cards showing "Total Revenue" or "Occupancy %" — are these real-time or cached? For dashboards with 6+ stat cards each making aggregate queries, cache results for 5 minutes (Redis or in-memory). |
| DA-7 | **Export format coverage** | LOW | Plan mentions CSV/PDF/Excel export but doesn't specify which reports get which formats. All reports should support CSV. Financial reports (P&L, tax) should also support PDF. Occupancy data should support Excel for pivot tables. |

### RECOMMENDED CHANGES
1. Add PostHog or Plausible analytics from Sprint 1. Track: page views, feature usage, funnel completion.
2. Add `assignedAt`, `escalatedAt` to Complaint model for resolution time calculation.
3. Define data retention policy: create a `src/lib/data-retention.ts` with cleanup cron.
4. Cache dashboard aggregates (stat cards) with 5-minute TTL.
5. Plan read-replica database connection for reporting queries at scale.

---

## 7. DEVOPS / SRE ENGINEER — Infrastructure & Operations

### APPROVED
- **Vercel deployment** — ideal for Next.js, zero-config, auto-scaling, India edge (Mumbai PoP). Good for initial scale.
- **Health check endpoint planned** — essential for uptime monitoring.
- **Sentry for error tracking** — industry standard, good Next.js integration.
- **Structured logging (pino)** — correct choice, fast, JSON output.
- **Performance middleware** — response time tracking is essential.

### CONCERNS

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| OPS-1 | **No CI/CD pipeline exists** | HIGH | No `.github/workflows/` directory. Need: lint → type-check → test → build → Lighthouse CI → deploy. Should block merges on failures. |
| OPS-2 | **Vercel Cron limitations** | HIGH | Plan has 6+ scheduled jobs. Vercel Cron: max 10-second execution, limited to Hobby/Pro plans. Auto-rent generation for 1000+ bookings won't finish in 10 seconds. Use Inngest, Trigger.dev, or QStash (Upstash) instead. |
| OPS-3 | **No staging environment** | HIGH | Only production exists. Need: `staging.pgmanager.com` with separate DB for testing migrations, new features, and integration testing before prod deploy. |
| OPS-4 | **Database backup not automated** | MEDIUM | Plan says "daily automated backups" but doesn't specify how. If using Neon/Supabase, backups are automatic. If self-managed PostgreSQL, need `pg_dump` cron or WAL-G continuous archiving. |
| OPS-5 | **No environment variable management** | MEDIUM | `.env` file with sensitive secrets. Need: Vercel Environment Variables for prod, `.env.local` for dev (gitignored). Consider Doppler or Infisical for secret management at Enterprise tier. |
| OPS-6 | **No container strategy** | LOW | Plan mentions Docker in design doc but no `Dockerfile` exists. For self-hosted/Enterprise customers, need multi-stage Dockerfile. Not needed for Vercel deploys. |
| OPS-7 | **RTO < 1 hour claim unverified** | MEDIUM | Disaster recovery says < 1 hour, but no runbook exists. Need: documented steps, practiced quarterly, assigned on-call rotation. |
| OPS-8 | **No cost alerts** | LOW | Plan has infra cost calculator but no budget alerts. Set up billing alerts at 50%, 80%, 100% of monthly budget on cloud provider. |

### RECOMMENDED CHANGES
1. Create `.github/workflows/ci.yml` with full pipeline in Sprint 1.
2. Use Inngest for background jobs instead of Vercel Cron.
3. Set up staging environment with separate database before Sprint 2.
4. Automate database backups — use managed PostgreSQL (Neon/Supabase) with automatic PITR.
5. Create disaster recovery runbook at `docs/disaster-recovery-runbook.md`.

---

## 8. LEGAL & COMPLIANCE ADVISOR — Regulatory & Legal

### COMPLIANT
- **Terms of Service / Privacy Policy / Refund Policy pages** planned (Phase 7.1).
- **Police verification Form C** planned for foreign nationals (G43).
- **Data export for GDPR compliance** planned (G67).
- **Audit logging** captures who/what/when — good for accountability.

### RISK AREAS

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| LEG-1 | **DPDP Act 2023 compliance gap** | HIGH | India's data protection law requires: (a) Explicit consent before processing personal data, (b) Purpose limitation — only collect what's needed, (c) Data Principal rights — right to access, correct, erase, (d) Data Fiduciary obligations — security safeguards, breach notification within 72 hours, (e) Consent Manager — mechanism to withdraw consent. Plan mentions GDPR but not DPDP specifically. |
| LEG-2 | **Aadhaar storage is restricted** | HIGH | Storing Aadhaar numbers requires authorization under Aadhaar Act Section 8. PG management apps generally should NOT store raw Aadhaar numbers. Options: (a) Use DigiLocker API for verification without storing, (b) Store only masked number (XXXX-XXXX-1234) after verification, (c) If must store, encrypt with AES-256 and restrict access. |
| LEG-3 | **TDS on rent** | MEDIUM | Under Section 194-IB of Income Tax Act, if monthly rent exceeds ₹50,000, the tenant must deduct TDS at 5%. The platform should: (a) Flag when rent > ₹50,000, (b) Show TDS deduction in invoice, (c) Provide Form 26QC data for tenant. Plan mentions "TDS report" in G44 but doesn't detail this workflow. |
| LEG-4 | **GST on platform fees** | MEDIUM | SaaS subscription fees attract 18% GST. Platform must: register for GST, issue GST invoices for subscription payments, file quarterly returns. If the platform also processes rent payments, the pass-through must not attract GST (rent is exempt). |
| LEG-5 | **State-specific PG regulations** | MEDIUM | Karnataka, Maharashtra, Telangana have different rules: (a) Karnataka: PGs must register with local police, (b) Maharashtra: Requires fire safety NOC, (c) Delhi: License required under Delhi Municipal Corporation. Platform should guide owners on compliance for their state. |
| LEG-6 | **E-sign legality** | LOW | Digital agreements signed via checkbox + date are valid under IT Act 2000 (Section 5: Legal recognition of electronic signatures) BUT a simple checkbox may not meet the standard of "authentication" for disputes > ₹5 lakhs. Consider Aadhaar eSign (via eSign API) for higher legal standing. |
| LEG-7 | **Gender-based PG restrictions** | LOW | PGs commonly restrict by gender (Male Only, Female Only). This is LEGAL under Indian law (no anti-discrimination law applies to private housing). However, the `genderType` field and filtering is fine — just ensure marketing doesn't frame it discriminatorily. |
| LEG-8 | **Security deposit cap** | MEDIUM | Some states cap security deposits (e.g., Maharashtra: max 3 months rent). Platform should allow owners to configure deposit limits but WARN if exceeding state-specific caps. |
| LEG-9 | **Data localization** | LOW | DPDP Act 2023 allows cross-border data transfers except to countries the govt restricts. For now, storing data in AWS Mumbai / Neon Asia is compliant. But Enterprise customers may contractually require India-only storage. |
| LEG-10 | **Minor tenants** | LOW | PG guests may be 17-year-old students. DPDP Act has stricter requirements for processing data of children (< 18). Need: age verification, verifiable parental consent for minors. |

### REQUIRED ACTIONS
1. Add DPDP Act consent flow: explicit consent checkbox at registration with purpose statement (Sprint 2).
2. DO NOT store raw Aadhaar numbers. Integrate DigiLocker API for verification, store only masked number.
3. Add TDS calculation logic when rent > ₹50,000/month (Phase 4).
4. Register platform for GST; issue GST-compliant invoices for subscription fees.
5. Add state-specific compliance guidance in property setup wizard.
6. Add data breach notification mechanism (email all affected users within 72 hours).
7. Add age verification step — if < 18, require guardian consent.

---

# COUNCIL CONSENSUS — Top Priority Actions

### MUST DO (Sprint 1, Non-Negotiable)

| # | Action | Raised By | Impact |
|---|--------|-----------|--------|
| C-1 | Fix 16 unprotected API routes with auth + data isolation | Security, Principal | **All data is currently exposed** |
| C-2 | Remove hardcoded JWT secret fallback | Security, Principal | **Anyone can forge tokens** |
| C-3 | Add rate limiting to auth endpoints | Security | **OTP brute-force possible** |
| C-4 | Set cookie attributes (HttpOnly, Secure, SameSite) | Security | **Session hijacking risk** |
| C-5 | Add database indexes for hot query paths | Principal | **Performance degrades at scale** |
| C-6 | Set up CI/CD pipeline (lint, test, build, deploy) | DevOps, Frontend | **No automated quality gates** |
| C-7 | Add testing infrastructure (Vitest + Playwright) | Frontend | **Zero test coverage** |
| C-8 | Replace `useApi` with TanStack Query | Frontend | **Stale data, no caching, waterfalls** |
| C-9 | Add PostHog/Plausible analytics | Data/Analytics | **Cannot measure product usage** |
| C-10 | Define MVP scope explicitly | Product Manager | **12-week scope too large without prioritization** |

### SHOULD DO (Sprint 2-3)

| # | Action | Raised By |
|---|--------|-----------|
| C-11 | DPDP Act consent flow | Legal |
| C-12 | Don't store raw Aadhaar — use DigiLocker | Legal, Security |
| C-13 | Background job system (Inngest/Trigger.dev) | Principal, DevOps |
| C-14 | Staging environment | DevOps |
| C-15 | Subscription tier pricing definition | Product Manager |
| C-16 | Per-role onboarding checklist | Product Manager, UX |
| C-17 | Reduce Guest bottom nav to 4 tabs | UX |
| C-18 | Notification center slide-out panel | UX |
| C-19 | Data retention policy | Data/Analytics |
| C-20 | Security headers (CSP, X-Frame-Options) | Security |

### CAN DEFER (Sprint 4+)

| # | Action | Raised By |
|---|--------|-----------|
| C-21 | Refresh token rotation | Security |
| C-22 | Optimistic locking | Principal |
| C-23 | Dark mode | UX, Frontend |
| C-24 | PWA / service worker | Frontend |
| C-25 | Predictive analytics | Data/Analytics |
| C-26 | SSO / SAML integration | Legal, Security |
| C-27 | White-labeling | Product Manager |
| C-28 | Load testing (k6) | DevOps |

---

# PLAN UPDATES REQUIRED

Based on council review, the following changes should be made to the plan:

1. **Add "Phase 0.5: MVP Scope"** — define the minimum shippable product (admin room management + guest booking & payment + owner dashboard).
2. **Move testing setup to Phase 0** — non-negotiable from day 1.
3. **Move TanStack Query adoption to Phase 0** — replaces useApi as the data fetching layer.
4. **Add subscription tier table** — FREE/PRO/ENTERPRISE with exact feature gates and pricing.
5. **Add DPDP Act compliance section** to Phase 7 legal work.
6. **Replace Vercel Cron with Inngest** for all background jobs.
7. **Add CI/CD pipeline spec** — exact GitHub Actions workflow.
8. **Add DigiLocker integration** instead of raw Aadhaar storage for KYC.
9. **Add database indexing section** to Phase 0.
10. **Add PostHog analytics tracking** to Sprint 1.
11. **Reduce Guest bottom nav from 5 to 4 tabs**.
12. **Add per-role onboarding checklist** components.
13. **Add data retention policy** — define per-model retention rules.
14. **Add Razorpay webhook signature verification** to payment integration.
15. **Add security headers** to `next.config.ts`.
