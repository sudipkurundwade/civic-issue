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
  ArrowUpRight,
  Plus,
  Building2,
  AlertTriangle,
} from "lucide-react"
import { adminService } from "@/services/adminService"
import { issueService } from "@/services/issueService"
import { useToast } from "@/components/ui/use-toast"
import { IssueDetailDialog } from "@/components/IssueDetailDialog"

// Standard department options for a region.
const PREDEFINED_DEPARTMENTS = [
  "Roads & Infrastructure",
  "Water Supply",
  "Sanitation & Garbage",
  "Electricity / Street Lights",
  "Drainage & Sewage",
  "Public Health",
  "Encroachment / Illegal Construction",
  "Traffic & Public Safety",
  "Parks & Public Spaces",
  "Animal Control",
]

export default function DepartmentDashboard() {
  const { toast } = useToast()
  const [departments, setDepartments] = React.useState([])
  const [selectedDepartment, setSelectedDepartment] = React.useState("all")
  const [adminName, setAdminName] = React.useState("")
  const [adminEmail, setAdminEmail] = React.useState("")
  const [adminPassword, setAdminPassword] = React.useState("")
  const [adminDept, setAdminDept] = React.useState("")
  const [newDeptName, setNewDeptName] = React.useState("")
  const [isCreateNewDept, setIsCreateNewDept] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [allIssues, setAllIssues] = React.useState([])
  const [selectedIssue, setSelectedIssue] = React.useState(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [pendingIssues, setPendingIssues] = React.useState([])
  const [assigningDept, setAssigningDept] = React.useState(null)

  // Departments that have NOT yet been created in this region,
  // based on the standard list above.
  const availableDeptNames = React.useMemo(() => {
    const existing = new Set(
      departments.map((d) => String(d.name || "").toLowerCase().trim())
    )
    return PREDEFINED_DEPARTMENTS.filter(
      (name) => !existing.has(name.toLowerCase().trim())
    )
  }, [departments])

  React.useEffect(() => {
    adminService.getDepartments().then(setDepartments).catch(() => toast({ title: "Failed to load departments", variant: "destructive" }))
  }, [dialogOpen])

  React.useEffect(() => {
    issueService.getAllIssues().then(setAllIssues).catch(() => setAllIssues([]))
  }, [])
  React.useEffect(() => {
    adminService.getPendingDepartmentIssues().then(setPendingIssues).catch(() => setPendingIssues([]))
  }, [dialogOpen])

  const deptIds = departments.map((d) => String(d.id ?? d._id ?? ""))
  const regionIssues = allIssues.filter((i) => {
    const deptId = String(i.department?.id ?? i.department?._id ?? i.department ?? "")
    return deptIds.includes(deptId) && deptId
  }).map((i) => ({
    id: i.id,
    title: i.description?.slice(0, 60) || "Issue",
    department: i.department?.name || "—",
    time: i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "",
    status: (i.status || "PENDING").toLowerCase().replace("_", "-"),
  }))
  const filteredIssues = !selectedDepartment || selectedDepartment === "all"
    ? regionIssues
    : regionIssues.filter((i) => i.department === selectedDepartment)

  const handleCreateDeptAndAssign = async (deptName) => {
    // Open the existing \"Create Departmental Admin\" dialog
    // with \"Create new department\" checked and name pre-filled,
    // so the regional admin can enter name/email/password like manual flow.
    setIsCreateNewDept(true)
    setNewDeptName(deptName)
    setDialogOpen(true)
  }

  const pendingByDept = pendingIssues.reduce((acc, i) => {
    const name = i.requestedDepartmentName || "Unknown"
    if (!acc[name]) acc[name] = []
    acc[name].push(i)
    return acc
  }, {})

  const pendingDeptCount = Object.keys(pendingByDept).length

  const handleCreateDepartmentalAdmin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminService.createDepartmentalAdmin({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        departmentId: isCreateNewDept ? null : adminDept || null,
        departmentName: isCreateNewDept ? newDeptName.trim() : null,
      })
      toast({ title: "Departmental admin created successfully" })
      setDialogOpen(false)
      setAdminName(""); setAdminEmail(""); setAdminPassword("")
      setAdminDept(""); setNewDeptName(""); setIsCreateNewDept(false)
      adminService.getDepartments().then(setDepartments)
      adminService.getPendingDepartmentIssues().then(setPendingIssues)
      issueService.getAllIssues().then(setAllIssues)
    } catch (err) {
      toast({ title: err.message || "Failed to create admin", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold">Region Admin Dashboard</h2>
          {pendingDeptCount > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 px-3 py-1 text-xs font-medium">
              <AlertTriangle className="h-3 w-3" />
              <span>{pendingDeptCount} department{pendingDeptCount > 1 ? "s" : ""} need to be created for citizen issues</span>
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Departmental Admin
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Departmental Admin</DialogTitle>
              <DialogDescription>
                Create a new administrator for a department. They can receive and resolve issues.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateDepartmentalAdmin} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Admin name" required />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@dept.com" required />
              </div>
              <div className="grid gap-2">
                <Label>Password</Label>
                <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isCreateNewDept}
                    onChange={(e) => {
                      setIsCreateNewDept(e.target.checked)
                      // Reset selection when switching modes
                      setAdminDept("")
                      setNewDeptName("")
                    }}
                  />
                  Create new department
                </label>
                {isCreateNewDept ? (
                  availableDeptNames.length > 0 ? (
                    <select
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="h-10 w-full rounded-md border px-3 text-sm"
                      required
                    >
                      <option value="">Select Department</option>
                      {availableDeptNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      All standard departments have already been created for this region.
                    </p>
                  )
                ) : (
                  <select
                    value={adminDept}
                    onChange={(e) => setAdminDept(e.target.value)}
                    className="h-10 w-full rounded-md border px-3 text-sm"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={loading || (isCreateNewDept && availableDeptNames.length === 0)}
                >
                  {loading ? "Creating..." : "Create Admin"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending - Awaiting Department Creation */}
      {Object.keys(pendingByDept).length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" />
              Issues Awaiting Department
            </CardTitle>
            <CardDescription>
              Citizens reported issues for departments that don&apos;t exist. Create the department to assign these issues.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(pendingByDept).map(([deptName, issues]) => (
              <div key={deptName} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-background">
                <div>
                  <p className="font-medium">{deptName}</p>
                  <p className="text-sm text-muted-foreground">{issues.length} issue(s) waiting</p>
                </div>
                <Button
                  onClick={() => handleCreateDeptAndAssign(deptName)}
                  disabled={assigningDept === deptName}
                >
                  {assigningDept === deptName ? "Creating..." : "Create Department & Assign"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Departments & Issues Layout */}
      <div className="grid gap-4 md:grid-cols-12">

        {/* Departments List */}
        <Card className="md:col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Select Department</CardTitle>
            <CardDescription>Filter issues by department or view all</CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            <div
              onClick={() => setSelectedDepartment("all")}
              className={`flex justify-between p-3 rounded cursor-pointer ${(!selectedDepartment || selectedDepartment === "all") ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              <span>All Issues</span>
            </div>
            {departments.map((dept) => (
              <div
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.name)}
                className={`flex justify-between p-3 rounded cursor-pointer ${selectedDepartment === dept.name ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{dept.name}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Issues Section */}
        <Card className="md:col-span-8 lg:col-span-9">
          <CardHeader>
            <CardTitle>Issues {selectedDepartment && selectedDepartment !== "all" ? `in ${selectedDepartment}` : "(All in your region)"}</CardTitle>
          </CardHeader>

          <CardContent>
            {filteredIssues.length > 0 ? (
              <div className="space-y-4">
                {filteredIssues.map((issue) => {
                  const fullIssue = allIssues.find((i) => String(i.id) === String(issue.id))
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
                No issues in {selectedDepartment && selectedDepartment !== "all" ? "this department" : "your region"}.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <IssueDetailDialog open={detailOpen} onClose={() => setDetailOpen(false)} issue={selectedIssue} />

      {/* Department Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Department Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <Button variant="outline">
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

    </div>
  )
}
