import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        [
          "flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base",
          "ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
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

export { Input }