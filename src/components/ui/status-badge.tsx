import React from "react";
import { cn } from "@/lib/utils";

type StatusStyle = { bg: string; text: string; dot: string };

const statusMap: Record<string, StatusStyle> = {
  // Room / bed statuses
  VACANT: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  AVAILABLE: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  OCCUPIED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  MAINTENANCE: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  UNDER_MAINTENANCE: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },

  // Booking / payment statuses
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  CONFIRMED: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },

  // Payment statuses
  PAID: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  UNPAID: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  OVERDUE: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  PARTIAL: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },

  // Tenant statuses
  ACTIVE: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  INACTIVE: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-400" },
  CHECKED_OUT: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },

  // Complaint / ticket statuses
  OPEN: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  IN_PROGRESS: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  RESOLVED: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  CLOSED: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
};

const defaultStyle: StatusStyle = {
  bg: "bg-gray-50",
  text: "text-gray-700",
  dot: "bg-gray-400",
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
}

export function StatusBadge({
  status,
  className,
  ...props
}: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/[\s-]+/g, "_");
  const style = statusMap[normalized] || defaultStyle;
  const display = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        style.bg,
        style.text,
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {display}
    </span>
  );
}
