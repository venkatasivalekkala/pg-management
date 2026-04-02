/**
 * Demo accounts for development — no database required.
 * OTP for all demo accounts: 123456
 */
export const DEMO_OTP = "123456";

export const DEMO_ACCOUNTS = [
  {
    id: "demo-owner-001",
    name: "Aadya Sharma",
    email: "owner@demo.com",
    phone: "+919876543210",
    role: "OWNER",
    avatarUrl: null,
  },
  {
    id: "demo-admin-001",
    name: "Rajesh Kumar",
    email: "admin@demo.com",
    phone: "+919876543211",
    role: "ADMIN",
    avatarUrl: null,
  },
  {
    id: "demo-guest-001",
    name: "Rahul Sharma",
    email: "guest@demo.com",
    phone: "+919876543212",
    role: "GUEST",
    avatarUrl: null,
  },
  {
    id: "demo-staff-001",
    name: "Raju Kumar",
    email: "staff@demo.com",
    phone: "+919800000001",
    role: "STAFF",
    avatarUrl: null,
  },
];

export function findDemoAccount(identifier: { phone?: string; email?: string }) {
  if (identifier.email) {
    return DEMO_ACCOUNTS.find(
      (a) => a.email === identifier.email!.toLowerCase()
    );
  }
  if (identifier.phone) {
    // Match with or without +91 prefix
    const clean = identifier.phone.replace(/[^\d]/g, "");
    return DEMO_ACCOUNTS.find((a) => {
      const acctClean = a.phone.replace(/[^\d]/g, "");
      return acctClean === clean || acctClean.endsWith(clean);
    });
  }
  return undefined;
}

export function isDemoIdentifier(identifier: { phone?: string; email?: string }): boolean {
  return !!findDemoAccount(identifier);
}
