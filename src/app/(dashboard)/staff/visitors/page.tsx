"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner, SkeletonTableRow } from "@/components/ui/loading";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { useApi } from "@/hooks/use-api";
import {
  Plus,
  LogIn,
  LogOut,
  Users,
  XCircle,
} from "lucide-react";

interface Visitor {
  id: string;
  visitorName: string;
  phone: string;
  guest: string;
  room: string;
  purpose: string;
  entryTime: string | null;
  exitTime: string | null;
  status: string;
}

interface NewVisitorForm {
  name: string;
  phone: string;
  purpose: string;
  guestId: string;
}

const emptyForm: NewVisitorForm = {
  name: "",
  phone: "",
  purpose: "",
  guestId: "",
};

export default function StaffVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewVisitorForm>(emptyForm);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const { loading, error, get, setError } = useApi();
  const {
    loading: mutating,
    put,
    error: mutationError,
    setError: setMutationError,
  } = useApi();
  const {
    loading: creating,
    post,
    error: createError,
    setError: setCreateError,
  } = useApi();

  const fetchVisitors = useCallback(async () => {
    const data = await get("/api/visitors");
    if (data) setVisitors(data);
  }, [get]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const updateVisitorStatus = async (id: string, status: string) => {
    setMutatingId(id);
    setMutationError(null);
    const result = await put(`/api/visitors/${id}`, { status });
    setMutatingId(null);
    if (result) await fetchVisitors();
  };

  const handleCreateVisitor = async () => {
    setCreateError(null);
    if (!form.name.trim() || !form.phone.trim() || !form.purpose.trim()) {
      setCreateError("Please fill in all required fields.");
      return;
    }
    const result = await post("/api/visitors", {
      name: form.name.trim(),
      phone: form.phone.trim(),
      purpose: form.purpose.trim(),
      guestId: form.guestId.trim() || undefined,
    });
    if (result) {
      setForm(emptyForm);
      setShowModal(false);
      await fetchVisitors();
    }
  };

  const displayError = error || mutationError;

  const filtered = visitors.filter((v) => {
    if (
      search &&
      !v.visitorName.toLowerCase().includes(search.toLowerCase()) &&
      !v.guest.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const todayStats = {
    total: visitors.length,
    checkedIn: visitors.filter((v) => v.status === "CHECKED_IN").length,
    expected: visitors.filter((v) => v.status === "EXPECTED").length,
    checkedOut: visitors.filter((v) => v.status === "CHECKED_OUT").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitor Log</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage visitor entries and exits.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Log New Visitor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{todayStats.total}</p>
            <p className="text-xs text-gray-500">Today&apos;s Visitors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {todayStats.checkedIn}
            </p>
            <p className="text-xs text-gray-500">Currently Inside</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {todayStats.expected}
            </p>
            <p className="text-xs text-gray-500">Expected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">
              {todayStats.checkedOut}
            </p>
            <p className="text-xs text-gray-500">Checked Out</p>
          </CardContent>
        </Card>
      </div>

      {displayError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{displayError}</span>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => {
              setError(null);
              setMutationError(null);
            }}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="flex-1">
        <SearchInput
          placeholder="Search visitor or guest name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
      </div>

      {/* Visitor Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today&apos;s Visitor Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonTableRow key={i} columns={7} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title={
                visitors.length === 0
                  ? "No visitors logged today"
                  : "No visitors match your search"
              }
              description={
                visitors.length === 0
                  ? "Use the button above to log a new visitor entry."
                  : "Try adjusting the search term."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Visiting</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Exit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{visitor.visitorName}</p>
                        <p className="text-xs text-gray-500">{visitor.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{visitor.guest}</p>
                        {visitor.room !== "\u2014" && (
                          <p className="text-xs text-gray-500">
                            Room {visitor.room}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{visitor.purpose}</TableCell>
                    <TableCell className="text-sm">
                      {visitor.entryTime || "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {visitor.exitTime || "\u2014"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={visitor.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {visitor.status === "EXPECTED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            disabled={mutating && mutatingId === visitor.id}
                            onClick={() =>
                              updateVisitorStatus(visitor.id, "CHECKED_IN")
                            }
                          >
                            {mutating && mutatingId === visitor.id ? (
                              <Spinner size="sm" className="mr-1" />
                            ) : (
                              <LogIn className="w-3.5 h-3.5 mr-1" />
                            )}
                            Check In
                          </Button>
                        )}
                        {visitor.status === "CHECKED_IN" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600"
                            disabled={mutating && mutatingId === visitor.id}
                            onClick={() =>
                              updateVisitorStatus(visitor.id, "CHECKED_OUT")
                            }
                          >
                            {mutating && mutatingId === visitor.id ? (
                              <Spinner size="sm" className="mr-1" />
                            ) : (
                              <LogOut className="w-3.5 h-3.5 mr-1" />
                            )}
                            Check Out
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New Visitor Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader onClose={() => setShowModal(false)}>
          <ModalTitle>Log New Visitor</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {createError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
              <span>{createError}</span>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => setCreateError(null)}
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Visitor Name *
              </label>
              <Input
                placeholder="Enter visitor name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <Input
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Guest ID (optional)
              </label>
              <Input
                placeholder="Enter guest ID being visited"
                value={form.guestId}
                onChange={(e) => setForm({ ...form, guestId: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Purpose of Visit *
              </label>
              <Textarea
                placeholder="Describe the purpose of the visit"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowModal(false);
              setForm(emptyForm);
              setCreateError(null);
            }}
          >
            Cancel
          </Button>
          <Button loading={creating} onClick={handleCreateVisitor}>
            Log Visitor
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
