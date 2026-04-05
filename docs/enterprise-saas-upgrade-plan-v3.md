# Enterprise SaaS Upgrade Plan — PG Management (Refined v3)

## Context
The app has pages and APIs but is NOT a production SaaS product. Deep audit from every role's lifecycle reveals gaps far beyond just "add auth." The design document specifies 10 modules with 100+ use cases. This plan covers every gap found by walking through each user role's complete lifecycle.

---

# PART A: GAP ANALYSIS — Role-by-Role Lifecycle Review

## Role 1: PROSPECTIVE GUEST (Looking for a PG)

**Current state**: Must log in to see `/guest/explore`. No public pages. No map. No comparison.

### Missing from plan:
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G1 | **No SEO-optimized listing pages** — `/properties/[slug]` should be server-rendered for Google indexing | "SEO-optimized listing pages" | HIGH |
| G2 | **No PG comparison** — side-by-side compare 2-3 PGs | "Compare multiple PGs side-by-side" | MEDIUM |
| G3 | **No social sharing** — share PG link on WhatsApp/Instagram | "Share listing via WhatsApp/social media" | MEDIUM |
| G4 | **No site visit scheduling** — prospective guest wants to visit before booking | "Pre-booking site visit scheduling" | HIGH |
| G5 | **No trial stay booking** — 1-3 day trial before committing | "Trial stay option (1-3 days before commitment)" | MEDIUM |
| G6 | **No waitlist** — what happens when a PG is full? | "Waitlist management when rooms are full" | MEDIUM |
| G7 | **No saved/favorites** — shortlist PGs for later | "Save favorites / shortlist" | LOW |
| G8 | **No sorting** — sort by price, rating, distance | "Sort by price, rating, distance" | MEDIUM |
| G9 | **No photo gallery** — only URL strings, no carousel/lightbox | "Photo gallery & virtual tours" | HIGH |
| G10 | **No nearby landmarks** on property detail | "Set location on map with nearby landmarks" | LOW |

### Workflow gap:
```
Current:  Landing Page → Login → Explore (logged in only)
Should be: Landing Page → Browse PGs (public) → PG Detail (public) → Book/Login → KYC → Payment → Confirmation
```

---

## Role 2: CURRENT GUEST (Living in the PG)

**Current state**: Has pages for room, payments, complaints, meals, visitors, notices, reviews. But many are surface-level.

### Missing from plan:
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G11 | **No KYC upload flow** — Aadhaar/PAN verification is just a placeholder | "Digital check-in with ID verification" | HIGH |
| G12 | **No digital agreement signing** — no e-sign or agreement PDF | "Agreement signing (digital / e-sign)" | HIGH |
| G13 | **No room condition photos at check-in** — dispute prevention | "Room condition documentation" | MEDIUM |
| G14 | **No partial payment support** — guest can only pay full or nothing | "Partial payment tracking" | HIGH |
| G15 | **No late fee calculation** — no penalty rules engine | "Late fee calculation & penalty rules" | HIGH |
| G16 | **No rent receipt PDF download** — critical for tax purposes in India | "Digital receipts & invoice generation" | HIGH |
| G17 | **No stay certificate generation** — used as address proof | "Download stay certificate" | MEDIUM |
| G18 | **No room change request** — guest wants to move rooms | "Request room change / bed swap" | MEDIUM |
| G19 | **No meal feedback/rating** — guest can't rate meals | "Meal feedback & rating" | LOW |
| G20 | **No meal opt-out per specific day** — only generic opt-in/out | "Guest meal opt-in / opt-out per day" | MEDIUM |
| G21 | **No diet preference setting** — Veg/Non-Veg/Jain/Vegan | "Special diet preferences" | MEDIUM |
| G22 | **No guest meal (extra) charges** — friend visiting, wants to eat | "Extra meal / guest meal charges" | LOW |
| G23 | **No visitor time limit enforcement** — no curfew/duration rules | "Visitor time limit enforcement" | LOW |
| G24 | **No night visitor approval flow** — needs admin approval | "Night visitor restrictions & approvals" | MEDIUM |
| G25 | **No delivery person logging** — separate from personal visitors | "Delivery person entry logging" | LOW |
| G26 | **No emergency contact registration** — vital safety feature | "Emergency contact registration" | HIGH |
| G27 | **No in-app chat** — guest ↔ admin messaging | "In-app chat (Guest ↔ Admin)" | MEDIUM |
| G28 | **No community forum/poll** — residents connecting | "Community forum for guests" | LOW |
| G29 | **No complaint satisfaction rating** after resolution | "Guest satisfaction rating after resolution" | MEDIUM |
| G30 | **No forwarding address at checkout** | "Forwarding address collection" | LOW |
| G31 | **No electricity/water bill splitting** — common PG need | "Electricity/water bill splitting" | HIGH |

### Key lifecycle gaps:
- **Check-in flow**: No guided digital check-in (KYC → Agreement → Room Photos → Key Assignment)
- **Monthly cycle**: No auto-generated rent invoices on 1st of month
- **Payment reminders**: No automated SMS/Push/WhatsApp reminders (Day 1, Day 5, Day 10)
- **Check-out flow**: No guided process (inspection → deposit deduction → refund → certificate)

---

## Role 3: PG OWNER (1-50 properties)

**Current state**: Has dashboard, analytics, team, payouts pages. But thin on financial controls.

### Missing from plan:
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G32 | **No pricing rules engine** — seasonal pricing, long-stay discounts, referral codes | "Seasonal pricing & discount codes" | HIGH |
| G33 | **No P&L report per property** — owner needs profit/loss view | "P&L report per property" | HIGH |
| G34 | **No GST invoice generation** — required for commercial PGs in India | "GST invoice generation" | HIGH |
| G35 | **No bank reconciliation** | "Bank reconciliation" | LOW |
| G36 | **No defaulter escalation workflow** — Day 1, Day 5, Day 10, Final notice | "Defaulter management with escalation" | HIGH |
| G37 | **No property-wise occupancy heatmap** | "Property-wise occupancy heatmap" | MEDIUM |
| G38 | **No underperforming property alerts** | "Underperforming property alerts" | MEDIUM |
| G39 | **No guided property setup wizard** | Plan has it (4.3) but needs more: deposit rules, pricing tiers, curfew settings | HIGH |
| G40 | **No audit log UI** — API exists but no page to view "who did what" | "Audit log — who did what and when" | MEDIUM |
| G41 | **No guest acquisition source tracking** — how did the guest find us? | "Guest acquisition source tracking" | LOW |
| G42 | **No competitor benchmarking / pricing suggestions** | "Pricing optimization suggestions" | LOW |
| G43 | **No police verification compliance** — Form C for foreign guests | "Police verification compliance" | HIGH (legal) |
| G44 | **No tax report generation** — GST, TDS, ITR support | "Tax report generation" | HIGH |
| G45 | **No property group/portfolio view** — group PGs by location/type | Plan has org but no grouping UI | MEDIUM |

### Key lifecycle gaps:
- **Onboarding**: No step-by-step guide for first-time owner
- **Revenue leakage**: No auto-rent generation, no penalty calculation
- **Compliance**: No police verification, no GST handling
- **Financial control**: No deposit rules, no refund processing logic

---

## Role 4: PROPERTY ADMIN/MANAGER

