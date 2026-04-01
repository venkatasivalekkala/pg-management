"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/loading";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { useApi } from "@/hooks/use-api";
import { AlertCircle, Clock, CheckCircle, UserCheck } from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  guest: string;
  room: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  assignedTo: string | null;
  description: string;
}

const priorityColor: Record<string, string> = {
  LOW: "text-green-700 bg-green-50",
  MEDIUM: "text-yellow-700 bg-yellow-50",
  HIGH: "text-orange-700 bg-orange-50",
  URGENT: "text-red-700 bg-red-50",
};

export default function ComplaintsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    null
  );
  const [staffId, setStaffId] = useState("");

  const {
    loading: fetchLoading,
    error: fetchError,
    get,
    setError,
  } = useApi();
  const { loading: mutationLoading, put, error: mutationError } = useApi();

  const fetchComplaints = useCallback(async () => {
    const data = await get("/api/complaints");
    if (data) {
      setComplaints(data);
    }
  }, [get]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleAssignClick = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    setStaffId("");
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedComplaintId || !staffId.trim()) return;
    const result = await put(`/api/complaints/${selectedComplaintId}`, {
      status: "ASSIGNED",
      assignedTo: staffId.trim(),
    });
    if (result) {
      setAssignModalOpen(false);
      setSelectedComplaintId(null);
      setStaffId("");
      await fetchComplaints();
    }
  };

  const handleResolve = async (complaintId: string) => {
    const result = await put(`/api/complaints/${complaintId}`, {
      status: "RESOLVED",
    });
    if (result) {
      await fetchComplaints();
    }
  };

  const filtered = complaints.filter((c) => {
    if (
      search &&
      !c.title.toLowerCase().includes(search.toLowerCase()) &&
      !c.guest.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusFilter && c.status !== statusFilter) return false;
    if (priorityFilter && c.priority !== priorityFilter) return false;
    return true;
  });

  const error = fetchError || mutationError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Complaints & Maintenance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and resolve guest complaints
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-xl font-bold">
                {complaints.filter((c) => c.status === "OPEN").length}
              </p>
              <p className="text-xs text-gray-500">Open</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-xl font-bold">
                {complaints.filter((c) => c.status === "ASSIGNED").length}
              </p>
              <p className="text-xs text-gray-500">Assigned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-xl font-bold">
                {complaints.filter((c) => c.status === "IN_PROGRESS").length}
              </p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-xl font-bold">
                {
                  complaints.filter(
                    (c) => c.status === "RESOLVED" || c.status === "CLOSED"
                  ).length
                }
              </p>
              <p className="text-xs text-gray-500">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search complaints..."
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
            { value: "OPEN", label: "Open" },
            { value: "ASSIGNED", label: "Assigned" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "RESOLVED", label: "Resolved" },
            { value: "CLOSED", label: "Closed" },
          ]}
        />
        <Select
          label=""
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={[
            { value: "", label: "All Priority" },
            { value: "URGENT", label: "Urgent" },
            { value: "HIGH", label: "High" },
            { value: "MEDIUM", label: "Medium" },
            { value: "LOW", label: "Low" },
          ]}
        />
      </div>

      {fetchLoading && complaints.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No complaints found.
              </CardContent>
            </Card>
          ) : (
            filtered.map((complaint) => (
              <Card
                key={complaint.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {complaint.title}
                        </h3>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColor[complaint.priority]}`}
                        >
                          {complaint.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {complaint.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {complaint.guest} · Room {complaint.room}
                        </span>
                        <span>{complaint.category}</span>
                        <span>{complaint.createdAt}</span>
                        {complaint.assignedTo && (
                          <span className="text-indigo-600">
                            Assigned to: {complaint.assignedTo}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={complaint.status} />
                      {complaint.status === "OPEN" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={mutationLoading}
                          onClick={() => handleAssignClick(complaint.id)}
                        >
                          Assign
                        </Button>
                      )}
                      {(complaint.status === "ASSIGNED" ||
                        complaint.status === "IN_PROGRESS") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600"
                          disabled={mutationLoading}
                          onClick={() => handleResolve(complaint.id)}
                        >
                          {mutationLoading ? "Resolving..." : "Resolve"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)}>
        <ModalHeader onClose={() => setAssignModalOpen(false)}>
          <ModalTitle>Assign Complaint</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <label
            htmlFor="staff-id"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Assign to (Staff name or ID)
          </label>
          <input
            id="staff-id"
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Raju (Maintenance)"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setAssignModalOpen(false)}
            disabled={mutationLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignSubmit}
            disabled={mutationLoading || !staffId.trim()}
          >
            {mutationLoading ? "Assigning..." : "Assign"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
