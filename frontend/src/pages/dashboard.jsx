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
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Trophy,
  ArrowUpRight,
  MoreHorizontal,
  Droplets,
  Zap,
  Truck,
  Trash2,
} from "lucide-react"

export default function Dashboard() {
  // Mock data for Civic Issue Dashboard
  const stats = [
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
    {
      title: "Ranking",
      value: "#3",
      change: "+2",
      trend: "up",
      icon: Trophy,
      description: "city-wide performance",
    },
  ]

  const departments = [
    {
      name: "Water Supply Department 💧",
      icon: Droplets,
      issues: 120,
      solved: 95,
      status: "Operational",
    },
    {
      name: "Electricity / Street Lighting 💡",
      icon: Zap,
      issues: 85,
      solved: 70,
      status: "Operational",
    },
    {
      name: "Roads & Public Works 🛣️",
      icon: Truck, // Using Truck as placeholder for Road works if HardHat/Cone not available or just generic
      issues: 210,
      solved: 150,
      status: "High Load",
    },
    {
      name: "Solid Waste Management 🗑️",
      icon: Trash2,
      issues: 65,
      solved: 60,
      status: "Operational",
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
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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
                  <span className="text-green-600 font-medium">
                    {stat.change}
                  </span>
                  <span>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Departments Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Departments Overview</CardTitle>
            <CardDescription>
              Current status and performance of municipal departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {departments.map((dept, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-center space-y-3"
                >
                  <div className="p-2 bg-primary/10 rounded-full">
                    <dept.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{dept.name}</h3>
                  <div className="grid grid-cols-2 gap-4 w-full text-xs">
                    <div>
                      <p className="text-muted-foreground">Issues</p>
                      <p className="font-bold">{dept.issues}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Solved</p>
                      <p className="font-bold">{dept.solved}</p>
                    </div>
                  </div>
                  <Badge variant={dept.status === "High Load" ? "destructive" : "secondary"} className="w-full justify-center">
                    {dept.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues Feed */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Issues</CardTitle>
                <CardDescription>
                  Latest reported civic issues
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

        {/* Quick Actions / Info */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
            <CardDescription>Manage system and reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Generate Monthly Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Review Solved Cases
            </Button>
            <Button className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50" variant="outline">
              <AlertCircle className="mr-2 h-4 w-4" />
              View Critical Issues
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
