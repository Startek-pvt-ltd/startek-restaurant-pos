"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <Button
      className="h-10 px-4"
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
        <LogOut aria-hidden="true" />
      )}
      {isSigningOut ? "Signing out…" : "Logout"}
    </Button>
  );
}
