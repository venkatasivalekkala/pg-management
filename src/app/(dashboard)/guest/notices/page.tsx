"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/loading";
import { useApi } from "@/hooks/use-api";
import { LogOut, AlertCircle, Calendar, CheckCircle, Clock, FileText } from "lucide-react";

interface NoticePeriodEntry {
  id: string;
  bookingId: string;
  noticeDays: number;
  expectedEndDate: string;
  status: string;
  reason: string | null;
  requestDate: string;
  booking?: { room?: { roomNumber: string }; rentAmount: number; securityDeposit: number };
}

interface Booking {
  id: string;
  status: string;
  checkInDate: string;
  rentAmount: number;
  securityDeposit: number;
  room?: { roomNumber: string; floor: number };
}

export default function GuestNoticesPage() {
  const [notices, setNotices] = useState<NoticePeriodEntry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ bookingId: "", noticeDays: "30", expectedEndDate: "", reason: "" });

  const { loading, error, get, setError } = useApi();
  const { loading: submitting, error: submitError, post, put, setError: setSubmitError } = useApi();
  const bookingsApi = useApi();

  const fetchData = useCallback(async () => {
    const [noticeRes, bookingRes] = await Promise.all([
      get("/api/notice-periods"),
      bookingsApi.get("/api/bookings"),
    ]);
    if (noticeRes) setNotices(Array.isArray(noticeRes) ? noticeRes : noticeRes.data || []);
    if (bookingRes) {
      const all = Array.isArray(bookingRes) ? bookingRes : bookingRes.data || [];
      setBookings(all.filter((b: Booking) => b.status === "CONFIRMED"));
    }
  }, [get, bookingsApi]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    const bookingId = form.bookingId || bookings[0]?.id;
    if (!bookingId || !form.expectedEndDate) {
      setSubmitError("Please select a booking and expected end date");
      return;
    }
    const res = await post("/api/notice-periods", {
      bookingId,
      noticeDays: parseInt(form.noticeDays),
      expectedEndDate: new Date(form.expectedEndDate).toISOString(),
      reason: form.reason || undefined,
    });
    if (res) {
      setForm({ bookingId: "", noticeDays: "30", expectedEndDate: "", reason: "" });
      setShowModal(false);
      fetchData();
    }
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm("Withdraw your notice period request?")) return;
    const res = await put(`/api/notice-periods/${id}`, { status: "WITHDRAWN" });
    if (res) fetchData();
  };

  const activeBooking = bookings[0];
  const activeNotice = notices.find(n => n.status === "REQUESTED" || n.status === "APPROVED");

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notice Period</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your check-out and notice period</p>
        </div>
        {activeBooking && !activeNotice && (
          <Button onClick={() => setShowModal(true)}>
            <LogOut className="w-4 h-4 mr-2" /> Submit Notice
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500">✕</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <>
          {/* Current Booking Info */}
          {activeBooking && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Current Booking</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Room</p>
                    <p className="font-semibold">{activeBooking.room?.roomNumber || "—"}, Floor {activeBooking.room?.floor}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Check-in Date</p>
                    <p className="font-semibold">{new Date(activeBooking.checkInDate).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Monthly Rent</p>
                    <p className="font-semibold">₹{activeBooking.rentAmount?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Security Deposit</p>
                    <p className="font-semibold">₹{activeBooking.securityDeposit?.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Notice */}
          {activeNotice && (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">Notice Period Active</h3>
                      <StatusBadge status={activeNotice.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Notice Days:</span>
                        <span className="ml-2 font-medium">{activeNotice.noticeDays} days</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Requested:</span>
                        <span className="ml-2 font-medium">{new Date(activeNotice.requestDate).toLocaleDateString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expected End:</span>
                        <span className="ml-2 font-medium">{new Date(activeNotice.expectedEndDate).toLocaleDateString("en-IN")}</span>
                      </div>
                      {activeNotice.reason && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Reason:</span>
                          <span className="ml-2">{activeNotice.reason}</span>
                        </div>
                      )}
                    </div>
                    {activeNotice.status === "REQUESTED" && (
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => handleWithdraw(activeNotice.id)}>
                        Withdraw Notice
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Check-out Checklist */}
          {activeNotice && activeNotice.status === "APPROVED" && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Check-out Checklist</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "Clear all pending rent dues",
                    "Return room key / access card",
                    "Schedule room inspection with admin",
                    "Collect belongings",
                    "Get security deposit refund details",
                    "Provide forwarding address",
                    "Leave a review for the property",
                  ].map((item, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Past Notices */}
          {notices.filter(n => n.status === "COMPLETED" || n.status === "WITHDRAWN").length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Past Notices</h3>
              <div className="space-y-2">
                {notices.filter(n => n.status === "COMPLETED" || n.status === "WITHDRAWN").map(n => (
                  <Card key={n.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="text-sm">
                        <p className="font-medium">{n.noticeDays}-day notice</p>
                        <p className="text-gray-500">Requested {new Date(n.requestDate).toLocaleDateString("en-IN")}</p>
                      </div>
                      <StatusBadge status={n.status} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!activeBooking && notices.length === 0 && (
            <Card><CardContent className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No active booking</p>
              <p className="text-sm mt-1">You need an active booking to submit a notice period.</p>
            </CardContent></Card>
          )}
        </>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader><ModalTitle>Submit Notice Period</ModalTitle></ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {submitError && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{submitError}</div>}
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Once submitted, your notice period will begin. Ensure you are ready to vacate by the expected end date.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.noticeDays} onChange={e => setForm({ ...form, noticeDays: e.target.value })}>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
              </select>
            </div>
            <Input label="Expected End Date" type="date" value={form.expectedEndDate} onChange={e => setForm({ ...form, expectedEndDate: e.target.value })} />
            <Textarea label="Reason (optional)" placeholder="Why are you leaving?" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit Notice"}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
