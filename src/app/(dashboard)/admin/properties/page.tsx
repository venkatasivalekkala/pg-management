"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner, SkeletonCard } from "@/components/ui/loading";
import { useApi } from "@/hooks/use-api";
import { Plus, MapPin, Star, Users, DoorOpen, Edit, Eye, Trash2, AlertCircle } from "lucide-react";

interface Property {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  genderType: string;
  amenities?: string[];
  rules?: string[];
  photos?: string[];
  isActive: boolean;
  isListed?: boolean;
  totalRooms?: number;
  occupiedRooms?: number;
  avgRating?: number;
  monthlyRevenue?: number;
  rooms?: unknown[];
  owner?: { id: string; name: string; email: string };
}

interface PropertyFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  genderType: string;
  amenities: string;
  rules: string;
  photos: string;
}

const emptyForm: PropertyFormData = {
  name: "",
  description: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  genderType: "",
  amenities: "",
  rules: "",
  photos: "",
};

function formToPayload(form: PropertyFormData) {
  return {
    name: form.name,
    description: form.description || undefined,
    address: form.address,
    city: form.city,
    state: form.state,
    pincode: form.pincode,
    genderType: form.genderType,
    amenities: form.amenities
      ? form.amenities.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    rules: form.rules
      ? form.rules.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    photos: form.photos
      ? form.photos.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
  };
}

