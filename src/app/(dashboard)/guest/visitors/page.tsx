"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loading";
import { useApi } from "@/hooks/use-api";
import { Plus, AlertCircle } from "lucide-react";

interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  expectedDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
}

const defaultForm = { name: "", phone: "", purpose: "", expectedDate: "" };

export default function GuestVisitorsPage() {
  const [showRegister, setShowRegister] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [form, setForm] = useState(defaultForm);

  const { loading, error, get, setError } = useApi();
  const { loading: submitting, error: submitError, post, setError: setSubmitError } = useApi();

  const fetchVisitors = useCallback(async () => {
    const res = await get("/api/visitors");
    if (res) {
      setVisitors(Array.isArray(res) ? res : res.data || []);
    }
  }, [get]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.purpose || !form.expectedDate) {
      setSubmitError("Please fill in all fields");
      return;
    }
    const res = await post("/api/visitors", {
      name: form.name,
      phone: form.phone,
      purpose: form.purpose,
      expectedDate: new Date(form.expectedDate).toISOString(),
    });
    if (res) {
      setForm(defaultForm);
      setShowRegister(false);
      fetchVisitors();
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (visitor: Visitor) => {
    if (visitor.checkInTime && visitor.checkOutTime) {
      const inTime = new Date(visitor.checkInTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
      const outTime = new Date(visitor.checkOutTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
      return `${inTime} - ${outTime}`;
    }
    if (visitor.checkInTime) {
      const inTime = new Date(visitor.checkInTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
      return `Checked in ${inTime}`;
    }
    if (visitor.expectedDate) {
      const time = new Date(visitor.expectedDate).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
      return `Expected ${time}`;
    }
    return "";
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Visitors</h1>
          <p className="text-sm text-gray-500 mt-1">Pre-register visitors for faster entry</p>
        </div>
        <Button onClick={() => setShowRegister(true)}><Plus className="w-4 h-4 mr-2" /> Register Visitor</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {loading && visitors.length === 0 ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : visitors.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p className="font-medium">No visitors registered yet</p>
            <p className="text-sm mt-1">Pre-register your visitors for faster check-in at the gate.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visitors.map(v => (
            <Card key={v.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{v.name}</p>
                  <p className="text-sm text-gray-500">{v.purpose} · {formatDate(v.expectedDate)}</p>
                  <p className="text-xs text-gray-400">{formatTime(v)}</p>
                </div>
                <StatusBadge status={v.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showRegister} onClose={() => { setShowRegister(false); setSubmitError(null); }}>
        <ModalHeader><ModalTitle>Register Visitor</ModalTitle></ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{submitError}</div>
            )}
            <Input label="Visitor Name" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Phone Number" placeholder="10-digit number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Purpose" placeholder="e.g., Family visit" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
            <Input label="Expected Date & Time" type="datetime-local" value={form.expectedDate} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowRegister(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Registering..." : "Register"}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
