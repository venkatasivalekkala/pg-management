"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { User, Shield, Globe, Phone, AlertTriangle } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  company?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  language?: string;
  kycStatus?: {
    aadhaar?: { verified: boolean; verifiedAt?: string };
    pan?: { verified: boolean; verifiedAt?: string };
  };
}

export default function ProfilePage() {
  const api = useApi();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    company: "",
    emergencyContact: "",
    emergencyContactName: "",
    language: "en",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await api.get("/api/auth/me");
      if (data) {
        const user = data.user || data;
        setProfile(user);
        setEditForm({
          name: user.name || "",
          email: user.email || "",
          company: user.company || "",
          emergencyContact: user.emergencyContact || "",
          emergencyContactName: user.emergencyContactName || "",
          language: user.language || "en",
        });
      }
      setLoaded(true);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const result = await api.put(`/api/users/${profile.id}`, editForm);
    if (result) {
      const updated = result.user || result;
      setProfile(updated);
      setEditModalOpen(false);
    }
    setSaving(false);
  };

  if (!loaded || api.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (api.error && !profile) {
    return (
      <EmptyState
        icon={<User className="w-6 h-6" />}
        title="Failed to load profile"
        description={api.error}
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  if (!profile) {
    return (
      <EmptyState
        icon={<User className="w-6 h-6" />}
        title="Profile not found"
        description="Unable to load your profile information."
      />
    );
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Profile Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <p className="text-sm text-gray-500">{profile.phone}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Full Name</span>
              <span className="font-medium">{profile.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium">{profile.phone}</span>
            </div>
            {profile.company && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Company / College</span>
                <span className="font-medium">{profile.company}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Language</span>
              <span className="font-medium">
                {editForm.language === "en" ? "English" : editForm.language === "hi" ? "Hindi" : editForm.language === "kn" ? "Kannada" : editForm.language === "te" ? "Telugu" : editForm.language}
              </span>
            </div>
          </div>
          <Button className="mt-4" onClick={() => setEditModalOpen(true)}>
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" /> Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.emergencyContact ? (
            <div className="space-y-2">
              {profile.emergencyContactName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">{profile.emergencyContactName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{profile.emergencyContact}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No emergency contact added. Click Edit Profile to add one.</p>
          )}
        </CardContent>
      </Card>

      {/* KYC Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" /> KYC Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              profile.kycStatus?.aadhaar?.verified ? "bg-green-50" : "bg-yellow-50"
            }`}>
              <div>
                <p className="font-medium text-sm">Aadhaar Card</p>
                <p className="text-xs text-gray-500">
                  {profile.kycStatus?.aadhaar?.verified
                    ? `Verified on ${new Date(profile.kycStatus.aadhaar.verifiedAt!).toLocaleDateString()}`
                    : "Not uploaded yet"}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                profile.kycStatus?.aadhaar?.verified
                  ? "text-green-600 bg-green-100"
                  : "text-yellow-600 bg-yellow-100"
              }`}>
                {profile.kycStatus?.aadhaar?.verified ? "Verified" : "Pending"}
              </span>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              profile.kycStatus?.pan?.verified ? "bg-green-50" : "bg-yellow-50"
            }`}>
              <div>
                <p className="font-medium text-sm">PAN Card</p>
                <p className="text-xs text-gray-500">
                  {profile.kycStatus?.pan?.verified
                    ? `Verified on ${new Date(profile.kycStatus.pan.verifiedAt!).toLocaleDateString()}`
                    : "Not uploaded yet"}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                profile.kycStatus?.pan?.verified
                  ? "text-green-600 bg-green-100"
                  : "text-yellow-600 bg-yellow-100"
              }`}>
                {profile.kycStatus?.pan?.verified ? "Verified" : "Pending"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader><CardTitle>Account Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline">Change Password</Button>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              <AlertTriangle className="w-4 h-4 mr-2" /> Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <ModalHeader onClose={() => setEditModalOpen(false)}>
          <ModalTitle>Edit Profile</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
            />
            <Input
              label="Company / College"
              value={editForm.company}
              onChange={(e) => setEditForm((f) => ({ ...f, company: e.target.value }))}
            />
            <Input
              label="Emergency Contact Name"
              value={editForm.emergencyContactName}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, emergencyContactName: e.target.value }))
              }
            />
            <Input
              label="Emergency Contact Phone"
              value={editForm.emergencyContact}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, emergencyContact: e.target.value }))
              }
            />
            <Select
              label="Language"
              value={editForm.language}
              onChange={(e) => setEditForm((f) => ({ ...f, language: e.target.value }))}
              options={[
                { value: "en", label: "English" },
                { value: "hi", label: "Hindi" },
                { value: "kn", label: "Kannada" },
                { value: "te", label: "Telugu" },
              ]}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
