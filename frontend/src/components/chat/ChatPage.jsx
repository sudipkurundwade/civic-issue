import * as React from "react"
import { io } from "socket.io-client"
import { ChatSidebar } from "./ChatSidebar"
import { ChatWindow } from "./ChatWindow"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  mockUsers,
  mockChatHistory,
  getChatHistory,
  saveMessage,
  getUserById,
  CURRENT_USER_ID,
} from "@/services/chatService"

const SOCKET_URL = "http://localhost:3001" // Mock socket URL

export function ChatPage({ className }) {
  const [selectedUserId, setSelectedUserId] = React.useState(null)
  const [messages, setMessages] = React.useState([])
  const [users, setUsers] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isTyping, setIsTyping] = React.useState(false)
  const [connectionStatus, setConnectionStatus] = React.useState("disconnected")
  const [socket, setSocket] = React.useState(null)
  const { toast } = useToast()

  // Initialize users and socket
  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setUsers(mockUsers)
      setIsLoading(false)
    }, 500)

    // Initialize socket (for demo, we'll use mock behavior)
    // In a real app, you'd connect to an actual socket.io server
    const initializeSocket = () => {
      try {
        // Mock socket behavior since we don't have a real server
        // In production, use: const newSocket = io(SOCKET_URL)
        const mockSocket = {
          connected: true,
          on: (event, callback) => {
            // Mock event handlers
            if (event === "connect") {
              setTimeout(() => {
                setConnectionStatus("connected")
                toast({
                  title: "Connected",
                  description: "You are now connected to the chat server",
                })
              }, 100)
            }
            if (event === "disconnect") {
              setConnectionStatus("disconnected")
              toast({
                title: "Disconnected",
                description: "Connection to chat server lost",
                variant: "destructive",
              })
            }
            if (event === "message") {
              callback({
                senderId: selectedUserId,
                receiverId: CURRENT_USER_ID,
                content: "Mock message",
                timestamp: new Date(),
              })
            }
            if (event === "typing") {
              callback({ userId: selectedUserId, isTyping: true })
            }
          },
          emit: (event, data) => {
            // Mock emit - in real app, this sends to server
            console.log("Mock emit:", event, data)
          },
          disconnect: () => {
            setConnectionStatus("disconnected")
          },
        }

        setSocket(mockSocket)
        setConnectionStatus("connected")

        // Simulate connection
        setTimeout(() => {
          mockSocket.on("connect", () => {})
        }, 100)
      } catch (error) {
        console.error("Socket connection error:", error)
        setConnectionStatus("disconnected")
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat server",
          variant: "destructive",
        })
      }
    }

    initializeSocket()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  // Load messages when user is selected
  React.useEffect(() => {
    if (selectedUserId) {
      const chatHistory = getChatHistory(selectedUserId)
      setMessages(chatHistory)

      // Mark messages as read
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUserId ? { ...user, unreadCount: 0 } : user
        )
      )
    } else {
      setMessages([])
    }
  }, [selectedUserId])

  // Handle sending a message
  const handleSendMessage = React.useCallback(
    (content) => {
      if (!selectedUserId || !content.trim()) return

      const newMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        senderId: CURRENT_USER_ID,
        receiverId: selectedUserId,
        content,
        timestamp: new Date(),
      }

      // Save to mock history
      saveMessage(selectedUserId, newMessage)

      // Update messages state
      setMessages((prev) => [...prev, newMessage])

      // Emit to socket (mock)
      if (socket) {
        socket.emit("message", {
          receiverId: selectedUserId,
          message: newMessage,
        })
      }

      // Update user's last message
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUserId
            ? {
                ...user,
                lastMessage: content,
                lastMessageTime: new Date(),
              }
            : user
        )
      )

      // Simulate typing indicator after sending (optional)
      setTimeout(() => {
        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
        }, 1500)
      }, 300)
    },
    [selectedUserId, socket]
  )

  // Handle user selection
  const handleSelectUser = React.useCallback((user) => {
    setSelectedUserId(user.id)
    setIsTyping(false)
  }, [])

  // Get selected user object
  const selectedUser = selectedUserId
    ? getUserById(selectedUserId)
    : null

  return (
    <div className={cn("flex h-full w-full overflow-hidden min-h-0", className)}>
      <div className="hidden md:flex md:w-80 lg:w-96 flex-shrink-0">
        <ChatSidebar
          users={users}
          selectedUserId={selectedUserId}
          onSelectUser={handleSelectUser}
          isLoading={isLoading}
        />
      </div>

      {/* Mobile: Show sidebar or chat window */}
      <div className="flex-1 flex min-h-0">
        {selectedUserId ? (
          <div className="flex-1 flex flex-col">
            <ChatWindow
              user={selectedUser}
              messages={messages}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedUserId(null)}
              isTyping={isTyping}
              connectionStatus={connectionStatus}
            />
          </div>
        ) : (
          <div className="flex-1 md:hidden">
            <ChatSidebar
              users={users}
              selectedUserId={selectedUserId}
              onSelectUser={handleSelectUser}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      <Toaster />
    </div>
  )
}

