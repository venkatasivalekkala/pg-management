import { cookies } from "next/headers";
import { UserRole } from "@/types";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read user role from cookie; default to ADMIN until real auth is wired up
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("user_role")?.value;
  const role =
    roleCookie && Object.values(UserRole).includes(roleCookie as UserRole)
      ? (roleCookie as UserRole)
      : UserRole.ADMIN;

  return <DashboardLayout role={role}>{children}</DashboardLayout>;
}
