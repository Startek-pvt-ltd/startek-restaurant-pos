"use client";

import { useEffect, useState } from "react";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSidebarCollapsed(window.localStorage.getItem("startek-sidebar-collapsed") === "true");
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((value) => {
      window.localStorage.setItem("startek-sidebar-collapsed", String(!value));
      return !value;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={toggleSidebar} />
      <div className={cn("dashboard-shell transition-[padding] duration-300", sidebarCollapsed ? "md:pl-20" : "md:pl-72")}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} user={user} />
        <main className={cn("dashboard-main min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6 lg:px-8 2xl:px-10", contentClassName)}>{children}</main>
      </div>
    </div>
  );
}
