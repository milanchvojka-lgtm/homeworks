import * as React from "react"

import { cn } from "@/lib/utils"

/** Multi-line counterpart of `Input` (same border, radius, type size and focus ring). */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full min-w-0 rounded-lg border border-input bg-card px-3.5 py-3 text-base transition-[color,border-color,box-shadow] outline-none placeholder:text-subtle placeholder:italic focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