### Missing from plan:
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G46 | **No visual room management with drag-drop** | "Drag & drop room allocation" | MEDIUM |
| G47 | **No bed-level tracking UI** — important for shared rooms | "Bed-level management for shared rooms" | HIGH |
| G48 | **No room cleaning schedule** | "Room cleaning schedule & status" | MEDIUM |
| G49 | **No room inventory tracking** — furniture, fixtures | "Room inventory tracking" | LOW |
| G50 | **No auto-generate monthly invoices** on 1st of month | "Auto-generate invoices on 1st" | HIGH |
| G51 | **No payment reminder automation** — configurable schedule | "Payment reminder automation" | HIGH |
| G52 | **No guest blacklist management** | "Guest blacklist management" | MEDIUM |
| G53 | **No bulk communication** — SMS/email to all residents | "Bulk communication" | MEDIUM |
| G54 | **No guest feedback analysis** — sentiment from reviews | "Guest feedback analysis" | LOW |
| G55 | **No SLA tracking on complaints** — escalation if not resolved in X hours | "SLA tracking — escalation" | HIGH |
| G56 | **No maintenance schedule** — preventive maintenance calendar | "Maintenance schedule for preventive work" | MEDIUM |

---

## Role 5: STAFF

### Missing from plan:
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G57 | **No shift scheduling** for staff | "Shift scheduling" | MEDIUM |
| G58 | **No attendance tracking** | "Attendance tracking" | MEDIUM |
| G59 | **No performance rating** based on task completion | "Performance rating" | LOW |
| G60 | **No cook-specific view** — meal counts, dietary needs today | "Update meal preparation status" | HIGH |
| G61 | **No cleaning checklist** per room | "View assigned tasks (cleaning schedule)" | MEDIUM |

---

## Role 6: PLATFORM OPERATOR (SaaS business)

### Missing from plan:
| # | Gap | Priority |
|---|-----|----------|
| G62 | **No super-admin panel** — platform-level management | HIGH |
| G63 | **No onboarding funnel** — track owner signup → first property → first guest | HIGH |
| G64 | **No referral program** — owner invites owner, guest invites guest | MEDIUM |
| G65 | **No support ticket system** — owners need to contact platform support | MEDIUM |
| G66 | **No terms of service / privacy policy pages** | HIGH (legal) |
| G67 | **No data export / GDPR compliance** | MEDIUM |
| G68 | **No platform analytics** — total users, properties, revenue across all tenants | HIGH |
| G69 | **No email/WhatsApp notification templates** — configurable per event | HIGH |

---

## Additional Gaps Found in v3 Cross-Reference (G70-G99)

### Module 2 (Booking) — New Gaps
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G70 | **No real-time room availability calendar** — no date-range availability query. Current booking API only checks bed count at time of booking. | "Real-time room availability calendar" | HIGH |
| G71 | **No instant vs approval-based booking toggle** — all bookings go to PENDING. No property-level config for auto-approval. | "Instant booking vs approval-based booking" | HIGH |
| G72 | **No booking cancellation & refund policy engine** — BookingStatus has CANCELLED but no pre-move-in cancellation rules (refund %, time windows). Separate from checkout. | "Booking cancellation & refund policy" | HIGH |
| G73 | **No group/corporate booking** — no way for a company to book multiple rooms under single invoice. | "Group booking for corporates" | MEDIUM |

### Module 4 (Complaint) — New Gaps
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G74 | **No auto-assign complaints by category** — complaint creation accepts `assignedTo` but never auto-fills it. Need configurable mapping per property. | "Auto-assign to relevant staff" | HIGH |
| G75 | **No recurring issue detection** — no logic to flag when same room+category accumulates 3+ complaints. | "Recurring issue detection & alerts" | MEDIUM |
| G76 | **No vendor/contractor management** — no model for external repair vendors, invoices, warranties. | "Vendor/contractor management for repairs" | LOW |

### Module 5 (Meal) — New Gaps
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G77 | **No meal subscription vs per-meal pricing** — no pricing on Meal or MealOptIn. Some PGs include meals; others charge per meal. | "Monthly meal subscription vs per-meal pricing" | HIGH |
| G78 | **No festival/special menu announcements** — no distinct flag for seasonal menus. | "Festival/special menu announcements" | LOW |
| G79 | **No meal wastage tracking** — `Meal` has expectedCount/actualCount but no cost fields, no wastage reporting. | "Meal wastage tracking for owners" | MEDIUM |

### Module 6 (Visitor) — New Gaps
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G80 | **No blacklisted visitor alerts** — visitor-level blacklisting (specific phone numbers banned per property) absent. | "Blacklisted visitor alerts" | MEDIUM |
| G81 | **No OTP-based visitor verification** — no OTP flow for visitors at gate. | "OTP-based visitor verification" | MEDIUM |
| G82 | **No visitor parking allocation** — no Parking model or slot assignment. | "Visitor parking allocation" | LOW |

### Module 7 (Check-in/Check-out) — New Gaps
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G83 | **No room key/access card inventory** — no model for keys/cards/fobs, no assignment tracking. | "Room key/access card assignment" | MEDIUM |
| G84 | **No room turnover scheduling** — checkout doesn't auto-create housekeeping task. | "Room turnover scheduling for housekeeping" | HIGH |

### Module 8 (Communication) — New Gaps
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G85 | **No emergency alert system** — no panic button, no mass push/SMS escalation chain. | "Emergency alerts" | HIGH |
| G86 | **No poll/survey creation** — no Poll model or voting mechanism. | "Poll/survey creation" | LOW |
| G87 | **No document sharing** — no shared documents area for house rules PDF, templates. | "Document sharing (house rules, agreements)" | MEDIUM |

### Owner Business Intelligence — New Gaps
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G88 | **No demand forecasting** — no predictive analytics for vacancy periods. | "Demand forecasting" | LOW |
| G89 | **No guest lifetime value analysis** — no calculation of total revenue per guest. | "Guest lifetime value analysis" | LOW |
| G90 | **No churn prediction** — no heuristic to flag guests likely to leave. | "Churn prediction" | LOW |

### Staff Management — New Gaps
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G91 | **No salary management** — Expense has STAFF_SALARY category but no structured payroll. | "Salary management" | MEDIUM |

### Enterprise Features — New Gaps
| # | Gap | Design Use Case | Priority |
|---|-----|-----------------|----------|
| G92 | **No webhook system** — no way to push events to third-party systems (Tally, listing sites). | "Webhook system for integrations" | MEDIUM |
| G93 | **No API keys for external integrations** — auth is JWT-only. No long-lived API keys for enterprise tenants. | "API keys for external integrations" | MEDIUM |
| G94 | **No white-labeling** — no custom domain, logo, or color scheme per organization. | "White-labeling" | LOW |
| G95 | **No SSO/corporate login** — no SAML/OIDC for corporate PG partnerships. | "SSO/Corporate login" | LOW |
| G96 | **No activity feed on dashboard** — AuditLog stores data but no feed-style UI. | "Activity feed" | MEDIUM |
| G97 | **No prorated rent calculation** — booking rentAmount is static. No mid-month check-in proration. | "Prorated rent" | HIGH |
| G98 | **No no-show handling** — no timeout, no auto-cancellation if guest books but never checks in. | "No-show handling" | MEDIUM |
| G99 | **No concurrent edit protection** — no optimistic locking. Two admins can overwrite each other. | "Optimistic locking" | MEDIUM |

---

## Cross-Role Workflow Gaps

