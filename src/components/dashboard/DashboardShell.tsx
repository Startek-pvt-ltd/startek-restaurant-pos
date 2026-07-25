"use client";

import { useState } from "react";

import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  contentClassName?: string;
  user: {
    fullName: string;
    role: string;
  };
}

export function DashboardShell({ children, contentClassName, user }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <Topbar onMenuClick={() => setSidebarOpen(true)} user={user} />
        <main className={cn("min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6 lg:px-8 2xl:px-10", contentClassName)}>{children}</main>
      </div>
    </div>
  );
}
