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

const ROLE_NAV = {
  super_admin: [
    { title: "Super Admin Dashboard", url: "/super-dashboard", icon: LayoutDashboard },
    { title: "Analytics", url: "/analytics", icon: PieChart },
    { title: "Messages", url: "/chat", icon: MessageSquare },
    { title: "Profile", url: "/profile", icon: User },
  ],
<<<<<<< HEAD
  regional_admin: [
    { title: "Region Dashboard", url: "/region-dashboard", icon: Map },
    { title: "Messages", url: "/chat", icon: MessageSquare },
    { title: "Profile", url: "/profile", icon: User },
=======

  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Region Dashboard",
      url: "/region-dashboard",
      icon: Map,
    },
    {
      title: "Dept. Admin",
      url: "/department-admin",
      icon: Command,
    },
    {
      title: "Citizen View",
      url: "/citizen",
      icon: AudioWaveform,
    },
    {
      title: "Messages",
      url: "/chat",
      icon: Bot,
    },
    {
      title: "Investors",
      url: "#",
      icon: BookOpen,
    },
    {
      title: "Pitch Deck",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: PieChart,
    },
>>>>>>> 18511e52e5f12a0000dcb995d1efba0ed8149239
  ],
  departmental_admin: [
    { title: "Department Dashboard", url: "/dept-dashboard", icon: Building2 },
    { title: "Messages", url: "/chat", icon: MessageSquare },
    { title: "Profile", url: "/profile", icon: User },
  ],
  civic: [
    { title: "Report Issue", url: "/civic-dashboard", icon: AlertCircle },
    { title: "Profile", url: "/profile", icon: User },
  ],
}

export function AppSidebar({ user, onLogout, page, onNavigate }) {
  const navItems = ROLE_NAV[user?.role] || ROLE_NAV.civic

  const handleNav = (e, url) => {
    e?.preventDefault?.()
    if (onNavigate) onNavigate(url)
    else window.location.href = url
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-2">
          <h2 className="font-semibold text-lg">Civic Issue</h2>
          <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace("_", " ")}</p>
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
