"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PillToggleProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export const PillToggle = React.memo(function PillToggle({
  label,
  selected,
  onToggle,
}: PillToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "rounded-full border px-4 py-2 text-sm min-h-[44px] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/10 text-primary font-medium"
          : "border-border text-muted-foreground hover:border-primary/40",
      )}
    >
      {label}
    </button>
  );
});
