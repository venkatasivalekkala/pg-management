"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Spinner } from "@/components/ui/loading";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  IndianRupee,
  Users,
  DoorOpen,
  TrendingUp,
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";

interface Property {
  id: string;
  name: string;
}

interface Room {
  id: string;
  roomNumber: string;
  floor?: number;
  status: string;
  propertyId: string;
}

interface BookingRecord {
  id: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  createdAt?: string;
  user?: { name: string; email: string };
  room?: { roomNumber: string };
}

interface PaymentRecord {
  id: string;
  amount: number;
  status: string;
  method?: string;
  type?: string;
  paidAt?: string;
  createdAt?: string;
}

interface Complaint {
  id: string;
  status: string;
  category?: string;
  createdAt?: string;
  resolvedAt?: string;
}

export default function ReportsPage() {
  const api = useApi();
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [propsRes, roomsRes, bookingsRes, paymentsRes, complaintsRes] = await Promise.all([
        api.get("/api/properties"),
        api.get("/api/rooms"),
        api.get("/api/bookings"),
        api.get("/api/payments"),
        api.get("/api/complaints"),
      ]);
      if (propsRes) setProperties(Array.isArray(propsRes) ? propsRes : propsRes.properties || []);
      if (roomsRes) setRooms(Array.isArray(roomsRes) ? roomsRes : roomsRes.rooms || []);
      if (bookingsRes) setBookings(Array.isArray(bookingsRes) ? bookingsRes : bookingsRes.bookings || []);
      if (paymentsRes) setPayments(Array.isArray(paymentsRes) ? paymentsRes : paymentsRes.payments || []);
      if (complaintsRes) setComplaints(Array.isArray(complaintsRes) ? complaintsRes : complaintsRes.complaints || []);
    };
    fetchAll();
  }, []);

  // Revenue calculations
  const successPayments = payments.filter((p) => p.status === "SUCCESS");
  const totalIncome = successPayments.reduce((sum, p) => sum + p.amount, 0);

  const monthlyBreakdown = successPayments.reduce<Record<string, number>>((acc, p) => {
    const date = p.paidAt || p.createdAt;
    if (!date) return acc;
    const key = new Date(date).toLocaleDateString("en-IN", { year: "numeric", month: "short" });
    acc[key] = (acc[key] || 0) + p.amount;
    return acc;
  }, {});

  const methodDistribution = successPayments.reduce<Record<string, number>>((acc, p) => {
    const method = p.method || "Other";
    acc[method] = (acc[method] || 0) + p.amount;
    return acc;
  }, {});

  // Occupancy calculations
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === "OCCUPIED").length;
  const vacantRooms = rooms.filter((r) => r.status === "VACANT" || r.status === "AVAILABLE").length;
  const maintenanceRooms = rooms.filter((r) => r.status === "MAINTENANCE").length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const floorGroups = rooms.reduce<Record<number, { total: number; occupied: number }>>((acc, r) => {
    const floor = r.floor || 0;
    if (!acc[floor]) acc[floor] = { total: 0, occupied: 0 };
    acc[floor].total++;
    if (r.status === "OCCUPIED") acc[floor].occupied++;
    return acc;
  }, {});

  // Complaints calculations
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length;
  const pendingComplaints = complaints.filter((c) => c.status === "PENDING" || c.status === "OPEN" || c.status === "IN_PROGRESS").length;

  const avgResolutionTime = (() => {
    const resolved = complaints.filter((c) => c.resolvedAt && c.createdAt);
    if (resolved.length === 0) return "N/A";
    const totalHours = resolved.reduce((sum, c) => {
      const diff = new Date(c.resolvedAt!).getTime() - new Date(c.createdAt!).getTime();
      return sum + diff / (1000 * 60 * 60);
    }, 0);
    const avg = totalHours / resolved.length;
    return avg < 24 ? `${Math.round(avg)}h` : `${Math.round(avg / 24)}d`;
  })();

  const complaintsByCategory = complaints.reduce<Record<string, number>>((acc, c) => {
    const cat = c.category || "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // Guest calculations
  const now = new Date();
  const activeGuests = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "ACTIVE" || b.status === "CHECKED_IN"
  ).length;
  const newThisMonth = bookings.filter((b) => {
    const created = b.createdAt ? new Date(b.createdAt) : null;
    return created && created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;
  const checkOutsThisMonth = bookings.filter((b) => {
    const co = b.checkOut ? new Date(b.checkOut) : null;
    return co && co.getMonth() === now.getMonth() && co.getFullYear() === now.getFullYear();
  }).length;

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toLocaleString();
  };

  if (api.loading && payments.length === 0 && rooms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Business intelligence and performance metrics</p>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Total Income" value={`\u20B9${formatCurrency(totalIncome)}`} />
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Successful Payments"
                value={successPayments.length}
              />
              <StatCard
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Pending Payments"
                value={payments.filter((p) => p.status === "PENDING").length}
              />
            </div>

            <Card>
              <CardHeader><CardTitle>Monthly Revenue Breakdown</CardTitle></CardHeader>
              <CardContent>
                {Object.keys(monthlyBreakdown).length === 0 ? (
                  <p className="text-sm text-gray-500">No payment data available yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Visual</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(monthlyBreakdown)
                        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                        .map(([month, amount]) => {
                          const maxAmount = Math.max(...Object.values(monthlyBreakdown));
                          const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                          return (
                            <TableRow key={month}>
                              <TableCell className="font-medium">{month}</TableCell>
                              <TableCell className="font-semibold">{"\u20B9"}{amount.toLocaleString()}</TableCell>
                              <TableCell>
                                <div className="w-full bg-gray-100 rounded-full h-4">
                                  <div className="bg-indigo-500 h-4 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Payment Method Distribution</CardTitle></CardHeader>
              <CardContent>
                {Object.keys(methodDistribution).length === 0 ? (
                  <p className="text-sm text-gray-500">No payment data available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(methodDistribution)
                      .sort(([, a], [, b]) => b - a)
                      .map(([method, amount]) => {
                        const pct = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0;
                        return (
                          <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-sm">{method}</span>
                              <Badge variant="info">{pct}%</Badge>
                            </div>
                            <span className="font-semibold text-sm">{"\u20B9"}{amount.toLocaleString()}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Occupancy Tab */}
        <TabsContent value="occupancy">
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={<Building2 className="w-5 h-5" />} label="Total Rooms" value={totalRooms} />
              <StatCard icon={<DoorOpen className="w-5 h-5" />} label="Occupied" value={occupiedRooms} />
              <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Vacant" value={vacantRooms} />
              <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Maintenance" value={maintenanceRooms} />
            </div>

            <Card>
              <CardHeader><CardTitle>Overall Occupancy Rate</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-indigo-600">{occupancyRate}%</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-100 rounded-full h-6">
                      <div
                        className="bg-indigo-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${occupancyRate}%` }}
                      >
                        {occupancyRate > 15 && (
                          <span className="text-xs text-white font-medium">{occupiedRooms}/{totalRooms}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Occupancy by Floor</CardTitle></CardHeader>
              <CardContent>
                {Object.keys(floorGroups).length === 0 ? (
                  <p className="text-sm text-gray-500">No room data available.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(floorGroups)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([floor, data]) => {
                        const pct = data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0;
                        return (
                          <div key={floor} className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-600 w-20">Floor {floor}</span>
                            <div className="flex-1">
                              <div className="w-full bg-gray-100 rounded-full h-4">
                                <div className="bg-indigo-500 h-4 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <span className="text-sm font-semibold w-24 text-right">
                              {data.occupied}/{data.total} ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints">
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Total Complaints" value={totalComplaints} />
              <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Resolved" value={resolvedComplaints} />
              <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={pendingComplaints} />
              <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Avg Resolution" value={avgResolutionTime} />
            </div>

            <Card>
              <CardHeader><CardTitle>Complaints by Category</CardTitle></CardHeader>
              <CardContent>
                {Object.keys(complaintsByCategory).length === 0 ? (
                  <p className="text-sm text-gray-500">No complaint data available.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(complaintsByCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, count]) => {
                        const pct = totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0;
                        return (
                          <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-sm">{category}</span>
                              <Badge variant="info">{pct}%</Badge>
                            </div>
                            <span className="font-semibold text-sm">{count} complaints</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Guests Tab */}
        <TabsContent value="guests">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<Users className="w-5 h-5" />} label="Active Guests" value={activeGuests} />
              <StatCard icon={<TrendingUp className="w-5 h-5" />} label="New This Month" value={newThisMonth} />
              <StatCard icon={<DoorOpen className="w-5 h-5" />} label="Check-outs This Month" value={checkOutsThisMonth} />
            </div>

            <Card>
              <CardHeader><CardTitle>Recent Bookings</CardTitle></CardHeader>
              <CardContent className="p-0">
                {bookings.length === 0 ? (
                  <div className="p-6">
                    <p className="text-sm text-gray-500">No booking data available.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guest</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.slice(0, 10).map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.user?.name || "-"}</TableCell>
                          <TableCell>{b.room?.roomNumber || "-"}</TableCell>
                          <TableCell className="text-sm">
                            {b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {b.checkOut ? new Date(b.checkOut).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                b.status === "CONFIRMED" || b.status === "ACTIVE"
                                  ? "success"
                                  : b.status === "CANCELLED"
                                  ? "danger"
                                  : "default"
                              }
                            >
                              {b.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
