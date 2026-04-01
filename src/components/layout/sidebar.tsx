"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { UserRole } from "@/types";
import {
  Building2,
  LayoutDashboard,
  DoorOpen,
  CalendarCheck,
  CreditCard,
  AlertCircle,
  UtensilsCrossed,
  Users,
  UserCog,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building,
  X,
  User,
} from "lucide-react";

// ─── Navigation config ──────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "MAIN",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        roles: [UserRole.OWNER, UserRole.ADMIN],
      },
      {
        label: "Properties",
        href: "/admin/properties",
        icon: Building2,
        roles: [UserRole.OWNER, UserRole.ADMIN],
      },
      {
        label: "Rooms",
        href: "/admin/rooms",
        icon: DoorOpen,
        roles: [UserRole.OWNER, UserRole.ADMIN],
      },
      {
        label: "My Room",
        href: "/guest/my-room",
        icon: DoorOpen,
        roles: [UserRole.GUEST],
      },
      {
        label: "Bookings",
        href: "/admin/bookings",
        icon: CalendarCheck,
        roles: [UserRole.OWNER, UserRole.ADMIN],
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        label: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
        roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.GUEST],
      },
      {
        label: "Complaints",
        href: "/admin/complaints",
        icon: AlertCircle,
        roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.GUEST],
      },
      {
        label: "Meals",
        href: "/admin/meals",
        icon: UtensilsCrossed,
        roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.GUEST],
      },
      {
        label: "Visitors",
        href: "/admin/visitors",
        icon: Users,
        roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.GUEST],
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        label: "Staff",
        href: "/admin/staff",
        icon: UserCog,
        roles: [UserRole.OWNER, UserRole.ADMIN],
      },
      {
        label: "Reports",
        href: "/admin/reports",
        icon: BarChart3,
        roles: [UserRole.OWNER, UserRole.ADMIN],
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        roles: [UserRole.OWNER, UserRole.ADMIN],
      },
      {
        label: "Profile",
        href: "/guest/profile",
        icon: User,
        roles: [UserRole.GUEST],
      },
    ],
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export interface SidebarProps {
  role: UserRole;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Mobile drawer open state */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  role,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Building className="h-5 w-5" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-gray-900">
            PG Manager
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {filteredGroups.map((group) => (
          <div key={group.title} className="mb-6">
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {group.title}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          isActive
                            ? "text-indigo-600"
                            : "text-gray-400 group-hover:text-gray-600"
                        )}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden border-t border-gray-200 p-3 lg:block">
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* User info */}
      <div className="shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Avatar name="Admin User" size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                Admin User
              </p>
              <p className="truncate text-xs text-gray-500">{role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-screen border-r border-gray-200 bg-white transition-all duration-300 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col",
          collapsed ? "lg:w-[72px]" : "lg:w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl">
            <button
              onClick={onMobileClose}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
