"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { cn } from "@/lib/utils";

interface ModalProps {
  children: React.ReactNode;
  description?: string;
  onClose: () => void;
  open: boolean;
  size?: "sm" | "md" | "lg";
  title: string;
}

export function Modal({ children, description, onClose, open, size = "md", title }: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto bg-secondary/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div
        className={cn(
          "dashboard-fade-in relative max-h-[94vh] w-full overflow-y-auto rounded-t-3xl border border-border bg-card shadow-[0_28px_80px_rgba(74,35,16,0.28)] sm:rounded-3xl",
          size === "sm" && "max-w-md",
          size === "md" && "max-w-2xl",
          size === "lg" && "max-w-3xl",
        )}
        ref={dialogRef}
      >
        <div className="sticky top-0 z-10 flex items-start gap-4 border-b border-border bg-card/95 px-5 py-4 backdrop-blur sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-secondary sm:text-xl" id={titleId}>
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground" id={descriptionId}>
                {description}
              </p>
            )}
          </div>
          <button
            aria-label="Close dialog"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:border-primary hover:bg-muted hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