### 1. Complaint Resolution Flow (currently broken):
```
Current:  Guest creates → Admin can assign/resolve → Done
Missing:  Guest creates → [PUSH notification to Admin] → Admin assigns to Staff →
          [PUSH to Staff] → Staff updates progress → [Status update to Guest] →
          Staff resolves → [Rating request to Guest] → Guest rates →
          [If SLA breached: Escalate to Owner]
```

### 2. Payment Flow (currently disconnected):
```
Current:  Admin records payment manually → Done
Missing:  [1st of month: Auto-generate invoice] → [SMS/WhatsApp reminder to Guest] →
          Guest pays online (Razorpay) → [Auto-update payment status] →
          [Receipt PDF generated] → [Admin dashboard updates] →
          [Owner sees consolidated revenue] →
          [If unpaid by Day 5: 2nd reminder] → [Day 10: Final notice] →
          [Day 15: Late fee applied] → [Day 30: Defaulter escalation to Owner]
```

### 3. Booking-to-Checkin Flow (currently fragmented):
```
Current:  Booking created → Status changed manually → Done
Missing:  Guest books online → [Confirmation SMS/Email] → [Admin approval notification] →
          Admin approves → [Guest receives approval + KYC instructions] →
          Guest uploads KYC → [Admin verifies KYC] →
          Check-in day: [Digital agreement e-sign] → [Room condition photos] →
          [Key/card assignment] → [Welcome message with house rules] →
          [Guest dashboard activates with room info]
```

### 4. Check-out Flow (not implemented end-to-end):
```
Missing:  Guest submits notice → [Admin notified] → [Owner sees on dashboard] →
          Notice period counts down → [Inspection scheduled] →
          Admin inspects room → [Damage assessment with photos] →
          [Deposit deduction calculated] → [Refund processed] →
          [Stay certificate generated] → [Review request to Guest] →
          [Room marked for turnover] → [Cleaning task assigned to Staff]
```

---

# PART B: TECHNICAL GAPS

| # | Gap | Impact | Priority |
|---|-----|--------|----------|
| T1 | **No file upload system** — KYC docs, photos, receipts need S3/Cloudinary | Blocks KYC, photos, receipts | HIGH |
| T2 | **No PDF generation** — invoices, receipts, stay certificates, agreements | Blocks financial compliance | HIGH |
| T3 | **No email service** — transactional emails for confirmations, reminders | Blocks all notification flows | HIGH |
| T4 | **No SMS/WhatsApp integration** — MSG91/Twilio for OTP + reminders | Blocks payment reminders, visitor alerts | HIGH |
| T5 | **No real-time updates** — WebSocket/SSE for live notifications | Blocks complaint status updates, chat | MEDIUM |
| T6 | **No payment gateway integration** — Razorpay for online rent payment | Blocks online rent collection | HIGH |
| T7 | **No cron/scheduled jobs** — auto-rent generation, reminder schedules | Blocks automation workflows | HIGH |
| T8 | **No i18n framework** — Hindi, Telugu, Kannada support per design | Blocks wider adoption in India | MEDIUM |
| T9 | **No rate limiting** on API routes | Security vulnerability | HIGH |
| T10 | **No input validation schemas** — Zod for API + forms | Security + UX | HIGH |
| T11 | **No caching** — Redis for sessions, frequently accessed data | Performance at scale | MEDIUM |
| T12 | **No error boundary components** — graceful UI error handling | UX resilience | MEDIUM |
| T13 | **No performance budget** — design specifies page load < 2s, API < 300ms, 99.9% uptime. No enforcement. | Cannot verify production readiness | HIGH |
| T14 | **No load testing strategy** — no k6/Artillery scripts, no baseline benchmarks. | Unknown breaking point | MEDIUM |
| T15 | **No backup/disaster recovery plan** — no DB backup schedule, no point-in-time recovery, no failover. | Data loss risk | HIGH |
| T16 | **No monitoring/alerting setup** — design mentions Sentry + Grafana but plan never implements. No health check. | Incidents go undetected | HIGH |
| T17 | **No API versioning** — all routes unversioned (`/api/bookings`). Breaking changes will break integrations. | Enterprise API stability | MEDIUM |
| T18 | **No request logging/tracing** — no correlation IDs, no structured logging. | Cannot debug production issues | HIGH |
| T19 | **No database connection pooling config** — Prisma defaults with no explicit pool sizing. | Connection exhaustion under load | MEDIUM |
| T20 | **No CDN/asset optimization** — no image optimization pipeline for photo-heavy listings. | Slow page loads | MEDIUM |

---

# PART F: ENTITY STATE MACHINE DIAGRAMS

## F.1 Booking Lifecycle

```
                            ┌──────────────┐
                   ┌────────│   PENDING    │────────┐
                   │        └──────┬───────┘        │
                   │               │                │
              [guest/admin     [admin approves     [no-show timeout
               cancels]         OR auto-approve]    48h past checkIn]
                   │               │                     │
                   v               v                     v
            ┌──────────┐   ┌─────────────┐      ┌──────────────┐
            │ CANCELLED │   │  CONFIRMED  │      │   NO_SHOW    │
            └──────────┘   └──────┬──────┘      └──────────────┘
                                  │
                          [KYC verified +
                           agreement signed]
                                  │
                                  v
                          ┌──────────────┐
                          │  CHECKED_IN  │
                          └──────┬───────┘
                                 │
                          [guest submits notice]
                                 │
                                 v
                          ┌──────────────┐
                          │    NOTICE    │
                          └──────┬───────┘
                                 │
                          [notice ends + inspection
                           done + dues cleared]
                                 │
                                 v
                          ┌──────────────┐
                          │ CHECKED_OUT  │
                          └──────┬───────┘
                                 │
                          [deposit refunded +
                           certificate issued]
                                 │
                                 v
                          ┌──────────────┐
                          │  COMPLETED   │
                          └──────────────┘
```

**Schema change**: Add `CHECKED_IN`, `NOTICE`, `CHECKED_OUT`, `NO_SHOW` to `BookingStatus` enum.

**Transition rules** (enforced in `PUT /api/bookings/[id]`):
- PENDING → CONFIRMED: admin action (or auto if `property.bookingApprovalMode = "INSTANT"`)
- PENDING → CANCELLED: guest or admin; triggers refund policy engine
- PENDING → NO_SHOW: cron job after 48h past checkInDate
- CONFIRMED → CHECKED_IN: requires `kycStatus = VERIFIED`, `agreementUrl != null`
- CHECKED_IN → NOTICE: requires active NoticePeriod record
- NOTICE → CHECKED_OUT: all dues cleared + inspection completed
- CHECKED_OUT → COMPLETED: deposit refund processed
- No backward transitions. Cancelled bookings require new booking.

## F.2 Payment Lifecycle

```
            [auto-generated 1st                [partial payment
             or admin creates]                  received]
                    │                                │
                    v                                v
            ┌──────────────┐                ┌──────────────┐
            │  GENERATED   │                │   PARTIAL    │
            └──────┬───────┘                └──────┬───────┘
                   │                               │
            [invoice sent]                  [remaining paid]
                   │                               │
                   v                               v
            ┌──────────────┐               ┌──────────────┐
            │   PENDING    │──────────────>│     PAID     │
            └──────┬───────┘  [full pay]   └──────────────┘
                   │
            [grace period exceeded]
                   │
                   v
            ┌──────────────┐       ┌──────────────┐
            │   OVERDUE    │       │   REFUNDED   │
            └──────┬───────┘       └──────────────┘
                   │                       ^
            [30+ days, reminders           │
             exhausted]             [cancellation or
                   │                deposit return]
                   v
            ┌──────────────┐
            │  DEFAULTER   │
            └──────────────┘
```

