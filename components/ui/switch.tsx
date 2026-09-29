"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

/** Pen `Switch · zapnuto (B tmavá)` / `Switch · vypnuto` (D28): iOS size 51×31, on = ink like the primary button. */
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer group/switch relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full border border-transparent p-0.5 transition-all outline-none after:absolute after:-inset-x-1 after:-inset-y-1.5 focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:bg-primary data-unchecked:bg-input data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-[27px] rounded-full bg-card shadow-[0_2px_4px_rgb(0_0_0/0.18)] ring-0 transition-transform data-checked:translate-x-5 data-unchecked:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
