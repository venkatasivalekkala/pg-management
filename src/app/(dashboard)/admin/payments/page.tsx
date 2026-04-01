"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatCard } from "@/components/ui/stat-card";
import { IndianRupee, Download, Send, TrendingUp, AlertTriangle } from "lucide-react";

const mockPayments = [
  { id: "PAY001", guestName: "Rahul Sharma", room: "A-101", amount: 8000, type: "RENT", method: "UPI", status: "SUCCESS", dueDate: "2026-03-01", paidAt: "2026-03-01", month: "March 2026" },
  { id: "PAY002", guestName: "Priya Patel", room: "B-205", amount: 12000, type: "RENT", method: "CARD", status: "SUCCESS", dueDate: "2026-03-01", paidAt: "2026-03-03", month: "March 2026" },
  { id: "PAY003", guestName: "Amit Kumar", room: "A-304", amount: 6500, type: "RENT", method: "UPI", status: "PENDING", dueDate: "2026-03-01", paidAt: null, month: "March 2026" },
  { id: "PAY004", guestName: "Sneha Reddy", room: "C-102", amount: 17000, type: "DEPOSIT", method: "NETBANKING", status: "SUCCESS", dueDate: "2026-03-27", paidAt: "2026-03-27", month: "March 2026" },
  { id: "PAY005", guestName: "Vikram Singh", room: "B-108", amount: 12000, type: "RENT", method: "UPI", status: "FAILED", dueDate: "2026-03-01", paidAt: null, month: "March 2026" },
  { id: "PAY006", guestName: "Meera Tiwari", room: "C-301", amount: 13000, type: "RENT", method: "WALLET", status: "SUCCESS", dueDate: "2026-03-01", paidAt: "2026-03-02", month: "March 2026" },
  { id: "PAY007", guestName: "Neha Gupta", room: "C-303", amount: 6500, type: "RENT", method: "CASH", status: "SUCCESS", dueDate: "2026-03-01", paidAt: "2026-03-05", month: "March 2026" },
  { id: "PAY008", guestName: "Arjun Nair", room: "A-103", amount: 2000, type: "PENALTY", method: "UPI", status: "PENDING", dueDate: "2026-03-15", paidAt: null, month: "March 2026" },
];

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filtered = mockPayments.filter((p) => {
    if (search && !p.guestName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (typeFilter && p.type !== typeFilter) return false;
    return true;
  });

  const totalCollected = mockPayments.filter(p => p.status === "SUCCESS").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = mockPayments.filter(p => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Track rent collection and financial transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
          <Button><Send className="w-4 h-4 mr-2" /> Send Reminders</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Total Collected" value={`₹${(totalCollected/1000).toFixed(1)}K`} change={12} />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Pending Amount" value={`₹${(totalPending/1000).toFixed(1)}K`} />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Collection Rate" value="87%" change={5} />
        <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Defaulters" value={mockPayments.filter(p => p.status === "PENDING" || p.status === "FAILED").length.toString()} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput placeholder="Search by guest name..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch("")} />
        </div>
        <Select label="" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "", label: "All Status" }, { value: "SUCCESS", label: "Success" }, { value: "PENDING", label: "Pending" }, { value: "FAILED", label: "Failed" }]} />
        <Select label="" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={[{ value: "", label: "All Types" }, { value: "RENT", label: "Rent" }, { value: "DEPOSIT", label: "Deposit" }, { value: "PENALTY", label: "Penalty" }, { value: "REFUND", label: "Refund" }]} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium text-indigo-600">{payment.id}</TableCell>
                  <TableCell>
                    <div><p className="font-medium">{payment.guestName}</p><p className="text-xs text-gray-500">Room {payment.room}</p></div>
                  </TableCell>
                  <TableCell><StatusBadge status={payment.type} /></TableCell>
                  <TableCell className="font-semibold">₹{payment.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{payment.method}</TableCell>
                  <TableCell className="text-sm">{payment.dueDate}</TableCell>
                  <TableCell><StatusBadge status={payment.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
