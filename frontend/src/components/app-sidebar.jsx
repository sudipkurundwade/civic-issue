"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Map,
  Building2,
  AlertCircle,
  PieChart,
  MessageSquare,
  User,
  List,
  Megaphone,
  Bell,
  FileText,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import logoImg from "@/assets/logo.png"

const ROLE_NAV = {
  super_admin: [
    { title: "Super Admin Dashboard", url: "/super-dashboard", icon: LayoutDashboard },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Analytics", url: "/analytics", icon: PieChart },
    { title: "Announcements", url: "/announcements", icon: Megaphone },
    { title: "My Announcements", url: "/my-announcements", icon: List },
    { title: "Profile", url: "/profile", icon: User },
  ],
  regional_admin: [
    { title: "Region Dashboard", url: "/region-dashboard", icon: Map },
    { title: "Departments", url: "/region-departments", icon: Building2 },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Analytics", url: "/analytics", icon: PieChart },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Messages", url: "/chat", icon: MessageSquare },
    { title: "Profile", url: "/profile", icon: User },
  ],
  departmental_admin: [
    { title: "Department Dashboard", url: "/dept-dashboard", icon: Building2 },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Announcements", url: "/announcements", icon: Megaphone },
    { title: "Messages", url: "/chat", icon: MessageSquare },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Profile", url: "/profile", icon: User },
  ],
  civic: [
    { title: "Report Issue", url: "/civic-dashboard", icon: AlertCircle },
    { title: "Announcements", url: "/announcements", icon: Megaphone },
    { title: "My Issues", url: "/my-issues", icon: List },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Profile", url: "/profile", icon: User },
  ],
}

export function AppSidebar({ user, onLogout, page, onNavigate }) {
  const baseNav = ROLE_NAV[user?.role] || ROLE_NAV.civic

  const navItems = baseNav.map((item, idx) => {
    if (idx !== 0) return item

    if (user?.role === "departmental_admin" && user?.department?.name) {
      return { ...item, title: user.department.name }
    }

    if (user?.role === "regional_admin" && user?.region?.name) {
      return { ...item, title: user.region.name }
    }

    return item
  })

  const handleNav = (e, url) => {
    e?.preventDefault?.()
    if (onNavigate) onNavigate(url)
    else window.location.href = url
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/50 bg-gradient-to-br from-orange-50/30 to-transparent">
        <div className="flex items-center gap-3 px-2 py-3 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          {/* Logo - Always visible, size adjusts based on sidebar state */}
          <div className="shrink-0 w-10 h-10 transition-all duration-200 group-data-[collapsible=icon]:w-14 group-data-[collapsible=icon]:h-14">
            <img
              src={logoImg}
              alt="Civic Issue Reporter Logo"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
          
          {/* Text content - Hidden when collapsed */}
          <div className="flex-1 min-w-0 overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:hidden">
            <h2 className="font-semibold text-lg bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent truncate">
              Civic Issue
            </h2>
            <p className="text-xs text-muted-foreground capitalize truncate">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} currentPage={page} onNavigate={handleNav} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || "User",
            email: user?.email || "",
            avatar: null,
          }}
          onLogout={onLogout}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
