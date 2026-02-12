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

export default function Dashboard() {
  // Mock data for Civic Issue Dashboard
  const stats = [
    {
      title: "Total Regions",
      value: "12",
      change: "",
      trend: "neutral",
      icon: MapPin,
      description: "active administrative wards",
    },
    {
      title: "Total Issues",
      value: "1,248",
      change: "+12%",
      trend: "up",
      icon: AlertCircle,
      description: "reported this month",
    },
    {
      title: "Pending",
      value: "432",
      change: "+5%",
      trend: "up",
      icon: Clock,
      description: "currently active",
    },
    {
      title: "Solved",
      value: "816",
      change: "+18%",
      trend: "up",
      icon: CheckCircle,
      description: "resolved this month",
    },
  ]

  const recentIssues = [
    {
      id: 1,
      title: "Water Leakage in Sector 4",
      department: "Water Supply",
      time: "2 hours ago",
      status: "pending",
      priority: "high",
    },
    {
      id: 2,
      title: "Street Light Malfunction",
      department: "Electricity",
      time: "5 hours ago",
      status: "solved",
      priority: "medium",
    },
    {
      id: 3,
      title: "Pothole on Main Road",
      department: "Roads",
      time: "1 day ago",
      status: "in-progress",
      priority: "high",
    },
    {
      id: 4,
      title: "Garbage Collection Delayed",
      department: "Waste Management",
      time: "1 day ago",
      status: "solved",
      priority: "low",
    },
    {
      id: 5,
      title: "Broken Park Bench",
      department: "Parks",
      time: "2 days ago",
      status: "pending",
      priority: "low",
    },
  ]

  const kolhapurRegions = [
    "Karveer",
    "Panhala",
    "Radhanagari",
    "Shirol",
    "Hatkanangale"
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Create a new administrator account for a specific region.
              </DialogDescription>
            </DialogHeader>
            <form className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="region" className="text-right">
                  Region
                </Label>
                <div className="col-span-3">
                  <select
                    id="region"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled selected>Select Region</option>
                    {kolhapurRegions.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
            <DialogFooter>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className={`font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {stat.change}
                  </span>
                  <span>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Area: Recent Issues (Full Width) */}
      <div className="grid gap-4 md:grid-cols-1">

        {/* Recently Posted Issues by Public Section (Full Width) */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recently Posted Issues by Public</CardTitle>
                <CardDescription>
                  Latest community reports from all regions
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {issue.title}
                      </p>
                      <Badge
                        variant={
                          issue.status === "solved"
                            ? "default"
                            : issue.status === "in-progress"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {issue.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {issue.department}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {issue.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions (Full Width or Separate Row) */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
            <CardDescription>Manage system and reports</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="outline">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Generate Monthly Report
            </Button>
            <Button variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Review Solved Cases
            </Button>
            <Button className="text-red-600 hover:text-red-600 hover:bg-red-50" variant="outline">
              <AlertCircle className="mr-2 h-4 w-4" />
              View Critical Issues
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
