"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure property and platform settings</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Property Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Property Name" defaultValue="Sunshine PG for Men" />
          <Textarea label="Property Rules" defaultValue="1. Curfew at 10:30 PM&#10;2. No smoking inside rooms&#10;3. Visitors allowed until 8 PM&#10;4. Maintain silence after 10 PM" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Grace Period (days)" type="number" defaultValue="5" />
            <Input label="Late Fee (₹/day)" type="number" defaultValue="100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Notice Period (days)" type="number" defaultValue="30" />
            <Select label="Security Deposit" options={[{ value: "1", label: "1 Month Rent" }, { value: "2", label: "2 Months Rent" }, { value: "3", label: "3 Months Rent" }]} />
          </div>
          <Button>Save Property Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment Gateway</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select label="Gateway Provider" options={[{ value: "razorpay", label: "Razorpay" }, { value: "cashfree", label: "Cashfree" }, { value: "paytm", label: "Paytm" }]} />
          <Input label="API Key" placeholder="rzp_live_xxxxxxxxxx" type="password" />
          <Input label="API Secret" placeholder="xxxxxxxxxxxxxxxx" type="password" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Auto-reminder" options={[{ value: "yes", label: "Enabled" }, { value: "no", label: "Disabled" }]} />
            <Select label="Reminder Days" options={[{ value: "1,5,10", label: "Day 1, 5, 10" }, { value: "1,3,7,10", label: "Day 1, 3, 7, 10" }]} />
          </div>
          <Button>Save Payment Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select label="SMS Provider" options={[{ value: "msg91", label: "MSG91" }, { value: "twilio", label: "Twilio" }]} />
          <Input label="SMS API Key" placeholder="Your API key" type="password" />
          <Select label="WhatsApp Integration" options={[{ value: "meta", label: "Meta Business API" }, { value: "none", label: "Disabled" }]} />
          <Input label="SMTP Server" placeholder="smtp.gmail.com" />
          <Input label="SMTP Email" placeholder="admin@yourpg.com" />
          <Button>Save Notification Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
