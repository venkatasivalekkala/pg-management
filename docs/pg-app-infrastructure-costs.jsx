import { useState } from "react";

const stages = ["MVP / Launch", "Growth (1K users)", "Scale (10K users)", "Enterprise (50K+ users)"];

const costData = {
  0: {
    label: "MVP / Launch",
    subtitle: "0–500 users · 5–20 PGs · First 6 months",
    monthly: {
      "Compute (EC2 / App Server)": { cost: 3500, detail: "1× t3.medium (4GB RAM) for API + 1× t3.small for admin panel — Mumbai region" },
      "Database (RDS PostgreSQL)": { cost: 3000, detail: "1× db.t3.medium (Single-AZ) — 4GB RAM, 50GB SSD storage" },
      "Cache (Redis / ElastiCache)": { cost: 1200, detail: "1× cache.t3.micro — session management, OTP cache" },
      "File Storage (S3)": { cost: 300, detail: "~20GB photos, documents, invoices — S3 Standard" },
      "CDN (CloudFront)": { cost: 500, detail: "Image delivery for PG photos, ~50GB transfer/month" },
      "Domain + SSL + DNS (Route 53)": { cost: 100, detail: "1 hosted zone + domain registration" },
      "Email Service (SES)": { cost: 200, detail: "Transactional emails — invoices, confirmations, ~2K emails/month" },
      "SMS Gateway (MSG91)": { cost: 1500, detail: "OTP + payment reminders — ~3,000 SMS/month at ₹0.5/SMS" },
      "WhatsApp API (Meta Business)": { cost: 2000, detail: "Rent reminders, booking confirmations — ~1,000 messages/month" },
      "Push Notifications (FCM)": { cost: 0, detail: "Firebase Cloud Messaging — free tier sufficient" },
      "Payment Gateway (Razorpay)": { cost: 0, detail: "2% + GST per transaction — no fixed monthly cost, deducted per payment" },
      "Monitoring (CloudWatch)": { cost: 500, detail: "Basic metrics, logs, alarms" },
      "CI/CD (GitHub Actions)": { cost: 0, detail: "Free tier — 2,000 min/month for private repos" },
      "App Store Fees": { cost: 2100, detail: "Google Play ₹2,100 one-time + Apple $99/yr (~₹8,300/yr)" },
    },
    totalMonthly: 14900,
    paymentGateway: "~₹4,000–8,000/month (2% + GST on ₹2–4L rent collection)",
    annualNote: "Total Year 1: ~₹2.2–2.8 Lakhs (infra only, excl. payment gateway fees)",
  },
  1: {
    label: "Growth",
    subtitle: "500–1,000 users · 20–80 PGs · Month 6–12",
    monthly: {
      "Compute (EC2 / ECS)": { cost: 8000, detail: "2× t3.large (8GB RAM) with auto-scaling group + Load Balancer" },
      "Database (RDS PostgreSQL)": { cost: 7000, detail: "1× db.t3.large (Multi-AZ) — 8GB RAM, 100GB SSD, daily backups" },
      "Cache (Redis / ElastiCache)": { cost: 3500, detail: "1× cache.t3.small — expanded caching for listings, sessions" },
      "File Storage (S3)": { cost: 800, detail: "~100GB photos, documents, invoices" },
      "CDN (CloudFront)": { cost: 1500, detail: "~200GB transfer/month, image optimization" },
      "Domain + SSL + DNS (Route 53)": { cost: 200, detail: "2 hosted zones + health checks" },
      "Email Service (SES)": { cost: 500, detail: "~10K emails/month — invoices, reminders, announcements" },
      "SMS Gateway (MSG91)": { cost: 4000, detail: "~8,000 SMS/month — OTPs, rent reminders, visitor alerts" },
      "WhatsApp API (Meta Business)": { cost: 5000, detail: "~3,000 messages/month — rent, complaints, booking updates" },
      "Push Notifications (FCM)": { cost: 0, detail: "Still free tier — handles millions of messages" },
      "Payment Gateway (Razorpay)": { cost: 0, detail: "2% + GST per transaction — scales with volume" },
      "Monitoring (CloudWatch + Sentry)": { cost: 2000, detail: "Enhanced logging + error tracking (Sentry free/developer tier)" },
      "CI/CD + Staging Env": { cost: 3000, detail: "GitHub Actions Team + staging server (t3.small)" },
      "Elasticsearch (Search)": { cost: 4000, detail: "1× t3.small.search — PG discovery search functionality" },
    },
    totalMonthly: 39500,
    paymentGateway: "~₹16,000–40,000/month (2% + GST on ₹8–20L rent collection)",
    annualNote: "Total Year: ~₹4.7–6.5 Lakhs (infra only, excl. payment gateway fees)",
  },
  2: {
    label: "Scale",
    subtitle: "1K–10K users · 80–500 PGs · Year 1–2",
    monthly: {
      "Compute (ECS Fargate / EKS)": { cost: 25000, detail: "Containerized microservices — 4–6 services, auto-scaling, ALB" },
      "Database (RDS PostgreSQL)": { cost: 18000, detail: "1× db.r6g.large (Multi-AZ) — 16GB RAM, 500GB SSD, read replica" },
      "Cache (Redis / ElastiCache)": { cost: 8000, detail: "1× cache.r6g.large — listings cache, real-time data, rate limiting" },
      "File Storage (S3 + Backup)": { cost: 2500, detail: "~500GB total, lifecycle policies, cross-region backup" },
      "CDN (CloudFront)": { cost: 5000, detail: "~1TB transfer/month, WAF basic protection" },
      "Domain + SSL + DNS": { cost: 400, detail: "Multiple domains, health checks, failover routing" },
      "Email Service (SES)": { cost: 1500, detail: "~50K emails/month" },
      "SMS Gateway (MSG91)": { cost: 12000, detail: "~25,000 SMS/month — bulk rates kick in" },
      "WhatsApp API (Meta Business)": { cost: 15000, detail: "~10,000 messages/month — automated workflows" },
      "Push Notifications (FCM)": { cost: 0, detail: "Free — even at scale" },
      "Payment Gateway (Razorpay)": { cost: 0, detail: "Volume discounts may apply — negotiate at this scale" },
      "Monitoring Stack": { cost: 6000, detail: "CloudWatch + Sentry Pro + Grafana Cloud" },
      "CI/CD + DevOps": { cost: 5000, detail: "GitHub Enterprise + staging + pre-prod environments" },
      "Elasticsearch (Managed)": { cost: 10000, detail: "2-node cluster — PG search, analytics" },
      "Security (WAF + Secrets)": { cost: 4000, detail: "AWS WAF, Secrets Manager, KMS encryption" },
      "Data Pipeline (Analytics)": { cost: 5000, detail: "Basic ETL — S3 + Athena for analytics queries" },
    },
    totalMonthly: 117400,
    paymentGateway: "~₹1–4L/month (2% + GST on ₹50L–2Cr rent collection)",
    annualNote: "Total Year: ~₹14–18 Lakhs (infra only, excl. payment gateway fees)",
  },
  3: {
    label: "Enterprise",
    subtitle: "10K–50K+ users · 500–2000+ PGs · Year 2+",
    monthly: {
      "Compute (EKS Kubernetes)": { cost: 70000, detail: "Kubernetes cluster — 10+ pods, horizontal auto-scaling, multi-AZ" },
      "Database (RDS + Aurora)": { cost: 50000, detail: "Aurora PostgreSQL (Multi-AZ) — auto-scaling storage, 2 read replicas" },
      "Cache (ElastiCache Cluster)": { cost: 20000, detail: "Redis cluster mode — sharded, high availability" },
      "File Storage (S3 + Glacier)": { cost: 8000, detail: "~2TB, intelligent tiering, archival for old data" },
      "CDN (CloudFront + Shield)": { cost: 15000, detail: "~5TB transfer, DDoS protection, edge functions" },
      "DNS + Global Infra": { cost: 2000, detail: "Route 53 + latency-based routing" },
      "Email Service (SES)": { cost: 4000, detail: "~200K emails/month + dedicated IPs" },
      "SMS Gateway": { cost: 30000, detail: "~60K+ SMS/month — enterprise rates" },
      "WhatsApp Business API": { cost: 40000, detail: "~30K+ messages, chatbot integration" },
      "Payment Gateway": { cost: 0, detail: "Custom enterprise rates — typically 1.5–1.8% at high volume" },
      "Monitoring + Observability": { cost: 15000, detail: "Datadog / New Relic + PagerDuty + custom dashboards" },
      "CI/CD + Infra as Code": { cost: 10000, detail: "Terraform + ArgoCD + multi-env pipeline" },
      "Search + Analytics": { cost: 25000, detail: "OpenSearch 3-node + Redshift for BI" },
      "Security + Compliance": { cost: 15000, detail: "WAF + GuardDuty + Inspector + SOC2 prep" },
      "Data Lake + ML": { cost: 12000, detail: "S3 data lake + SageMaker for pricing/churn prediction" },
      "DR + Multi-Region": { cost: 8000, detail: "Cross-region backup, disaster recovery setup" },
    },
    totalMonthly: 324000,
    paymentGateway: "~₹3–10L/month (negotiated rate on ₹2–5Cr+ rent collection)",
    annualNote: "Total Year: ~₹39–50 Lakhs (infra only, excl. payment gateway fees)",
  },
};

