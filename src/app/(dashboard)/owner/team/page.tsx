"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Shield, Pencil, Trash2, Users } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status?: string;
  createdAt?: string;
  property?: { id: string; name: string };
  propertyId?: string;
}

interface Property {
  id: string;
  name: string;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "STAFF",
  propertyId: "",
};

export default function TeamPage() {
  const api = useApi();
  const [admins, setAdmins] = useState<TeamMember[]>([]);
  const [staff, setStaff] = useState<TeamMember[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchTeam = async () => {
    const [adminsData, staffData, propsData] = await Promise.all([
      api.get("/api/users?role=ADMIN"),
      api.get("/api/users?role=STAFF"),
      api.get("/api/properties"),
    ]);
    if (adminsData) setAdmins(Array.isArray(adminsData) ? adminsData : adminsData.users || adminsData.data || []);
    if (staffData) setStaff(Array.isArray(staffData) ? staffData : staffData.users || staffData.data || []);
    if (propsData) setProperties(Array.isArray(propsData) ? propsData : propsData.properties || propsData.data || []);
    setLoaded(true);
  };

  useEffect(() => {
    fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allMembers = [...admins, ...staff];

  const openAddModal = () => {
    setEditingMember(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setForm({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      password: "",
      role: member.role || "STAFF",
      propertyId: member.propertyId || member.property?.id || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    let result;
    if (editingMember) {
      const body: Record<string, string> = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        propertyId: form.propertyId,
      };
      result = await api.put(`/api/users/${editingMember.id}`, body);
    } else {
      result = await api.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        propertyId: form.propertyId,
      });
    }
    if (result) {
      setShowModal(false);
      setForm(emptyForm);
      setEditingMember(null);
      await fetchTeam();
    }
    setSaving(false);
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    setRemoving(id);
    const result = await api.del(`/api/users/${id}`);
    if (result !== null) {
      await fetchTeam();
    }
    setRemoving(null);
  };

  const filtered = allMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      (m.property?.name || "").toLowerCase().includes(search.toLowerCase())
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {allMembers.length} team {allMembers.length === 1 ? "member" : "members"} across your properties
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" /> Add Team Member
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

      {allMembers.length > 0 && (
        <SearchInput
          placeholder="Search by name, email, role, or property..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {filtered.length === 0 && loaded ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title={search ? "No team members match your search" : "No team members yet"}
          description={search ? "Try a different search term." : "Add admins or staff to manage your properties."}
          action={
            !search ? (
              <Button onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" /> Add Team Member
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar name={m.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{m.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{m.email}</p>
                        {m.phone && <p className="text-xs text-gray-400">{m.phone}</p>}
                      </div>
                      {m.status && <StatusBadge status={m.status} />}
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Badge variant="info">
                        <Shield className="w-3 h-3 mr-1" /> {m.role}
                      </Badge>
                      {(m.property?.name) && (
                        <Badge variant="default">{m.property.name}</Badge>
                      )}
                    </div>
                    {m.createdAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        Since {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => openEditModal(m)}>
                        <Pencil className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        loading={removing === m.id}
                        onClick={() => handleRemove(m.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Team Member Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader onClose={() => setShowModal(false)}>
          <ModalTitle>{editingMember ? "Edit Team Member" : "Add Team Member"}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Rajesh Kumar"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="e.g. rajesh@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Phone"
              placeholder="e.g. 9800000001"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            {!editingMember && (
              <Input
                label="Password"
                type="password"
                placeholder="Set a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            )}
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[
                { value: "ADMIN", label: "Admin" },
                { value: "STAFF", label: "Staff" },
              ]}
            />
            <Select
              label="Assign to Property"
              value={form.propertyId}
              onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
              placeholder="Select a property"
              options={properties.map((p) => ({ value: p.id, label: p.name }))}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving} disabled={!form.name || !form.email || (!editingMember && !form.password)}>
            {editingMember ? "Update Member" : "Add Member"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