**Schema change**: Replace `PaymentStatus` enum with `GENERATED | PENDING | PARTIAL | PAID | OVERDUE | DEFAULTER | REFUNDED | FAILED`. Add `amountPaid` (Float, default 0), `lateFee` (Float, default 0) to Payment.

## F.3 Complaint Lifecycle

```
            [guest creates]
                   │
                   v
            ┌──────────────┐
            │     OPEN     │
            └──────┬───────┘
                   │
            [auto-assign by category
             or admin assigns manually]
                   │
                   v
            ┌──────────────┐
            │   ASSIGNED   │
            └──────┬───────┘
                   │
            [staff begins work]
                   │
                   v
            ┌──────────────┐
            │ IN_PROGRESS  │──────────┐
            └──────┬───────┘          │
                   │           [SLA breached]
            [staff resolves]          │
                   │                  v
                   v          ┌──────────────┐
            ┌──────────────┐  │  ESCALATED   │
            │   RESOLVED   │  └──────┬───────┘
            └──────┬───────┘         │
                   │          [reassigned at
            [guest rates +     higher level]
             7-day auto-close]       │
                   │                 v
                   v          (back to ASSIGNED)
            ┌──────────────┐
            │    CLOSED    │
            └──────────────┘
                   ^
                   │
            [guest reopens within 48h]
                   │
            ┌──────────────┐
            │   REOPENED   │──> (back to ASSIGNED)
            └──────────────┘
```

**Schema change**: Add `ESCALATED`, `REOPENED` to `ComplaintStatus`. Add `slaDeadline`, `escalationLevel`, `reopenCount` to Complaint.

---

# PART G: API ACCESS CONTROL MATRIX

**Legend**: C=Create, R=Read, U=Update, D=Delete. Scope: `own-org`=own organization, `own-prop`=assigned properties, `own-rec`=own records, `pub`=public.

### Auth Routes (public)
| Route | PUBLIC | GUEST | STAFF | ADMIN | OWNER | SUPER_ADMIN |
|-------|--------|-------|-------|-------|-------|-------------|
| POST /api/auth/register | C | -- | -- | -- | -- | -- |
| POST /api/auth/send-otp | C | -- | -- | -- | -- | -- |
| POST /api/auth/verify-otp | C | -- | -- | -- | -- | -- |
| GET /api/auth/me | -- | R(own) | R(own) | R(own) | R(own) | R(own) |

### Properties
| Route | PUBLIC | GUEST | STAFF | ADMIN | OWNER | SUPER_ADMIN |
|-------|--------|-------|-------|-------|-------|-------------|
| GET /api/properties | R(listed) | R(listed) | R(own-prop) | R(own-prop) | R(own-org) | R(all) |
| POST /api/properties | -- | -- | -- | -- | C(own-org) | C(any) |
| GET /api/properties/[id] | R(listed) | R(listed/own) | R(own-prop) | R(own-prop) | R(own-org) | R(any) |
| PUT /api/properties/[id] | -- | -- | -- | U(own-prop) | U(own-org) | U(any) |
| DELETE /api/properties/[id] | -- | -- | -- | -- | D(own-org) | D(any) |

**CURRENTLY BROKEN**: PUT/DELETE have ZERO ownership checks. Any authenticated user can modify any property.

### Rooms
| Route | PUBLIC | GUEST | STAFF | ADMIN | OWNER | SUPER_ADMIN |
|-------|--------|-------|-------|-------|-------|-------------|
| GET /api/rooms | R(listed,avail) | R(own-prop) | R(own-prop) | R(own-prop) | R(own-org) | R(all) |
| POST /api/rooms | -- | -- | -- | C(own-prop) | C(own-org) | C(any) |
| PUT /api/rooms/[id] | -- | -- | -- | U(own-prop) | U(own-org) | U(any) |

### Bookings
| Route | PUBLIC | GUEST | STAFF | ADMIN | OWNER | SUPER_ADMIN |
|-------|--------|-------|-------|-------|-------|-------------|
| GET /api/bookings | -- | R(own-rec) | -- | R(own-prop) | R(own-org) | R(all) |
| POST /api/bookings | -- | C(self only) | -- | C(own-prop) | C(own-org) | C(any) |
| PUT /api/bookings/[id] | -- | U(own-rec,cancel only) | -- | U(own-prop) | U(own-org) | U(any) |

**CURRENTLY BROKEN**: GET returns ALL bookings to any user. POST accepts arbitrary guestId. GET/[id] has zero auth.

### Payments
| Route | PUBLIC | GUEST | STAFF | ADMIN | OWNER | SUPER_ADMIN |
|-------|--------|-------|-------|-------|-------|-------------|
| GET /api/payments | -- | R(own-booking) | -- | R(own-prop) | R(own-org) | R(all) |
| POST /api/payments | -- | -- | -- | C(own-prop) | C(own-org) | C(any) |
| PUT /api/payments/[id] | -- | -- | -- | U(own-prop) | U(own-org) | U(any) |

**CURRENTLY BROKEN**: GET/POST have zero auth. Any user can read all payments or create payment records.

### Complaints
| Route | PUBLIC | GUEST | STAFF | ADMIN | OWNER | SUPER_ADMIN |
|-------|--------|-------|-------|-------|-------|-------------|
| GET /api/complaints | -- | R(own-rec) | R(assigned) | R(own-prop) | R(own-org) | R(all) |
| POST /api/complaints | -- | C(own-prop,self) | -- | C(own-prop) | -- | -- |
| PUT /api/complaints/[id] | -- | U(own-rec,rate only) | U(assigned,status) | U(own-prop) | U(own-org) | U(any) |

### Meals, Visitors, Tasks, Announcements, Reviews, Expenses, Notifications, Users, Notice Periods, Audit Logs
All follow the same pattern:
- **Guest**: own records only
- **Staff**: assigned/own-property records only
- **Admin**: own-property records only
- **Owner**: own-organization records only
- **Super Admin**: all records

**Implementation**: Create `src/lib/data-scope.ts` with helpers:
- `scopeToOrg(userId)` → `{ organizationId }` filter
- `scopeToProperty(userId)` → `{ propertyId: { in: [...] } }` filter
- `scopeToOwnRecords(userId)` → `{ guestId: userId }` filter
- Each route wraps Prisma `where` with appropriate scope

---

# PART H: CRITICAL BUSINESS RULES

### H.1 Prorated Rent
```
Formula: proratedRent = (monthlyRent / daysInMonth) * remainingDays
Example: ₹12,000/mo, check in 15th March = (12000/31) * 17 = ₹6,581

Configuration (per property in PropertyBillingConfig):
  - proratedEnabled: boolean (default true)
  - proratedRounding: CEIL | FLOOR | ROUND
  - minimumDaysForFullMonth: number (default 25)
```

