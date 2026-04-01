"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { IndianRupee, Download, CreditCard } from "lucide-react";

const paymentHistory = [
  { id: "PAY001", month: "March 2026", amount: 8000, method: "UPI", status: "SUCCESS", paidAt: "2026-03-01", invoiceUrl: "#" },
  { id: "PAY002", month: "February 2026", amount: 8000, method: "UPI", status: "SUCCESS", paidAt: "2026-02-02", invoiceUrl: "#" },
  { id: "PAY003", month: "January 2026", amount: 8000, method: "Card", status: "SUCCESS", paidAt: "2026-01-03", invoiceUrl: "#" },
  { id: "PAY004", month: "Security Deposit", amount: 16000, method: "Net Banking", status: "SUCCESS", paidAt: "2026-01-15", invoiceUrl: "#" },
];

export default function GuestPaymentsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
        <p className="text-sm text-gray-500 mt-1">View payment history and pay rent</p>
      </div>

      {/* Pay Rent Card */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">April 2026 Rent</p>
              <p className="text-3xl font-bold text-indigo-700 mt-1">₹8,000</p>
              <p className="text-sm text-indigo-500 mt-1">Due: April 1, 2026</p>
            </div>
            <Button size="lg"><CreditCard className="w-5 h-5 mr-2" /> Pay Now</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-green-600">₹24K</p><p className="text-xs text-gray-500">Total Paid</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-indigo-600">₹16K</p><p className="text-xs text-gray-500">Deposit Held</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-gray-900">₹0</p><p className="text-xs text-gray-500">Pending Dues</p></CardContent></Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentHistory.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{p.month}</p>
                    <p className="text-xs text-gray-500">Paid via {p.method} · {p.paidAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">₹{p.amount.toLocaleString()}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
