import Link from "next/link";
import {
  Building2,
  CreditCard,
  AlertCircle,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    title: "Property Management",
    description:
      "Manage multiple PG properties, rooms, and beds from a single dashboard. Track occupancy, amenities, and maintenance with ease.",
    icon: Building2,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "Rent Collection",
    description:
      "Automate rent invoicing, send payment reminders, and accept online payments via UPI, cards, and net banking.",
    icon: CreditCard,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Complaint Tracking",
    description:
      "Let tenants raise complaints, assign them to staff, and track resolution progress in real time.",
    icon: AlertCircle,
    color: "bg-amber-100 text-amber-600",
  },
  {
    title: "Analytics & Reports",
    description:
      "Get deep insights into occupancy rates, revenue trends, pending dues, and operational efficiency.",
    icon: BarChart3,
    color: "bg-rose-100 text-rose-600",
  },
];

const highlights = [
  "Multi-property support",
  "Role-based access control",
  "Meal management",
  "Visitor tracking",
  "Mobile responsive",
  "Real-time notifications",
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ─── Navbar ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              PG Manager
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
        {/* Decorative grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40V0h1v40zm40 0V0h1v40zM0 0h40v1H0zm0 40h40v1H0z' fill='%23fff'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Manage Your PG Properties{" "}
              <span className="bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">
                Effortlessly
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-indigo-100">
              The all-in-one SaaS platform for PG and hostel owners. Handle
              properties, tenants, rent, complaints, meals, and visitors -- all
              from a single dashboard.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-300 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Everything you need
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Powerful features for PG management
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              From property onboarding to daily operations, we have got every
              aspect covered.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    className={`inline-flex rounded-xl p-3 ${feature.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Highlights strip ─────────────────────────────────────────── */}
      <section className="border-y border-gray-200 bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to streamline your PG operations?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Join hundreds of PG owners who trust PG Manager to run their
            properties efficiently.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-8 py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                PG Manager
              </span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} PG Manager. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