### H.2 Security Deposit Refund Timeline
```
Day 0: Checkout complete, inspection done
Day 1-7: Damage assessment period (admin documents deductions)
Day 7: Deduction finalized, net refund locked
Day 7-15: Refund processed
Day 15: Maximum refund deadline

Deduction categories: Room damage, unpaid bills, lost key/card,
  cleaning fee, notice period shortfall

New model: DepositRefund (bookingId, depositAmount, deductions JSON,
  netRefund, status, refundDeadline, processedAt)
```

### H.3 Booking Cancellation Refund Policy
```
Default (configurable per property):
  7+ days before check-in: 100% refund
  3-6 days: 50% refund
  1-2 days: 25% refund
  On check-in day or after: 0% (no-show)
  Security deposit: always 100% on cancellation

New model: CancellationPolicy (propertyId, daysBeforeCheckin, refundPercentage)
```

### H.4 Late Payment Grace Period & Penalty
```
Configuration (PropertyBillingConfig):
  - gracePeriodDays: Int (default 5)
  - lateFeeType: FLAT | PERCENTAGE_PER_DAY | PERCENTAGE_ONE_TIME
  - lateFeeValue: Float
  - maxLateFee: Float (cap)
  - reminderSchedule: JSON [1, 5, 10, 15, 30]

Escalation: Day 0 → invoice. Day 1 → reminder. Day grace+1 → late fee.
  Day 10 → 2nd reminder. Day 15 → admin escalation. Day 30 → owner alert + defaulter.
```

### H.5 No Simultaneous Active Bookings
```
Validation on POST /api/bookings:
  If guest has booking with status IN (PENDING, CONFIRMED, CHECKED_IN, NOTICE):
    Reject: "You already have an active booking."
Exception: OWNER/ADMIN creating on behalf (group bookings) can override.
```

### H.6 Room Lock After Notice
```
Config (per property): roomLockOnNotice: boolean (default false)
  - false: room shown as "available from [notice end date]" immediately
  - true: room stays reserved until actual checkout
```

---

# PART I: PERFORMANCE & OPERATIONS

### I.1 Performance Budget
| Metric | Target | Enforcement |
|--------|--------|-------------|
| Page LCP | < 2.0s | Lighthouse CI in GitHub Actions |
| API p95 | < 300ms | Custom middleware + alert |
| API p99 | < 1.0s | Alert if exceeded 5 min |
| JS bundle/route | < 250KB gzip | @next/bundle-analyzer |
| DB query | < 100ms | Prisma query event logging |
| Uptime | 99.9% | Uptime monitor + PagerDuty |

### I.2 Load Testing (k6)
- Baseline: 50 users, 10 min → p95 < 300ms
- Peak: 200 users, 15 min → p95 < 500ms
- Spike: 50→500 users in 30s → graceful degradation
- Soak: 100 users, 2h → no memory leaks

### I.3 Backup & Disaster Recovery
- Daily automated DB backups, 7-day PITR window
- S3 versioning enabled, 30-day soft delete
- RTO < 1 hour, RPO < 5 minutes
- Cross-region replication for ENTERPRISE tier

### I.4 Monitoring & Alerting
- Error tracking: Sentry (client + server)
- Health check: `GET /api/health` (DB connectivity, version, uptime)
- Structured logging: `pino` with correlation IDs
- Alerts: error rate > 1% → Slack, > 5% → PagerDuty

---

# PART J: SCHEMA CHANGE SUMMARY

### Modified Enums
1. **BookingStatus**: Add `CHECKED_IN`, `NOTICE`, `CHECKED_OUT`, `NO_SHOW`
2. **PaymentStatus**: Replace with `GENERATED | PENDING | PARTIAL | PAID | OVERDUE | DEFAULTER | REFUNDED | FAILED`
3. **ComplaintStatus**: Add `ESCALATED`, `REOPENED`
4. **Role**: Add `SUPER_ADMIN`

### Modified Models
1. **Booking**: Add `version` (Int, default 1)
2. **Payment**: Add `amountPaid`, `lateFee`, `version`
3. **Complaint**: Add `slaDeadline`, `escalationLevel`, `reopenCount`, `version`
4. **Room**: Add `version`
5. **Meal**: Add `estimatedCost`
6. **Property**: Add `slug` (unique, for SEO URLs)

### New Models (12)
1. **PropertyBillingConfig** — grace period, late fee, proration, reminders, booking approval mode, meal billing
2. **CancellationPolicy** — refund tiers per days before check-in
3. **DepositRefund** — deposit refund workflow tracking
4. **ComplaintAssignmentRule** — auto-assign category→staff mapping
5. **BlacklistedVisitor** — visitor-level ban list per property
6. **WebhookEndpoint** — outbound webhook registrations per org
7. **ApiKey** — long-lived API keys for enterprise integrations
8. **WhiteLabelConfig** — custom domain, branding per org
9. **Poll** + **PollVote** — resident surveys
10. **SharedDocument** — house rules, templates per property
11. **StaffSalary** — staff payroll configuration
12. **GroupBooking** — corporate multi-room bookings

---

# PART C: REFINED IMPLEMENTATION PLAN

## Phase 0: Foundation (must come first)

### 0.1 Input Validation Layer
**New file**: `src/lib/validations.ts`
- Zod schemas for every entity: property, room, booking, payment, complaint, meal, visitor, review, task, expense
- Used BOTH in API routes (server validation) AND forms (client validation)
- Consistent error response format: `{ error: string, fields?: { [field]: string } }`

### 0.2 File Upload System
- Install: `@aws-sdk/client-s3` (or use Cloudinary)
- New API: `api/upload/route.ts` — presigned URL generation or direct upload
- New component: `src/components/ui/file-upload.tsx` — drag-drop, preview, progress bar
- Configure S3 bucket or Cloudinary account in `.env`
- Used for: KYC documents, property photos, complaint photos, receipts, room condition photos

### 0.3 PDF Generation
- Install: `@react-pdf/renderer` or `jspdf`
- New utility: `src/lib/pdf-generator.ts`
- Templates: rent invoice, payment receipt, stay certificate, digital agreement
- API endpoints: `api/documents/invoice/[bookingId]/route.ts`, `api/documents/receipt/[paymentId]/route.ts`, `api/documents/certificate/[bookingId]/route.ts`

### 0.4 Notification Service
- New utility: `src/lib/notifications.ts`
- Channels: in-app (DB), email (Resend/SES), SMS (MSG91), WhatsApp (Meta Business API)
- Event-driven: `sendNotification(event, userId, data)` routes to appropriate channels
- Configurable per user: which channels they want for which events
- Templates stored as constants/JSON for each event type

### 0.5 Toast System
- Install `sonner`, add `<Toaster />` to layout
- Update `useApi` hook to auto-toast errors

### 0.6 Structured Logging (T18)
- Install `pino` + `pino-pretty`
- New utility: `src/lib/logger.ts` — structured JSON logging with correlation IDs
- Replace all `console.error` with structured logger
- Add request correlation ID middleware

### 0.7 Health Check Endpoint (T16)
- New API: `GET /api/health` returning DB connectivity, version, uptime
- Used by uptime monitors

### 0.8 Performance Middleware (T13)
- New utility: `src/lib/perf-middleware.ts`
- Measures `Date.now()` at request start/end, adds `X-Response-Time` header
- Logs to structured JSON for Grafana ingestion

---

## Phase 1: API Security & Data Isolation (same as before, refined)

