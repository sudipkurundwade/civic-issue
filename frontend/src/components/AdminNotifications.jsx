import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Bell, Plus, AlertTriangle, MapPin, ArrowRight } from "lucide-react"
import { notificationService } from "@/services/notificationService"
import { useToast } from "@/components/ui/use-toast"

const formatWhen = (dateString) => {
  if (!dateString) return ""
  const d = new Date(dateString)
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diffSec < 60) return "Just now"
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} days ago`
  return d.toLocaleDateString()
}

export default function AdminNotifications({ userRole = "super_admin", onNavigate }) {
  const { toast } = useToast()
  const [notifications, setNotifications] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(() => {
    setLoading(true)
    notificationService
      .getMyNotifications()
      .then((data) => setNotifications(data))
      .catch(() => {
        setNotifications([])
        toast({ title: "Failed to load notifications", variant: "destructive" })
      })
      .finally(() => setLoading(false))
  }, [toast])

  React.useEffect(() => {
    load()
  }, [load])

  // Listen for custom notification refresh events
  React.useEffect(() => {
    const handleNotificationRefresh = () => {
      console.log('Notification refresh event received')
      load()
    }
    
    window.addEventListener('notificationRefresh', handleNotificationRefresh)
    
    return () => {
      window.removeEventListener('notificationRefresh', handleNotificationRefresh)
    }
  }, [])

  const handleNotificationClick = (notification) => {
    if (notification.type === 'MISSING_REGION' && userRole === 'super_admin') {
      // Navigate to Super Admin dashboard with region creation trigger
      if (onNavigate) {
        onNavigate('/super-dashboard?createRegion=true')
      }
      // Mark as read
      notificationService.markRead(notification.id).then(() => load())
    } else if (notification.type === 'MISSING_DEPARTMENT' && userRole === 'regional_admin') {
      // Navigate to Regional Admin dashboard with department creation trigger
      if (onNavigate) {
        onNavigate('/region-dashboard?createDepartment=true')
      }
      notificationService.markRead(notification.id).then(() => load())
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const actionableNotifications = notifications.filter(n => 
    (n.type === 'MISSING_REGION' && userRole === 'super_admin') ||
    (n.type === 'MISSING_DEPARTMENT' && userRole === 'regional_admin')
  )

  return (
    <div className="space-y-4">
      {/* Actionable Notifications */}
      {actionableNotifications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Action Required
            </CardTitle>
            <CardDescription>
              Issues need your attention to create missing regions or departments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actionableNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 rounded-md border px-3 py-2 transition-colors ${
                    n.read ? "bg-background" : "bg-orange-100 border-orange-300 hover:bg-orange-200"
                  }`}
                >
                  <div className="mt-1">
                    <Bell className={`h-4 w-4 ${n.read ? "text-muted-foreground" : "text-orange-600"}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{n.title}</p>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatWhen(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => handleNotificationClick(n)}>
                      <ArrowRight className="mr-2 h-3 w-3" />
                      {n.type === 'MISSING_REGION' ? 'Go to Create Region' : 'Go to Create Department'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regular Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Notifications</span>
            <Badge variant={unreadCount ? "destructive" : "secondary"}>
              {unreadCount ? `${unreadCount} unread` : "All caught up"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground space-y-2">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">No notifications yet</p>
              <p className="text-sm">You'll see updates here when things change.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 rounded-md border px-3 py-2 ${
                    n.read ? "bg-background" : "bg-muted/60 border-primary/40"
                  }`}
                >
                  <div className="mt-1">
                    <Bell className={`h-4 w-4 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{n.title}</p>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatWhen(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
