// Mock Chat Service
// In a real application, this would be replaced with actual API calls

// Mock users data
export const mockUsers = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    status: "online",
    lastMessage: "Hey, how are you?",
    lastMessageTime: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Bob Smith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    status: "online",
    lastMessage: "See you later!",
    lastMessageTime: new Date(Date.now() - 30 * 60000), // 30 minutes ago
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Charlie Brown",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    status: "offline",
    lastMessage: "Thanks for the help!",
    lastMessageTime: new Date(Date.now() - 2 * 3600000), // 2 hours ago
    unreadCount: 1,
  },
  {
    id: "4",
    name: "Diana Prince",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
    status: "online",
    lastMessage: "Are you coming to the meeting?",
    lastMessageTime: new Date(Date.now() - 1 * 3600000), // 1 hour ago
    unreadCount: 0,
  },
  {
    id: "5",
    name: "Eve Williams",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve",
    status: "offline",
    lastMessage: "Let's catch up soon!",
    lastMessageTime: new Date(Date.now() - 24 * 3600000), // 1 day ago
    unreadCount: 0,
  },
  {
    id: "6",
    name: "Frank Miller",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank",
    status: "online",
    lastMessage: "The project is complete!",
    lastMessageTime: new Date(Date.now() - 15 * 60000), // 15 minutes ago
    unreadCount: 3,
  },
]

// Mock chat history
export const mockChatHistory = {
  "1": [
    {
      id: "m1",
      senderId: "current-user",
      receiverId: "1",
      content: "Hi Alice!",
      timestamp: new Date(Date.now() - 10 * 60000),
    },
    {
      id: "m2",
      senderId: "1",
      receiverId: "current-user",
      content: "Hey, how are you?",
      timestamp: new Date(Date.now() - 5 * 60000),
    },
  ],
  "2": [
    {
      id: "m3",
      senderId: "2",
      receiverId: "current-user",
      content: "See you later!",
      timestamp: new Date(Date.now() - 30 * 60000),
    },
  ],
  "3": [
    {
      id: "m4",
      senderId: "current-user",
      receiverId: "3",
      content: "No problem!",
      timestamp: new Date(Date.now() - 2 * 3600000),
    },
    {
      id: "m5",
      senderId: "3",
      receiverId: "current-user",
      content: "Thanks for the help!",
      timestamp: new Date(Date.now() - 2 * 3600000),
    },
  ],
  "4": [
    {
      id: "m6",
      senderId: "4",
      receiverId: "current-user",
      content: "Are you coming to the meeting?",
      timestamp: new Date(Date.now() - 1 * 3600000),
    },
  ],
  "5": [
    {
      id: "m7",
      senderId: "current-user",
      receiverId: "5",
      content: "Sure thing!",
      timestamp: new Date(Date.now() - 24 * 3600000),
    },
    {
      id: "m8",
      senderId: "5",
      receiverId: "current-user",
      content: "Let's catch up soon!",
      timestamp: new Date(Date.now() - 24 * 3600000),
    },
  ],
  "6": [
    {
      id: "m9",
      senderId: "6",
      receiverId: "current-user",
      content: "The project is complete!",
      timestamp: new Date(Date.now() - 15 * 60000),
    },
  ],
}

// Current user ID
export const CURRENT_USER_ID = "current-user"

// Helper function to format time
export const formatTime = (date) => {
  const now = new Date()
  const messageDate = new Date(date)
  const diffInMs = now - messageDate
  const diffInMinutes = Math.floor(diffInMs / 60000)
  const diffInHours = Math.floor(diffInMs / 3600000)
  const diffInDays = Math.floor(diffInMs / 86400000)

  if (diffInMinutes < 1) {
    return "Just now"
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`
  } else {
    return messageDate.toLocaleDateString()
  }
}

// Helper function to format message time
export const formatMessageTime = (date) => {
  const messageDate = new Date(date)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  )

  if (messageDay.getTime() === today.getTime()) {
    // Today - show time only
    return messageDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  } else {
    // Older messages - show date and time
    return messageDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }
}

// Save message to mock history
export const saveMessage = (chatId, message) => {
  if (!mockChatHistory[chatId]) {
    mockChatHistory[chatId] = []
  }
  mockChatHistory[chatId].push(message)
  return message
}

// Get chat history for a user
export const getChatHistory = (chatId) => {
  return mockChatHistory[chatId] || []
}

// Get user by ID
export const getUserById = (userId) => {
  return mockUsers.find((user) => user.id === userId)
}

