"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatCard } from "@/components/ui/stat-card";
import { Spinner } from "@/components/ui/loading";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { useApi } from "@/hooks/use-api";
import { Users, UserCheck, UserX, Eye, Phone, Mail, Shield } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Booking {
  id: string;
  guestId: string;
  status: string;
  checkInDate: string;
  checkOutDate: string | null;
  rentAmount: number;
  securityDeposit: number;
  room?: { roomNumber: string; floor: number };
  guest?: { name: string; email: string; phone: string | null };
}

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const { loading, error, get, setError } = useApi();
  const bookingsApi = useApi();

  const fetchData = useCallback(async () => {
    const [guestRes, bookingRes] = await Promise.all([
      get("/api/users?role=GUEST"),
      bookingsApi.get("/api/bookings"),
    ]);
    if (guestRes) setGuests(Array.isArray(guestRes) ? guestRes : guestRes.data || []);
    if (bookingRes) setBookings(Array.isArray(bookingRes) ? bookingRes : bookingRes.data || []);
  }, [get, bookingsApi]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const guestBooking = (guestId: string) => bookings.find(b => b.guestId === guestId && (b.status === "CONFIRMED" || b.status === "PENDING"));

  const filtered = guests.filter(g => {
    const q = search.toLowerCase();
    return g.name.toLowerCase().includes(q) || g.email.toLowerCase().includes(q) || (g.phone || "").includes(q);
  });

  const activeGuests = guests.filter(g => g.isActive).length;
  const verifiedGuests = guests.filter(g => g.isVerified).length;
  const withBooking = guests.filter(g => guestBooking(g.id)).length;

  const selectedBookings = selectedGuest ? bookings.filter(b => b.guestId === selectedGuest.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Guest Directory</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all residents and their details</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Guests" value={guests.length} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Active" value={activeGuests} icon={<UserCheck className="w-5 h-5" />} />
        <StatCard label="Verified" value={verifiedGuests} icon={<Shield className="w-5 h-5" />} />
        <StatCard label="With Booking" value={withBooking} icon={<UserCheck className="w-5 h-5" />} />
      </div>

      <SearchInput placeholder="Search by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch("")} />

      {loading && guests.length === 0 ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">{search ? "No guests match your search" : "No guests registered yet"}</p>
        </CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(g => {
                const booking = guestBooking(g.id);
                return (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" />{g.email}</div>
                        {g.phone && <div className="flex items-center gap-1 text-gray-500"><Phone className="w-3 h-3 text-gray-400" />{g.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking?.room ? (
                        <Badge variant="default">Room {booking.room.roomNumber}</Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={g.isActive ? "ACTIVE" : "INACTIVE"} />
                    </TableCell>
                    <TableCell>
                      {g.isVerified ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm"><Shield className="w-3.5 h-3.5" /> Verified</span>
                      ) : (
                        <span className="text-yellow-600 text-sm">Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(g.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedGuest(g)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Guest Detail Modal */}
      <Modal open={!!selectedGuest} onClose={() => setSelectedGuest(null)}>
        <ModalHeader><ModalTitle>Guest Profile</ModalTitle></ModalHeader>
        <ModalBody>
          {selectedGuest && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {selectedGuest.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedGuest.name}</h3>
                  <p className="text-sm text-gray-500">{selectedGuest.email}</p>
                  {selectedGuest.phone && <p className="text-sm text-gray-500">{selectedGuest.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500">Status</span>
                  <p className="font-medium mt-1">{selectedGuest.isActive ? "Active" : "Inactive"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500">KYC</span>
                  <p className="font-medium mt-1">{selectedGuest.isVerified ? "Verified" : "Pending"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500">Joined</span>
                  <p className="font-medium mt-1">{new Date(selectedGuest.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500">Bookings</span>
                  <p className="font-medium mt-1">{selectedBookings.length}</p>
                </div>
              </div>

              {selectedBookings.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Booking History</h4>
                  <div className="space-y-2">
                    {selectedBookings.map(b => (
                      <div key={b.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                        <div className="text-sm">
                          <p className="font-medium">Room {b.room?.roomNumber || "—"}</p>
                          <p className="text-gray-500">{new Date(b.checkInDate).toLocaleDateString("en-IN")} — {b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString("en-IN") : "Ongoing"}</p>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={b.status} />
                          <p className="text-sm font-medium mt-1">₹{b.rentAmount?.toLocaleString()}/mo</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedGuest(null)}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
