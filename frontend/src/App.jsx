import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatPage } from "@/components/chat/ChatPage"
import SuperAdminDashboard from "@/pages/SuperAdmin/dashboard"
import RegionDashboard from "@/pages/regionAdmin/regionDashboard"
import RegionDepartments from "@/pages/regionAdmin/RegionDepartments"
import DepartmentAdminDashboard from "@/pages/departmentAdmin/departmentdashboard"
import CitizenDashboard from "@/pages/citizen/citizensDashboard"
import MyIssuesPage from "@/pages/citizen/myIssues"
import ProfilePage from "@/pages/SuperAdmin/profile"
import AnalyticsPage from "@/pages/SuperAdmin/analytics"
import NotificationsPage from "@/pages/Notifications"
import AnnouncementsList from "@/pages/shared/AnnouncementsList"
import CreateAnnouncement from "@/pages/shared/CreateAnnouncement"
import ReportsPage from "@/pages/Reports"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"

// Role → Default Home Path
const ROLE_HOME = {
  super_admin: "/super-dashboard",
  regional_admin: "/region-dashboard",
  departmental_admin: "/dept-dashboard",
  civic: "/citizen-dashboard",
}

function AppContent() {
  const { user, loading, logout } = useAuth()
  const [page, setPage] = useState("login")
  const isAuthenticated = !!user

  const homePath = user ? ROLE_HOME[user.role] || "/citizen-dashboard" : "/login"

  const navigate = (path) => {
    window.history.pushState({}, "", path)
    const p = path === "/" ? homePath : path
    setPage(p.slice(1) || "login")
  }

  useEffect(() => {
    const path = window.location.pathname

    if (path === "/signup") {
      setPage("signup")
      return
    }

    if (path === "/login") {
      setPage("login")
      return
    }

    if (!isAuthenticated) {
      setPage("login")
      return
    }

    setPage(path.slice(1).replace(/\//g, "-") || homePath.slice(1))
  }, [isAuthenticated, homePath])

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname

      if (path === "/login" || path === "/signup") {
        setPage(path.slice(1))
      } else if (isAuthenticated) {
        setPage(path.slice(1).replace(/\//g, "-") || homePath.slice(1))
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [isAuthenticated, homePath])

  useEffect(() => {
    if (!user) return

    const path = window.location.pathname
    const rolePaths = Object.values(ROLE_HOME)

    if (path === "/" || (rolePaths.includes(path) && path !== homePath)) {
      window.history.replaceState({}, "", homePath)
      setPage(homePath.slice(1))
    }
  }, [user, homePath])

  const handleLogin = (loggedInUser) => {
    const path = ROLE_HOME[loggedInUser?.role] || "/citizen-dashboard"
    window.history.pushState({}, "", path)
    setPage(path.slice(1))
  }

  const handleSignup = (signedUpUser) => {
    const path = ROLE_HOME[signedUpUser?.role] || "/citizen-dashboard"
    window.history.pushState({}, "", path)
    setPage(path.slice(1))
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

  // Login Page
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

  // Signup Page
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

  // Authenticated Layout
  if (isAuthenticated) {
    const pageTitle =
      page.includes("super-dashboard") ? "Super Admin" :
        page.includes("region-dashboard") ? "Region Dashboard" :
          page.includes("region-departments") ? "Departments" :
            page.includes("dept-dashboard") ? "Department Dashboard" :
              page.includes("citizen-dashboard") ? "Report Issue" :
                page.includes("my-issues") ? "My Issues" :
                  page === "notifications" ? "Notifications" :
                    page === "chat" ? "Chat" :
                      page === "profile" ? "Profile" :
                        page === "analytics" ? "Analytics" :
                          page === "reports" ? "Reports" :
                            page === "announcements" ? "Announcements" :
                              page === "my-announcements" ? "My Announcements" :
                                page === "create-announcement" ? "Create Announcement" :
                                  ""

    return (
      <SidebarProvider>
        <AppSidebar
          user={user}
          onLogout={logout}
          page={page}
          onNavigate={navigate}
        />

        <SidebarInset>
          <header className="flex h-16 items-center gap-2 border-b px-4 bg-background">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{pageTitle}</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-hidden min-h-0">
            {page.includes("super-dashboard") && user?.role === "super_admin" && <SuperAdminDashboard />}
            {page.includes("region-dashboard") && user?.role === "regional_admin" && <RegionDashboard />}
            {page.includes("region-departments") && user?.role === "regional_admin" && <RegionDepartments />}
            {page.includes("dept-dashboard") && user?.role === "departmental_admin" && <DepartmentAdminDashboard />}
            {page.includes("citizen-dashboard") && user?.role === "civic" && <CitizenDashboard />}
            {page.includes("my-issues") && user?.role === "civic" && <MyIssuesPage />}
            {page === "notifications" && <NotificationsPage />}
            {page === "chat" && <ChatPage />}
            {page === "profile" && <ProfilePage />}
            {page === "analytics" && (user?.role === "super_admin" || user?.role === "regional_admin") && <AnalyticsPage />}
            {page === "reports" && <ReportsPage />}
            {page === "announcements" && <AnnouncementsList />}
            {page === "my-announcements" && <AnnouncementsList mode="my" />}
            {page === "create-announcement" && <CreateAnnouncement />}
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return null
}

export default function App() {
  return <AppContent />
}
