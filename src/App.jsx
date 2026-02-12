import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatPage } from "@/components/chat/ChatPage"
import Dashboard from "@/pages/dashboard"
import ProfilePage from "@/pages/profile"
import AnalyticsPage from "@/pages/analytics"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

function App() {
  const [page, setPage] = useState("login")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Handle navigation based on window location
  useEffect(() => {
    const path = window.location.pathname
    if (path === "/signup") {
      setPage("signup")
      setIsAuthenticated(false)
    } else if (path === "/login") {
      setPage("login")
      setIsAuthenticated(false)
    } else if (path === "/dashboard") {
      setIsAuthenticated(true)
      setPage("dashboard")
    } else if (path === "/chat") {
      setIsAuthenticated(true)
      setPage("chat")
    } else if (path === "/profile") {
      setIsAuthenticated(true)
      setPage("profile")
    } else if (path === "/analytics") {
      setIsAuthenticated(true)
      setPage("analytics")
    } else if (path === "/" && isAuthenticated) {
      // Redirect authenticated users from root to dashboard
      window.history.pushState({}, "", "/dashboard")
      setPage("dashboard")
    }
  }, [isAuthenticated])

  // Handle login - redirect to dashboard
  const handleLogin = () => {
    setIsAuthenticated(true)
    setPage("dashboard")
    window.history.pushState({}, "", "/dashboard")
  }

  // Handle signup - redirect to dashboard
  const handleSignup = () => {
    setIsAuthenticated(true)
    setPage("dashboard")
    window.history.pushState({}, "", "/dashboard")
  }

  // ---------- LOGIN PAGE ----------
  if (!isAuthenticated && page === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="max-w-4xl w-full relative z-10">
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    )
  }

  // ---------- SIGNUP PAGE ----------
  if (!isAuthenticated && page === "signup") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="max-w-4xl w-full relative z-10">
          <SignupForm onSignup={handleSignup} />
        </div>
      </div>
    )
  }

  // ---------- AUTHENTICATED PAGES (With Sidebar) ----------
  if (isAuthenticated) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {page === "dashboard" ? "Dashboard" : page === "chat" ? "Chat" : page === "profile" ? "Profile" : page === "analytics" ? "Analytics" : ""}
              </h1>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-hidden min-h-0">
            {page === "dashboard" && <Dashboard />}
            {page === "chat" && <ChatPage />}
            {page === "profile" && <ProfilePage />}
            {page === "analytics" && <AnalyticsPage />}
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return null
}

export default App
