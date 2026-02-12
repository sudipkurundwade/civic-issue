import * as React from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function MessageInput({ onSend, disabled = false, className }) {
  const [message, setMessage] = React.useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-2 border-t bg-background p-4",
        className
      )}>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Press Enter to send)"
        disabled={disabled}
        className="flex-1"
      />
      <Button type="submit" disabled={disabled || !message.trim()} size="icon">
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  )
}

