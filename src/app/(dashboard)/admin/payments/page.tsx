"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/loading";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { IndianRupee, AlertTriangle, TrendingUp, Clock, Plus, CheckCircle } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  type: string;
  method?: string;
  status: string;
  dueDate?: string;
  paidAt?: string;
  createdAt?: string;
  booking?: {
    id: string;
    user?: { name: string; email: string };
    room?: { roomNumber: string };
  };
  bookingId?: string;
}

interface Booking {
  id: string;
  user?: { name: string; email: string };
  room?: { roomNumber: string };
  status: string;
}

export default function PaymentsPage() {
  const api = useApi();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    bookingId: "",
    amount: "",
    type: "RENT",
    method: "UPI",
    dueDate: "",
  });

  const fetchData = async () => {
    const [paymentsRes, bookingsRes] = await Promise.all([
      api.get("/api/payments"),
      api.get("/api/bookings?status=CONFIRMED"),
    ]);
    if (paymentsRes) setPayments(Array.isArray(paymentsRes) ? paymentsRes : paymentsRes.payments || []);
    if (bookingsRes) setBookings(Array.isArray(bookingsRes) ? bookingsRes : bookingsRes.bookings || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordPayment = async () => {
    const res = await api.post("/api/payments", {
      ...paymentForm,
      amount: Number(paymentForm.amount),
    });
    if (res) {
      setShowRecordPayment(false);
      setPaymentForm({ bookingId: "", amount: "", type: "RENT", method: "UPI", dueDate: "" });
      fetchData();
    }
  };

  const handleMarkPaid = async (paymentId: string) => {
    const res = await api.put(`/api/payments/${paymentId}`, {
      status: "SUCCESS",
      paidAt: new Date().toISOString(),
    });
    if (res) fetchData();
  };

  const filtered = payments.filter((p) => {
    const guestName = p.booking?.user?.name || "";
    if (search && !guestName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (dateFrom && p.dueDate && new Date(p.dueDate) < new Date(dateFrom)) return false;
    if (dateTo && p.dueDate && new Date(p.dueDate) > new Date(dateTo)) return false;
    return true;
  });

  const totalCollected = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments
    .filter((p) => p.status === "PENDING" && p.dueDate && new Date(p.dueDate) < new Date())
    .reduce((sum, p) => sum + p.amount, 0);
  const thisMonth = payments
    .filter((p) => {
      const now = new Date();
      const paidDate = p.paidAt ? new Date(p.paidAt) : null;
      return p.status === "SUCCESS" && paidDate && paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  if (api.loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Track rent collection and financial transactions</p>
        </div>
        <Button onClick={() => setShowRecordPayment(true)}>
          <Plus className="w-4 h-4 mr-2" /> Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Total Collected" value={`\u20B9${formatCurrency(totalCollected)}`} />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={`\u20B9${formatCurrency(totalPending)}`} />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Overdue" value={`\u20B9${formatCurrency(totalOverdue)}`} />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="This Month" value={`\u20B9${formatCurrency(thisMonth)}`} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by guest name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
        </div>
        <Select
          label=""
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "", label: "All Status" },
            { value: "PENDING", label: "Pending" },
            { value: "SUCCESS", label: "Success" },
            { value: "FAILED", label: "Failed" },
          ]}
        />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder="From"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder="To"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<IndianRupee className="w-6 h-6" />}
                title="No payments found"
                description="No payments match your current filters."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.booking?.user?.name || "-"}</p>
                        <p className="text-xs text-gray-500">{payment.booking?.user?.email || ""}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.booking?.room?.roomNumber || "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.type} />
                    </TableCell>
                    <TableCell className="font-semibold">
                      {"\u20B9"}{payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">{payment.method || "-"}</TableCell>
                    <TableCell className="text-sm">
                      {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>
                      {(payment.status === "PENDING" || payment.status === "FAILED") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkPaid(payment.id)}
                          disabled={api.loading}
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Modal */}
      <Modal open={showRecordPayment} onClose={() => setShowRecordPayment(false)}>
        <ModalHeader onClose={() => setShowRecordPayment(false)}>
          <ModalTitle>Record Payment</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Select
              label="Booking"
              value={paymentForm.bookingId}
              onChange={(e) => setPaymentForm((f) => ({ ...f, bookingId: e.target.value }))}
              placeholder="Select booking"
              options={bookings.map((b) => ({
                value: b.id,
                label: `${b.user?.name || "Guest"} - Room ${b.room?.roomNumber || "N/A"}`,
              }))}
            />
            <Input
              label="Amount"
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="Enter amount"
            />
            <Select
              label="Payment Type"
              value={paymentForm.type}
              onChange={(e) => setPaymentForm((f) => ({ ...f, type: e.target.value }))}
              options={[
                { value: "RENT", label: "Rent" },
                { value: "DEPOSIT", label: "Deposit" },
                { value: "PENALTY", label: "Penalty" },
                { value: "REFUND", label: "Refund" },
              ]}
            />
            <Select
              label="Payment Method"
              value={paymentForm.method}
              onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value }))}
              options={[
                { value: "UPI", label: "UPI" },
                { value: "CASH", label: "Cash" },
                { value: "CARD", label: "Card" },
                { value: "NETBANKING", label: "Net Banking" },
                { value: "WALLET", label: "Wallet" },
              ]}
            />
            <Input
              label="Due Date"
              type="date"
              value={paymentForm.dueDate}
              onChange={(e) => setPaymentForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </div>
          {api.error && <p className="mt-3 text-sm text-red-600">{api.error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowRecordPayment(false)}>Cancel</Button>
          <Button onClick={handleRecordPayment} disabled={api.loading}>
            {api.loading ? <Spinner size="sm" /> : "Record Payment"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