const thirdPartyServices = [
  { name: "Razorpay", type: "Payment Gateway", pricing: "2% + 18% GST per successful txn (no setup/AMC)", note: "UPI has zero MDR per RBI mandate. Cards/netbanking at 2%. Premium methods at 3%." },
  { name: "MSG91", type: "SMS Gateway", pricing: "₹0.15–₹0.50 per SMS (volume-based)", note: "OTP SMS cheaper (~₹0.15). Promotional SMS ~₹0.25–₹0.50. Bulk discounts available." },
  { name: "WhatsApp Business API", type: "Messaging", pricing: "₹0.50–₹1.50 per message (template-based)", note: "Marketing messages costlier than utility. First 1,000 service conversations/month free." },
  { name: "Firebase", type: "Auth + Push", pricing: "Free tier → ₹0 for most startups", note: "Phone auth: 10K verifications/month free. FCM push: unlimited free." },
  { name: "Google Maps API", type: "Location", pricing: "$7/1K loads (Dynamic Maps)", note: "$200 free credit/month = ~28K map loads free. Geocoding at $5/1K requests." },
  { name: "Cloudinary", type: "Image CDN", pricing: "Free tier → $89+/month at scale", note: "25K transformations + 25GB storage free. Good for PG photo optimization." },
  { name: "Sentry", type: "Error Tracking", pricing: "Free → $26/month (Team)", note: "5K errors/month free. Essential for catching mobile app crashes." },
  { name: "SendGrid / AWS SES", type: "Email", pricing: "SES: $0.10/1K emails", note: "SES is cheapest for transactional email in India. SendGrid has better templates." },
];

