"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, IndianRupee, Users, DoorOpen, TrendingUp, AlertTriangle } from "lucide-react";

const portfolioData = {
  totalProperties: 5,
  totalRooms: 140,
  occupiedRooms: 117,
  totalGuests: 156,
  monthlyRevenue: 1685000,
  pendingAmount: 245000,
  collectionRate: 87,
  openComplaints: 18,
};

const properties = [
  { name: "Sunshine PG", city: "Bangalore", rooms: 30, occupancy: 87, revenue: 312000, complaints: 3 },
  { name: "Green Valley Hostel", city: "Hyderabad", rooms: 45, occupancy: 89, revenue: 540000, complaints: 5 },
  { name: "Urban Nest", city: "Bangalore", rooms: 25, occupancy: 72, revenue: 198000, complaints: 8 },
  { name: "Comfort Stay PG", city: "Bangalore", rooms: 20, occupancy: 75, revenue: 150000, complaints: 2 },
  { name: "Pearl Women's PG", city: "Bangalore", rooms: 20, occupancy: 95, revenue: 485000, complaints: 0 },
];

export default function OwnerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portfolio Overview</h1>
        <p className="text-sm text-gray-500 mt-1">All properties at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Building2 className="w-5 h-5" />} label="Properties" value={portfolioData.totalProperties.toString()} />
        <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Monthly Revenue" value={`₹${(portfolioData.monthlyRevenue / 100000).toFixed(1)}L`} change={12} />
        <StatCard icon={<DoorOpen className="w-5 h-5" />} label="Overall Occupancy" value={`${Math.round((portfolioData.occupiedRooms / portfolioData.totalRooms) * 100)}%`} change={3} />
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Guests" value={portfolioData.totalGuests.toString()} change={8} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Collection Rate" value={`${portfolioData.collectionRate}%`} change={5} />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Pending Amount" value={`₹${(portfolioData.pendingAmount / 1000).toFixed(0)}K`} />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Open Complaints" value={portfolioData.openComplaints.toString()} />
      </div>

      {/* Property Performance */}
      <Card>
        <CardHeader><CardTitle>Property Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {properties.map((p) => (
              <div key={p.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.city} · {p.rooms} rooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-lg font-bold text-indigo-600">₹{(p.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${p.occupancy >= 85 ? "text-green-600" : p.occupancy >= 70 ? "text-yellow-600" : "text-red-600"}`}>{p.occupancy}%</p>
                    <p className="text-xs text-gray-500">Occupancy</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${p.complaints === 0 ? "text-green-600" : p.complaints > 5 ? "text-red-600" : "text-yellow-600"}`}>{p.complaints}</p>
                    <p className="text-xs text-gray-500">Complaints</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
