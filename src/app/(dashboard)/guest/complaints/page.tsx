"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/loading";
import { useApi } from "@/hooks/use-api";
import { Plus, Clock, CheckCircle } from "lucide-react";

interface TimelineEntry {
  status: string;
  date: string;
  note: string;
}

interface Complaint {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  description: string;
  photos: string[];
  assignee: { id: string; name: string } | null;
  property: { id: string; name: string } | null;
  room: { id: string; roomNumber: string } | null;
  guest: { id: string; name: string; email: string } | null;
  timeline?: TimelineEntry[];
}

const defaultForm = {
  propertyId: "",
  roomId: "",
  category: "OTHER",
  title: "",
  description: "",
  priority: "MEDIUM",
  photos: [] as string[],
};

export default function GuestComplaintsPage() {
  const [showNew, setShowNew] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [form, setForm] = useState(defaultForm);

  const { loading: fetchLoading, error: fetchError, get, setError } = useApi();
  const { loading: submitLoading, error: submitError, post } = useApi();

  const fetchComplaints = useCallback(async () => {
    const res = await get("/api/complaints");
    if (res) {
      setComplaints(Array.isArray(res) ? res : res.data ?? []);
    }
  }, [get]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    const result = await post("/api/complaints", {
      propertyId: form.propertyId || undefined,
      roomId: form.roomId || undefined,
      category: form.category,
      title: form.title,
      description: form.description,
      priority: form.priority,
      photos: form.photos,
    });
    if (result) {
      setShowNew(false);
      setForm(defaultForm);
      await fetchComplaints();
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const error = fetchError || submitError;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-sm text-gray-500 mt-1">Raise and track complaints</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Complaint
        </Button>
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

      {fetchLoading && complaints.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : complaints.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No complaints yet. Click &quot;New Complaint&quot; to raise one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.title}</h3>
                    <p className="text-sm text-gray-500">
                      {c.category} · {c.priority} Priority · {formatDate(c.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-sm text-gray-600 mb-4">{c.description}</p>
                {c.assignee && (
                  <p className="text-sm text-indigo-600 mb-3">
                    Assigned to: {c.assignee.name}
                  </p>
                )}

                {/* Timeline */}
                {c.timeline && c.timeline.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">TIMELINE</p>
                    <div className="space-y-2">
                      {c.timeline.map((t, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              t.status === "RESOLVED"
                                ? "bg-green-100"
                                : "bg-indigo-100"
                            }`}
                          >
                            {t.status === "RESOLVED" ? (
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {t.note}
                            </p>
                            <p className="text-xs text-gray-400">{t.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)}>
        <ModalHeader>
          <ModalTitle>Raise a Complaint</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="Brief description of the issue"
              value={form.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
            />
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => handleFormChange("category", e.target.value)}
              options={[
                { value: "PLUMBING", label: "Plumbing" },
                { value: "ELECTRICAL", label: "Electrical" },
                { value: "CLEANING", label: "Cleaning" },
                { value: "FURNITURE", label: "Furniture" },
                { value: "FOOD", label: "Food Quality" },
                { value: "NOISE", label: "Noise" },
                { value: "SECURITY", label: "Security" },
                { value: "OTHER", label: "Other" },
              ]}
            />
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => handleFormChange("priority", e.target.value)}
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
                { value: "URGENT", label: "Urgent" },
              ]}
            />
            <Textarea
              label="Description"
              placeholder="Describe the issue in detail..."
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowNew(false)}
            disabled={submitLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitLoading || !form.title.trim() || !form.description.trim()}
          >
            {submitLoading ? "Submitting..." : "Submit Complaint"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
