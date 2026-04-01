"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { IndianRupee, Users, TrendingUp, TrendingDown, Download, Building2 } from "lucide-react";

const monthlyRevenue = [
  { month: "Oct", value: 1250000 },
  { month: "Nov", value: 1380000 },
  { month: "Dec", value: 1420000 },
  { month: "Jan", value: 1520000 },
  { month: "Feb", value: 1590000 },
  { month: "Mar", value: 1685000 },
];

const cityDistribution = [
  { city: "Bangalore", properties: 4, revenue: 1145000, share: 68 },
  { city: "Hyderabad", properties: 1, revenue: 540000, share: 32 },
];

export default function AnalyticsPage() {
  const maxRev = Math.max(...monthlyRevenue.map(m => m.value));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Revenue, growth, and performance insights</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export Report</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Monthly Revenue" value="₹16.8L" change={6.0} />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Annual Revenue (Proj.)" value="₹2.02Cr" change={18} />
        <StatCard icon={<Users className="w-5 h-5" />} label="Guest Retention" value="78%" change={-2} />
        <StatCard icon={<Building2 className="w-5 h-5" />} label="Avg Revenue/Property" value="₹3.37L" change={5} />
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader><CardTitle>Revenue Trend (6 Months)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthlyRevenue.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-8">{m.month}</span>
                <div className="flex-1 h-8 bg-gray-100 rounded relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded" style={{ width: `${(m.value / maxRev) * 100}%` }} />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-20 text-right">₹{(m.value / 100000).toFixed(1)}L</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City Distribution */}
        <Card>
          <CardHeader><CardTitle>Revenue by City</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cityDistribution.map((c) => (
                <div key={c.city}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{c.city} ({c.properties} properties)</span>
                    <span className="text-sm font-semibold text-indigo-600">₹{(c.revenue / 100000).toFixed(1)}L ({c.share}%)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader><CardTitle>Key Insights</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { metric: "Avg rent per bed", value: "₹8,200/mo", trend: "up" },
                { metric: "Guest acquisition cost", value: "₹450", trend: "down" },
                { metric: "Avg stay duration", value: "8.5 months", trend: "up" },
                { metric: "Churn rate", value: "12%/quarter", trend: "down" },
                { metric: "Maintenance cost/room", value: "₹320/mo", trend: "up" },
                { metric: "NPS Score", value: "42", trend: "up" },
              ].map((item) => (
                <div key={item.metric} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <span className="text-sm text-gray-600">{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.value}</span>
                    {item.trend === "up" ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
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
