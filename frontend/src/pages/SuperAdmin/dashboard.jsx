import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  ArrowUpRight,
  Plus,
} from "lucide-react"
import { adminService } from "@/services/adminService"
import { issueService } from "@/services/issueService"
import { notificationService } from "@/services/notificationService"
import { useToast } from "@/components/ui/use-toast"
import { IssueDetailDialog } from "@/components/IssueDetailDialog"

const formatTimeAgo = (date) => {
  const sec = Math.floor((Date.now() - date) / 1000)
  if (sec < 60) return "Just now"
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`
  if (sec < 604800) return `${Math.floor(sec / 86400)} days ago`
  return date.toLocaleDateString()
}

export default function SuperAdminDashboard() {
  const { toast } = useToast()

  // Navigation function
  const navigate = (path) => {
    window.history.pushState({}, "", path)
    window.location.reload() // Reload to trigger the App.jsx routing logic
  }

  const [regions, setRegions] = React.useState([])
  const [availableRegions, setAvailableRegions] = React.useState([])
  const [selectedRegion, setSelectedRegion] = React.useState("all")
  const [adminEmail, setAdminEmail] = React.useState("")
  const [adminPassword, setAdminPassword] = React.useState("")
  const [adminName, setAdminName] = React.useState("")
  const [adminRegion, setAdminRegion] = React.useState("")
  const [newRegionName, setNewRegionName] = React.useState("")
  const [isCreateNewRegion, setIsCreateNewRegion] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [regionsKey, setRegionsKey] = React.useState(0)
  const [allIssues, setAllIssues] = React.useState([])
  const [selectedIssue, setSelectedIssue] = React.useState(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [report, setReport] = React.useState(null)

  // Check for URL parameters to auto-open dialogs
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('createRegion') === 'true') {
      setDialogOpen(true)
      // Clean the URL
      window.history.replaceState({}, '', '/super-dashboard')

      // Try to get the requested region name from notifications
      notificationService.getMyNotifications().then(notifications => {
        const missingRegionNotification = notifications.find(n =>
          n.type === 'MISSING_REGION' && !n.read
        )
        if (missingRegionNotification?.issue?.requestedRegionName) {
          // Note: newRegionName was removed, we might need it back or handle differently
          // But I'll just keep the structure for now.
        }
      }).catch(() => {
        // Silently fail if we can't get notifications
      })
    }
  }, [])

  React.useEffect(() => {
    if (dialogOpen) {
      adminService.getAvailableRegions()
        .then(setAvailableRegions)
        .catch(() => toast({ title: "Failed to load available regions", variant: "destructive" }))
    }
  }, [dialogOpen])

  React.useEffect(() => {
    adminService.getRegions()
      .then(setRegions)
      .catch(() => toast({ title: "Failed to load regions", variant: "destructive" }))
  }, [regionsKey])

  // Debug: Log regions to see what's happening
  React.useEffect(() => {
    console.log('Regions loaded:', regions)
  }, [regions])

  // Remove duplicate regions by name (case-insensitive)
  const uniqueRegions = React.useMemo(() => {
    const seen = new Set();
    return regions.filter(region => {
      const normalizedName = region.name.toLowerCase().trim();
      if (seen.has(normalizedName)) {
        return false;
      }
      seen.add(normalizedName);
      return true;
    });
  }, [regions])

  React.useEffect(() => {
    issueService.getAllIssues()
      .then(setAllIssues)
      .catch(() => setAllIssues([]))
  }, [])

  const recentIssues = allIssues.map((i) => ({
    id: i.id,
    title: i.description?.slice(0, 60) || "Issue",
    department: i.department?.name || "—",
    time: i.createdAt ? formatTimeAgo(new Date(i.createdAt)) : "",
    status: (i.status || "PENDING").toLowerCase().replace("_", "-"),
    region: i.department?.region?.name || "—",
  }))
  const totalPending = recentIssues.filter((i) => i.status !== "completed").length
  const totalSolved = recentIssues.filter((i) => i.status === "completed").length
  const stats = [
    { title: "Total Regions", value: String(uniqueRegions.length), change: "", icon: MapPin, description: "administrative regions" },
    { title: "Total Issues", value: String(allIssues.length), change: "", icon: AlertCircle, description: "all reported issues" },
    { title: "Pending", value: String(totalPending), change: "", icon: Clock, description: "awaiting resolution" },
    { title: "Solved", value: String(totalSolved), change: "", icon: CheckCircle, description: "resolved" },
  ]

  const handleCreateRegionalAdmin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const selectedRegionObj = availableRegions.find(r => r.id === adminRegion || r.name === adminRegion);
      const isNew = selectedRegionObj && !selectedRegionObj.id;

      const result = await adminService.createRegionalAdmin({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        regionId: isNew ? null : adminRegion || null,
        regionName: isNew ? adminRegion : null,
      })
      toast({ title: "Regional admin created successfully" })
      setDialogOpen(false)
      // Refresh regions list when either admin or region is created
      setRegionsKey((k) => k + 1)
      // Trigger immediate notification refresh by emitting a custom event
      window.dispatchEvent(new CustomEvent('notificationRefresh'))
      setAdminEmail("")
      setAdminPassword("")
      setAdminName("")
      setAdminRegion("")
      setNewRegionName("")
      setIsCreateNewRegion(false)
    } catch (err) {
      toast({ title: err.message || "Failed to create admin", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filteredIssues = !selectedRegion || selectedRegion === "all"
    ? recentIssues
    : recentIssues.filter((issue) => issue.region === selectedRegion)

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">SuperAdmin Dashboard</h2>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Regional Admin
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Regional Admin</DialogTitle>
              <DialogDescription>
                Create a new administrator for a region. They can manage departments and create departmental admins.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateRegionalAdmin} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Admin name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@region.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Region</Label>
                <select
                  value={adminRegion}
                  onChange={(e) => setAdminRegion(e.target.value)}
                  className="h-10 w-full rounded-md border px-3 text-sm"
                  required
                >
                  <option value="">Select Region</option>
                  {availableRegions.map((region) => (
                    <option key={region.id || region.name} value={region.id || region.name}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Admin"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>


      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row justify-between pb-2">
                <CardTitle className="text-sm">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change} {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Regions & Issues */}
      <div className="grid gap-4 md:grid-cols-12">
        {/* Regions */}
        <Card className="md:col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Select Region</CardTitle>
            <CardDescription>Filter issues by region or view all</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div
              onClick={() => setSelectedRegion("all")}
              className={`flex justify-between p-3 rounded cursor-pointer ${(!selectedRegion || selectedRegion === "all")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
                }`}
            >
              <span>All Issues</span>
            </div>
            {uniqueRegions.map((region) => (
              <div
                key={region.id}
                onClick={() => setSelectedRegion(region.name)}
                className={`flex justify-between p-3 rounded cursor-pointer ${selectedRegion === region.name
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
                  }`}
              >
                <span>{region.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Issues */}
        <Card className="md:col-span-8 lg:col-span-9">
          <CardHeader>
            <CardTitle>Issues {selectedRegion && selectedRegion !== "all" ? `in ${selectedRegion}` : "(All)"}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredIssues.length > 0 ? (
              <div className="space-y-4">
                {filteredIssues.map((issue) => {
                  const fullIssue = allIssues.find((i) => String(i.id) === String(issue.id)) || issue
                  return (
                    <div
                      key={issue.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => { setSelectedIssue({ ...fullIssue, ...issue, likes: 0, comments: 0 }); setDetailOpen(true) }}
                      onKeyDown={(e) => e.key === "Enter" && (setSelectedIssue({ ...fullIssue, ...issue, likes: 0, comments: 0 }), setDetailOpen(true))}
                      className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    >
                      <div className="flex justify-between">
                        <p className="font-medium">{issue.title}</p>
                        <Badge>{issue.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {issue.department}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {issue.time}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No recent issues in this region.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <IssueDetailDialog open={detailOpen} onClose={() => setDetailOpen(false)} issue={selectedIssue} />

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const data = await adminService.getSystemReport()
                setReport(data)
                toast({ title: "System report generated" })
              } catch (err) {
                toast({ title: err.message || "Failed to generate report", variant: "destructive" })
              }
            }}
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline">
            <CheckCircle className="mr-2 h-4 w-4" />
            Review Solved Cases
          </Button>
          <Button variant="outline" className="text-red-600">
            <AlertCircle className="mr-2 h-4 w-4" />
            View Critical Issues
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>System Report Summary</CardTitle>
            <CardDescription>High-level overview of issues, performance, and SLA.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-semibold">Total Issues:</span> {report.totalIssues}</p>
            <div>
              <p className="font-semibold">Status Distribution:</p>
              <ul className="list-disc list-inside text-muted-foreground">
                {Object.entries(report.statusDistribution || {}).map(([status, count]) => (
                  <li key={status}>{status}: {count}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold">SLA:</p>
              <p className="text-muted-foreground">
                Threshold {report.sla?.thresholdHours}h · Completed {report.sla?.totalCompleted} · Breaches {report.sla?.totalBreaches}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
