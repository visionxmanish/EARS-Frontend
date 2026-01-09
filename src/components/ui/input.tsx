import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base (unselected)
        "h-9 w-full min-w-0 rounded-md border border-gray-300 bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow]",
        "placeholder:text-muted-foreground file:text-foreground",
        "selection:bg-blue-500 selection:text-white",

        // Focus (selected)
        "focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40",

        // File input
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",

        // States
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "dark:bg-input/30 md:text-sm",

        className
      )}
      {...props}
    />
  )
}

export { Input }
