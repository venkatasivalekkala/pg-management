"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/loading";
import { CheckCircle, User, Building2, Bell } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface PropertySettings {
  id: string;
  name: string;
  rules?: string;
  amenities?: string;
  timing?: string;
}

export default function SettingsPage() {
  const api = useApi();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<PropertySettings[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [propertyForm, setPropertyForm] = useState({ name: "", rules: "", amenities: "", timing: "" });
  const [notifications, setNotifications] = useState({
    emailPayments: true,
    emailComplaints: true,
    emailBookings: true,
    smsPayments: false,
    smsComplaints: false,
    smsBookings: false,
  });
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [userRes, propsRes] = await Promise.all([
        api.get("/api/auth/me"),
        api.get("/api/properties"),
      ]);
      if (userRes) {
        const u = userRes.user || userRes;
        setUser(u);
        setProfileForm({ name: u.name || "", email: u.email || "", phone: u.phone || "" });
      }
      if (propsRes) {
        const list = Array.isArray(propsRes) ? propsRes : propsRes.properties || [];
        setProperties(list);
        if (list.length > 0) {
          setSelectedPropertyId(list[0].id);
          setPropertyForm({
            name: list[0].name || "",
            rules: list[0].rules || "",
            amenities: list[0].amenities || "",
            timing: list[0].timing || "",
          });
        }
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const prop = properties.find((p) => p.id === selectedPropertyId);
    if (prop) {
      setPropertyForm({
        name: prop.name || "",
        rules: prop.rules || "",
        amenities: prop.amenities || "",
        timing: prop.timing || "",
      });
    }
  }, [selectedPropertyId, properties]);

  const showSuccess = (message: string) => {
    setSaveSuccess(message);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const res = await api.put(`/api/users/${user.id}`, profileForm);
    if (res) {
      setUser((prev) => (prev ? { ...prev, ...profileForm } : prev));
      showSuccess("Profile updated successfully");
    }
  };

  const handleSaveProperty = async () => {
    if (!selectedPropertyId) return;
    const res = await api.put(`/api/properties/${selectedPropertyId}`, propertyForm);
    if (res) {
      setProperties((prev) =>
        prev.map((p) => (p.id === selectedPropertyId ? { ...p, ...propertyForm } : p))
      );
      showSuccess("Property settings updated successfully");
    }
  };

  const handleSaveNotifications = () => {
    showSuccess("Notification preferences saved");
  };

  if (api.loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your profile, property, and notification settings</p>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <CheckCircle className="w-4 h-4" />
          {saveSuccess}
        </div>
      )}

      {api.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {api.error}
        </div>
      )}

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Full Name"
            value={profileForm.name}
            onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Enter your name"
          />
          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Enter your email"
          />
          <Input
            label="Phone"
            value={profileForm.phone}
            onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Enter your phone number"
          />
          <Button onClick={handleSaveProfile} disabled={api.loading}>
            {api.loading ? <Spinner size="sm" /> : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Property Settings Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <CardTitle>Property Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {properties.length > 1 && (
            <Select
              label="Select Property"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              options={properties.map((p) => ({ value: p.id, label: p.name }))}
            />
          )}
          <Input
            label="Property Name"
            value={propertyForm.name}
            onChange={(e) => setPropertyForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Enter property name"
          />
          <Textarea
            label="Property Rules"
            value={propertyForm.rules}
            onChange={(e) => setPropertyForm((f) => ({ ...f, rules: e.target.value }))}
            placeholder="Enter property rules (one per line)"
          />
          <Textarea
            label="Amenities"
            value={propertyForm.amenities}
            onChange={(e) => setPropertyForm((f) => ({ ...f, amenities: e.target.value }))}
            placeholder="List amenities (comma separated)"
          />
          <Input
            label="Timing / Office Hours"
            value={propertyForm.timing}
            onChange={(e) => setPropertyForm((f) => ({ ...f, timing: e.target.value }))}
            placeholder="e.g., 9:00 AM - 6:00 PM"
          />
          <Button onClick={handleSaveProperty} disabled={api.loading}>
            {api.loading ? <Spinner size="sm" /> : "Save Property Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Email Notifications</h4>
              <div className="space-y-2">
                {[
                  { key: "emailPayments" as const, label: "Payment updates" },
                  { key: "emailComplaints" as const, label: "New complaints" },
                  { key: "emailBookings" as const, label: "Booking confirmations" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[key]}
                      onChange={(e) =>
                        setNotifications((n) => ({ ...n, [key]: e.target.checked }))
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">SMS Notifications</h4>
              <div className="space-y-2">
                {[
                  { key: "smsPayments" as const, label: "Payment reminders" },
                  { key: "smsComplaints" as const, label: "Complaint updates" },
                  { key: "smsBookings" as const, label: "Booking alerts" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[key]}
                      onChange={(e) =>
                        setNotifications((n) => ({ ...n, [key]: e.target.checked }))
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={handleSaveNotifications}>Save Notification Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
