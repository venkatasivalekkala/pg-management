"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { BedDouble, Calendar, IndianRupee, AlertCircle, UtensilsCrossed, MessageSquare, Bell, Clock } from "lucide-react";

const roomData = {
  roomNumber: "A-101",
  floor: 1,
  roomType: "Double Sharing",
  property: "Sunshine PG for Men",
  address: "Koramangala 4th Block, Bangalore",
  checkInDate: "2026-01-15",
  rentAmount: 8000,
  nextDueDate: "2026-04-01",
  daysUntilDue: 2,
  securityDeposit: 16000,
  roommates: [{ name: "Amit Kumar", bed: "Bed 2" }],
  amenities: ["WiFi", "AC", "Attached Bathroom", "Study Table", "Wardrobe"],
};

const recentActivity = [
  { icon: <IndianRupee className="w-4 h-4 text-green-600" />, text: "Rent paid for March 2026", time: "March 1" },
  { icon: <AlertCircle className="w-4 h-4 text-yellow-600" />, text: "Complaint: AC not cooling - Resolved", time: "Feb 28" },
  { icon: <UtensilsCrossed className="w-4 h-4 text-orange-600" />, text: "Opted out of dinner on Feb 25", time: "Feb 24" },
  { icon: <Bell className="w-4 h-4 text-blue-600" />, text: "Water maintenance scheduled 10AM-2PM", time: "Feb 20" },
];

export default function MyRoomPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Room</h1>
        <p className="text-sm text-gray-500 mt-1">{roomData.property}</p>
      </div>

      {/* Rent Due Alert */}
      {roomData.daysUntilDue <= 5 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-800">Rent due in {roomData.daysUntilDue} days</p>
              <p className="text-sm text-yellow-700">₹{roomData.rentAmount.toLocaleString()} due on {roomData.nextDueDate}</p>
            </div>
          </div>
          <Button size="sm">Pay Now</Button>
        </div>
      )}

      {/* Room Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BedDouble className="w-5 h-5" /> Room Details</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Room Number</span><span className="font-semibold">{roomData.roomNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Floor</span><span className="font-semibold">{roomData.floor}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-semibold">{roomData.roomType}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Check-in Date</span><span className="font-semibold">{roomData.checkInDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Monthly Rent</span><span className="font-bold text-indigo-600">₹{roomData.rentAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Security Deposit</span><span className="font-semibold">₹{roomData.securityDeposit.toLocaleString()}</span></div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-500 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {roomData.amenities.map(a => <Badge key={a} variant="default">{a}</Badge>)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Roommates */}
          <Card>
            <CardHeader><CardTitle>Roommates</CardTitle></CardHeader>
            <CardContent>
              {roomData.roommates.map(rm => (
                <div key={rm.name} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">{rm.name[0]}</div>
                    <div><p className="font-medium">{rm.name}</p><p className="text-xs text-gray-500">{rm.bed}</p></div>
                  </div>
                  <Button variant="ghost" size="sm"><MessageSquare className="w-4 h-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start"><IndianRupee className="w-4 h-4 mr-2" /> Pay Rent</Button>
                <Button variant="outline" className="justify-start"><AlertCircle className="w-4 h-4 mr-2" /> Raise Complaint</Button>
                <Button variant="outline" className="justify-start"><UtensilsCrossed className="w-4 h-4 mr-2" /> Meal Menu</Button>
                <Button variant="outline" className="justify-start"><Calendar className="w-4 h-4 mr-2" /> Request Check-out</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
