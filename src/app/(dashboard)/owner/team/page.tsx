"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield } from "lucide-react";

const teamMembers = [
  { id: "1", name: "Rajesh Kumar", role: "ADMIN", email: "rajesh@example.com", phone: "9800000001", property: "Sunshine PG", status: "ACTIVE", joinedAt: "2025-06-15" },
  { id: "2", name: "Priya Menon", role: "ADMIN", email: "priya@example.com", phone: "9800000002", property: "Green Valley Hostel", status: "ACTIVE", joinedAt: "2025-08-01" },
  { id: "3", name: "Amit Shah", role: "ADMIN", email: "amit@example.com", phone: "9800000003", property: "Green Valley Hostel", status: "ACTIVE", joinedAt: "2025-09-10" },
  { id: "4", name: "Suresh Babu", role: "ADMIN", email: "suresh@example.com", phone: "9800000004", property: "Urban Nest", status: "ACTIVE", joinedAt: "2025-11-01" },
  { id: "5", name: "Meera Tiwari", role: "ADMIN", email: "meera@example.com", phone: "9800000005", property: "Pearl Women's PG", status: "ACTIVE", joinedAt: "2026-01-15" },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage admins and their property assignments</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Add Admin</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamMembers.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar name={m.name} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{m.name}</h3>
                      <p className="text-sm text-gray-500">{m.email}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="info"><Shield className="w-3 h-3 mr-1" /> {m.role}</Badge>
                    <Badge variant="default">{m.property}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Since {m.joinedAt}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">Edit Permissions</Button>
                    <Button size="sm" variant="ghost" className="text-red-600">Remove</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
