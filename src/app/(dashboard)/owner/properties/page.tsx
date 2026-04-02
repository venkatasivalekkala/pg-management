"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import {
  Plus,
  Building2,
  MapPin,
  Settings,
  Pencil,
  Trash2,
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  genderType: string;
  description?: string;
  amenities?: string[];
  rules?: string[];
  status: string;
  rating?: number;
  rooms?: Array<{ id: string; status: string }>;
  _count?: { rooms: number };
}

const emptyForm = {
  name: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  genderType: "CO_ED",
  description: "",
  amenities: "",
  rules: "",
};

export default function OwnerPropertiesPage() {
  const api = useApi();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProperties = async () => {
    const data = await api.get("/api/properties");
    if (data) {
      const list = Array.isArray(data) ? data : data.properties || data.data || [];
      setProperties(list);
    }
    setLoaded(true);
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingProperty(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (p: Property) => {
    setEditingProperty(p);
    setForm({
      name: p.name || "",
      address: p.address || "",
      city: p.city || "",
      state: p.state || "",
      pincode: p.pincode || "",
      genderType: p.genderType || "CO_ED",
      description: p.description || "",
      amenities: (p.amenities || []).join(", "),
      rules: (p.rules || []).join(", "),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const body = {
      ...form,
      amenities: form.amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      rules: form.rules
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    let result;
    if (editingProperty) {
      result = await api.put(`/api/properties/${editingProperty.id}`, body);
    } else {
      result = await api.post("/api/properties", body);
    }

    if (result) {
      setShowModal(false);
      setForm(emptyForm);
      setEditingProperty(null);
      await fetchProperties();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    setDeleting(id);
    const result = await api.del(`/api/properties/${id}`);
    if (result !== null) {
      await fetchProperties();
    }
    setDeleting(null);
  };

  const filtered = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      (p.address || "").toLowerCase().includes(search.toLowerCase())
  );

  if (!loaded && api.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (api.error && !loaded) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
        {api.error}
      </div>
    );
  }

  const getRoomCount = (p: Property) => {
    if (p.rooms) return p.rooms.length;
    if (p._count?.rooms) return p._count.rooms;
    return 0;
  };

  const getOccupancy = (p: Property) => {
    if (!p.rooms || p.rooms.length === 0) return 0;
    const occupied = p.rooms.filter((r) => r.status === "OCCUPIED").length;
    return Math.round((occupied / p.rooms.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-sm text-gray-500 mt-1">
            {properties.length} {properties.length === 1 ? "property" : "properties"} in portfolio
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" /> Add Property
        </Button>
      </div>

      {api.error && loaded && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm flex items-center justify-between">
          <span>{api.error}</span>
          <button onClick={() => api.setError(null)} className="text-red-500 hover:text-red-700 text-xs font-medium">
            Dismiss
          </button>
        </div>
      )}

      {properties.length > 0 && (
        <SearchInput
          placeholder="Search properties by name, city, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {filtered.length === 0 && loaded ? (
        <EmptyState
          icon={<Building2 className="w-6 h-6" />}
          title={search ? "No properties match your search" : "No properties yet"}
          description={search ? "Try a different search term." : "Add your first property to get started."}
          action={
            !search ? (
              <Button onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" /> Add Property
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-lg">{p.name}</h3>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {p.address}, {p.city}
                        {p.state ? `, ${p.state}` : ""}
                        {p.pincode ? ` - ${p.pincode}` : ""}
                      </p>
                      <div className="flex items-center gap-6 mt-3 text-sm">
                        <span>
                          <strong>{getRoomCount(p)}</strong> rooms
                        </span>
                        <span>
                          <strong>{getOccupancy(p)}%</strong> occupancy
                        </span>
                        {p.genderType && (
                          <span className="text-gray-500 capitalize">
                            {p.genderType.replace(/_/g, " ").toLowerCase()}
                          </span>
                        )}
                        {p.rating !== undefined && p.rating !== null && (
                          <span className="text-amber-600 font-medium">
                            {p.rating.toFixed(1)} rating
                          </span>
                        )}
                      </div>
                      {p.description && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-1">{p.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(p)}
                    >
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      loading={deleting === p.id}
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Property Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader onClose={() => setShowModal(false)}>
          <ModalTitle>
            {editingProperty ? "Edit Property" : "Add New Property"}
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <Input
              label="Property Name"
              placeholder="e.g. Sunshine PG for Men"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Address"
              placeholder="e.g. 123, 4th Block, Koramangala"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="e.g. Bangalore"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <Input
                label="State"
                placeholder="e.g. Karnataka"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Pincode"
                placeholder="e.g. 560034"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
              <Select
                label="Gender Type"
                value={form.genderType}
                onChange={(e) => setForm({ ...form, genderType: e.target.value })}
                options={[
                  { value: "MALE", label: "Male Only" },
                  { value: "FEMALE", label: "Female Only" },
                  { value: "CO_ED", label: "Co-Ed" },
                ]}
              />
            </div>
            <Textarea
              label="Description"
              placeholder="Describe the property..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
            <Input
              label="Amenities"
              placeholder="WiFi, AC, Laundry, Parking (comma-separated)"
              value={form.amenities}
              onChange={(e) => setForm({ ...form, amenities: e.target.value })}
              helperText="Separate multiple amenities with commas"
            />
            <Input
              label="Rules"
              placeholder="No smoking, No visitors after 10 PM (comma-separated)"
              value={form.rules}
              onChange={(e) => setForm({ ...form, rules: e.target.value })}
              helperText="Separate multiple rules with commas"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving} disabled={!form.name || !form.city}>
            {editingProperty ? "Update Property" : "Create Property"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