### 1.1 Authorization Utility — `src/lib/authorization.ts`
Same as before, plus:
- `getGuestPropertyId(userId)` — single helper for guest's current property
- `isPropertyAdmin(userId, propertyId)` — check PropertyAdmin table
- `canPerformAction(user, action, resource)` — extensible RBAC

### 1.2 Secure All Routes
Same scope as before (14 unprotected + 7 to harden). Additionally:
- Add Zod validation to every POST/PUT body
- Return proper 403 with reason message, not just "Unauthorized"
- Log auth failures to AuditLog table

### 1.3 Rate Limiting
- New middleware helper: `src/lib/rate-limit.ts`
- Use in-memory store for MVP (upgrade to Redis later)
- Limits: auth endpoints (5/min), read endpoints (60/min), write endpoints (20/min)
- Return 429 with `Retry-After` header

### 1.4 Optimistic Locking (G99)
- Add `version` (Int, autoincrement on update) to Booking, Room, Payment, Complaint
- All PUT handlers include `version` in WHERE clause, return 409 Conflict on mismatch

### 1.5 Data Isolation Enforcement (PART G matrix)
- New utility: `src/lib/data-scope.ts`
  - `scopeToOrg(userId)` → `{ organizationId }` filter
  - `scopeToProperty(userId)` → `{ propertyId: { in: [...] } }` filter
  - `scopeToOwnRecords(userId)` → `{ guestId: userId }` filter
- Every route handler wraps Prisma `where` with appropriate scope per PART G matrix
- This is the largest single change: applies to ALL 34 route files

---

## Phase 2: Multi-Tenancy & Subscription (same as before, refined)

### 2.1 Schema Changes
Same as before (Organization, Subscription, OrganizationMember), plus:
- Add `PropertyGroup` model — for owners to group properties (by city, by type, etc.)
- Add `source` field to User — tracks how guest found the platform (organic, referral, social)
- Add `referralCode` to User — for referral program
- Add `emergencyContact`, `emergencyPhone` to User — safety feature (G26)
- Add `dietPreference` to MealOptIn — Veg/Non-Veg/Jain/Vegan (G21)
- Add `SiteVisit` model — scheduling pre-booking visits (G4)
- Add `RoomChangeRequest` model — guest requesting room change (G18)
- Add `UtilityBill` model — electricity/water bill tracking and splitting (G31)

### 2.2 Feature Gates
Same as before, plus:
- Gate by feature: analytics (PRO+), export reports (PRO+), bulk communication (ENTERPRISE), API access (ENTERPRISE), white-label (ENTERPRISE)

### 2.3 Pricing & Discounts Engine
**New file**: `src/lib/pricing.ts`
- Seasonal pricing rules per room type per property
- Long-stay discounts (6 month: 5% off, 12 month: 10% off)
- Referral discount codes
- Late fee calculation: configurable per property (flat fee or % per day)

### 2.4 Property Billing Configuration (H.1-H.4, H.6)
- New model: `PropertyBillingConfig` — grace period, late fee rules, proration settings, reminder schedule, booking approval mode (instant/manual), room lock on notice, meal billing type
- New model: `CancellationPolicy` — refund tiers per days before check-in per property

### 2.5 Enum Expansions (PART F state machines)
- `BookingStatus`: Add `CHECKED_IN`, `NOTICE`, `CHECKED_OUT`, `NO_SHOW`
- `PaymentStatus`: Replace with `GENERATED | PENDING | PARTIAL | PAID | OVERDUE | DEFAULTER | REFUNDED | FAILED`
- `ComplaintStatus`: Add `ESCALATED`, `REOPENED`
- `Role`: Add `SUPER_ADMIN`

---

## Phase 3: Public Discovery & Map Search (same as before, expanded)

### 3.1-3.5 Same as before

### 3.6 NEW: PG Comparison Page
- `src/app/(public)/compare/page.tsx`
- Compare up to 3 PGs side by side: price, amenities, ratings, rules
- URL-based: `/compare?ids=abc,def,ghi`

### 3.7 NEW: Social Sharing
- OpenGraph meta tags on property detail pages (SSR)
- WhatsApp share button with formatted message + link
- Copy link button

### 3.8 NEW: SEO Optimization
- Dynamic sitemap at `src/app/sitemap.ts` listing all active properties
- Property detail pages use `generateMetadata()` for title, description, og:image
- Structured data (JSON-LD) for local business schema

### 3.9 NEW: Room Availability Calendar API (G70)
- New endpoint: `GET /api/properties/[id]/availability?from=&to=`
- Returns date-range matrix of room availability based on bookings + notice periods
- Visual calendar component showing available/occupied dates per room

---

## Phase 4: Guest Lifecycle Features (NEW — was missing entirely)

### 4.1 KYC & Check-in Flow
- New page: `src/app/(dashboard)/guest/checkin/page.tsx`
- Step 1: Upload Aadhaar/PAN (uses file-upload component)
- Step 2: Digital agreement (display terms, e-sign checkbox, date)
- Step 3: Room condition photos (take/upload photos of room at check-in)
- Step 4: Emergency contact details
- API: `api/kyc/route.ts` — upload & verify documents
- New schema fields: `kycStatus` (PENDING/SUBMITTED/VERIFIED/REJECTED) on User

### 4.2 Payment & Financial Features
- **Razorpay integration**: `src/lib/razorpay.ts` — create order, verify payment
- API: `api/payments/initiate/route.ts` — create Razorpay order
- API: `api/payments/webhook/route.ts` — Razorpay callback handler
- **Auto-rent generation**: scheduled job to create Payment records on 1st of each month
- **Late fee engine**: scheduled job to apply penalties after grace period
- **Partial payments**: modify Payment model to track `amountPaid` vs `amountDue`
- **Receipt PDF**: download link on each payment row

### 4.3 Check-out Flow
- New page: `src/app/(dashboard)/guest/checkout/page.tsx`
- Guided steps: submit notice → pending dues summary → inspection date → deposit refund status → certificate download → review request
- API: `api/checkout/[bookingId]/route.ts` — manages the full checkout process
- Deposit deduction logic: damage assessment → deductions → net refund calculation

### 4.4 Meal Enhancements
- Per-day opt-in/opt-out calendar view (not just generic toggle)
- Diet preference setting persisted per user
- Meal count dashboard for cook (staff role)
- Meal feedback: 1-5 star rating after each meal

### 4.5 Room Change Request
- New API: `api/room-changes/route.ts`
- Guest requests change → Admin reviews → Approves/rejects → Room swap executed

### 4.6 Prorated Rent Engine (G97, H.1)
- Logic in `src/lib/pricing.ts` for first and last month proration
- Called by auto-rent generation and check-in flow

### 4.7 No-Show Detection (G98)
- Cron job: check CONFIRMED bookings where checkInDate > 48h past
- Transition to NO_SHOW, trigger cancellation policy

### 4.8 Booking Cancellation Flow (G72, H.3)
- New endpoint: `POST /api/bookings/[id]/cancel`
- Checks cancellation policy, calculates refund, creates refund Payment, transitions booking

### 4.9 Booking State Machine Enforcement (PART F.1)
- Refactor `PUT /api/bookings/[id]` to enforce valid transitions only
- Add simultaneous booking guard (H.5)
- Add instant vs approval booking mode (G71)

---

## Phase 5: Admin Operations (NEW — was partially covered)

### 5.1 Auto Invoice Generation
- Cron job (or Next.js API route triggered by cron): runs on 1st of month
- Creates Payment records for all active bookings
- Sends invoice via email/SMS

