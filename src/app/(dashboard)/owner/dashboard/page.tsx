"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Building2,
  IndianRupee,
  Users,
  DoorOpen,
  AlertTriangle,
  TrendingUp,
  Plus,
  BarChart3,
  CreditCard,
  MessageSquare,
  CalendarCheck,
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  city: string;
  address?: string;
  status: string;
  rooms?: Array<{ id: string; status: string; beds?: Array<{ id: string; status: string }> }>;
  _count?: { rooms: number };
}

interface Booking {
  id: string;
  guestName?: string;
  tenant?: { name: string };
  property?: { name: string };
  status: string;
  checkInDate: string;
  createdAt: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  tenant?: { name: string };
  property?: { name: string };
  createdAt: string;
  paidAt?: string;
}

interface Complaint {
  id: string;
  title: string;
  status: string;
  priority?: string;
  property?: { name: string };
  tenant?: { name: string };
  createdAt: string;
}

export default function OwnerDashboard() {
  const api = useApi();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [propsData, bookingsData, paymentsData, complaintsData] = await Promise.all([
        api.get("/api/properties"),
        api.get("/api/bookings"),
        api.get("/api/payments"),
        api.get("/api/complaints"),
      ]);
      if (propsData) setProperties(Array.isArray(propsData) ? propsData : propsData.properties || propsData.data || []);
      if (bookingsData) setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || bookingsData.data || []);
      if (paymentsData) setPayments(Array.isArray(paymentsData) ? paymentsData : paymentsData.payments || paymentsData.data || []);
      if (complaintsData) setComplaints(Array.isArray(complaintsData) ? complaintsData : complaintsData.complaints || complaintsData.data || []);
      setLoaded(true);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loaded && api.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (api.error && !loaded) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
        {api.error}
      </div>
    );
  }

  // Compute metrics
  const totalProperties = properties.length;
  const totalRooms = properties.reduce((sum, p) => {
    if (p.rooms) return sum + p.rooms.length;
    if (p._count?.rooms) return sum + p._count.rooms;
    return sum;
  }, 0);

  const occupiedRooms = properties.reduce((sum, p) => {
    if (p.rooms) return sum + p.rooms.filter((r) => r.status === "OCCUPIED").length;
    return sum;
  }, 0);

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const totalRevenue = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const openComplaints = complaints.filter(
    (c) => c.status === "OPEN" || c.status === "IN_PROGRESS" || c.status === "PENDING"
  ).length;

  const activeGuests = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "ACTIVE" || b.status === "CHECKED_IN"
  ).length;

  // Per-property metrics
  const propertyMetrics = properties.map((p) => {
    const roomCount = p.rooms ? p.rooms.length : p._count?.rooms || 0;
    const occupied = p.rooms ? p.rooms.filter((r) => r.status === "OCCUPIED").length : 0;
    const occ = roomCount > 0 ? Math.round((occupied / roomCount) * 100) : 0;
    const propPayments = payments.filter((pay) => pay.property?.name === p.name && pay.status === "PAID");
    const revenue = propPayments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const propComplaints = complaints.filter(
      (c) => c.property?.name === p.name && (c.status === "OPEN" || c.status === "IN_PROGRESS" || c.status === "PENDING")
    ).length;
    return { ...p, roomCount, occupancy: occ, revenue, complaints: propComplaints };
  });

  // Recent activity: merge and sort by date
  const recentActivity = [
    ...bookings.slice(0, 10).map((b) => ({
      type: "booking" as const,
      id: b.id,
      title: `Booking ${b.status.toLowerCase()}`,
      description: `${b.tenant?.name || b.guestName || "Guest"} at ${b.property?.name || "property"}`,
      status: b.status,
      date: b.createdAt,
      icon: <CalendarCheck className="w-4 h-4" />,
    })),
    ...payments.slice(0, 10).map((p) => ({
      type: "payment" as const,
      id: p.id,
      title: `Payment ${p.status.toLowerCase()}`,
      description: `${p.tenant?.name || "Tenant"} - ₹${p.amount?.toLocaleString("en-IN") || 0}`,
      status: p.status,
      date: p.createdAt,
      icon: <CreditCard className="w-4 h-4" />,
    })),
    ...complaints.slice(0, 10).map((c) => ({
      type: "complaint" as const,
      id: c.id,
      title: c.title || "Complaint",
      description: `${c.tenant?.name || "Tenant"} at ${c.property?.name || "property"}`,
      status: c.status,
      date: c.createdAt,
      icon: <MessageSquare className="w-4 h-4" />,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Overview</h1>
          <p className="text-sm text-gray-500 mt-1">All properties at a glance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => (window.location.href = "/owner/analytics")}>
            <BarChart3 className="w-4 h-4 mr-2" /> View Reports
          </Button>
          <Button onClick={() => (window.location.href = "/owner/properties")}>
            <Plus className="w-4 h-4 mr-2" /> Add Property
          </Button>
        </div>
      </div>

      {/* Top-level stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={<Building2 className="w-5 h-5" />} label="Total Properties" value={totalProperties.toString()} />
        <StatCard icon={<DoorOpen className="w-5 h-5" />} label="Total Rooms" value={totalRooms.toString()} />
        <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Occupancy Rate" value={`${occupancyRate}%`} />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Open Complaints" value={openComplaints.toString()} />
        <StatCard icon={<Users className="w-5 h-5" />} label="Active Guests" value={activeGuests.toString()} />
      </div>

      {/* Property Performance Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Property Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {propertyMetrics.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-6 h-6" />}
              title="No properties yet"
              description="Add your first property to start tracking performance."
              action={
                <Button onClick={() => (window.location.href = "/owner/properties")}>
                  <Plus className="w-4 h-4 mr-2" /> Add Property
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {propertyMetrics.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{p.name}</p>
                      <p className="text-sm text-gray-500">
                        {p.city} · {p.roomCount} rooms
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-lg font-bold text-indigo-600">{formatCurrency(p.revenue)}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-lg font-bold ${
                          p.occupancy >= 85
                            ? "text-green-600"
                            : p.occupancy >= 70
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {p.occupancy}%
                      </p>
                      <p className="text-xs text-gray-500">Occupancy</p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-lg font-bold ${
                          p.complaints === 0
                            ? "text-green-600"
                            : p.complaints > 5
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {p.complaints}
                      </p>
                      <p className="text-xs text-gray-500">Complaints</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No recent activity to show.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-gray-400">
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
