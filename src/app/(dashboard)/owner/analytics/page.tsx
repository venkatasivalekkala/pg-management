"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Spinner } from "@/components/ui/loading";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  IndianRupee,
  Users,
  TrendingUp,
  TrendingDown,
  Building2,
  DoorOpen,
  PieChart,
  BarChart3,
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  city: string;
  rooms?: Array<{ id: string; status: string }>;
  _count?: { rooms: number };
}

interface Booking {
  id: string;
  status: string;
  checkInDate: string;
  createdAt: string;
  tenant?: { name: string; gender?: string };
  property?: { name: string; id: string };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  property?: { name: string; id: string };
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  description?: string;
  createdAt: string;
  property?: { name: string; id: string };
}

export default function AnalyticsPage() {
  const api = useApi();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [propsData, bookingsData, paymentsData, expensesData] = await Promise.all([
        api.get("/api/properties"),
        api.get("/api/bookings"),
        api.get("/api/payments"),
        api.get("/api/expenses"),
      ]);
      if (propsData) setProperties(Array.isArray(propsData) ? propsData : propsData.properties || propsData.data || []);
      if (bookingsData) setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || bookingsData.data || []);
      if (paymentsData) setPayments(Array.isArray(paymentsData) ? paymentsData : paymentsData.payments || paymentsData.data || []);
      if (expensesData) setExpenses(Array.isArray(expensesData) ? expensesData : expensesData.expenses || expensesData.data || []);
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

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  // Revenue calculations
  const paidPayments = payments.filter((p) => p.status === "PAID");
  const totalCollected = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayments = payments.filter((p) => p.status === "PENDING" || p.status === "UNPAID" || p.status === "OVERDUE");
  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalCollected - totalExpenses;

  // Collection rate
  const totalBilled = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Occupancy across properties
  const totalRooms = properties.reduce((sum, p) => {
    if (p.rooms) return sum + p.rooms.length;
    if (p._count?.rooms) return sum + p._count.rooms;
    return sum;
  }, 0);
  const occupiedRooms = properties.reduce((sum, p) => {
    if (p.rooms) return sum + p.rooms.filter((r) => r.status === "OCCUPIED").length;
    return sum;
  }, 0);
  const overallOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Monthly revenue breakdown
  const monthlyData: Record<string, { revenue: number; expenses: number }> = {};
  paidPayments.forEach((p) => {
    const date = new Date(p.paidAt || p.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyData[key]) monthlyData[key] = { revenue: 0, expenses: 0 };
    monthlyData[key].revenue += p.amount || 0;
  });
  expenses.forEach((e) => {
    const date = new Date(e.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyData[key]) monthlyData[key] = { revenue: 0, expenses: 0 };
    monthlyData[key].expenses += e.amount || 0;
  });
  const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
  const monthlyTrend = sortedMonths.map((key) => {
    const [year, month] = key.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return {
      label: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      revenue: monthlyData[key].revenue,
      expenses: monthlyData[key].expenses,
    };
  });
  const maxMonthlyRevenue = Math.max(...monthlyTrend.map((m) => m.revenue), 1);

  // Expense breakdown by category
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    const cat = e.category || "Other";
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + (e.amount || 0);
  });
  const expenseCategories = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      share: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }));

  // Per-property revenue
  const propertyRevenue = properties.map((p) => {
    const rev = paidPayments
      .filter((pay) => pay.property?.id === p.id || pay.property?.name === p.name)
      .reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const exp = expenses
      .filter((e) => e.property?.id === p.id || e.property?.name === p.name)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const roomCount = p.rooms ? p.rooms.length : p._count?.rooms || 0;
    const occupied = p.rooms ? p.rooms.filter((r) => r.status === "OCCUPIED").length : 0;
    const occ = roomCount > 0 ? Math.round((occupied / roomCount) * 100) : 0;
    return { name: p.name, city: p.city, revenue: rev, expenses: exp, net: rev - exp, rooms: roomCount, occupancy: occ };
  });

  // Guest demographics from bookings
  const genderCount: Record<string, number> = {};
  bookings.forEach((b) => {
    const gender = b.tenant?.gender || "Unknown";
    genderCount[gender] = (genderCount[gender] || 0) + 1;
  });
  const totalGuestEntries = Object.values(genderCount).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Revenue, growth, and performance insights</p>
      </div>

      {api.error && loaded && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
          {api.error}
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Total Collected" value={formatCurrency(totalCollected)} />
        <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Pending Amount" value={formatCurrency(totalPending)} />
        <StatCard icon={<DoorOpen className="w-5 h-5" />} label="Overall Occupancy" value={`${overallOccupancy}%`} />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Collection Rate" value={`${collectionRate}%`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Total Expenses" value={formatCurrency(totalExpenses)} />
        <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Net Profit" value={formatCurrency(netProfit)} />
        <StatCard
          icon={<Building2 className="w-5 h-5" />}
          label="Avg Revenue/Property"
          value={properties.length > 0 ? formatCurrency(Math.round(totalCollected / properties.length)) : "₹0"}
        />
      </div>

      {/* Revenue Trend */}
      {monthlyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyTrend.map((m) => (
                <div key={m.label} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-16">{m.label}</span>
                  <div className="flex-1 h-8 bg-gray-100 rounded relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded"
                      style={{ width: `${(m.revenue / maxMonthlyRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-20 text-right">
                    {formatCurrency(m.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseCategories.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No expense data available.</p>
            ) : (
              <div className="space-y-4">
                {expenseCategories.map((c) => (
                  <div key={c.category}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium capitalize">
                        {c.category.replace(/_/g, " ").toLowerCase()}
                      </span>
                      <span className="text-sm font-semibold text-indigo-600">
                        {formatCurrency(c.amount)} ({c.share}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Guest Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            {totalGuestEntries === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No guest data available.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(genderCount)
                  .sort((a, b) => b[1] - a[1])
                  .map(([gender, count]) => {
                    const percentage = Math.round((count / totalGuestEntries) * 100);
                    return (
                      <div key={gender}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{gender.toLowerCase()}</span>
                          <span className="text-sm font-semibold">
                            {count} guests ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-Property Revenue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Property</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {propertyRevenue.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No property data available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Rooms</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Expenses</TableHead>
                  <TableHead>Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propertyRevenue.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.city}</TableCell>
                    <TableCell>{p.rooms}</TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${
                          p.occupancy >= 85
                            ? "text-green-600"
                            : p.occupancy >= 70
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {p.occupancy}%
                      </span>
                    </TableCell>
                    <TableCell className="text-green-700 font-semibold">{formatCurrency(p.revenue)}</TableCell>
                    <TableCell className="text-red-600">{formatCurrency(p.expenses)}</TableCell>
                    <TableCell className={`font-semibold ${p.net >= 0 ? "text-green-700" : "text-red-600"}`}>
                      {formatCurrency(p.net)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Monthly Breakdown Summary Table */}
      {monthlyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Expenses</TableHead>
                  <TableHead>Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyTrend.map((m) => (
                  <TableRow key={m.label}>
                    <TableCell className="font-medium">{m.label}</TableCell>
                    <TableCell className="text-green-700 font-semibold">{formatCurrency(m.revenue)}</TableCell>
                    <TableCell className="text-red-600">{formatCurrency(m.expenses)}</TableCell>
                    <TableCell className={`font-semibold ${m.revenue - m.expenses >= 0 ? "text-green-700" : "text-red-600"}`}>
                      {formatCurrency(m.revenue - m.expenses)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