### 5.2 Payment Reminder Automation
- Configurable reminder schedule per property: Day 1, 5, 10, 15, 30
- Sends via configured channels (push, SMS, WhatsApp, email)
- Tracks reminder history per payment

### 5.3 Complaint SLA Engine
- Configurable SLA per complaint priority: Urgent=4hrs, High=24hrs, Medium=3days, Low=7days
- Background check: if SLA breached, auto-escalate to next level (Staff→Admin→Owner)
- SLA countdown visible on complaint cards

### 5.4 Guest Directory Enhancements
- KYC verification status with approve/reject
- Police verification status (Form C for foreign nationals)
- Blacklist management with reason and photo

### 5.5 Bulk Communication
- Select recipients: all guests, by floor, by property, custom list
- Channels: in-app + email + SMS
- Template library for common messages

### 5.6 Complaint Auto-Assignment (G74)
- New model: `ComplaintAssignmentRule` (propertyId, category, assignedToUserId)
- On complaint creation, auto-assign based on rules

### 5.7 Recurring Issue Detection (G75)
- Trigger: count complaints per room+category in rolling 30 days
- If >= 3, create notification to property owner

### 5.8 Room Turnover on Checkout (G84)
- When booking transitions to CHECKED_OUT, auto-create StaffTask: "Room turnover - [roomNumber]"

### 5.9 Emergency Alert System (G85)
- New API: `POST /api/alerts/emergency` — sends push+SMS to all staff+admin+owner
- "Panic button" component on guest dashboard

### 5.10 Deposit Refund Workflow (H.2)
- New model: `DepositRefund` with timeline enforcement
- Tracks inspection → deductions → refund processing

---

## Phase 6: Owner Business Features (NEW)

### 6.1 Financial Reports
- P&L report per property: income - expenses = profit
- GST report: taxable income, GST collected, GST paid
- TDS report for applicable payments
- Export to PDF/Excel

### 6.2 Pricing Engine UI
- Set base price per room type
- Seasonal rules: "December-January: +15% (peak season)"
- Long-stay discounts
- Referral discount codes with usage tracking

### 6.3 Occupancy Analytics
- Heatmap: property × month grid showing occupancy %
- Trend charts: occupancy over time per property
- Vacancy alerts: "Room 301 has been vacant for 30+ days"
- Revenue per room analysis

### 6.4 Audit Log Viewer
- UI page: `src/app/(dashboard)/owner/audit-log/page.tsx`
- Filter by user, action type, entity, date range
- Shows: who did what, when, on which entity

### 6.5 Meal Billing Configuration (G77)
- Add `mealBillingType` (INCLUDED | PER_MEAL | SUBSCRIPTION) to property config
- If PER_MEAL, add mealPrice fields. Auto-add meal charges to monthly invoice

### 6.6 Meal Wastage Report (G79)
- Add `estimatedCost` field to Meal
- Report: (actualCount - expectedCount) * costPerMeal across date ranges

### 6.7 Staff Salary Management (G91)
- New model: `StaffSalary` (userId, propertyId, monthlySalary, payDay, bankDetails)
- Auto-generate salary expense records monthly

### 6.8 Activity Feed (G96)
- New API: `GET /api/activity-feed` querying AuditLog + Notifications
- Dashboard timeline component showing recent actions

---

## Phase 7: Platform & Compliance (NEW)

### 7.1 Legal Pages
- `src/app/(public)/terms/page.tsx` — Terms of Service
- `src/app/(public)/privacy/page.tsx` — Privacy Policy
- `src/app/(public)/refund/page.tsx` — Refund Policy

### 7.2 Super Admin Panel (Platform operator)
- `src/app/(dashboard)/superadmin/` — platform-level dashboard
- Total properties, users, revenue across all tenants
- Manage subscription plans
- Support ticket management
- Feature flag management

### 7.3 Compliance Features
- Police verification form generation (Form C)
- Data export API for GDPR compliance
- Account deletion flow

### 7.4 Internationalization
- Install `next-intl`
- Create message files for: English, Hindi, Telugu, Kannada
- Language switcher in header
- All UI strings externalized

### 7.5 Webhook System (G92)
- New model: `WebhookEndpoint` (organizationId, url, events[], secret, isActive)
- Service: `src/lib/webhooks.ts` — emit events to registered endpoints with HMAC signature
- Events: booking.created, payment.received, complaint.created, etc.

### 7.6 API Key Management (G93)
- New model: `ApiKey` (organizationId, keyHash, prefix, permissions[], lastUsedAt, expiresAt)
- New auth pathway in middleware accepting `X-API-Key` header alongside JWT
- Enterprise tier only

### 7.7 White-Label Configuration (G94)
- New model: `WhiteLabelConfig` (organizationId, customDomain, logoUrl, primaryColor, faviconUrl)
- Middleware reads config on custom domain requests

### 7.8 SSO Integration (G95)
- SAML/OIDC provider configuration per organization
- `next-auth` providers for corporate login

---

## Phase 8: UX Polish (expanded from Phase 4)

### 8.1 Toast Notifications (moved to Phase 0.5)
### 8.2 Confirmation Dialog (same)
### 8.3 Property Onboarding Wizard (expanded)
- 7 steps: Basic Info → Location (map) → Amenities & Rules → Photos → Room Setup → Pricing & Deposit Rules → Review & Publish

### 8.4 Landing Page Enhancement
- Pricing section with tier cards
- Testimonials/social proof section
- FAQ section
- Public browse CTA
- Footer with legal links

### 8.5 Error Boundaries
- `src/components/error-boundary.tsx` — catches React errors
- Per-page error.tsx files for graceful degradation

### 8.6 Empty States & Onboarding Hints
- First-time user gets contextual hints on each page
- Empty state illustrations with action CTAs

### 8.7 Visitor Blacklist (G80)
- New model: `BlacklistedVisitor` (propertyId, phone, reason, blacklistedBy)
- Check on visitor creation

### 8.8 Poll/Survey System (G86)
- New models: `Poll` (propertyId, question, options[], expiresAt) + `PollVote`
- Simple CRUD + voting

### 8.9 Document Sharing (G87)
- New model: `SharedDocument` (propertyId, title, fileUrl, category)
- Admin uploads house rules, templates; guests download

---

## Phase 9: Predictive Analytics (Post-Launch)

### 9.1 Demand Forecasting (G88)
- Historical occupancy data + seasonality → vacancy prediction on owner dashboard

### 9.2 Guest Lifetime Value (G89)
- Total revenue per guest across all bookings. Sort by LTV on owner dashboard.

### 9.3 Churn Prediction (G90)
- Flag guests likely to leave based on: complaint frequency, review sentiment, late payments

### 9.4 Vendor Management (G76)
- New models: `Vendor` (name, phone, specialization, rating) + `VendorInvoice`

### 9.5 Group/Corporate Bookings (G73)
- New model: `GroupBooking` (corporateId, roomIds[], singleInvoice, contactPerson)

---

# PART D: IMPLEMENTATION PRIORITY & ORDER

