"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/menu/ConfirmDialog";
import { changeStaffStatusAction } from "@/features/staff/actions/staff-actions";
import type { StaffRecord } from "@/features/staff/types";

export function StaffStatusDialog({ onClose, staff }: { onClose: () => void; staff: StaffRecord | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const activating = staff?.status === "INACTIVE";
  const confirm = () => {
    if (!staff) return;
    startTransition(async () => {
      const result = await changeStaffStatusAction(staff.id, activating ? "ACTIVE" : "INACTIVE");
      if (!result.success) { toast.error(result.message); return; }
      toast.success(result.message);
      onClose();
      router.refresh();
    });
  };
  return <ConfirmDialog confirmLabel={activating ? "Activate account" : "Deactivate account"} description={activating ? `Allow ${staff?.fullName ?? "this user"} to sign in again?` : `Deactivate ${staff?.fullName ?? "this user"}? Existing sessions will be revoked. Historical records remain unchanged.`} onCancel={onClose} onConfirm={confirm} open={Boolean(staff)} pending={pending} title={activating ? "Activate staff account" : "Deactivate staff account"} />;
}
