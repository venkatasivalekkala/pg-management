"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar name="Rahul Sharma" size="lg" />
            <div>
              <h2 className="text-xl font-bold">Rahul Sharma</h2>
              <p className="text-sm text-gray-500">Guest · Room A-101</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" defaultValue="Rahul Sharma" />
              <Input label="Email" type="email" defaultValue="rahul@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone" defaultValue="+91 9876543210" disabled />
              <Input label="Emergency Contact" defaultValue="+91 9812345670" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Company / College" defaultValue="TCS, Bangalore" />
              <Select label="Language" options={[{ value: "en", label: "English" }, { value: "hi", label: "Hindi" }, { value: "kn", label: "Kannada" }, { value: "te", label: "Telugu" }]} />
            </div>
            <Button>Update Profile</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>KYC Documents</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div><p className="font-medium text-sm">Aadhaar Card</p><p className="text-xs text-gray-500">Verified on Jan 15, 2026</p></div>
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">Verified</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div><p className="font-medium text-sm">PAN Card</p><p className="text-xs text-gray-500">Verified on Jan 15, 2026</p></div>
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">Verified</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
