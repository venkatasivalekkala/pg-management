"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Building2, MapPin, Settings } from "lucide-react";

const ownerProperties = [
  { id: "1", name: "Sunshine PG for Men", city: "Bangalore", address: "Koramangala 4th Block", rooms: 30, guests: 44, admins: ["Rajesh K."], revenue: 312000, status: "ACTIVE" },
  { id: "2", name: "Green Valley Women's Hostel", city: "Hyderabad", address: "Madhapur", rooms: 45, guests: 62, admins: ["Priya M.", "Amit S."], revenue: 540000, status: "ACTIVE" },
  { id: "3", name: "Urban Nest Co-Living", city: "Bangalore", address: "HSR Layout", rooms: 25, guests: 28, admins: ["Suresh B."], revenue: 198000, status: "ACTIVE" },
  { id: "4", name: "Comfort Stay PG", city: "Bangalore", address: "Whitefield", rooms: 20, guests: 15, admins: [], revenue: 150000, status: "INACTIVE" },
  { id: "5", name: "Pearl Women's PG", city: "Bangalore", address: "Indiranagar", rooms: 20, guests: 19, admins: ["Meera T."], revenue: 485000, status: "ACTIVE" },
];

export default function OwnerPropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-sm text-gray-500 mt-1">{ownerProperties.length} properties in portfolio</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Add Property</Button>
      </div>
      <div className="space-y-4">
        {ownerProperties.map((p) => (
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
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {p.address}, {p.city}</p>
                    <div className="flex items-center gap-6 mt-3 text-sm">
                      <span><strong>{p.rooms}</strong> rooms</span>
                      <span><strong>{p.guests}</strong> guests</span>
                      <span className="text-indigo-600 font-semibold">₹{(p.revenue / 1000).toFixed(0)}K/mo</span>
                    </div>
                    {p.admins.length > 0 && <p className="text-xs text-gray-500 mt-2">Managed by: {p.admins.join(", ")}</p>}
                    {p.admins.length === 0 && <p className="text-xs text-yellow-600 mt-2">No admin assigned</p>}
                  </div>
                </div>
                <Button variant="outline" size="sm"><Settings className="w-4 h-4 mr-1" /> Manage</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
