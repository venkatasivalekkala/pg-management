import { useState } from "react";

const sections = [
  {
    id: "overview",
    title: "Overview",
    icon: "🏠",
  },
  {
    id: "users",
    title: "User Roles",
    icon: "👥",
  },
  {
    id: "modules",
    title: "Feature Modules",
    icon: "📦",
  },
  {
    id: "guest",
    title: "Guest Features",
    icon: "🧑",
  },
  {
    id: "admin",
    title: "Admin Features",
    icon: "⚙️",
  },
  {
    id: "owner",
    title: "Owner Features",
    icon: "👑",
  },
  {
    id: "architecture",
    title: "Tech Architecture",
    icon: "🏗️",
  },
  {
    id: "database",
    title: "Database Design",
    icon: "🗄️",
  },
  {
    id: "screens",
    title: "Screen Flows",
    icon: "📱",
  },
  {
    id: "api",
    title: "API Endpoints",
    icon: "🔌",
  },
  {
    id: "timeline",
    title: "Dev Timeline",
    icon: "📅",
  },
];

const OverviewSection = () => (
  <div>
    <h2 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", margin: "0 0 8px" }}>
      PG & Hostel Management Platform
    </h2>
    <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7, margin: "0 0 24px" }}>
      A complete SaaS platform for PG/Hostel owners, administrators, and guests — covering
      property listing, room booking, rent collection, complaint management, meal tracking,
      visitor logs, and more. Targeting Bangalore, Hyderabad, and expandable to all Indian cities.
    </p>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
      {[
        { label: "Target Users", value: "PG Owners, Admins, Guests", color: "#6366f1" },
        { label: "Platforms", value: "Web + Android + iOS", color: "#0ea5e9" },
        { label: "Revenue Model", value: "SaaS Subscription", color: "#10b981" },
        { label: "MVP Timeline", value: "12–16 Weeks", color: "#f59e0b" },
      ].map((item) => (
        <div
          key={item.label}
          style={{
            background: `linear-gradient(135deg, ${item.color}11, ${item.color}08)`,
            border: `1px solid ${item.color}30`,
            borderRadius: 12,
            padding: "16px 20px",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: item.color, textTransform: "uppercase", letterSpacing: 1 }}>
            {item.label}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginTop: 6 }}>{item.value}</div>
        </div>
      ))}
    </div>

    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: "0 0 12px" }}>Core Problem Statement</h3>
    <div style={{ background: "#fef3c7", border: "1px solid #fbbf2440", borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: "#92400e" }}>
        Most PGs in India still manage operations manually — rent collection via cash/UPI with no tracking,
        complaints via WhatsApp, room allocation on paper registers, no digital record of visitors or meals.
        This leads to disputes, revenue leakage, poor tenant experience, and zero scalability for owners
        managing multiple properties.
      </p>
    </div>

    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: "0 0 12px" }}>Business Goals</h3>
    <div style={{ display: "grid", gap: 10 }}>
      {[
        "Digitize all PG operations — booking, payments, complaints, meals, visitors",
        "Provide real-time dashboards for owners across multiple properties",
        "Enable online discovery and booking for guests",
        "Reduce disputes with transparent billing and digital receipts",
        "Create a scalable multi-tenant SaaS platform",
        "Support regional languages (Hindi, Telugu, Kannada) for wider adoption",
      ].map((goal, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color: "#10b981", fontWeight: 700, fontSize: 16, marginTop: 1 }}>✓</span>
          <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{goal}</span>
        </div>
      ))}
    </div>
  </div>
);

