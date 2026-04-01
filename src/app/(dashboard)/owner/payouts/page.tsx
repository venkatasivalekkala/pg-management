"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatCard } from "@/components/ui/stat-card";
import { IndianRupee, Wallet, Calendar } from "lucide-react";

const payouts = [
  { id: "PO001", property: "Sunshine PG", amount: 280000, deductions: 32000, net: 248000, date: "2026-03-25", status: "SUCCESS" },
  { id: "PO002", property: "Green Valley", amount: 510000, deductions: 30000, net: 480000, date: "2026-03-25", status: "SUCCESS" },
  { id: "PO003", property: "Urban Nest", amount: 185000, deductions: 13000, net: 172000, date: "2026-03-25", status: "PENDING" },
  { id: "PO004", property: "Pearl Women's", amount: 460000, deductions: 25000, net: 435000, date: "2026-03-25", status: "SUCCESS" },
  { id: "PO005", property: "Sunshine PG", amount: 290000, deductions: 28000, net: 262000, date: "2026-02-25", status: "SUCCESS" },
];

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<IndianRupee className="w-5 h-5" />} label="This Month" value="₹13.35L" />
        <StatCard icon={<Wallet className="w-5 h-5" />} label="Net (After Deductions)" value="₹12.07L" />
        <StatCard icon={<Calendar className="w-5 h-5" />} label="Next Payout" value="Apr 25" />
      </div>
      <Card>
        <CardHeader><CardTitle>Payout History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Payout</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-indigo-600">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.property}</TableCell>
                  <TableCell>₹{(p.amount / 1000).toFixed(0)}K</TableCell>
                  <TableCell className="text-red-600">-₹{(p.deductions / 1000).toFixed(0)}K</TableCell>
                  <TableCell className="font-semibold text-green-700">₹{(p.net / 1000).toFixed(0)}K</TableCell>
                  <TableCell className="text-sm">{p.date}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
