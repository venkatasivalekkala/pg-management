"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { IndianRupee, Users, DoorOpen, TrendingUp, Download, Building2 } from "lucide-react";

const revenueData = [
  { month: "Oct", revenue: 320000, collected: 290000 },
  { month: "Nov", revenue: 345000, collected: 310000 },
  { month: "Dec", revenue: 360000, collected: 340000 },
  { month: "Jan", revenue: 380000, collected: 355000 },
  { month: "Feb", revenue: 420000, collected: 395000 },
  { month: "Mar", revenue: 485000, collected: 422000 },
];

const propertyPerformance = [
  { name: "Sunshine PG", occupancy: 87, revenue: 312000, complaints: 3, rating: 4.2 },
  { name: "Green Valley Hostel", occupancy: 89, revenue: 540000, complaints: 5, rating: 4.5 },
  { name: "Urban Nest", occupancy: 72, revenue: 198000, complaints: 8, rating: 3.8 },
  { name: "Comfort Stay PG", occupancy: 75, revenue: 150000, complaints: 2, rating: 4.0 },
];

const defaulters = [
  { name: "Amit Kumar", room: "A-304", pending: 13000, months: 2 },
  { name: "Vikram Singh", room: "B-108", pending: 12000, months: 1 },
  { name: "Arjun Nair", room: "A-103", pending: 14000, months: 1 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState("monthly");
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Business intelligence and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select label="" value={period} onChange={(e) => setPeriod(e.target.value)} options={[{ value: "monthly", label: "Monthly" }, { value: "quarterly", label: "Quarterly" }, { value: "yearly", label: "Yearly" }]} />
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Total Revenue" value="₹4.85L" change={15.4} />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Collection Rate" value="87%" change={3.2} />
        <StatCard icon={<DoorOpen className="w-5 h-5" />} label="Avg Occupancy" value="82%" change={5} />
        <StatCard icon={<Users className="w-5 h-5" />} label="Guest Retention" value="78%" change={-2} />
      </div>

      {/* Revenue Chart (CSS-based) */}
      <Card>
        <CardHeader><CardTitle>Revenue Trend (Last 6 Months)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenueData.map((d) => (
              <div key={d.month} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-8">{d.month}</span>
                <div className="flex-1 relative h-8">
                  <div className="absolute inset-y-0 left-0 bg-indigo-100 rounded-r" style={{ width: `${(d.revenue / maxRevenue) * 100}%` }} />
                  <div className="absolute inset-y-0 left-0 bg-indigo-500 rounded-r" style={{ width: `${(d.collected / maxRevenue) * 100}%` }} />
                  <div className="absolute inset-y-0 flex items-center right-2">
                    <span className="text-xs font-semibold text-gray-700">₹{(d.collected / 1000).toFixed(0)}K / ₹{(d.revenue / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-500" /> Collected</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-100" /> Expected</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Performance */}
        <Card>
          <CardHeader><CardTitle>Property Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyPerformance.map((p) => (
                <div key={p.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">Occupancy: {p.occupancy}% · ⭐ {p.rating}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-indigo-600">₹{(p.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">{p.complaints} complaints</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Defaulters */}
        <Card>
          <CardHeader><CardTitle className="text-red-600">Defaulter List</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {defaulters.map((d) => (
                <div key={d.name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="font-semibold text-sm">{d.name}</p>
                    <p className="text-xs text-gray-500">Room {d.room} · {d.months} month{d.months > 1 ? "s" : ""} overdue</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">₹{d.pending.toLocaleString()}</p>
                    <Button size="sm" variant="outline" className="mt-1 text-xs">Send Reminder</Button>
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