const UsersSection = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: "0 0 20px" }}>User Roles & Permissions</h2>
    {[
      {
        role: "Super Admin / Owner",
        color: "#6366f1",
        emoji: "👑",
        desc: "PG/Hostel owner who may manage 1 or multiple properties",
        permissions: [
          "Add/manage multiple properties",
          "Assign admins/managers per property",
          "View consolidated revenue reports",
          "Set pricing, rules, and policies",
          "Approve/reject bookings",
          "Access all financial data",
          "Configure payment gateways",
          "View analytics across all properties",
        ],
      },
      {
        role: "Property Admin / Manager",
        color: "#0ea5e9",
        emoji: "⚙️",
        desc: "On-ground manager handling day-to-day operations of a specific property",
        permissions: [
          "Manage room allocation & availability",
          "Handle check-in / check-out",
          "Track rent payments & send reminders",
          "Manage complaints & maintenance",
          "Update meal menus & track food",
          "Log visitor entries",
          "Generate property-level reports",
          "Communicate with guests via in-app chat",
        ],
      },
      {
        role: "Guest / Tenant",
        color: "#10b981",
        emoji: "🧑",
        desc: "Current or prospective resident of the PG/Hostel",
        permissions: [
          "Search & discover PGs",
          "Book rooms online",
          "Pay rent & view payment history",
          "Raise complaints & track status",
          "View meal menu & mark preferences",
          "Request room change / notice period",
          "Register visitors",
          "Rate & review PG after stay",
        ],
      },
      {
        role: "Staff",
        color: "#f59e0b",
        emoji: "🧹",
        desc: "Housekeeping, security, cook — limited app access",
        permissions: [
          "View assigned tasks (cleaning schedule)",
          "Mark tasks as completed",
          "Log visitor entries (security)",
          "Update meal preparation status (cook)",
        ],
      },
    ].map((u) => (
      <div
        key={u.role}
        style={{
          border: `1px solid ${u.color}25`,
          borderRadius: 14,
          padding: 20,
          marginBottom: 16,
          background: `linear-gradient(135deg, ${u.color}06, transparent)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 24 }}>{u.emoji}</span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: u.color }}>{u.role}</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{u.desc}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {u.permissions.map((p, i) => (
            <div key={i} style={{ fontSize: 13, color: "#475569", display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ color: u.color, fontSize: 10, marginTop: 4 }}>●</span>
              {p}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const ModulesSection = () => {
  const [expandedModule, setExpandedModule] = useState(null);
  const modules = [
    {
      name: "Property Management",
      icon: "🏢",
      color: "#6366f1",
      useCases: [
        "Add property with photos, amenities, location, rules",
        "Define room types (Single, Double, Triple, Dormitory)",
        "Set pricing per room type (monthly, daily)",
        "Define sharing configurations (2-share, 3-share, etc.)",
        "Manage floors, wings, and bed numbers",
        "Set property rules (curfew time, visitor policy, food policy)",
        "Upload virtual tour / 360° photos",
        "Mark amenities (WiFi, AC, Gym, Laundry, Parking, CCTV)",
        "Set location on map with nearby landmarks",
        "Define security deposit and advance payment rules",
      ],
    },
    {
      name: "Booking & Reservation",
      icon: "📋",
      color: "#0ea5e9",
      useCases: [
        "Online room booking with date selection",
        "Real-time room availability calendar",
        "Instant booking vs. approval-based booking",
        "Booking confirmation via SMS/Email/WhatsApp",
        "Waitlist management when rooms are full",
        "Booking cancellation & refund policy",
        "Pre-booking site visit scheduling",
        "Trial stay option (1-3 days before commitment)",
        "Group booking for corporates",
        "Seasonal pricing & discount codes",
      ],
    },
    {
      name: "Rent & Payment",
      icon: "💰",
      color: "#10b981",
      useCases: [
        "Monthly rent generation with due dates",
        "Online payment via UPI, Cards, Net Banking, Wallets",
        "Auto payment reminders (SMS, Push, WhatsApp)",
        "Late fee calculation & penalty rules",
        "Partial payment tracking",
        "Security deposit management & refund",
        "Electricity/water bill splitting",
        "Digital receipts & invoice generation",
        "Payment history & downloadable statements",
        "Owner payout & commission management",
      ],
    },
    {
      name: "Complaint & Maintenance",
      icon: "🔧",
      color: "#ef4444",
      useCases: [
        "Raise complaint with category (Plumbing, Electrical, Cleaning, Pest, Noise)",
        "Attach photos/videos to complaints",
        "Priority levels (Low, Medium, High, Urgent)",
        "Auto-assign to relevant staff",
        "Track complaint status (Open → In Progress → Resolved → Closed)",
        "SLA tracking — escalation if not resolved in time",
        "Guest satisfaction rating after resolution",
        "Recurring issue detection & alerts",
        "Maintenance schedule for preventive work",
        "Vendor/contractor management for repairs",
      ],
    },
    {
      name: "Meal Management",
      icon: "🍽️",
      color: "#f59e0b",
      useCases: [
        "Weekly meal menu display (Breakfast, Lunch, Dinner)",
        "Guest meal opt-in / opt-out per day",
        "Special diet preferences (Veg, Non-Veg, Jain, Vegan)",
        "Guest count tracking for cook",
        "Meal feedback & rating",
        "Extra meal / guest meal charges",
        "Monthly meal subscription vs. per-meal pricing",
        "Food quality complaint logging",
        "Festival/special menu announcements",
        "Meal wastage tracking for owners",
      ],
    },
    {
      name: "Visitor Management",
      icon: "🚪",
      color: "#8b5cf6",
      useCases: [
        "Guest pre-registers expected visitors",
        "Security logs visitor entry with photo/ID",
        "Visitor time limit enforcement",
        "Night visitor restrictions & approvals",
        "Delivery person entry logging",
        "Visitor history per guest",
        "Emergency contact registration",
        "Blacklisted visitor alerts",
        "OTP-based visitor verification",
        "Visitor parking allocation",
      ],
    },
    {
      name: "Check-in / Check-out",
      icon: "🔑",
      color: "#ec4899",
      useCases: [
        "Digital check-in with ID verification (Aadhaar, PAN)",
        "Agreement signing (digital / e-sign)",
        "Room key / access card assignment",
        "Room condition documentation (photos at check-in)",
        "Notice period management (30/60 day)",
        "Check-out inspection & damage assessment",
        "Security deposit deduction & refund processing",
        "Feedback collection at check-out",
        "Room turnover scheduling for housekeeping",
        "Forwarding address collection",
      ],
    },
    {
      name: "Communication",
      icon: "💬",
      color: "#14b8a6",
      useCases: [
        "In-app chat (Guest ↔ Admin)",
        "Broadcast announcements (water cut, maintenance, events)",
        "Push notifications for important updates",
        "WhatsApp integration for reminders",
        "Notice board (digital)",
        "Emergency alerts",
        "Community forum for guests",
        "Poll/survey creation (e.g., preferred meal timings)",
        "Document sharing (house rules, agreements)",
        "Multi-language notification support",
      ],
    },
    {
      name: "Reports & Analytics",
      icon: "📊",
      color: "#0891b2",
      useCases: [
        "Occupancy rate trends",
        "Revenue reports (monthly, quarterly, yearly)",
        "Payment collection rate & defaulter list",
        "Complaint resolution metrics",
        "Guest retention & churn analysis",
        "Room-wise profitability",
        "Expense tracking (maintenance, utilities, staff salary)",
        "Comparative reports across properties",
        "Guest demographics & source tracking",
        "Exportable reports (PDF, Excel)",
      ],
    },
    {
      name: "Discovery & Listing",
      icon: "🔍",
      color: "#64748b",
      useCases: [
        "Public listing page for each PG",
        "Search by city, area, budget, amenities",
        "Filter by gender (Male, Female, Co-ed)",
        "Sort by price, rating, distance",
        "Map-based search with radius filter",
        "Photo gallery & virtual tours",
        "Guest reviews & ratings display",
        "Compare multiple PGs side-by-side",
        "Share listing via WhatsApp/social media",
        "SEO-optimized listing pages",
      ],
    },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: "0 0 6px" }}>Feature Modules</h2>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>Click any module to expand all use cases</p>
      <div style={{ display: "grid", gap: 12 }}>
        {modules.map((m, idx) => (
          <div
            key={m.name}
            style={{
              border: `1px solid ${expandedModule === idx ? m.color + "40" : "#e2e8f0"}`,
              borderRadius: 12,
              overflow: "hidden",
              background: expandedModule === idx ? `${m.color}06` : "#fff",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
          >
            <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{m.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: m.color }}>{m.name}</span>
                <span style={{
                  background: m.color + "18",
                  color: m.color,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 20,
                }}>{m.useCases.length} use cases</span>
              </div>
              <span style={{ color: "#94a3b8", fontSize: 18, transform: expandedModule === idx ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
            </div>
            {expandedModule === idx && (
              <div style={{ padding: "0 18px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {m.useCases.map((uc, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#475569", display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.5 }}>
                    <span style={{ color: m.color, fontSize: 14, marginTop: 1 }}>{i + 1}.</span>
                    {uc}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const GuestSection = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#10b981", margin: "0 0 20px" }}>Guest App — Complete User Journey</h2>
    {[
      {
        phase: "1. Discovery & Search",
        steps: [
          "Open app → See nearby PGs based on location",
          "Search by area name (e.g., 'Koramangala', 'Madhapur')",
          "Apply filters: Budget ₹5K-₹15K, Male/Female, AC/Non-AC, Food included",
          "View PG cards with photos, price, rating, distance",
          "Tap to view detailed listing — photos, amenities, rules, reviews",
          "Compare 2-3 PGs side by side",
          "Save favorites / shortlist",
        ],
      },
      {
        phase: "2. Booking Flow",
        steps: [
          "Select room type and sharing preference",
          "Choose move-in date",
          "View total cost breakdown (rent + deposit + first month)",
          "Schedule a site visit before booking (optional)",
          "Book trial stay (1-3 days) before committing",
          "Fill KYC — Aadhaar, PAN, emergency contact, company/college details",
          "Upload ID documents",
          "Pay booking amount / advance online",
          "Receive booking confirmation + digital agreement",
        ],
      },
      {
        phase: "3. Living — Monthly Lifecycle",
        steps: [
          "Dashboard: Room details, upcoming rent due, announcements",
          "Pay monthly rent with one tap (saved UPI/card)",
          "View and download rent receipts",
          "See meal menu for the week, opt-out for specific days",
          "Raise complaints with photos — track resolution status",
          "Pre-register visitors with expected time",
          "View notice board for water cuts, events, maintenance schedules",
          "Chat with admin for any queries",
          "Request room change or bed swap",
        ],
      },
      {
        phase: "4. Check-out",
        steps: [
          "Submit notice period request (30/60 days)",
          "View pending dues and deposit refund estimate",
          "Schedule room inspection",
          "Complete check-out formalities",
          "Receive security deposit refund (minus deductions)",
          "Provide rating and detailed review",
          "Download stay certificate (for address proof)",
        ],
      },
    ].map((phase) => (
      <div key={phase.phase} style={{ marginBottom: 20, border: "1px solid #10b98125", borderRadius: 12, padding: 18, background: "#f0fdf4" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#059669", margin: "0 0 12px" }}>{phase.phase}</h3>
        <div style={{ display: "grid", gap: 8 }}>
          {phase.steps.map((s, i) => (
            <div key={i} style={{ fontSize: 13, color: "#334155", display: "flex", gap: 8, lineHeight: 1.6 }}>
              <span style={{ background: "#10b981", color: "#fff", borderRadius: 20, minWidth: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
              {s}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const AdminSection = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0ea5e9", margin: "0 0 20px" }}>Admin Dashboard — Features Deep Dive</h2>
    {[
      {
        title: "Dashboard Home",
        color: "#0ea5e9",
        items: [
          "Total rooms: Occupied / Vacant / Under Maintenance",
          "Today's collections vs. pending payments",
          "Open complaints count with priority breakdown",
          "New booking requests awaiting approval",
          "Today's check-ins and check-outs",
          "Meal count for today (Breakfast / Lunch / Dinner)",
          "Quick actions: Add guest, collect payment, raise issue",
        ],
      },
      {
        title: "Room Management Grid",
        color: "#6366f1",
        items: [
          "Visual floor plan — color coded (Green=Vacant, Red=Occupied, Yellow=Notice, Grey=Maintenance)",
          "Click room → See occupant details, payment status, complaints",
          "Drag & drop room allocation",
          "Bed-level management for shared rooms",
          "Room cleaning schedule & status",
          "Room inventory tracking (furniture, fixtures)",
        ],
      },
      {
        title: "Financial Management",
        color: "#10b981",
        items: [
          "Monthly rent roll — who paid, who didn't, partial payments",
          "Auto-generate invoices on 1st of every month",
          "Payment reminder automation (Day 1, Day 5, Day 10, Final notice)",
          "Expense logging (maintenance, groceries, staff salary, utilities)",
          "P&L report per property",
          "GST invoice generation (if applicable)",
          "Bank reconciliation",
          "Defaulter management with escalation workflows",
        ],
      },
      {
        title: "Guest Management",
        color: "#f59e0b",
        items: [
          "Guest directory with search & filters",
          "Guest profile: personal details, room, payment history, complaints",
          "KYC verification status tracking",
          "Police verification compliance (Form C for foreigners)",
          "Notice period tracker",
          "Guest blacklist management",
          "Bulk communication (SMS, email, push)",
          "Guest feedback analysis",
        ],
      },
      {
        title: "Staff Management",
        color: "#8b5cf6",
        items: [
          "Staff directory (housekeeping, security, cook, maintenance)",
          "Shift scheduling",
          "Task assignment & tracking",
          "Attendance tracking",
          "Performance rating based on complaint resolution",
          "Salary management",
        ],
      },
    ].map((section) => (
      <div key={section.title} style={{ marginBottom: 16, border: `1px solid ${section.color}20`, borderRadius: 12, padding: 18 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: section.color, margin: "0 0 12px" }}>{section.title}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {section.items.map((item, i) => (
            <div key={i} style={{ fontSize: 13, color: "#475569", display: "flex", gap: 6, alignItems: "flex-start", lineHeight: 1.5 }}>
              <span style={{ color: section.color, fontSize: 10, marginTop: 5 }}>●</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const OwnerSection = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#6366f1", margin: "0 0 20px" }}>Owner / Super Admin Portal</h2>
    <div style={{ background: "#eef2ff", borderRadius: 12, padding: 18, marginBottom: 20, border: "1px solid #6366f130" }}>
      <p style={{ margin: 0, fontSize: 14, color: "#4338ca", lineHeight: 1.7 }}>
        The Owner portal provides a bird's-eye view across all properties. Owners may manage
        1 PG or 50 — the dashboard scales accordingly with consolidated analytics and
        drill-down capability per property.
      </p>
    </div>
    {[
      {
        title: "Multi-Property Dashboard",
        items: [
          "Portfolio overview — total rooms, total revenue, total guests across all properties",
          "Property-wise occupancy heatmap",
          "Revenue comparison across properties",
          "Underperforming property alerts",
          "Add new property with guided setup wizard",
        ],
      },
      {
        title: "Financial Controls",
        items: [
          "Set rent pricing per property/room type",
          "Define late fee rules and grace periods",
          "Configure security deposit policies",
          "Payment gateway integration (Razorpay, PhonePe, Paytm)",
          "Owner payout scheduling and tracking",
          "Tax report generation (GST, TDS, ITR support)",
        ],
      },
      {
        title: "Team Management",
        items: [
          "Assign admins/managers per property",
          "Define role-based access permissions",
          "Track admin performance metrics",
          "Audit log — who did what and when",
        ],
      },
      {
        title: "Business Intelligence",
        items: [
          "Guest acquisition source tracking (which listing site, organic, referral)",
          "Demand forecasting — predict vacancy periods",
          "Pricing optimization suggestions based on area rates",
          "Competitor benchmarking",
          "Guest lifetime value analysis",
          "Churn prediction — guests likely to leave",
        ],
      },
    ].map((s) => (
      <div key={s.title} style={{ marginBottom: 16, border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: "0 0 10px" }}>{s.title}</h3>
        <div style={{ display: "grid", gap: 6 }}>
          {s.items.map((item, i) => (
            <div key={i} style={{ fontSize: 13, color: "#475569", display: "flex", gap: 8, lineHeight: 1.6 }}>
              <span style={{ color: "#6366f1" }}>→</span> {item}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const ArchitectureSection = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: "0 0 20px" }}>Technical Architecture</h2>

    <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 12px" }}>Recommended Tech Stack</h3>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
      {[
        { layer: "Mobile App", tech: "React Native / Flutter", why: "Single codebase for Android + iOS" },
        { layer: "Web Frontend", tech: "React.js + Next.js", why: "SSR for SEO on listing pages, SPA for dashboards" },
        { layer: "Backend API", tech: "Node.js + Express / NestJS", why: "Fast, scalable, great ecosystem" },
        { layer: "Database", tech: "PostgreSQL + Redis", why: "Relational data + caching/sessions" },
        { layer: "File Storage", tech: "AWS S3 / Cloudinary", why: "Photos, documents, invoices" },
        { layer: "Auth", tech: "Firebase Auth / Auth0", why: "OTP login, social login, JWT" },
        { layer: "Payments", tech: "Razorpay / Cashfree", why: "UPI, cards, auto-debit support in India" },
        { layer: "Notifications", tech: "Firebase FCM + MSG91", why: "Push + SMS + WhatsApp" },
        { layer: "Maps", tech: "Google Maps API", why: "Location search, distance calculation" },
        { layer: "Hosting", tech: "AWS / GCP", why: "Auto-scaling, reliable, India regions available" },
        { layer: "CI/CD", tech: "GitHub Actions + Docker", why: "Automated testing and deployment" },
        { layer: "Monitoring", tech: "Sentry + Grafana", why: "Error tracking + performance monitoring" },
      ].map((s) => (
        <div key={s.layer} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.layer}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", margin: "4px 0 2px" }}>{s.tech}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{s.why}</div>
        </div>
      ))}
    </div>

    <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 12px" }}>System Architecture</h3>
    <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "monospace", lineHeight: 2.2, color: "#334155", overflowX: "auto" }}>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`┌─────────────────────────────────────────────────┐
│              CLIENT LAYER                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Mobile   │  │ Web App  │  │ Admin Panel   │  │
│  │ (Flutter)│  │ (Next.js)│  │ (React SPA)   │  │
│  └────┬─────┘  └────┬─────┘  └──────┬────────┘  │
└───────┼──────────────┼───────────────┼───────────┘
        │              │               │
        ▼              ▼               ▼
┌─────────────────────────────────────────────────┐
│           API GATEWAY (Kong / Nginx)             │
│        Rate Limiting · Auth · Load Balancing     │
└──────────────────────┬──────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌────────────────┐
│ Auth Service │ │ Core API │ │ Payment Service│
│ (JWT + OTP)  │ │ (NestJS) │ │ (Razorpay)     │
└──────────────┘ └────┬─────┘ └────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌──────────────┐ ┌─────────┐ ┌──────────────┐
│ PostgreSQL   │ │  Redis  │ │ S3 / CDN     │
│ (Primary DB) │ │ (Cache) │ │ (Files)      │
└──────────────┘ └─────────┘ └──────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Notification Service             │
│ FCM · SMS · WhatsApp · Email     │
└──────────────────────────────────┘`}
      </pre>
    </div>

    <h3 style={{ fontSize: 17, fontWeight: 700, margin: "24px 0 12px" }}>Key Non-Functional Requirements</h3>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {[
        { req: "Multi-tenancy", detail: "Each PG owner's data is isolated. Shared infrastructure, separate data." },
        { req: "Scalability", detail: "Handle 10K+ concurrent users. Horizontal scaling with containerization." },
        { req: "Security", detail: "End-to-end encryption, PCI-DSS for payments, GDPR-like data privacy." },
        { req: "Offline Support", detail: "Mobile app works offline for viewing data. Syncs when online." },
        { req: "Localization", detail: "Support Hindi, Telugu, Kannada, Tamil UI. RTL not needed." },
        { req: "Performance", detail: "Page load < 2s, API response < 300ms, 99.9% uptime SLA." },
      ].map((r) => (
        <div key={r.req} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{r.req}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.6 }}>{r.detail}</div>
        </div>
      ))}
    </div>
  </div>
);

const DatabaseSection = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: "0 0 20px" }}>Database Schema — Core Tables</h2>
    {[
      {
        table: "users",
        color: "#6366f1",
        fields: ["id (UUID, PK)", "name, email, phone", "role (ENUM: owner, admin, guest, staff)", "avatar_url", "language_preference", "is_verified, is_active", "created_at, updated_at"],
      },
      {
        table: "properties",
        color: "#0ea5e9",
        fields: ["id (UUID, PK)", "owner_id (FK → users)", "name, description", "address, city, state, pincode", "latitude, longitude", "gender_type (ENUM: male, female, coed)", "amenities (JSONB)", "rules (JSONB)", "photos (JSONB array)", "is_listed, is_active", "avg_rating"],
      },
      {
        table: "rooms",
        color: "#10b981",
        fields: ["id (UUID, PK)", "property_id (FK → properties)", "room_number, floor", "room_type (ENUM: single, double, triple, dorm)", "sharing_type (INT: 1,2,3,4)", "monthly_rent, daily_rent", "status (ENUM: vacant, occupied, maintenance)", "total_beds, occupied_beds", "amenities (JSONB)"],
      },
      {
        table: "bookings",
        color: "#f59e0b",
        fields: ["id (UUID, PK)", "guest_id (FK → users)", "room_id (FK → rooms)", "bed_number", "check_in_date, check_out_date", "status (ENUM: pending, confirmed, cancelled, completed)", "booking_amount, security_deposit", "rent_amount", "payment_status", "agreement_url", "notice_period_end"],
      },
      {
        table: "payments",
        color: "#ef4444",
        fields: ["id (UUID, PK)", "booking_id (FK → bookings)", "amount, currency", "type (ENUM: rent, deposit, advance, penalty, refund)", "method (ENUM: upi, card, netbanking, cash, wallet)", "status (ENUM: pending, success, failed, refunded)", "gateway_txn_id", "invoice_url", "due_date, paid_at"],
      },
      {
        table: "complaints",
        color: "#8b5cf6",
        fields: ["id (UUID, PK)", "guest_id, property_id, room_id", "category (ENUM: plumbing, electrical, cleaning, pest, noise, food, other)", "title, description", "photos (JSONB)", "priority (ENUM: low, medium, high, urgent)", "status (ENUM: open, assigned, in_progress, resolved, closed)", "assigned_to (FK → users)", "resolved_at, satisfaction_rating"],
      },
      {
        table: "meals",
        color: "#14b8a6",
        fields: ["id (UUID, PK)", "property_id (FK)", "date, meal_type (ENUM: breakfast, lunch, dinner)", "menu_items (JSONB)", "guest_opt_ins (JSONB — list of user_ids)", "expected_count, actual_count", "feedback_avg_rating"],
      },
      {
        table: "visitors",
        color: "#64748b",
        fields: ["id (UUID, PK)", "guest_id, property_id", "visitor_name, visitor_phone", "visitor_id_proof", "purpose", "entry_time, exit_time", "approved_by (FK → users)", "status (ENUM: expected, checked_in, checked_out, denied)"],
      },
    ].map((t) => (
      <div key={t.table} style={{ marginBottom: 14, border: `1px solid ${t.color}25`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ background: t.color, color: "#fff", padding: "8px 16px", fontSize: 14, fontWeight: 700, fontFamily: "monospace" }}>
          {t.table}
        </div>
        <div style={{ padding: "10px 16px", display: "grid", gap: 4 }}>
          {t.fields.map((f, i) => (
            <div key={i} style={{ fontSize: 12, color: "#475569", fontFamily: "monospace", lineHeight: 1.6 }}>
              {f}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const ScreenFlowsSection = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: "0 0 20px" }}>Screen Flows — All Apps</h2>

    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#10b981", margin: "0 0 12px" }}>📱 Guest Mobile App Screens</h3>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 24 }}>
      {[
        "Splash / Onboarding",
        "Login (OTP)",
        "Home / Explore",
        "Search + Filters",
        "PG Detail Page",
        "Photo Gallery",
        "Room Selection",
        "Booking Summary",
        "KYC Upload",
        "Payment Gateway",
        "Booking Confirmation",
        "My Room Dashboard",
        "Pay Rent",
        "Payment History",
        "Raise Complaint",
        "My Complaints",
        "Meal Menu",
        "Meal Opt-out",
        "Register Visitor",
        "Announcements",
        "Chat with Admin",
        "Profile / Settings",
        "Notice Period",
        "Check-out Flow",
        "Rate & Review",
      ].map((s) => (
        <div key={s} style={{
          background: "#f0fdf4",
          border: "1px solid #10b98130",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 12,
          fontWeight: 600,
          color: "#059669",
          textAlign: "center",
        }}>
          {s}
        </div>
      ))}
    </div>

    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0ea5e9", margin: "0 0 12px" }}>🖥️ Admin Web Dashboard Screens</h3>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 24 }}>
      {[
        "Login",
        "Dashboard Overview",
        "Room Grid / Floor Plan",
        "Room Details",
        "Guest Directory",
        "Guest Profile",
        "New Booking",
        "Booking Requests",
        "Payment Collection",
        "Invoice Generator",
        "Defaulter List",
        "Complaint Queue",
        "Complaint Detail",
        "Meal Planner",
        "Visitor Log",
        "Announcements",
        "Staff Management",
        "Task Board",
        "Reports Hub",
        "Revenue Report",
        "Occupancy Report",
        "Settings",
        "Property Profile",
        "Bulk SMS / Notify",
      ].map((s) => (
        <div key={s} style={{
          background: "#eff6ff",
          border: "1px solid #0ea5e930",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 12,
          fontWeight: 600,
          color: "#0369a1",
          textAlign: "center",
        }}>
          {s}
        </div>
      ))}
    </div>

    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#6366f1", margin: "0 0 12px" }}>👑 Owner Portal Screens</h3>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
      {[
        "Portfolio Dashboard",
        "Property List",
        "Add New Property",
        "Property Analytics",
        "Revenue Consolidated",
        "Team / Admins",
        "Permissions",
        "Audit Log",
        "Pricing Config",
        "Payout History",
        "Tax Reports",
        "Settings",
      ].map((s) => (
        <div key={s} style={{
          background: "#eef2ff",
          border: "1px solid #6366f130",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 12,
          fontWeight: 600,
          color: "#4338ca",
          textAlign: "center",
        }}>
          {s}
        </div>
      ))}
    </div>
  </div>
);

const APISection = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: "0 0 20px" }}>API Design — Key Endpoints</h2>
    {[
      {
        group: "Auth",
        color: "#ef4444",
        endpoints: [
          "POST /auth/send-otp",
          "POST /auth/verify-otp",
          "POST /auth/register",
          "POST /auth/refresh-token",
          "GET  /auth/me",
        ],
      },
      {
        group: "Properties",
        color: "#6366f1",
        endpoints: [
          "GET    /properties (search, filter, paginate)",
          "GET    /properties/:id",
          "POST   /properties (owner creates)",
          "PUT    /properties/:id",
          "GET    /properties/:id/rooms",
          "GET    /properties/:id/reviews",
          "GET    /properties/nearby?lat=&lng=&radius=",
        ],
      },
      {
        group: "Rooms",
        color: "#0ea5e9",
        endpoints: [
          "GET    /rooms/:id",
          "PUT    /rooms/:id (update status, price)",
          "GET    /rooms/:id/availability",
          "POST   /rooms/:id/allocate",
        ],
      },
      {
        group: "Bookings",
        color: "#10b981",
        endpoints: [
          "POST   /bookings",
          "GET    /bookings/:id",
          "PUT    /bookings/:id/approve",
          "PUT    /bookings/:id/cancel",
          "PUT    /bookings/:id/check-in",
          "PUT    /bookings/:id/check-out",
          "POST   /bookings/:id/notice-period",
        ],
      },
      {
        group: "Payments",
        color: "#f59e0b",
        endpoints: [
          "POST   /payments/initiate",
          "POST   /payments/webhook (gateway callback)",
          "GET    /payments/history?guest_id=&month=",
          "GET    /payments/pending?property_id=",
          "POST   /payments/refund/:id",
          "GET    /payments/invoice/:id",
        ],
      },
      {
        group: "Complaints",
        color: "#8b5cf6",
        endpoints: [
          "POST   /complaints",
          "GET    /complaints?property_id=&status=",
          "PUT    /complaints/:id/assign",
          "PUT    /complaints/:id/resolve",
          "POST   /complaints/:id/feedback",
        ],
      },
      {
        group: "Meals",
        color: "#14b8a6",
        endpoints: [
          "GET    /meals/menu?property_id=&date=",
          "POST   /meals/menu (admin sets menu)",
          "PUT    /meals/opt-out",
          "GET    /meals/count?date=&meal_type=",
        ],
      },
      {
        group: "Visitors",
        color: "#64748b",
        endpoints: [
          "POST   /visitors/register",
          "PUT    /visitors/:id/check-in",
          "PUT    /visitors/:id/check-out",
          "GET    /visitors?property_id=&date=",
        ],
      },
    ].map((g) => (
      <div key={g.group} style={{ marginBottom: 14, border: `1px solid ${g.color}20`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ background: g.color + "15", padding: "8px 16px", fontWeight: 700, fontSize: 14, color: g.color }}>
          {g.group}
        </div>
        <div style={{ padding: "8px 16px" }}>
          {g.endpoints.map((e, i) => (
            <div key={i} style={{ fontFamily: "monospace", fontSize: 12, color: "#334155", padding: "3px 0", borderBottom: i < g.endpoints.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              {e}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const TimelineSection = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: "0 0 20px" }}>Development Timeline — 16 Weeks MVP</h2>
    {[
      {
        phase: "Phase 1: Foundation (Weeks 1-3)",
        color: "#6366f1",
        tasks: [
          "Project setup, CI/CD pipeline, dev environment",
          "Database schema design & migrations",
          "Auth system (OTP login, JWT, role-based access)",
          "Basic API structure with validation",
          "Admin web shell with routing & layout",
          "Mobile app shell with navigation",
        ],
      },
      {
        phase: "Phase 2: Core Features (Weeks 4-7)",
        color: "#0ea5e9",
        tasks: [
          "Property CRUD + photo upload",
          "Room management + floor plan view",
          "Booking flow (guest side + admin approval)",
          "Guest KYC upload & verification",
          "Check-in / Check-out flow",
          "Guest dashboard with room info",
        ],
      },
      {
        phase: "Phase 3: Payments & Operations (Weeks 8-10)",
        color: "#10b981",
        tasks: [
          "Razorpay integration (UPI, cards, auto-debit)",
          "Rent invoice generation",
          "Payment tracking & reminders",
          "Complaint system (raise, track, resolve)",
          "Meal menu management & opt-in/out",
          "Visitor registration & logging",
        ],
      },
      {
        phase: "Phase 4: Communication & Reports (Weeks 11-13)",
        color: "#f59e0b",
        tasks: [
          "In-app chat (guest ↔ admin)",
          "Push notifications (FCM)",
          "SMS & WhatsApp notifications",
          "Announcement / notice board",
          "Reports dashboard (revenue, occupancy, complaints)",
          "PDF invoice & receipt generation",
        ],
      },
      {
        phase: "Phase 5: Polish & Launch (Weeks 14-16)",
        color: "#ef4444",
        tasks: [
          "Owner multi-property portal",
          "PG discovery / search / listing pages (SEO)",
          "Testing — unit, integration, E2E",
          "Performance optimization & security audit",
          "App Store & Play Store submission",
          "Beta launch with 5-10 PGs in Bangalore/Hyderabad",
        ],
      },
    ].map((p) => (
      <div key={p.phase} style={{ marginBottom: 16, borderLeft: `4px solid ${p.color}`, paddingLeft: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: p.color, margin: "0 0 10px" }}>{p.phase}</h3>
        <div style={{ display: "grid", gap: 6 }}>
          {p.tasks.map((t, i) => (
            <div key={i} style={{ fontSize: 13, color: "#475569", display: "flex", gap: 8, lineHeight: 1.5 }}>
              <span style={{ color: p.color }}>□</span> {t}
            </div>
          ))}
        </div>
      </div>
    ))}

    <div style={{ background: "#fef3c7", borderRadius: 12, padding: 18, marginTop: 20, border: "1px solid #fbbf2430" }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#92400e", margin: "0 0 8px" }}>Team Recommendation</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>
        <div>→ 1 Full-stack Lead / Architect</div>
        <div>→ 2 Backend Developers</div>
        <div>→ 1 Mobile Developer (Flutter)</div>
        <div>→ 1 Frontend Developer (React)</div>
        <div>→ 1 UI/UX Designer</div>
        <div>→ 1 QA Engineer</div>
        <div>→ 1 DevOps (part-time)</div>
        <div>→ 1 Product Manager</div>
      </div>
      <p style={{ fontSize: 13, color: "#92400e", marginTop: 12, marginBottom: 0 }}>
        Estimated MVP Budget: ₹18–30 Lakhs (with Indian team) or ₹8–15 Lakhs (lean startup with 3-4 devs)
      </p>
    </div>
  </div>
);

const sectionComponents = {
  overview: OverviewSection,
  users: UsersSection,
  modules: ModulesSection,
  guest: GuestSection,
  admin: AdminSection,
  owner: OwnerSection,
  architecture: ArchitectureSection,
  database: DatabaseSection,
  screens: ScreenFlowsSection,
  api: APISection,
  timeline: TimelineSection,
};

export default function PGManagementDesign() {
  const [activeSection, setActiveSection] = useState("overview");
  const ActiveComponent = sectionComponents[activeSection];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "28px 24px 20px",
        color: "#fff",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: "#818cf8", textTransform: "uppercase", marginBottom: 6 }}>
          Product Design Document
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
          PG & Hostel Management
        </h1>
        <p style={{ fontSize: 14, color: "#94a3b8", margin: "6px 0 0" }}>
          Complete analysis — 100+ use cases · 10 modules · Full architecture
        </p>
      </div>

      {/* Navigation */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 16px",
        overflowX: "auto",
        position: "sticky",
        top: 0,
        zIndex: 10,
        WebkitOverflowScrolling: "touch",
      }}>
        <div style={{ display: "flex", gap: 0, minWidth: "max-content" }}>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                background: "none",
                border: "none",
                padding: "12px 14px",
                fontSize: 12,
                fontWeight: activeSection === s.id ? 700 : 500,
                color: activeSection === s.id ? "#6366f1" : "#64748b",
                cursor: "pointer",
                borderBottom: activeSection === s.id ? "2px solid #6366f1" : "2px solid transparent",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              <span style={{ marginRight: 4 }}>{s.icon}</span>
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 20px", maxWidth: 860, margin: "0 auto" }}>
        <ActiveComponent />
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "20px", fontSize: 12, color: "#94a3b8", borderTop: "1px solid #e2e8f0" }}>
        PG Management Platform — Design Document v1.0
      </div>
    </div>
  );
}