```
Sprint 1 (Week 1-2): Foundation + Security [CRITICAL PATH]
  Phase 0: Validation, File Upload, PDF, Toast, Notification service,
           Structured logging (0.6), Health check (0.7), Perf middleware (0.8)
  Phase 1: Authorization utility + Secure all 34 routes,
           Data isolation enforcement (1.5), Optimistic locking (1.4),
           Rate limiting (1.3)

Sprint 2 (Week 3-4): Multi-Tenancy + Core Business Rules
  Phase 2: Organization, Subscription, Feature Gates,
           PropertyBillingConfig (2.4), CancellationPolicy (2.4),
           Enum expansions for state machines (2.5),
           Pricing engine (2.3)

Sprint 3 (Week 5-6): Public Discovery + Guest Lifecycle
  Phase 3: Public routes, Map, SEO, Comparison,
           Availability calendar API (3.9)
  Phase 4: KYC, Check-in (state machine enforcement 4.9),
           Payments (Razorpay + prorated rent 4.6),
           No-show detection (4.7), Cancellation flow (4.8),
           Check-out, Meal enhancements

Sprint 4 (Week 7-8): Admin Operations + Owner Features
  Phase 5: Auto invoicing, Reminder automation, SLA engine,
           Complaint auto-assign (5.6), Recurring issues (5.7),
           Room turnover (5.8), Emergency alerts (5.9),
           Deposit refund workflow (5.10), Bulk comms
  Phase 6: Financial reports, Pricing UI, Occupancy analytics,
           Meal billing (6.5), Wastage report (6.6),
           Staff salary (6.7), Activity feed (6.8), Audit log

Sprint 5 (Week 9-10): Platform + Enterprise + Polish
  Phase 7: Legal pages, Super admin, Compliance, i18n,
           Webhooks (7.5), API keys (7.6), White-label (7.7), SSO (7.8)
  Phase 8: Onboarding wizard, Landing page, Error boundaries,
           Visitor blacklist (8.7), Polls (8.8), Doc sharing (8.9)

Sprint 6 (Week 11-12): Hardening + Beta Launch
  Monitoring & alerting setup (Sentry + Grafana)
  Load testing execution (k6 scripts)
  Backup/DR verification
  E2E testing of all state machine transitions
  Performance budget verification
  Security penetration testing
  Beta launch with 5-10 PGs

Post-Launch: Phase 9 — Predictive analytics, vendor management, corporate bookings
```

---

# PART E: VERIFICATION CHECKLIST

### Security
- [ ] Unauthenticated request to `/api/bookings` → 401
- [ ] Guest A cannot see Guest B's bookings → 403 or empty
- [ ] Owner A cannot see Owner B's properties → filtered
- [ ] Staff cannot access another property's tasks → 403
- [ ] Admin cannot modify properties they're not assigned to → 403

### Multi-tenancy
- [ ] Create 2 owners → each has separate organizations
- [ ] Owner A's property list shows only their properties
- [ ] Admin assigned to Property X cannot manage Property Y
- [ ] Guest booked in Property X cannot see Property Y's complaints

### Public Discovery
- [ ] `/explore` works without login → shows property listings
- [ ] Map view shows pins at correct lat/lng locations
- [ ] Filters (city, gender, budget) work correctly
- [ ] Property detail page has OpenGraph meta tags

### Payments
- [ ] Razorpay order created → payment page opens → callback updates status
- [ ] Receipt PDF downloadable after successful payment
- [ ] Late fee auto-applied after grace period

### Notifications
- [ ] New complaint → admin gets in-app notification
- [ ] Rent due → guest gets email/SMS reminder
- [ ] Booking approved → guest gets confirmation

### Documents
- [ ] Invoice PDF generates with correct amounts and GST
- [ ] Stay certificate generates with correct dates
- [ ] KYC documents uploadable and viewable by admin

### Data Isolation (from PART G matrix)
- [ ] Owner A's API call to `/api/bookings` returns ZERO bookings from Owner B's properties
- [ ] Admin assigned to Property X cannot query payments from Property Y
- [ ] Guest A calling `GET /api/bookings/[Guest-B-id]` returns 403
- [ ] Staff member only sees tasks assigned to self
- [ ] Passing arbitrary `propertyId` to scoped endpoint returns 403 if no access

### State Machines (from PART F)
- [ ] Cannot transition booking from PENDING directly to CHECKED_IN
- [ ] Cannot transition booking backward from CHECKED_OUT to CHECKED_IN
- [ ] Payment cannot go from PAID to PENDING
- [ ] Complaint cannot go from CLOSED to IN_PROGRESS (must REOPEN first)
- [ ] Booking auto-transitions to NO_SHOW after 48h past check-in date

### Business Rules (from PART H)
- [ ] Mid-month check-in generates prorated first-month invoice
- [ ] Late fee accrues only after grace period expires
- [ ] Cancellation 7+ days before check-in refunds 100%
- [ ] Guest cannot create second booking while first is active
- [ ] Deposit refund processed within 15 days of checkout
- [ ] Optimistic locking rejects stale updates with 409

### Enterprise Features
- [ ] API key authentication works alongside JWT
- [ ] Webhook delivers event within 30 seconds of trigger
- [ ] Rate limiting returns 429 with `Retry-After` header
- [ ] Health check endpoint returns 200 with DB connectivity status

### Performance (from PART I)
- [ ] API p95 response time < 300ms under 50 concurrent users
- [ ] Property listing page LCP < 2.0s
- [ ] No N+1 queries (verify with Prisma query logging)
- [ ] Bundle size per route < 250KB gzipped

### Build
- [ ] `npx next build` passes with zero errors
- [ ] All API routes return proper error codes (400, 401, 403, 404)
- [ ] No console errors on any page

---

# PART K: CRITICAL FILES FOR IMPLEMENTATION

These files are the highest-impact touch points where most changes will occur:

| File | Why Critical |
|------|-------------|
| `prisma/schema.prisma` | All 12 new models, 4 enum changes, 6 model modifications start here |
| `src/middleware.ts` | Must support API versioning, API key auth, rate limiting, white-label routing, perf timing, data scope injection |
| `src/lib/data-scope.ts` (new) | Core data isolation — every route depends on this |
| `src/lib/authorization.ts` (new) | RBAC + permission checks — every route depends on this |
| `src/lib/validations.ts` (new) | Zod schemas — every POST/PUT depends on this |
| `src/lib/pricing.ts` (new) | Prorated rent, late fees, seasonal pricing, discounts |
| `src/lib/notifications.ts` (new) | Multi-channel notification service (in-app, email, SMS, WhatsApp) |
| `src/lib/pdf-generator.ts` (new) | Invoice, receipt, certificate, agreement templates |
| `src/lib/logger.ts` (new) | Structured logging with correlation IDs |
| `src/app/api/bookings/[id]/route.ts` | Most critical route — state machine enforcement, zero auth currently |
| `src/app/api/payments/route.ts` | Payment lifecycle state machine, zero auth currently |
| `src/hooks/use-api.ts` | Add toast integration, optimistic locking support |

---

# PLAN STATS

| Category | Count |
|----------|-------|
| Feature gaps identified | G1-G99 (99 total) |
| Technical gaps identified | T1-T20 (20 total) |
| Implementation phases | 0-9 (10 phases) |
| New Prisma models | 12 |
| Modified Prisma enums | 4 |
| Modified Prisma models | 6 |
| Business rules codified | H.1-H.6 (6 rules) |
| State machine diagrams | 3 (Booking, Payment, Complaint) |
| API access matrix entries | 17 route groups × 6 roles |
| Sprint timeline | 6 sprints (12 weeks) + post-launch |
| Verification checklist items | 35+ |
