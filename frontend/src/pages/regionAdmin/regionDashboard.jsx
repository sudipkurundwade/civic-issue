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
} from "lucide-react"
import { adminService } from "@/services/adminService"
import { useToast } from "@/components/ui/use-toast"

export default function DepartmentDashboard() {
  const { toast } = useToast()
  const [departments, setDepartments] = React.useState([])
  const [selectedDepartment, setSelectedDepartment] = React.useState("")
  const [adminName, setAdminName] = React.useState("")
  const [adminEmail, setAdminEmail] = React.useState("")
  const [adminPassword, setAdminPassword] = React.useState("")
  const [adminDept, setAdminDept] = React.useState("")
  const [newDeptName, setNewDeptName] = React.useState("")
  const [isCreateNewDept, setIsCreateNewDept] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [issues, setIssues] = React.useState([])

  React.useEffect(() => {
    adminService.getDepartments().then(setDepartments).catch(() => toast({ title: "Failed to load departments", variant: "destructive" }))
  }, [dialogOpen])

  const filteredIssues = issues.filter((i) => i.department?.name === selectedDepartment)

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
        <h2 className="text-3xl font-bold">Department Dashboard</h2>

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
                  <input type="checkbox" checked={isCreateNewDept} onChange={(e) => setIsCreateNewDept(e.target.checked)} />
                  Create new department
                </label>
                {isCreateNewDept ? (
                  <Input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="e.g. Road Department" required={isCreateNewDept} />
                ) : (
                  <select value={adminDept} onChange={(e) => setAdminDept(e.target.value)} className="h-10 w-full rounded-md border px-3 text-sm" required={!isCreateNewDept}>
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Admin"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Departments & Issues Layout */}
      <div className="grid gap-4 md:grid-cols-12">

        {/* Departments List */}
        <Card className="md:col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Select department to view issues</CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            {departments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No departments yet. Create a departmental admin and assign a new department.</p>
            ) : (
              departments.map((dept) => (
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
              ))
            )}
          </CardContent>
        </Card>

        {/* Issues Section */}
        <Card className="md:col-span-8 lg:col-span-9">
          <CardHeader>
            <CardTitle>Issues in {selectedDepartment}</CardTitle>
          </CardHeader>

          <CardContent>
            {filteredIssues.length > 0 ? (
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 border rounded-lg hover:bg-accent"
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
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No recent issues in this department.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
