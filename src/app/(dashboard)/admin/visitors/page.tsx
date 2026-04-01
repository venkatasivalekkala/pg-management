"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner, SkeletonTableRow } from "@/components/ui/loading";
import { useApi } from "@/hooks/use-api";
import { Plus, LogIn, LogOut, XCircle, Users } from "lucide-react";

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

export default function VisitorsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const { loading, error, get, setError } = useApi();
  const { loading: mutating, put, error: mutationError, setError: setMutationError } = useApi();

  const fetchVisitors = useCallback(async () => {
    const data = await get("/api/visitors");
    if (data) {
      setVisitors(data);
    }
  }, [get]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const updateVisitorStatus = async (id: string, status: string) => {
    setMutatingId(id);
    setMutationError(null);
    const result = await put(`/api/visitors/${id}`, { status });
    setMutatingId(null);
    if (result) {
      await fetchVisitors();
    }
  };

  const displayError = error || mutationError;

  const filtered = visitors.filter((v) => {
    if (search && !v.visitorName.toLowerCase().includes(search.toLowerCase()) && !v.guest.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && v.status !== statusFilter) return false;
    return true;
  });

  const todayStats = {
    total: visitors.length,
    checkedIn: visitors.filter(v => v.status === "CHECKED_IN").length,
    expected: visitors.filter(v => v.status === "EXPECTED").length,
    denied: visitors.filter(v => v.status === "DENIED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitor Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage visitor entries</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Log Visitor</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{todayStats.total}</p><p className="text-xs text-gray-500">Today&apos;s Visitors</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{todayStats.checkedIn}</p><p className="text-xs text-gray-500">Currently Inside</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{todayStats.expected}</p><p className="text-xs text-gray-500">Expected</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{todayStats.denied}</p><p className="text-xs text-gray-500">Denied</p></CardContent></Card>
      </div>

      {displayError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{displayError}</span>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => { setError(null); setMutationError(null); }}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput placeholder="Search visitor or guest name..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch("")} /></div>
        <Select label="" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "", label: "All Status" }, { value: "EXPECTED", label: "Expected" }, { value: "CHECKED_IN", label: "Checked In" }, { value: "CHECKED_OUT", label: "Checked Out" }, { value: "DENIED", label: "Denied" }]} />
      </div>

      <Card>
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
              title={visitors.length === 0 ? "No visitors yet" : "No visitors match your filters"}
              description={visitors.length === 0 ? "Visitor entries will appear here once logged." : "Try adjusting the search or status filter."}
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
                      <div><p className="font-medium">{visitor.visitorName}</p><p className="text-xs text-gray-500">{visitor.phone}</p></div>
                    </TableCell>
                    <TableCell>
                      <div><p className="font-medium">{visitor.guest}</p><p className="text-xs text-gray-500">{visitor.room !== "—" ? `Room ${visitor.room}` : ""}</p></div>
                    </TableCell>
                    <TableCell className="text-sm">{visitor.purpose}</TableCell>
                    <TableCell className="text-sm">{visitor.entryTime || "—"}</TableCell>
                    <TableCell className="text-sm">{visitor.exitTime || "—"}</TableCell>
                    <TableCell><StatusBadge status={visitor.status} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {visitor.status === "EXPECTED" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              disabled={mutating && mutatingId === visitor.id}
                              onClick={() => updateVisitorStatus(visitor.id, "CHECKED_IN")}
                            >
                              {mutating && mutatingId === visitor.id ? (
                                <Spinner size="sm" className="mr-1" />
                              ) : (
                                <LogIn className="w-3.5 h-3.5 mr-1" />
                              )}
                              Check In
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              disabled={mutating && mutatingId === visitor.id}
                              onClick={() => updateVisitorStatus(visitor.id, "DENIED")}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Deny
                            </Button>
                          </>
                        )}
                        {visitor.status === "CHECKED_IN" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600"
                            disabled={mutating && mutatingId === visitor.id}
                            onClick={() => updateVisitorStatus(visitor.id, "CHECKED_OUT")}
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
    </div>
  );
}
