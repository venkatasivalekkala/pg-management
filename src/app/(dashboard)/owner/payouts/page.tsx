"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
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
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { IndianRupee, Wallet, TrendingUp, Plus, Receipt } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  status: string;
  tenant?: { name: string };
  property?: { name: string };
  createdAt: string;
  paidAt?: string;
  method?: string;
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  description?: string;
  property?: { name: string; id: string };
  propertyId?: string;
  createdAt: string;
}

interface Property {
  id: string;
  name: string;
}

const emptyExpenseForm = {
  amount: "",
  category: "MAINTENANCE",
  description: "",
  propertyId: "",
};

export default function PayoutsPage() {
  const api = useApi();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [paymentsData, expensesData, propsData] = await Promise.all([
      api.get("/api/payments"),
      api.get("/api/expenses"),
      api.get("/api/properties"),
    ]);
    if (paymentsData) setPayments(Array.isArray(paymentsData) ? paymentsData : paymentsData.payments || paymentsData.data || []);
    if (expensesData) setExpenses(Array.isArray(expensesData) ? expensesData : expensesData.expenses || expensesData.data || []);
    if (propsData) setProperties(Array.isArray(propsData) ? propsData : propsData.properties || propsData.data || []);
    setLoaded(true);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddExpense = async () => {
    setSaving(true);
    const result = await api.post("/api/expenses", {
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      description: expenseForm.description,
      propertyId: expenseForm.propertyId || undefined,
    });
    if (result) {
      setShowExpenseModal(false);
      setExpenseForm(emptyExpenseForm);
      await fetchData();
    }
    setSaving(false);
  };

  if (!loaded && api.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (api.error && !loaded) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
        {api.error}
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const paidPayments = payments.filter((p) => p.status === "PAID");
  const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  // Monthly breakdown
  const monthlyData: Record<string, { revenue: number; expenses: number }> = {};
  paidPayments.forEach((p) => {
    const date = new Date(p.paidAt || p.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyData[key]) monthlyData[key] = { revenue: 0, expenses: 0 };
    monthlyData[key].revenue += p.amount || 0;
  });
  expenses.forEach((e) => {
    const date = new Date(e.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyData[key]) monthlyData[key] = { revenue: 0, expenses: 0 };
    monthlyData[key].expenses += e.amount || 0;
  });
  const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
  const monthlyBreakdown = sortedMonths.map((key) => {
    const [year, month] = key.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return {
      label: date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      ...monthlyData[key],
      net: monthlyData[key].revenue - monthlyData[key].expenses,
    };
  });

  // Recent payments sorted by date
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  // Recent expenses sorted by date
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Revenue, expenses, and net profit</p>
        </div>
        <Button onClick={() => setShowExpenseModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Expense
        </Button>
      </div>

      {api.error && loaded && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm flex items-center justify-between">
          <span>{api.error}</span>
          <button onClick={() => api.setError(null)} className="text-red-500 hover:text-red-700 text-xs font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <StatCard icon={<Wallet className="w-5 h-5" />} label="Total Expenses" value={formatCurrency(totalExpenses)} />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Net Profit"
          value={formatCurrency(netProfit)}
        />
      </div>

      {/* Recent Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentPayments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Receipt className="w-6 h-6" />}
                title="No payments yet"
                description="Payments will appear here once tenants make payments."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.tenant?.name || "N/A"}</TableCell>
                    <TableCell>{p.property?.name || "N/A"}</TableCell>
                    <TableCell className="font-semibold">₹{(p.amount || 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-sm text-gray-500 capitalize">
                      {(p.method || "N/A").replace(/_/g, " ").toLowerCase()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(p.paidAt || p.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Expense Tracking */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expense Tracking</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentExpenses.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Wallet className="w-6 h-6" />}
                title="No expenses recorded"
                description="Track your property expenses here."
                action={
                  <Button onClick={() => setShowExpenseModal(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Expense
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentExpenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium capitalize">
                      {(e.category || "Other").replace(/_/g, " ").toLowerCase()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                      {e.description || "-"}
                    </TableCell>
                    <TableCell>{e.property?.name || "General"}</TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      ₹{(e.amount || 0).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(e.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      {monthlyBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Expenses</TableHead>
                  <TableHead>Net Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyBreakdown.map((m) => (
                  <TableRow key={m.label}>
                    <TableCell className="font-medium">{m.label}</TableCell>
                    <TableCell className="text-green-700 font-semibold">{formatCurrency(m.revenue)}</TableCell>
                    <TableCell className="text-red-600">{formatCurrency(m.expenses)}</TableCell>
                    <TableCell className={`font-semibold ${m.net >= 0 ? "text-green-700" : "text-red-600"}`}>
                      {formatCurrency(m.net)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Expense Modal */}
      <Modal open={showExpenseModal} onClose={() => setShowExpenseModal(false)}>
        <ModalHeader onClose={() => setShowExpenseModal(false)}>
          <ModalTitle>Add Expense</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Amount (₹)"
              type="number"
              placeholder="e.g. 5000"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            />
            <Select
              label="Category"
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              options={[
                { value: "MAINTENANCE", label: "Maintenance" },
                { value: "UTILITIES", label: "Utilities" },
                { value: "SALARY", label: "Salary" },
                { value: "SUPPLIES", label: "Supplies" },
                { value: "RENT", label: "Rent" },
                { value: "INSURANCE", label: "Insurance" },
                { value: "MARKETING", label: "Marketing" },
                { value: "OTHER", label: "Other" },
              ]}
            />
            <Select
              label="Property (optional)"
              value={expenseForm.propertyId}
              onChange={(e) => setExpenseForm({ ...expenseForm, propertyId: e.target.value })}
              placeholder="Select a property"
              options={properties.map((p) => ({ value: p.id, label: p.name }))}
            />
            <Textarea
              label="Description"
              placeholder="What was this expense for?"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              rows={3}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowExpenseModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddExpense}
            loading={saving}
            disabled={!expenseForm.amount || parseFloat(expenseForm.amount) <= 0}
          >
            Add Expense
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
