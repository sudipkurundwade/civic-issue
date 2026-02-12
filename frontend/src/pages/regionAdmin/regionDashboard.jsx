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
  MoreHorizontal,
  Plus,
  Building2,
} from "lucide-react"

export default function DepartmentDashboard() {
  const [selectedDepartment, setSelectedDepartment] = React.useState("Water Supply")
  const [newDepartment, setNewDepartment] = React.useState("")

  // Departments List
  const departments = [
    { name: "Water Supply", count: 125 },
    { name: "Electricity", count: 84 },
    { name: "Roads", count: 62 },
    { name: "Waste Management", count: 98 },
    { name: "Parks", count: 34 },
    { name: "Sewerage", count: 41 },
  ]

  // Issues Data
  const issues = [
    { id: 1, title: "Water Leakage in Sector 4", department: "Water Supply", time: "2 hours ago", status: "pending" },
    { id: 2, title: "Street Light Malfunction", department: "Electricity", time: "5 hours ago", status: "solved" },
    { id: 3, title: "Pothole on Main Road", department: "Roads", time: "1 day ago", status: "in-progress" },
    { id: 4, title: "Garbage Collection Delayed", department: "Waste Management", time: "1 day ago", status: "solved" },
    { id: 5, title: "Broken Park Bench", department: "Parks", time: "2 days ago", status: "pending" },
    { id: 6, title: "Drain Blockage", department: "Sewerage", time: "3 hours ago", status: "pending" },
  ]

  const filteredIssues = issues.filter(
    (issue) => issue.department === selectedDepartment
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("New Department Added:", newDepartment)
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Department Dashboard</h2>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Department
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department Admin</DialogTitle>
              <DialogDescription>
                Create a new administrator for a department.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" placeholder="admin@example.com" required />
              </div>
              <div className="grid gap-2">
                <Label>Password</Label>
                <Input type="password" required />
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="h-10 rounded-md border px-3 text-sm"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.name} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter>
                <Button type="submit">Submit</Button>
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
            {departments.map((dept) => (
              <div
                key={dept.name}
                onClick={() => setSelectedDepartment(dept.name)}
                className={`flex justify-between p-3 rounded cursor-pointer ${selectedDepartment === dept.name
                  ? "bg-primary text-white"
                  : "hover:bg-accent"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{dept.name}</span>
                </div>
                <Badge variant="outline">{dept.count}</Badge>
              </div>
            ))}
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