export default function InfraCostCalculator() {
  const [activeStage, setActiveStage] = useState(0);
  const [activeTab, setActiveTab] = useState("breakdown");
  const data = costData[activeStage];

  const formatINR = (num) => {
    if (num === 0) return "₹0";
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num}`;
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#0f172a", minHeight: "100vh", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ padding: "28px 20px 16px", background: "linear-gradient(135deg, #0f172a, #1e293b)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#22d3ee", textTransform: "uppercase" }}>
          Infrastructure Cost Analysis
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "6px 0 4px", color: "#f8fafc" }}>
          PG Management App — Cloud Costs
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>AWS Mumbai Region · All prices in ₹ INR · Updated March 2026</p>
      </div>

      {/* Stage Selector */}
      <div style={{ padding: "16px 20px 0", display: "flex", gap: 8, overflowX: "auto" }}>
        {stages.map((s, i) => (
          <button
            key={s}
            onClick={() => setActiveStage(i)}
            style={{
              background: activeStage === i ? "#22d3ee" : "#1e293b",
              color: activeStage === i ? "#0f172a" : "#94a3b8",
              border: `1px solid ${activeStage === i ? "#22d3ee" : "#334155"}`,
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <div style={{ background: "#1e293b", borderRadius: 12, padding: 16, border: "1px solid #334155" }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Monthly Infra</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#22d3ee", marginTop: 4 }}>{formatINR(data.totalMonthly)}</div>
          <div style={{ fontSize: 11, color: "#475569" }}>/month</div>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 12, padding: 16, border: "1px solid #334155" }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Annual Infra</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#a78bfa", marginTop: 4 }}>{formatINR(data.totalMonthly * 12)}</div>
          <div style={{ fontSize: 11, color: "#475569" }}>/year</div>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 12, padding: 16, border: "1px solid #334155" }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Payment Gateway</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginTop: 8, lineHeight: 1.5 }}>{data.paymentGateway}</div>
        </div>
      </div>

      {/* Stage Info */}
      <div style={{ padding: "0 20px 12px" }}>
        <div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 16px", border: "1px solid #334155" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>{data.label}</span>
          <span style={{ fontSize: 13, color: "#64748b", marginLeft: 10 }}>{data.subtitle}</span>
          <div style={{ fontSize: 12, color: "#22d3ee", marginTop: 4 }}>{data.annualNote}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ padding: "0 20px", display: "flex", gap: 0, borderBottom: "1px solid #334155" }}>
        {[
          { id: "breakdown", label: "Cost Breakdown" },
          { id: "thirdparty", label: "3rd Party Services" },
          { id: "tips", label: "Cost Saving Tips" },
          { id: "comparison", label: "All Stages" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              padding: "10px 14px",
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? "#22d3ee" : "#64748b",
              cursor: "pointer",
              borderBottom: activeTab === tab.id ? "2px solid #22d3ee" : "2px solid transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: "16px 20px" }}>
        {activeTab === "breakdown" && (
          <div>
            {Object.entries(data.monthly).map(([service, info]) => (
              <div key={service} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "12px 0",
                borderBottom: "1px solid #1e293b",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc" }}>{service}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 3, lineHeight: 1.5 }}>{info.detail}</div>
                </div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: info.cost === 0 ? "#22c55e" : "#22d3ee",
                  minWidth: 70,
                  textAlign: "right",
                }}>
                  {info.cost === 0 ? "FREE" : formatINR(info.cost)}
                </div>
              </div>
            ))}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "16px 0",
              borderTop: "2px solid #334155",
              marginTop: 8,
            }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc" }}>Total Monthly Infrastructure</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#22d3ee" }}>{formatINR(data.totalMonthly)}</span>
            </div>
          </div>
        )}

        {activeTab === "thirdparty" && (
          <div>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px", lineHeight: 1.6 }}>
              These are variable costs that depend on usage. Most have generous free tiers for MVP stage.
            </p>
            {thirdPartyServices.map((svc) => (
              <div key={svc.name} style={{
                background: "#1e293b",
                borderRadius: 10,
                padding: 16,
                marginBottom: 10,
                border: "1px solid #334155",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>{svc.name}</span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#22d3ee",
                      background: "#22d3ee15",
                      padding: "2px 8px",
                      borderRadius: 20,
                      marginLeft: 8,
                    }}>{svc.type}</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fbbf24", marginBottom: 4 }}>{svc.pricing}</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{svc.note}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "tips" && (
          <div>
            {[
              {
                title: "Use AWS Free Tier (Year 1)",
                saving: "Save ₹3,000–5,000/month",
                desc: "t3.micro EC2 (750 hrs), 20GB RDS, 5GB S3, 1M Lambda requests — all free for 12 months. Start your MVP here.",
                color: "#22c55e",
              },
              {
                title: "Apply for AWS Activate Credits",
                saving: "Save ₹80K–₹8L+",
                desc: "Startups can get $1,000–$100,000 in AWS credits through the Activate program. Apply through your accelerator or VC.",
                color: "#22d3ee",
              },
              {
                title: "Reserved Instances (1-year)",
                saving: "Save 30–40% on EC2/RDS",
                desc: "Once your workload is stable (month 6+), switch from On-Demand to 1-year Reserved Instances for compute and database.",
                color: "#a78bfa",
              },
              {
                title: "Use Spot Instances for Background Jobs",
                saving: "Save up to 90% on compute",
                desc: "Report generation, image processing, data backups — all can run on Spot Instances at massive discounts.",
                color: "#f472b6",
              },
              {
                title: "S3 Lifecycle Policies",
                saving: "Save 50–70% on storage",
                desc: "Move old photos/invoices (>90 days) to S3 Infrequent Access, then Glacier after 1 year. Automatic via policies.",
                color: "#fbbf24",
              },
              {
                title: "Use UPI for Rent Collection",
                saving: "Save 100% gateway fee on UPI",
                desc: "RBI mandates zero MDR on UPI for merchants. Push tenants to pay via UPI instead of cards to save the 2% fee entirely.",
                color: "#22c55e",
              },
              {
                title: "Start with Managed Services",
                saving: "Save ₹50K–₹1L/month on DevOps",
                desc: "Use RDS, ElastiCache, ECS Fargate instead of self-managed. Saves on hiring a dedicated DevOps engineer early on.",
                color: "#fb923c",
              },
              {
                title: "CDN Caching Strategy",
                saving: "Save 40–60% on data transfer",
                desc: "Cache PG photos aggressively on CloudFront (24hr TTL). Most PG images rarely change. Reduces S3 requests significantly.",
                color: "#38bdf8",
              },
              {
                title: "Right-size Continuously",
                saving: "Save 20–30% ongoing",
                desc: "Use AWS Cost Explorer + Compute Optimizer monthly. Most startups over-provision by 30–40% in the early stages.",
                color: "#e879f9",
              },
            ].map((tip) => (
              <div key={tip.title} style={{
                background: "#1e293b",
                borderRadius: 10,
                padding: 16,
                marginBottom: 10,
                borderLeft: `3px solid ${tip.color}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>{tip.title}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: tip.color, whiteSpace: "nowrap" }}>{tip.saving}</span>
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, lineHeight: 1.6 }}>{tip.desc}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "comparison" && (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "#64748b", borderBottom: "1px solid #334155", fontSize: 12 }}>Stage</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: "#64748b", borderBottom: "1px solid #334155", fontSize: 12 }}>Monthly</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: "#64748b", borderBottom: "1px solid #334155", fontSize: 12 }}>Annual</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "#64748b", borderBottom: "1px solid #334155", fontSize: 12 }}>Users</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(costData).map((stage, i) => (
                    <tr key={i} style={{ background: activeStage === i ? "#22d3ee10" : "transparent" }}>
                      <td style={{ padding: "12px", borderBottom: "1px solid #1e293b", fontWeight: 600, color: "#f8fafc" }}>
                        {stage.label}
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>{stage.subtitle}</div>
                      </td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #1e293b", textAlign: "right", fontWeight: 700, color: "#22d3ee" }}>
                        {formatINR(stage.totalMonthly)}
                      </td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #1e293b", textAlign: "right", fontWeight: 700, color: "#a78bfa" }}>
                        {formatINR(stage.totalMonthly * 12)}
                      </td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #1e293b", color: "#94a3b8" }}>
                        {["0–500", "500–1K", "1K–10K", "10K–50K+"][i]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visual Bar Chart */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", marginBottom: 12 }}>Monthly Cost Scaling</div>
              {Object.values(costData).map((stage, i) => {
                const maxCost = costData[3].totalMonthly;
                const pct = (stage.totalMonthly / maxCost) * 100;
                return (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "#94a3b8" }}>{stage.label}</span>
                      <span style={{ color: "#22d3ee", fontWeight: 700 }}>{formatINR(stage.totalMonthly)}/mo</span>
                    </div>
                    <div style={{ background: "#1e293b", borderRadius: 6, height: 24, overflow: "hidden" }}>
                      <div style={{
                        width: `${Math.max(pct, 3)}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, #22d3ee, ${["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24"][i]})`,
                        borderRadius: 6,
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Ownership Cost */}
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 18, marginTop: 24, border: "1px solid #334155" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fbbf24", marginBottom: 10 }}>
                Total Cost of Ownership — First 2 Years
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600 }}>INFRASTRUCTURE</div>
                  <div style={{ color: "#22d3ee", fontWeight: 700, fontSize: 18, marginTop: 4 }}>₹7–12 Lakhs</div>
                  <div style={{ color: "#475569", fontSize: 11 }}>Cloud + 3rd party services</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600 }}>DEVELOPMENT</div>
                  <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 18, marginTop: 4 }}>₹18–30 Lakhs</div>
                  <div style={{ color: "#475569", fontSize: 11 }}>Team salary / agency cost</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600 }}>PAYMENT GATEWAY</div>
                  <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 18, marginTop: 4 }}>₹2–8 Lakhs</div>
                  <div style={{ color: "#475569", fontSize: 11 }}>2% + GST on rent volume</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600 }}>TOTAL 2-YEAR TCO</div>
                  <div style={{ color: "#f8fafc", fontWeight: 800, fontSize: 18, marginTop: 4 }}>₹27–50 Lakhs</div>
                  <div style={{ color: "#475569", fontSize: 11 }}>All-inclusive estimate</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 20px", textAlign: "center", fontSize: 11, color: "#475569", borderTop: "1px solid #1e293b" }}>
        Prices based on AWS Mumbai region (ap-south-1) · March 2026 · Excludes GST on AWS services
      </div>
    </div>
  );
}
