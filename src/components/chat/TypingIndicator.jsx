import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export function TypingIndicator({ className }) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-2", className)}>
      <div className="flex gap-1">
        <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"></div>
      </div>
      <span className="text-sm text-muted-foreground">Typing...</span>
    </div>
  )
}

