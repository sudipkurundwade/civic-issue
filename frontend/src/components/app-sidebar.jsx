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
  Trophy,
  Globe,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import logoImg from "@/assets/logo.png"
import { useLanguage, LANGUAGES } from "@/context/LanguageContext"

// Nav key → translation key mapping
const NAV_KEYS = {
  "Super Admin Dashboard": "nav.superAdminDashboard",
  "Reports": "nav.reports",
  "Notifications": "nav.notifications",
  "Analytics": "nav.analytics",
  "Announcements": "nav.announcements",
  "Heat Map": "nav.heatMap",
  "My Announcements": "nav.myAnnouncements",
  "Profile": "nav.profile",
  "Region Dashboard": "nav.regionDashboard",
  "Departments": "nav.departments",
  "Department Dashboard": "nav.departmentDashboard",
  "Report Issue": "nav.reportIssue",
  "My Issues": "nav.myIssues",
  "Leaderboard": "nav.leaderboard",
}

const ROLE_NAV = {
  super_admin: [
    { title: "Super Admin Dashboard", url: "/super-dashboard", icon: LayoutDashboard },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Analytics", url: "/analytics", icon: PieChart },
    { title: "Announcements", url: "/announcements", icon: Megaphone },
    { title: "Heat Map", url: "/heatmap", icon: Map },
    { title: "My Announcements", url: "/my-announcements", icon: List },
    { title: "Profile", url: "/profile", icon: User },
  ],
  regional_admin: [
    { title: "Region Dashboard", url: "/region-dashboard", icon: Map },
    { title: "Departments", url: "/region-departments", icon: Building2 },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Analytics", url: "/analytics", icon: PieChart },
    { title: "Announcements", url: "/announcements", icon: Megaphone },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Heat Map", url: "/heatmap", icon: Map },
    { title: "Profile", url: "/profile", icon: User },
  ],
  departmental_admin: [
    { title: "Department Dashboard", url: "/dept-dashboard", icon: Building2 },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Announcements", url: "/announcements", icon: Megaphone },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Heat Map", url: "/heatmap", icon: Map },
    { title: "Profile", url: "/profile", icon: User },
  ],
  civic: [
    { title: "Report Issue", url: "/citizen-dashboard", icon: AlertCircle },
    { title: "Heat Map", url: "/heatmap", icon: Map },
    { title: "Announcements", url: "/announcements", icon: Megaphone },
    { title: "My Issues", url: "/my-issues", icon: List },
    { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Profile", url: "/profile", icon: User },
  ],
}

export function AppSidebar({ user, onLogout, page, onNavigate }) {
  const { lang, setLang, t } = useLanguage()
  const [langOpen, setLangOpen] = React.useState(false)

  const baseNav = ROLE_NAV[user?.role] || ROLE_NAV.civic

  const navItems = baseNav.map((item, idx) => {
    // Translate title
    const translated = { ...item, title: t(NAV_KEYS[item.title] || item.title) }

    if (idx !== 0) return translated

    if (user?.role === "departmental_admin" && user?.department?.name) {
      return { ...translated, title: user.department.name }
    }

    if (user?.role === "regional_admin" && user?.region?.name) {
      return { ...translated, title: user.region.name }
    }

    return translated
  })

  const handleNav = (e, url) => {
    e?.preventDefault?.()
    if (onNavigate) onNavigate(url)
    else window.location.href = url
  }

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/50 bg-gradient-to-br from-orange-50/30 to-transparent">
        <div className="flex items-center gap-3 px-2 py-3 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <div className="shrink-0 w-10 h-10 transition-all duration-200 group-data-[collapsible=icon]:w-14 group-data-[collapsible=icon]:h-14">
            <img
              src={logoImg}
              alt="Civic Issue Reporter Logo"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>

          <div className="flex-1 min-w-0 overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:hidden">
            <h2 className="font-semibold text-lg bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent truncate">
              Civic Setu
            </h2>
            <p className="text-xs text-muted-foreground capitalize truncate">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} currentPage={page} onNavigate={handleNav} />

        {/* ── Language Switcher ── */}
        <div className="px-3 py-2 group-data-[collapsible=icon]:px-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="group-data-[collapsible=icon]:hidden">
                <button
                  onClick={() => setLangOpen(o => !o)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Globe className="h-4 w-4 shrink-0 text-orange-500" />
                  <span className="flex-1 text-left">{t("nav.language")}</span>
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">
                    {currentLang.nativeLabel}
                  </span>
                </button>

                {langOpen && (
                  <div className="mt-1 ml-6 flex flex-col gap-1">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false) }}
                        className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${lang === l.code
                            ? "bg-orange-50 text-orange-700 font-semibold"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          }`}
                      >
                        <span>{l.nativeLabel}</span>
                        <span className="text-xs text-muted-foreground">({l.label})</span>
                        {lang === l.code && <span className="ml-auto text-orange-500">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Collapsed state: just globe icon with mini dropdown */}
              <div className="hidden group-data-[collapsible=icon]:flex justify-center">
                <div className="relative">
                  <button
                    onClick={() => setLangOpen(o => !o)}
                    title={t("nav.language")}
                    className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-orange-600 transition-colors"
                  >
                    <Globe className="h-5 w-5" />
                  </button>
                  {langOpen && (
                    <div className="absolute left-10 top-0 z-50 bg-popover border rounded-md shadow-lg p-1 flex flex-col gap-1 min-w-[130px]">
                      {LANGUAGES.map(l => (
                        <button
                          key={l.code}
                          onClick={() => { setLang(l.code); setLangOpen(false) }}
                          className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${lang === l.code
                              ? "bg-orange-50 text-orange-700 font-semibold"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                        >
                          {l.nativeLabel}
                          {lang === l.code && <span className="ml-auto text-orange-500">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
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
