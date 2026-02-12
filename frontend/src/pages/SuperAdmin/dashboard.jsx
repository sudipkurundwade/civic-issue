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
  MoreHorizontal,
  Plus,
} from "lucide-react"

export default function SuperAdminDashboard() {
  const [selectedRegion, setSelectedRegion] = React.useState("Karveer")
  const [adminRegion, setAdminRegion] = React.useState("")

  const stats = [
    {
      title: "Total Regions",
      value: "12",
      change: "",
      icon: MapPin,
      description: "active administrative wards",
    },
    {
      title: "Total Issues",
      value: "1,248",
      change: "+12%",
      icon: AlertCircle,
      description: "reported this month",
    },
    {
      title: "Pending",
      value: "432",
      change: "+5%",
      icon: Clock,
      description: "currently active",
    },
    {
      title: "Solved",
      value: "816",
      change: "+18%",
      icon: CheckCircle,
      description: "resolved this month",
    },
  ]

  const recentIssues = [
    { id: 1, title: "Water Leakage in Sector 4", department: "Water Supply", time: "2 hours ago", status: "pending", priority: "high", region: "Karveer" },
    { id: 2, title: "Street Light Malfunction", department: "Electricity", time: "5 hours ago", status: "solved", priority: "medium", region: "Panhala" },
    { id: 3, title: "Pothole on Main Road", department: "Roads", time: "1 day ago", status: "in-progress", priority: "high", region: "Karveer" },
    { id: 4, title: "Garbage Collection Delayed", department: "Waste Management", time: "1 day ago", status: "solved", priority: "low", region: "Shirol" },
    { id: 5, title: "Broken Park Bench", department: "Parks", time: "2 days ago", status: "pending", priority: "low", region: "Hatkanangale" },
    { id: 6, title: "Pipeline Burst", department: "Water Supply", time: "3 hours ago", status: "pending", priority: "critical", region: "Karveer" },
    { id: 7, title: "Illegal Dumping", department: "Waste Management", time: "4 hours ago", status: "in-progress", priority: "medium", region: "Panhala" },
  ]

  const kolhapurRegions = [
    { name: "Karveer", count: 125 },
    { name: "Panhala", count: 84 },
    { name: "Radhanagari", count: 45 },
    { name: "Shirol", count: 62 },
    { name: "Hatkanangale", count: 98 },
  ]

  const filteredIssues = recentIssues.filter(
    (issue) => issue.region === selectedRegion
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Admin added for region:", adminRegion)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">SuperAdmin Dashboard</h2>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Admin
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Create a new administrator for a region.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" required />
              </div>

              <div className="grid gap-2">
                <Label>Password</Label>
                <Input type="password" required />
              </div>

              <div className="grid gap-2">
                <Label>Region</Label>
                <select
                  value={adminRegion}
                  onChange={(e) => setAdminRegion(e.target.value)}
                  className="h-10 rounded-md border px-3 text-sm"
                  required
                >
                  <option value="">Select Region</option>
                  {kolhapurRegions.map((region) => (
                    <option key={region.name} value={region.name}>
                      {region.name}
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
            <CardTitle>Regions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {kolhapurRegions.map((region) => (
              <div
                key={region.name}
                onClick={() => setSelectedRegion(region.name)}
                className={`flex justify-between p-3 rounded cursor-pointer ${selectedRegion === region.name
                  ? "bg-primary text-white"
                  : "hover:bg-accent"
                  }`}
              >
                <span>{region.name}</span>
                <Badge variant="outline">{region.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Issues */}
        <Card className="md:col-span-8 lg:col-span-9">
          <CardHeader>
            <CardTitle>Issues in {selectedRegion}</CardTitle>
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
                    <p className="text-sm text-muted-foreground">
                      {issue.department}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      {issue.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No recent issues in this region.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
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
