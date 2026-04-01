import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
