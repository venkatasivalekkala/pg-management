"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function OwnerSettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Owner Settings</h1>
      <Card>
        <CardHeader><CardTitle>Business Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Business Name" defaultValue="PG Properties Pvt. Ltd." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="GST Number" placeholder="22AAAAA0000A1Z5" />
            <Input label="PAN Number" placeholder="AAAAA0000A" />
          </div>
          <Input label="Bank Account (for payouts)" placeholder="XXXX XXXX XXXX 1234" />
          <Input label="IFSC Code" placeholder="SBIN0001234" />
          <Button>Save Business Details</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Platform Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select label="Default Currency" options={[{ value: "INR", label: "₹ INR" }]} />
          <Select label="Invoice Frequency" options={[{ value: "monthly", label: "Monthly (1st of every month)" }, { value: "custom", label: "Custom date" }]} />
          <Select label="Late Fee Policy" options={[{ value: "100", label: "₹100/day after grace period" }, { value: "200", label: "₹200/day after grace period" }, { value: "percent", label: "2% per week" }]} />
          <Button>Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}
