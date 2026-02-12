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
import { Clock, Bell, CheckCircle } from "lucide-react"
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

export default function NotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [markingAll, setMarkingAll] = React.useState(false)

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

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkRead = async (id) => {
    try {
      const updated = await notificationService.markRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      )
    } catch (err) {
      toast({ title: err.message || "Failed to update notification", variant: "destructive" })
    }
  }

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true)
      await notificationService.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      toast({ title: err.message || "Failed to update notifications", variant: "destructive" })
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h2>
          <p className="text-muted-foreground">
            Stay up to date when your issues move forward or new work is assigned.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={unreadCount ? "destructive" : "secondary"}>
            {unreadCount ? `${unreadCount} unread` : "All caught up"}
          </Badge>
          {notifications.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllRead}
              disabled={markingAll || unreadCount === 0}
            >
              {markingAll ? "Marking..." : "Mark all as read"}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>
            Changes to your reported issues or assignments for your department.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground space-y-2">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="font-medium">No notifications yet</p>
              <p className="text-sm">You&apos;ll see updates here when things change.</p>
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
                  {!n.read && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleMarkRead(n.id)}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

