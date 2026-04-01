"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Star } from "lucide-react";

const mockStaff = [
  { id: "1", name: "Raju Kumar", role: "Maintenance", phone: "9800000001", shift: "Morning (6AM-2PM)", rating: 4.5, status: "ACTIVE", tasks: 3, completedTasks: 45 },
  { id: "2", name: "Lakshmi Devi", role: "Housekeeping", phone: "9800000002", shift: "Morning (6AM-2PM)", rating: 4.8, status: "ACTIVE", tasks: 5, completedTasks: 120 },
  { id: "3", name: "Suresh Babu", role: "Security", phone: "9800000003", shift: "Night (10PM-6AM)", rating: 4.2, status: "ACTIVE", tasks: 0, completedTasks: 30 },
  { id: "4", name: "Ramaiah", role: "Cook", phone: "9800000004", shift: "Split (6AM-10AM, 4PM-9PM)", rating: 4.0, status: "ACTIVE", tasks: 2, completedTasks: 180 },
  { id: "5", name: "Anita Kumari", role: "Housekeeping", phone: "9800000005", shift: "Afternoon (2PM-10PM)", rating: 3.8, status: "ON_LEAVE", tasks: 0, completedTasks: 85 },
  { id: "6", name: "Mohan Das", role: "Security", phone: "9800000006", shift: "Morning (6AM-2PM)", rating: 4.1, status: "ACTIVE", tasks: 1, completedTasks: 22 },
];

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage staff, shifts, and task assignments</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Add Staff</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{mockStaff.length}</p><p className="text-xs text-gray-500">Total Staff</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{mockStaff.filter(s => s.status === "ACTIVE").length}</p><p className="text-xs text-gray-500">On Duty</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{mockStaff.filter(s => s.status === "ON_LEAVE").length}</p><p className="text-xs text-gray-500">On Leave</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-indigo-600">{mockStaff.reduce((sum, s) => sum + s.tasks, 0)}</p><p className="text-xs text-gray-500">Active Tasks</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockStaff.map((staff) => (
          <Card key={staff.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar name={staff.name} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                      <p className="text-sm text-indigo-600 font-medium">{staff.role}</p>
                    </div>
                    <StatusBadge status={staff.status} />
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {staff.phone}</p>
                    <p>🕐 {staff.shift}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {staff.rating}</span>
                      <span>{staff.tasks} active tasks</span>
                      <span className="text-gray-400">{staff.completedTasks} completed</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">Assign Task</Button>
                    <Button size="sm" variant="ghost">View History</Button>
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
