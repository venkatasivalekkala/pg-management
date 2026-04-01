"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loading";
import { useApi } from "@/hooks/use-api";
import { Plus, BedDouble, User, AlertCircle } from "lucide-react";

interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  roomType: string;
  sharingType: number;
  monthlyRent: number;
  dailyRent?: number;
  totalBeds: number;
  occupiedBeds: number;
  occupants: string[];
  amenities: string[];
  status: string;
}

interface Property {
  id: string;
  name: string;
  city: string;
}

const ROOM_TYPES = [
  { value: "SINGLE", label: "Single" },
  { value: "DOUBLE", label: "Double" },
  { value: "TRIPLE", label: "Triple" },
  { value: "DORMITORY", label: "Dormitory" },
];

const STATUS_OPTIONS = [
  { value: "VACANT", label: "Vacant" },
  { value: "OCCUPIED", label: "Occupied" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const statusColor: Record<string, string> = {
  OCCUPIED: "bg-red-100 border-red-300 text-red-800",
  VACANT: "bg-green-100 border-green-300 text-green-800",
  MAINTENANCE: "bg-yellow-100 border-yellow-300 text-yellow-800",
};

const emptyForm = {
  roomNumber: "",
  floor: "",
  roomType: "DOUBLE",
  sharingType: "",
  monthlyRent: "",
  dailyRent: "",
  totalBeds: "",
  amenities: "",
  status: "VACANT",
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [filterFloor, setFilterFloor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [mutating, setMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { loading: roomsLoading, error: roomsError, get: getRooms, setError: setRoomsError } = useApi();
  const { loading: propsLoading, error: propsError, get: getProperties } = useApi();

  // Fetch properties on mount
  useEffect(() => {
    getProperties("/api/properties?limit=100").then((res) => {
      if (res?.data) {
        setProperties(res.data);
        if (res.data.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId(res.data[0].id);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch rooms when property changes
  const fetchRooms = useCallback(async () => {
    if (!selectedPropertyId) return;
    const res = await getRooms(`/api/rooms?propertyId=${selectedPropertyId}&limit=100`);
    if (res?.data) {
      setRooms(res.data);
    }
  }, [selectedPropertyId, getRooms]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Derive floor options from the current rooms
  const floorOptions = useMemo(() => {
    const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);
    return [
      { value: "", label: "All Floors" },
      ...floors.map((f) => ({ value: f.toString(), label: `Floor ${f}` })),
    ];
  }, [rooms]);

  const filtered = rooms.filter((r) => {
    if (filterFloor && r.floor.toString() !== filterFloor) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: rooms.length,
    occupied: rooms.filter((r) => r.status === "OCCUPIED").length,
    vacant: rooms.filter((r) => r.status === "VACANT").length,
    maintenance: rooms.filter((r) => r.status === "MAINTENANCE").length,
  };

  // Form helpers
  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetAndCloseAdd = () => {
    setForm(emptyForm);
    setMutationError(null);
    setShowAddModal(false);
  };

  const resetAndCloseEdit = () => {
    setEditingRoom(null);
    setForm(emptyForm);
    setMutationError(null);
    setShowEditModal(false);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setForm({
      roomNumber: room.roomNumber,
      floor: room.floor.toString(),
      roomType: room.roomType,
      sharingType: room.sharingType.toString(),
      monthlyRent: room.monthlyRent.toString(),
      dailyRent: room.dailyRent?.toString() || "",
      totalBeds: room.totalBeds.toString(),
      amenities: room.amenities?.join(", ") || "",
      status: room.status,
    });
    setMutationError(null);
    setShowEditModal(true);
  };

  // Mutations
  const handleAddRoom = async () => {
    if (!selectedPropertyId) return;
    setMutating(true);
    setMutationError(null);

    try {
      const body: Record<string, unknown> = {
        propertyId: selectedPropertyId,
        roomNumber: form.roomNumber,
        floor: parseInt(form.floor),
        roomType: form.roomType,
        sharingType: parseInt(form.sharingType),
        monthlyRent: parseFloat(form.monthlyRent),
        totalBeds: parseInt(form.totalBeds),
        amenities: form.amenities ? form.amenities.split(",").map((a) => a.trim()).filter(Boolean) : [],
      };
      if (form.dailyRent) body.dailyRent = parseFloat(form.dailyRent);

      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setMutationError(data.error || "Failed to add room");
        return;
      }

      resetAndCloseAdd();
      fetchRooms();
    } catch {
      setMutationError("Network error. Please try again.");
    } finally {
      setMutating(false);
    }
  };

  const handleEditRoom = async () => {
    if (!editingRoom) return;
    setMutating(true);
    setMutationError(null);

    try {
      const body: Record<string, unknown> = {
        roomNumber: form.roomNumber,
        floor: parseInt(form.floor),
        roomType: form.roomType,
        sharingType: parseInt(form.sharingType),
        monthlyRent: parseFloat(form.monthlyRent),
        totalBeds: parseInt(form.totalBeds),
        status: form.status,
        amenities: form.amenities ? form.amenities.split(",").map((a) => a.trim()).filter(Boolean) : [],
      };
      if (form.dailyRent) body.dailyRent = parseFloat(form.dailyRent);

      const res = await fetch(`/api/rooms/${editingRoom.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setMutationError(data.error || "Failed to update room");
        return;
      }

      resetAndCloseEdit();
      fetchRooms();
    } catch {
      setMutationError("Network error. Please try again.");
    } finally {
      setMutating(false);
    }
  };

  const handleStatusChange = async (room: Room, newStatus: string) => {
    try {
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchRooms();
      }
    } catch {
      // silently fail for inline status toggle
    }
  };

  const isFormValid =
    form.roomNumber.trim() !== "" &&
    form.floor !== "" &&
    form.sharingType !== "" &&
    form.monthlyRent !== "" &&
    form.totalBeds !== "";

  const initialLoading = propsLoading && properties.length === 0;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
          <p className="text-sm text-gray-500 mt-1">Visual floor plan &amp; room allocation</p>
        </div>
        <div className="flex items-center gap-3">
          {properties.length > 1 && (
            <Select
              label=""
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              options={properties.map((p) => ({ value: p.id, label: `${p.name} (${p.city})` }))}
            />
          )}
          <Button onClick={() => { setForm(emptyForm); setMutationError(null); setShowAddModal(true); }} disabled={!selectedPropertyId}>
            <Plus className="w-4 h-4 mr-2" /> Add Room
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {(roomsError || propsError) && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{roomsError || propsError}</span>
          <button
            className="ml-auto text-red-500 hover:text-red-700 underline text-xs"
            onClick={() => { setRoomsError(null); fetchRooms(); }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Rooms</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.vacant}</p>
          <p className="text-xs text-green-600">Vacant</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.occupied}</p>
          <p className="text-xs text-red-600">Occupied</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-700">{stats.maintenance}</p>
          <p className="text-xs text-yellow-600">Maintenance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select
          label=""
          placeholder="All Floors"
          value={filterFloor}
          onChange={(e) => setFilterFloor(e.target.value)}
          options={floorOptions}
        />
        <Select
          label=""
          placeholder="All Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[{ value: "", label: "All Status" }, ...STATUS_OPTIONS]}
        />
      </div>

      {/* Room Grid */}
      {roomsLoading && rooms.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !selectedPropertyId ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Select a property to view rooms.
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {rooms.length === 0 ? "No rooms found. Add one to get started." : "No rooms match the selected filters."}
        </div>
      ) : (
        <div className="relative">
          {roomsLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-xl">
              <Spinner size="md" />
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map((room) => (
              <div
                key={room.id}
                onClick={() => openEditModal(room)}
                className={`rounded-xl border-2 p-3 cursor-pointer hover:shadow-md transition-all ${statusColor[room.status] || "bg-gray-100 border-gray-300 text-gray-800"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{room.roomNumber}</span>
                  <BedDouble className="w-4 h-4" />
                </div>
                <div className="text-xs font-medium mb-1">{room.roomType} · {room.sharingType}-Share</div>
                <div className="text-xs font-semibold mb-2">{"\u20B9"}{(room.monthlyRent / 1000).toFixed(1)}K/mo</div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: room.totalBeds }).map((_, i) => (
                    <User
                      key={i}
                      className={`w-3 h-3 ${i < (room.occupiedBeds || 0) ? "text-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                {room.occupants && room.occupants.length > 0 && (
                  <div className="mt-2 text-xs opacity-75 truncate">
                    {room.occupants.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-300" /> Vacant</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-300" /> Occupied</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-300" /> Maintenance</span>
        <span className="flex items-center gap-1"><User className="w-3 h-3 text-gray-900" /> Bed occupied</span>
        <span className="flex items-center gap-1"><User className="w-3 h-3 text-gray-300" /> Bed available</span>
      </div>

      {/* Add Room Modal */}
      <Modal open={showAddModal} onClose={resetAndCloseAdd}>
        <ModalHeader><ModalTitle>Add New Room</ModalTitle></ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {mutationError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{mutationError}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Room Number" placeholder="e.g., A-101" value={form.roomNumber} onChange={(e) => updateForm("roomNumber", e.target.value)} />
              <Input label="Floor" type="number" placeholder="1" value={form.floor} onChange={(e) => updateForm("floor", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Room Type" value={form.roomType} onChange={(e) => updateForm("roomType", e.target.value)} options={ROOM_TYPES} />
              <Input label="Sharing Type" type="number" placeholder="2" value={form.sharingType} onChange={(e) => updateForm("sharingType", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Monthly Rent" type="number" placeholder="8000" value={form.monthlyRent} onChange={(e) => updateForm("monthlyRent", e.target.value)} />
              <Input label="Daily Rent" type="number" placeholder="400" value={form.dailyRent} onChange={(e) => updateForm("dailyRent", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Total Beds" type="number" placeholder="2" value={form.totalBeds} onChange={(e) => updateForm("totalBeds", e.target.value)} />
              <Input label="Amenities (comma-separated)" placeholder="WiFi, AC, Laundry" value={form.amenities} onChange={(e) => updateForm("amenities", e.target.value)} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={resetAndCloseAdd} disabled={mutating}>Cancel</Button>
          <Button onClick={handleAddRoom} disabled={mutating || !isFormValid}>
            {mutating ? <><Spinner size="sm" className="mr-2" /> Adding...</> : "Add Room"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Room Modal */}
      <Modal open={showEditModal} onClose={resetAndCloseEdit}>
        <ModalHeader><ModalTitle>Edit Room {editingRoom?.roomNumber}</ModalTitle></ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {mutationError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{mutationError}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Room Number" placeholder="e.g., A-101" value={form.roomNumber} onChange={(e) => updateForm("roomNumber", e.target.value)} />
              <Input label="Floor" type="number" placeholder="1" value={form.floor} onChange={(e) => updateForm("floor", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Room Type" value={form.roomType} onChange={(e) => updateForm("roomType", e.target.value)} options={ROOM_TYPES} />
              <Input label="Sharing Type" type="number" placeholder="2" value={form.sharingType} onChange={(e) => updateForm("sharingType", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Monthly Rent" type="number" placeholder="8000" value={form.monthlyRent} onChange={(e) => updateForm("monthlyRent", e.target.value)} />
              <Input label="Daily Rent" type="number" placeholder="400" value={form.dailyRent} onChange={(e) => updateForm("dailyRent", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Total Beds" type="number" placeholder="2" value={form.totalBeds} onChange={(e) => updateForm("totalBeds", e.target.value)} />
              <Input label="Amenities (comma-separated)" placeholder="WiFi, AC, Laundry" value={form.amenities} onChange={(e) => updateForm("amenities", e.target.value)} />
            </div>
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => updateForm("status", e.target.value)}
              options={STATUS_OPTIONS}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={resetAndCloseEdit} disabled={mutating}>Cancel</Button>
          <Button onClick={handleEditRoom} disabled={mutating || !isFormValid}>
            {mutating ? <><Spinner size="sm" className="mr-2" /> Saving...</> : "Save Changes"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