function propertyToForm(p: Property): PropertyFormData {
  return {
    name: p.name,
    description: p.description || "",
    address: p.address,
    city: p.city,
    state: p.state || "",
    pincode: p.pincode || "",
    genderType: p.genderType,
    amenities: (p.amenities || []).join(", "),
    rules: (p.rules || []).join(", "),
    photos: (p.photos || []).join(", "),
  };
}

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [form, setForm] = useState<PropertyFormData>(emptyForm);

  const { loading: listLoading, error: listError, get, setError: setListError } = useApi();
  const { loading: mutating, error: mutateError, post, put, del, setError: setMutateError } = useApi();

  const fetchProperties = useCallback(async () => {
    const result = await get("/api/properties?limit=100");
    if (result) {
      setProperties(result.data || []);
    }
  }, [get]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFormChange = (field: keyof PropertyFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = async () => {
    const payload = formToPayload(form);
    if (!payload.name || !payload.address || !payload.city || !payload.state || !payload.pincode || !payload.genderType) {
      setMutateError("Please fill in all required fields: name, address, city, state, pincode, and gender type.");
      return;
    }
    const result = await post("/api/properties", payload);
    if (result) {
      setShowAddModal(false);
      setForm(emptyForm);
      setMutateError(null);
      await fetchProperties();
    }
  };

  const handleEdit = async () => {
    if (!selectedProperty) return;
    const payload = formToPayload(form);
    const result = await put(`/api/properties/${selectedProperty.id}`, payload);
    if (result) {
      setShowEditModal(false);
      setSelectedProperty(null);
      setForm(emptyForm);
      setMutateError(null);
      await fetchProperties();
    }
  };

  const handleDelete = async () => {
    if (!selectedProperty) return;
    const result = await del(`/api/properties/${selectedProperty.id}`);
    if (result) {
      setShowDeleteModal(false);
      setSelectedProperty(null);
      setMutateError(null);
      await fetchProperties();
    }
  };

  const openEditModal = (property: Property) => {
    setSelectedProperty(property);
    setForm(propertyToForm(property));
    setMutateError(null);
    setShowEditModal(true);
  };

  const openDeleteModal = (property: Property) => {
    setSelectedProperty(property);
    setMutateError(null);
    setShowDeleteModal(true);
  };

  const filtered = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalRooms = properties.reduce((sum, p) => sum + (p.rooms?.length || p.totalRooms || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-500 mt-1">
            {listLoading ? "Loading..." : `${properties.length} properties managed`}
          </p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setMutateError(null); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {listError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{listError}</span>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => { setListError(null); fetchProperties(); }}>
            Retry
          </Button>
        </div>
      )}

      <SearchInput
        placeholder="Search properties by name or city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch("")}
      />

      {listLoading && properties.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !listLoading && properties.length === 0 && !listError ? (
        <EmptyState
          icon={<DoorOpen className="w-7 h-7" />}
          title="No properties yet"
          description="Add your first property to get started."
          action={
            <Button onClick={() => { setForm(emptyForm); setMutateError(null); setShowAddModal(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="h-36 bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center">
                  <DoorOpen className="w-12 h-12 text-indigo-300" />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{property.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {property.address}, {property.city}
                      </p>
                    </div>
                    <Badge variant={property.genderType === "MALE" ? "info" : property.genderType === "FEMALE" ? "warning" : "default"}>
                      {property.genderType}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    {property.avgRating != null && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        {property.avgRating}
                      </span>
                    )}
                    {(property.totalRooms != null || property.rooms) && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <Users className="w-3.5 h-3.5" />
                        {property.occupiedRooms ?? 0}/{property.rooms?.length ?? property.totalRooms ?? 0} occupied
                      </span>
                    )}
                    <StatusBadge status={property.isActive ? "ACTIVE" : "INACTIVE"} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    {property.monthlyRevenue != null ? (
                      <span className="text-sm font-semibold text-gray-900">
                        {"\u20B9"}{(property.monthlyRevenue / 1000).toFixed(0)}K/mo
                      </span>
                    ) : (
                      <span />
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditModal(property)}>
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDeleteModal(property)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && properties.length > 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={<MapPin className="w-7 h-7" />}
                title="No matching properties"
                description={`No properties match "${search}". Try a different search term.`}
              />
            </div>
          )}
        </div>
      )}

      {/* Add Property Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader>
          <ModalTitle>Add New Property</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {mutateError && showAddModal && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{mutateError}</span>
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Property Name"
              placeholder="e.g., Sunshine PG for Men"
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
            />
            <Textarea
              label="Description"
              placeholder="Describe your property..."
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Address"
                placeholder="Street address"
                value={form.address}
                onChange={(e) => handleFormChange("address", e.target.value)}
              />
              <Select
                label="City"
                value={form.city}
                onChange={(e) => handleFormChange("city", e.target.value)}
                options={[
                  { value: "", label: "Select city" },
                  { value: "Bangalore", label: "Bangalore" },
                  { value: "Hyderabad", label: "Hyderabad" },
                  { value: "Mumbai", label: "Mumbai" },
                  { value: "Delhi", label: "Delhi" },
                  { value: "Pune", label: "Pune" },
                  { value: "Chennai", label: "Chennai" },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="State"
                placeholder="State"
                value={form.state}
                onChange={(e) => handleFormChange("state", e.target.value)}
              />
              <Input
                label="Pincode"
                placeholder="560001"
                value={form.pincode}
                onChange={(e) => handleFormChange("pincode", e.target.value)}
              />
            </div>
            <Select
              label="Gender Type"
              value={form.genderType}
              onChange={(e) => handleFormChange("genderType", e.target.value)}
              options={[
                { value: "", label: "Select gender type" },
                { value: "MALE", label: "Male" },
                { value: "FEMALE", label: "Female" },
                { value: "COED", label: "Co-Ed" },
              ]}
            />
            <Input
              label="Amenities"
              placeholder="WiFi, AC, Laundry (comma-separated)"
              value={form.amenities}
              onChange={(e) => handleFormChange("amenities", e.target.value)}
            />
            <Input
              label="Rules"
              placeholder="No smoking, No pets (comma-separated)"
              value={form.rules}
              onChange={(e) => handleFormChange("rules", e.target.value)}
            />
            <Input
              label="Photo URLs"
              placeholder="https://... (comma-separated)"
              value={form.photos}
              onChange={(e) => handleFormChange("photos", e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={mutating}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={mutating}>
            {mutating ? <><Spinner size="sm" className="mr-2" /> Creating...</> : "Create Property"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Property Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
        <ModalHeader>
          <ModalTitle>Edit Property</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {mutateError && showEditModal && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{mutateError}</span>
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Property Name"
              placeholder="e.g., Sunshine PG for Men"
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
            />
            <Textarea
              label="Description"
              placeholder="Describe your property..."
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Address"
                placeholder="Street address"
                value={form.address}
                onChange={(e) => handleFormChange("address", e.target.value)}
              />
              <Select
                label="City"
                value={form.city}
                onChange={(e) => handleFormChange("city", e.target.value)}
                options={[
                  { value: "", label: "Select city" },
                  { value: "Bangalore", label: "Bangalore" },
                  { value: "Hyderabad", label: "Hyderabad" },
                  { value: "Mumbai", label: "Mumbai" },
                  { value: "Delhi", label: "Delhi" },
                  { value: "Pune", label: "Pune" },
                  { value: "Chennai", label: "Chennai" },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="State"
                placeholder="State"
                value={form.state}
                onChange={(e) => handleFormChange("state", e.target.value)}
              />
              <Input
                label="Pincode"
                placeholder="560001"
                value={form.pincode}
                onChange={(e) => handleFormChange("pincode", e.target.value)}
              />
            </div>
            <Select
              label="Gender Type"
              value={form.genderType}
              onChange={(e) => handleFormChange("genderType", e.target.value)}
              options={[
                { value: "", label: "Select gender type" },
                { value: "MALE", label: "Male" },
                { value: "FEMALE", label: "Female" },
                { value: "COED", label: "Co-Ed" },
              ]}
            />
            <Input
              label="Amenities"
              placeholder="WiFi, AC, Laundry (comma-separated)"
              value={form.amenities}
              onChange={(e) => handleFormChange("amenities", e.target.value)}
            />
            <Input
              label="Rules"
              placeholder="No smoking, No pets (comma-separated)"
              value={form.rules}
              onChange={(e) => handleFormChange("rules", e.target.value)}
            />
            <Input
              label="Photo URLs"
              placeholder="https://... (comma-separated)"
              value={form.photos}
              onChange={(e) => handleFormChange("photos", e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={mutating}>
            Cancel
          </Button>
          <Button onClick={handleEdit} disabled={mutating}>
            {mutating ? <><Spinner size="sm" className="mr-2" /> Saving...</> : "Save Changes"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>
          <ModalTitle>Delete Property</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {mutateError && showDeleteModal && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{mutateError}</span>
            </div>
          )}
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>{selectedProperty?.name}</strong>? This action will deactivate the property.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={mutating}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={mutating}>
            {mutating ? <><Spinner size="sm" className="mr-2" /> Deleting...</> : "Delete Property"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
