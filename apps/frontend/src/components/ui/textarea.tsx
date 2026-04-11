import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        [
          "flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background",
          "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          // WCAG 2.4.7: visible focus indicator for keyboard users
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // WCAG 3.3.1 / 3.3.3: invalid state is visually indicated (when used with aria-invalid)
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        ].join(" "),
        className
      )}
      {...props}
    />
  )
}

export { Textarea }