"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Building2,
  DoorOpen,
  Users,
  CreditCard,
  AlertCircle,
  CalendarCheck,
  TrendingUp,
  IndianRupee,
} from "lucide-react";

interface DashboardData {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  totalGuests: number;
  pendingBookings: number;
  openComplaints: number;
  monthlyRevenue: number;
  collectionRate: number;
  recentBookings: Array<{
    id: string;
    guestName: string;
    roomNumber: string;
    status: string;
    date: string;
  }>;
  recentComplaints: Array<{
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
  }>;
  recentPayments: Array<{
    id: string;
    guestName: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

const mockData: DashboardData = {
  totalProperties: 5,
  totalRooms: 120,
  occupiedRooms: 98,
  vacantRooms: 18,
  totalGuests: 156,
  pendingBookings: 8,
  openComplaints: 12,
  monthlyRevenue: 485000,
  collectionRate: 87,
  recentBookings: [
    { id: "1", guestName: "Rahul Sharma", roomNumber: "A-101", status: "PENDING", date: "2026-03-28" },
    { id: "2", guestName: "Priya Patel", roomNumber: "B-205", status: "CONFIRMED", date: "2026-03-27" },
    { id: "3", guestName: "Amit Kumar", roomNumber: "A-304", status: "CONFIRMED", date: "2026-03-26" },
    { id: "4", guestName: "Sneha Reddy", roomNumber: "C-102", status: "PENDING", date: "2026-03-26" },
    { id: "5", guestName: "Vikram Singh", roomNumber: "B-108", status: "CANCELLED", date: "2026-03-25" },
  ],
  recentComplaints: [
    { id: "1", title: "Water leakage in bathroom", category: "PLUMBING", priority: "HIGH", status: "OPEN" },
    { id: "2", title: "AC not cooling", category: "ELECTRICAL", priority: "MEDIUM", status: "ASSIGNED" },
    { id: "3", title: "Room cleaning pending", category: "CLEANING", priority: "LOW", status: "IN_PROGRESS" },
    { id: "4", title: "WiFi not working", category: "ELECTRICAL", priority: "URGENT", status: "OPEN" },
    { id: "5", title: "Pest issue in kitchen", category: "PEST", priority: "HIGH", status: "RESOLVED" },
  ],
  recentPayments: [
    { id: "1", guestName: "Rahul Sharma", amount: 12000, status: "SUCCESS", date: "2026-03-28" },
    { id: "2", guestName: "Priya Patel", amount: 8500, status: "SUCCESS", date: "2026-03-27" },
    { id: "3", guestName: "Amit Kumar", amount: 15000, status: "PENDING", date: "2026-03-26" },
    { id: "4", guestName: "Sneha Reddy", amount: 9000, status: "FAILED", date: "2026-03-25" },
    { id: "5", guestName: "Vikram Singh", amount: 11000, status: "SUCCESS", date: "2026-03-25" },
  ],
};

function formatINR(num: number): string {
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>(mockData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here&apos;s your property overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Building2 className="w-5 h-5" />}
          label="Total Properties"
          value={data.totalProperties.toString()}
        />
        <StatCard
          icon={<DoorOpen className="w-5 h-5" />}
          label="Occupancy Rate"
          value={`${Math.round((data.occupiedRooms / data.totalRooms) * 100)}%`}
          change={5.2}
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Guests"
          value={data.totalGuests.toString()}
          change={12}
        />
        <StatCard
          icon={<IndianRupee className="w-5 h-5" />}
          label="Monthly Revenue"
          value={formatINR(data.monthlyRevenue)}
          change={8.4}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DoorOpen className="w-5 h-5" />}
          label="Vacant Rooms"
          value={data.vacantRooms.toString()}
        />
        <StatCard
          icon={<CalendarCheck className="w-5 h-5" />}
          label="Pending Bookings"
          value={data.pendingBookings.toString()}
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Open Complaints"
          value={data.openComplaints.toString()}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Collection Rate"
          value={`${data.collectionRate}%`}
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.guestName}</p>
                    <p className="text-xs text-gray-500">Room {booking.roomNumber} · {booking.date}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Complaints */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Open Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentComplaints.map((complaint) => (
                <div key={complaint.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                    <p className="text-xs text-gray-500">{complaint.category} · {complaint.priority}</p>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{payment.guestName}</p>
                    <p className="text-xs text-gray-500">{payment.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{formatINR(payment.amount)}</span>
                    <StatusBadge status={payment.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
