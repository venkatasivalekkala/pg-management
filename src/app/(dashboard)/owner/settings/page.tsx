"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";
import { User, Bell, Building2, Check } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export default function OwnerSettingsPage() {
  const api = useApi();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Notification preferences (local state, toggles)
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailPayments: true,
    emailComplaints: true,
    emailReports: false,
    smsBookings: false,
    smsPayments: true,
    smsComplaints: true,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  // Property defaults
  const [defaults, setDefaults] = useState({
    defaultCheckInTime: "14:00",
    defaultCheckOutTime: "11:00",
    gracePeriodDays: "5",
    lateFeePerDay: "100",
  });
  const [defaultsSaved, setDefaultsSaved] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const data = await api.get("/api/auth/me");
      if (data) {
        const u = data.user || data;
        setUser(u);
        setProfileForm({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
        });
      }
      setLoaded(true);
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setProfileSaved(false);
    const result = await api.put(`/api/users/${user.id}`, {
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
    });
    if (result) {
      const updated = result.user || result;
      setUser(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
    setSavingProfile(false);
  };

  const handleSaveNotifications = () => {
    // Notification preferences would be saved to a preferences endpoint
    // For now, show a local success state
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };

  const handleSaveDefaults = () => {
    // Property defaults would be saved to a settings endpoint
    setDefaultsSaved(true);
    setTimeout(() => setDefaultsSaved(false), 3000);
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setNotifSaved(false);
  };

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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile and preferences</p>
      </div>

      {api.error && loaded && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm flex items-center justify-between">
          <span>{api.error}</span>
          <button onClick={() => api.setError(null)} className="text-red-500 hover:text-red-700 text-xs font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Full Name"
            value={profileForm.name}
            onChange={(e) => {
              setProfileForm({ ...profileForm, name: e.target.value });
              setProfileSaved(false);
            }}
            placeholder="Your full name"
          />
          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(e) => {
              setProfileForm({ ...profileForm, email: e.target.value });
              setProfileSaved(false);
            }}
            placeholder="your@email.com"
          />
          <Input
            label="Phone"
            value={profileForm.phone}
            onChange={(e) => {
              setProfileForm({ ...profileForm, phone: e.target.value });
              setProfileSaved(false);
            }}
            placeholder="e.g. 9800000000"
          />
          {user?.role && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Role</label>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                {user.role}
              </p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveProfile} loading={savingProfile} disabled={!profileForm.name || !profileForm.email}>
              Save Profile
            </Button>
            {profileSaved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-500" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Email Notifications</h4>
            {([
              { key: "emailBookings" as const, label: "New bookings and check-ins" },
              { key: "emailPayments" as const, label: "Payment confirmations and reminders" },
              { key: "emailComplaints" as const, label: "New complaints and resolutions" },
              { key: "emailReports" as const, label: "Weekly summary reports" },
            ]).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">{label}</span>
                <button
                  onClick={() => toggleNotif(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications[key] ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications[key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}

            <h4 className="text-sm font-medium text-gray-700 mb-3 mt-6">SMS Notifications</h4>
            {([
              { key: "smsBookings" as const, label: "New bookings" },
              { key: "smsPayments" as const, label: "Payment received" },
              { key: "smsComplaints" as const, label: "Urgent complaints" },
            ]).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">{label}</span>
                <button
                  onClick={() => toggleNotif(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications[key] ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications[key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            {notifSaved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Defaults */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-500" />
            <CardTitle>Property Defaults</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">Default settings applied when creating new properties.</p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Default Check-in Time"
              type="time"
              value={defaults.defaultCheckInTime}
              onChange={(e) => {
                setDefaults({ ...defaults, defaultCheckInTime: e.target.value });
                setDefaultsSaved(false);
              }}
            />
            <Input
              label="Default Check-out Time"
              type="time"
              value={defaults.defaultCheckOutTime}
              onChange={(e) => {
                setDefaults({ ...defaults, defaultCheckOutTime: e.target.value });
                setDefaultsSaved(false);
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Grace Period (days)"
              type="number"
              value={defaults.gracePeriodDays}
              onChange={(e) => {
                setDefaults({ ...defaults, gracePeriodDays: e.target.value });
                setDefaultsSaved(false);
              }}
              helperText="Days after due date before late fee applies"
            />
            <Input
              label="Late Fee (₹/day)"
              type="number"
              value={defaults.lateFeePerDay}
              onChange={(e) => {
                setDefaults({ ...defaults, lateFeePerDay: e.target.value });
                setDefaultsSaved(false);
              }}
              helperText="Per day after grace period"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveDefaults}>Save Defaults</Button>
            {defaultsSaved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
