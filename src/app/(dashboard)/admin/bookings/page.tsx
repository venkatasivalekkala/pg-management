"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Spinner } from "@/components/ui/loading";
import { useApi } from "@/hooks/use-api";
import { Plus, Check, X, Eye } from "lucide-react";

interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  bedNumber?: number | null;
  checkInDate: string;
  checkOutDate: string | null;
  bookingAmount: number;
  securityDeposit: number;
  rentAmount: number;
  status: string;
  createdAt: string;
  guest: { id: string; name: string; email: string; phone: string };
  room: {
    id: string;
    roomNumber: string;
    floor: number;
    property?: { id: string; name: string };
  };
}

interface BookingsResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const emptyForm = {
  guestId: "",
  roomId: "",
  bedNumber: "",
  checkInDate: "",
  bookingAmount: "",
  securityDeposit: "",
  rentAmount: "",
};

export default function BookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const { loading, error, get, setError } = useApi();
  const { loading: mutationLoading, error: mutationError, post, put, setError: setMutationError } = useApi();

  const fetchBookings = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("limit", "100");
    if (statusFilter) params.set("status", statusFilter);
    const result: BookingsResponse | null = await get(`/api/bookings?${params.toString()}`);
    if (result) {
      setBookings(result.data);
    }
  }, [get, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filtered = bookings.filter((b) => {
    if (
      search &&
      !b.guest.name.toLowerCase().includes(search.toLowerCase()) &&
      !b.id.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleApprove = async (id: string) => {
    setMutatingId(id);
    const result = await put(`/api/bookings/${id}`, { status: "CONFIRMED" });
    setMutatingId(null);
    if (result) {
      await fetchBookings();
    }
  };

  const handleCancel = async (id: string) => {
    setMutatingId(id);
    const result = await put(`/api/bookings/${id}`, { status: "CANCELLED" });
    setMutatingId(null);
    if (result) {
      await fetchBookings();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMutationError(null);

    const payload = {
      guestId: form.guestId,
      roomId: form.roomId,
      bedNumber: form.bedNumber ? parseInt(form.bedNumber) : undefined,
      checkInDate: form.checkInDate,
      bookingAmount: parseFloat(form.bookingAmount),
      securityDeposit: parseFloat(form.securityDeposit),
      rentAmount: parseFloat(form.rentAmount),
    };

    const result = await post("/api/bookings", payload);
    if (result) {
      setShowCreateModal(false);
      setForm(emptyForm);
      await fetchBookings();
    }
  };

  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const statusCounts = {
    PENDING: bookings.filter((b) => b.status === "PENDING").length,
    CONFIRMED: bookings.filter((b) => b.status === "CONFIRMED").length,
    COMPLETED: bookings.filter((b) => b.status === "COMPLETED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage room bookings and reservations
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Booking
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {statusCounts.PENDING}
            </p>
            <p className="text-xs text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {statusCounts.CONFIRMED}
            </p>
            <p className="text-xs text-gray-500">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {statusCounts.COMPLETED}
            </p>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {statusCounts.CANCELLED}
            </p>
            <p className="text-xs text-gray-500">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by guest name or booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
        </div>
        <Select
          label=""
          placeholder="All Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "", label: "All Status" },
            { value: "PENDING", label: "Pending" },
            { value: "CONFIRMED", label: "Confirmed" },
            { value: "COMPLETED", label: "Completed" },
            { value: "CANCELLED", label: "Cancelled" },
          ]}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading && bookings.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {loading ? "Loading bookings..." : "No bookings found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium text-indigo-600">
                        {booking.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.guest.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.guest.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {booking.room.roomNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            Floor {booking.room.floor}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(booking.checkInDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {"\u20B9"}
                        {booking.rentAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(booking)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {booking.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                disabled={mutatingId === booking.id}
                                onClick={() => handleApprove(booking.id)}
                              >
                                {mutatingId === booking.id ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                disabled={mutatingId === booking.id}
                                onClick={() => handleCancel(booking.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Booking Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader onClose={() => setShowCreateModal(false)}>
          <ModalTitle>New Booking</ModalTitle>
          <ModalDescription>
            Fill in the details to create a new booking.
          </ModalDescription>
        </ModalHeader>
        <form onSubmit={handleCreate}>
          <ModalBody>
            <div className="space-y-4">
              {mutationError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {mutationError}
                </div>
              )}
              <Input
                label="Guest ID"
                placeholder="Enter guest ID"
                value={form.guestId}
                onChange={(e) => setForm({ ...form, guestId: e.target.value })}
                required
              />
              <Input
                label="Room ID"
                placeholder="Enter room ID"
                value={form.roomId}
                onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                required
              />
              <Input
                label="Bed Number"
                type="number"
                placeholder="Enter bed number (optional)"
                value={form.bedNumber}
                onChange={(e) =>
                  setForm({ ...form, bedNumber: e.target.value })
                }
              />
              <Input
                label="Check-in Date"
                type="date"
                value={form.checkInDate}
                onChange={(e) =>
                  setForm({ ...form, checkInDate: e.target.value })
                }
                required
              />
              <Input
                label="Booking Amount"
                type="number"
                placeholder="Enter booking amount"
                value={form.bookingAmount}
                onChange={(e) =>
                  setForm({ ...form, bookingAmount: e.target.value })
                }
                required
              />
              <Input
                label="Security Deposit"
                type="number"
                placeholder="Enter security deposit"
                value={form.securityDeposit}
                onChange={(e) =>
                  setForm({ ...form, securityDeposit: e.target.value })
                }
                required
              />
              <Input
                label="Rent Amount"
                type="number"
                placeholder="Enter monthly rent amount"
                value={form.rentAmount}
                onChange={(e) =>
                  setForm({ ...form, rentAmount: e.target.value })
                }
                required
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setMutationError(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutationLoading}>
              {mutationLoading ? <Spinner size="sm" className="mr-2" /> : null}
              Create Booking
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Booking Detail Modal */}
      <Modal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      >
        {selectedBooking && (
          <>
            <ModalHeader onClose={() => setShowDetailModal(false)}>
              <ModalTitle>Booking Details</ModalTitle>
              <ModalDescription>
                ID: {selectedBooking.id}
              </ModalDescription>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <StatusBadge status={selectedBooking.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Guest</span>
                  <span className="font-medium">{selectedBooking.guest.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span>{selectedBooking.guest.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span>{selectedBooking.guest.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Room</span>
                  <span className="font-medium">{selectedBooking.room.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Floor</span>
                  <span>{selectedBooking.room.floor}</span>
                </div>
                {selectedBooking.bedNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bed Number</span>
                    <span>{selectedBooking.bedNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Check-in</span>
                  <span>
                    {new Date(selectedBooking.checkInDate).toLocaleDateString()}
                  </span>
                </div>
                {selectedBooking.checkOutDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-out</span>
                    <span>
                      {new Date(selectedBooking.checkOutDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking Amount</span>
                  <span className="font-semibold">
                    {"\u20B9"}{selectedBooking.bookingAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Security Deposit</span>
                  <span className="font-semibold">
                    {"\u20B9"}{selectedBooking.securityDeposit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rent Amount</span>
                  <span className="font-semibold">
                    {"\u20B9"}{selectedBooking.rentAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
}
