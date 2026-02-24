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
  Upload,
} from "lucide-react"
import * as XLSX from "xlsx"
import { adminService } from "@/services/adminService"
import { issueService } from "@/services/issueService"
import { notificationService } from "@/services/notificationService"
import { useToast } from "@/components/ui/use-toast"
import { IssueDetailDialog } from "@/components/IssueDetailDialog"
import { useLanguage } from "@/context/LanguageContext"
import sampleCSV from "@/assets/bulk_regional_admins_sample.csv?url"


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
  const { t } = useLanguage()

  // Navigation function
  const navigate = (path) => {
    window.history.pushState({}, "", path)
    window.location.reload() // Reload to trigger the App.jsx routing logic
  }

  const REGION_OPTIONS = [
    "Gadhinglaj", "Jaysingpur", "Panahala", "Murgud", "Kurundwad",
    "Kagal", "Wadgaon (Hatkanangale)", "Malkapur (Shahuwadi)", "Ajara",
    "Chandgad", "Hupari", "Kolhapur", "Ichalkaranji"
  ]

  const [regions, setRegions] = React.useState([])
  const [selectedRegion, setSelectedRegion] = React.useState("all")
  const [adminEmail, setAdminEmail] = React.useState("")
  const [adminPassword, setAdminPassword] = React.useState("")
  const [adminName, setAdminName] = React.useState("")
  const [adminRegion, setAdminRegion] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [regionsKey, setRegionsKey] = React.useState(0)
  const [allIssues, setAllIssues] = React.useState([])
  const [selectedIssue, setSelectedIssue] = React.useState(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [report, setReport] = React.useState(null)

  // Bulk upload state
  const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false)
  const [bulkFile, setBulkFile] = React.useState(null)
  const [bulkLoading, setBulkLoading] = React.useState(false)
  const [bulkResults, setBulkResults] = React.useState(null)

  // Check for URL parameters to auto-open dialogs
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('createRegion') === 'true') {
      setDialogOpen(true)
      window.history.replaceState({}, '', '/super-dashboard')
    }
  }, [])

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
    { title: t("superAdmin.totalRegions"), value: String(uniqueRegions.length), change: "", icon: MapPin, description: t("superAdmin.adminRegions") },
    { title: t("superAdmin.totalIssues"), value: String(allIssues.length), change: "", icon: AlertCircle, description: t("superAdmin.allReported") },
    { title: t("superAdmin.pending"), value: String(totalPending), change: "", icon: Clock, description: t("superAdmin.awaitingResolution") },
    { title: t("superAdmin.solved"), value: String(totalSolved), change: "", icon: CheckCircle, description: t("superAdmin.resolvedDesc") },
  ]

  const handleCreateRegionalAdmin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await adminService.createRegionalAdmin({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        regionName: adminRegion,
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

  const handleBulkUpload = async () => {
    if (!bulkFile) return
    setBulkLoading(true)
    setBulkResults(null)
    try {
      const buffer = await bulkFile.arrayBuffer()
      const wb = XLSX.read(buffer, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" })
      // Expected columns: name, email, password, regionName
      const admins = rows.map((row) => ({
        name: String(row.name || row.Name || "").trim(),
        email: String(row.email || row.Email || "").trim(),
        password: String(row.password || row.Password || "").trim(),
        regionName: String(row.regionName || row.RegionName || row.region || row.Region || "").trim(),
      })).filter((a) => a.email)

      if (admins.length === 0) {
        toast({ title: "No valid rows found in file", variant: "destructive" })
        setBulkLoading(false)
        return
      }

      console.log('Processed admins for bulk upload:', admins)
      const results = await adminService.bulkUploadRegionalAdmins(admins)
      console.log('Bulk upload results:', results)
      setBulkResults(results)
      const successCount = results.filter((r) => r.success).length
      toast({ title: `Bulk upload done: ${successCount}/${results.length} created` })
      setRegionsKey((k) => k + 1)
    } catch (err) {
      toast({ title: err.message || "Bulk upload failed", variant: "destructive" })
    } finally {
      setBulkLoading(false)
    }
  }

  const handleDownloadSample = () => {
    const link = document.createElement("a")
    link.href = sampleCSV
    link.download = "bulk_regional_admins_sample.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Sample sheet downloaded" })
  }

  const filteredIssues = !selectedRegion || selectedRegion === "all"
    ? recentIssues
    : recentIssues.filter((issue) => issue.region === selectedRegion)

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">{t("superAdmin.title")}</h2>

        <div className="flex gap-2">
          {/* Bulk Upload Dialog */}
          <Dialog open={bulkDialogOpen} onOpenChange={(open) => { setBulkDialogOpen(open); if (!open) { setBulkFile(null); setBulkResults(null) } }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300">
                <Upload className="mr-2 h-4 w-4" /> {t("superAdmin.bulkUpload")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Bulk Upload Regional Admins</DialogTitle>
                  <DialogDescription asChild>
                    <div className="text-sm text-muted-foreground">
                      Upload an Excel (.xlsx) or CSV file. Required columns: <strong>name</strong>, <strong>email</strong>, <strong>password</strong>, <strong>regionName</strong>.
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadSample}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-all duration-200 flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4 rotate-180" />
                          Download Sample Sheet
                        </Button>
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="bulkFile">Select File (.xlsx / .csv)</Label>
                  <Input
                    id="bulkFile"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => { setBulkFile(e.target.files?.[0] || null); setBulkResults(null) }}
                  />
                </div>
                {bulkResults && (
                  <div className="max-h-48 overflow-y-auto space-y-1 text-sm">
                    {bulkResults.map((r, i) => (
                      <div key={i} className={`flex items-center gap-2 p-2 rounded ${r.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {r.success ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                        <span className="truncate">{r.email}</span>
                        {!r.success && <span className="ml-auto shrink-0 text-xs">({r.error})</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleBulkUpload} disabled={!bulkFile || bulkLoading} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                  {bulkLoading ? t("superAdmin.uploading") : t("superAdmin.uploadCreate")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" /> {t("superAdmin.addRegionalAdmin")}
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
                    {REGION_OPTIONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? t("superAdmin.creating") : t("superAdmin.createAdminBtn")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>


      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = [
            "bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50",
            "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50",
            "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50",
            "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50"
          ]
          const iconColors = ["text-orange-600", "text-blue-600", "text-amber-600", "text-emerald-600"]
          const valueColors = ["text-orange-700", "text-blue-700", "text-amber-700", "text-emerald-700"]
          return (
            <Card key={index} className={`${colorClasses[index]} border-2 shadow-sm hover:shadow-md transition-all duration-300`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${iconColors[index]}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${valueColors[index]}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
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
            <CardTitle>{t("superAdmin.selectRegion")}</CardTitle>
            <CardDescription>{t("superAdmin.filterByRegion")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div
              onClick={() => setSelectedRegion("all")}
              className={`flex justify-between p-3 rounded cursor-pointer ${(!selectedRegion || selectedRegion === "all")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
                }`}
            >
              <span>{t("superAdmin.allIssues")}</span>
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
                      className="p-4 border rounded-lg hover:bg-orange-50/50 hover:border-orange-200 hover:shadow-md cursor-pointer transition-all duration-300"
                    >
                      <div className="flex justify-between">
                        <p className="font-medium">{issue.title}</p>
                        <Badge>{issue.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {issue.department}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1 opacity-70">
                          <Clock className="h-3 w-3 text-orange-400" />
                          {issue.time}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${fullIssue.latitude},${fullIssue.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100/50 text-orange-700 hover:bg-orange-100 hover:border-orange-200 transition-all duration-200 group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MapPin className="h-3 w-3 text-orange-500 group-hover:scale-110 transition-transform" />
                          <span className="font-semibold text-[10px] tracking-tight">
                            {fullIssue.address || fullIssue.area || `${fullIssue.latitude}, ${fullIssue.longitude}`}
                          </span>
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-orange-200 rounded-lg bg-gradient-to-br from-orange-50/50 to-transparent">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 mb-4">
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">{t("superAdmin.noIssues")}</p>
                  <p className="text-sm">{t("superAdmin.noIssuesRegion")}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <IssueDetailDialog open={detailOpen} onClose={() => setDetailOpen(false)} issue={selectedIssue} />

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("superAdmin.adminActions")}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <Button
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm hover:shadow-md transition-all duration-300"
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
            {t("superAdmin.generateReport")}
          </Button>
          <Button variant="outline" className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 transition-all duration-300">
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("superAdmin.reviewSolved")}
          </Button>
          <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300">
            <AlertCircle className="mr-2 h-4 w-4" />
            {t("superAdmin.viewCritical")}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>{t("superAdmin.reportTitle")}</CardTitle>
            <CardDescription>{t("superAdmin.reportDesc")}</CardDescription>
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
