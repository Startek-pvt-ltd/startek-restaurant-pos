"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  icon?: React.ReactNode;
}

export function LogoutButton({ className, icon }: LogoutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <Button
      className={cn("h-10 px-4", className)}
      disabled={isSigningOut}
      onClick={async () => {
        setIsSigningOut(true);
        await signOut({ redirectTo: "/login" });
      }}
      type="button"
      variant="secondary"
    >
      {isSigningOut ? (
        <LoaderCircle aria-hidden="true" className="animate-spin" />
      ) : (
        icon ?? <LogOut aria-hidden="true" />
      )}
      {isSigningOut ? "Signing out…" : "Logout"}
    </Button>
  );
}
