"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { Spinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { IndianRupee, Download, CreditCard, Wallet } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  type: string;
  method: string;
  status: string;
  paidAt?: string;
  createdAt: string;
  invoiceUrl?: string;
  description?: string;
  dueDate?: string;
}

export default function GuestPaymentsPage() {
  const api = useApi();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function load() {
      const data = await api.get("/api/payments");
      if (data) {
        const list = Array.isArray(data) ? data : data.data || [];
        setPayments(list);
      }
      setLoaded(true);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loaded || api.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (api.error) {
    return (
      <EmptyState
        icon={<IndianRupee className="w-6 h-6" />}
        title="Failed to load payments"
        description={api.error}
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  const totalPaid = payments
    .filter((p) => p.status === "SUCCESS" || p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const depositPaid = payments
    .filter((p) => p.type === "DEPOSIT" && (p.status === "SUCCESS" || p.status === "PAID"))
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingDues = payments
    .filter((p) => p.status === "PENDING" || p.status === "UNPAID" || p.status === "OVERDUE")
    .reduce((sum, p) => sum + p.amount, 0);

  const nextDue = payments.find(
    (p) => p.status === "PENDING" || p.status === "UNPAID"
  );

  const filtered = payments.filter((p) => {
    if (typeFilter && p.type !== typeFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
        <p className="text-sm text-gray-500 mt-1">View payment history and pay rent</p>
      </div>

      {/* Current Dues */}
      {nextDue && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">
                  {nextDue.description || "Upcoming Rent"}
                </p>
                <p className="text-3xl font-bold text-indigo-700 mt-1">
                  {"\u20B9"}{nextDue.amount.toLocaleString()}
                </p>
                {nextDue.dueDate && (
                  <p className="text-sm text-indigo-500 mt-1">
                    Due: {new Date(nextDue.dueDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                )}
              </div>
              <Button size="lg">
                <CreditCard className="w-5 h-5 mr-2" /> Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          icon={<IndianRupee className="w-5 h-5" />}
          label="Total Paid"
          value={`\u20B9${(totalPaid / 1000).toFixed(totalPaid >= 1000 ? 0 : 1)}K`}
        />
        <StatCard
          icon={<Wallet className="w-5 h-5" />}
          label="Deposit Held"
          value={`\u20B9${(depositPaid / 1000).toFixed(depositPaid >= 1000 ? 0 : 1)}K`}
        />
        <StatCard
          icon={<CreditCard className="w-5 h-5" />}
          label="Pending Dues"
          value={`\u20B9${pendingDues.toLocaleString()}`}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select
          label=""
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: "", label: "All Types" },
            { value: "RENT", label: "Rent" },
            { value: "DEPOSIT", label: "Deposit" },
          ]}
        />
        <Select
          label=""
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "", label: "All Statuses" },
            { value: "SUCCESS", label: "Success" },
            { value: "PAID", label: "Paid" },
            { value: "PENDING", label: "Pending" },
            { value: "OVERDUE", label: "Overdue" },
          ]}
        />
      </div>

      {/* Payment History Table */}
      <Card>
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<IndianRupee className="w-6 h-6" />}
              title="No payments found"
              description="No payments match the selected filters."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {new Date(p.paidAt || p.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {p.description || p.type}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {"\u20B9"}{p.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.type} />
                    </TableCell>
                    <TableCell>{p.method || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      {(p.status === "SUCCESS" || p.status === "PAID") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (p.invoiceUrl) window.open(p.invoiceUrl, "_blank");
                          }}
                        >
                          <Download className="w-4 h-4" />
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
    </div>
  );
}
