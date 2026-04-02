"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BedDouble,
  Calendar,
  IndianRupee,
  AlertCircle,
  MessageSquare,
  Bell,
  Clock,
  Users,
  Eye,
} from "lucide-react";

interface Booking {
  id: string;
  roomId: string;
  status: string;
  checkInDate: string;
  rentAmount: number;
  nextDueDate: string;
  securityDeposit: number;
  property?: { name: string; address: string };
}

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: string;
  amenities: string[];
  beds: { id: string; occupant?: { name: string }; label: string }[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  isPinned?: boolean;
}

export default function MyRoomPage() {
  const api = useApi();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const bookingsData = await api.get("/api/bookings");
      if (bookingsData) {
        const active = Array.isArray(bookingsData)
          ? bookingsData.find((b: Booking) => b.status === "ACTIVE" || b.status === "CONFIRMED")
          : bookingsData;
        if (active) {
          setBooking(active);
          const roomData = await api.get(`/api/rooms/${active.roomId}`);
          if (roomData) setRoom(roomData);
        }
      }
      const announcementsData = await api.get("/api/announcements");
      if (announcementsData) {
        const list = Array.isArray(announcementsData) ? announcementsData : announcementsData.data || [];
        setAnnouncements(list.slice(0, 5));
      }
      setLoaded(true);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const daysUntilDue = booking?.nextDueDate
    ? Math.ceil((new Date(booking.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

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
        icon={<AlertCircle className="w-6 h-6" />}
        title="Failed to load room data"
        description={api.error}
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  if (!booking || !room) {
    return (
      <EmptyState
        icon={<BedDouble className="w-6 h-6" />}
        title="No active booking"
        description="You don't have an active room booking at the moment."
        action={<Button onClick={() => (window.location.href = "/guest/explore")}>Explore PGs</Button>}
      />
    );
  }

  const roommates = room.beds
    ?.filter((b) => b.occupant)
    .map((b) => ({ name: b.occupant!.name, bed: b.label })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Room</h1>
        <p className="text-sm text-gray-500 mt-1">
          {booking.property?.name || "Your PG"} &middot; {booking.property?.address || ""}
        </p>
      </div>

      {/* Rent Due Alert */}
      {daysUntilDue !== null && daysUntilDue <= 5 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-800">
                Rent due {daysUntilDue <= 0 ? "today" : `in ${daysUntilDue} days`}
              </p>
              <p className="text-sm text-yellow-700">
                {"\u20B9"}{booking.rentAmount?.toLocaleString()} due on {booking.nextDueDate}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => (window.location.href = "/guest/payments")}>
            Pay Now
          </Button>
        </div>
      )}

      {/* Room Info & Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="w-5 h-5" /> Room Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Room Number</span>
                <span className="font-semibold">{room.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Floor</span>
                <span className="font-semibold">{room.floor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-semibold">{room.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-in Date</span>
                <span className="font-semibold">{booking.checkInDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Monthly Rent</span>
                <span className="font-bold text-indigo-600">
                  {"\u20B9"}{booking.rentAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Security Deposit</span>
                <span className="font-semibold">
                  {"\u20B9"}{booking.securityDeposit?.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-500 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities?.map((a) => (
                    <Badge key={a} variant="default">{a}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Roommates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" /> Roommates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roommates.length === 0 ? (
                <p className="text-sm text-gray-500">No roommates assigned.</p>
              ) : (
                roommates.map((rm) => (
                  <div key={rm.name} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                        {rm.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{rm.name}</p>
                        <p className="text-xs text-gray-500">{rm.bed}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => (window.location.href = "/guest/payments")}
                >
                  <IndianRupee className="w-4 h-4 mr-2" /> Pay Rent
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => (window.location.href = "/guest/complaints")}
                >
                  <AlertCircle className="w-4 h-4 mr-2" /> Raise Complaint
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => (window.location.href = "/guest/visitors")}
                >
                  <Eye className="w-4 h-4 mr-2" /> Register Visitor
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => (window.location.href = "/guest/notices")}
                >
                  <Calendar className="w-4 h-4 mr-2" /> Notice Period
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" /> Recent Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-sm text-gray-500">No announcements yet.</p>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{a.title}</p>
                      <StatusBadge status={a.type} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{a.content?.slice(0, 100)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
