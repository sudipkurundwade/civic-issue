import * as React from "react"
import { ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { TypingIndicator } from "./TypingIndicator"
import { cn } from "@/lib/utils"
import { CURRENT_USER_ID } from "@/services/chatService"

export function ChatWindow({
  user,
  messages,
  onSendMessage,
  onBack,
  isTyping = false,
  connectionStatus = "connected",
  className,
}) {
  const messagesEndRef = React.useRef(null)
  const scrollAreaRef = React.useRef(null)

  const scrollToBottom = React.useCallback(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight
        }, 100)
      }
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  if (!user) {
    return (
      <div
        className={cn(
          "flex flex-col h-full min-h-0 overflow-hidden items-center justify-center text-center p-8",
          className
        )}>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No chat selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a user from the sidebar to start a conversation
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full min-h-0 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 border-b bg-background p-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold truncate">{user.name}</h2>
            <Badge
              variant={user.status === "online" ? "default" : "secondary"}
              className={cn(
                "h-2 w-2 rounded-full p-0",
                user.status === "online" ? "bg-green-500" : "bg-gray-400"
              )}>
              <span className="sr-only">{user.status}</span>
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {user.status}
          </p>
        </div>
        <Badge
          variant={connectionStatus === "connected" ? "default" : "secondary"}
          className="text-xs">
          {connectionStatus === "connected" ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      <Separator />

      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
        <div className="py-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-8">
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === CURRENT_USER_ID}
              />
            ))
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <Separator />

      {/* Input Area */}
      <MessageInput
        onSend={onSendMessage}
        disabled={connectionStatus !== "connected"}
      />
    </div>
  )
}

