"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface StatusSwitchProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => Promise<boolean | void> | boolean | void;
}

export function StatusSwitch({ checked, disabled = false, label, onCheckedChange }: StatusSwitchProps) {
  const [optimisticValue, setOptimisticValue] = useState<boolean | null>(null);
  const [updating, setUpdating] = useState(false);
  const displayedChecked = optimisticValue ?? checked;

  const toggle = async () => {
    if (disabled || updating) return;
    const previous = displayedChecked;
    const next = !previous;
    setOptimisticValue(next);
    setUpdating(true);

    try {
      const succeeded = await onCheckedChange(next);
      if (succeeded === false) setOptimisticValue(null);
    } catch {
      setOptimisticValue(null);
    } finally {
      setOptimisticValue(null);
      setUpdating(false);
    }
  };

  return (
    <button
      aria-checked={displayedChecked}
      aria-label={label}
      aria-busy={updating}
      className={cn(
        "inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        displayedChecked ? "bg-success" : "bg-stone-300",
      )}
      disabled={disabled || updating}
      onClick={toggle}
      role="switch"
      type="button"
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-5 shrink-0 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
          displayedChecked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
