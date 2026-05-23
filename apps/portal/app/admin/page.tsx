"use client";

import { useEffect } from "react";

// Redirect /admin to /admin/dashboard
export default function AdminIndexPage() {
  useEffect(() => {
    window.location.href = "/admin/dashboard";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  );
}
