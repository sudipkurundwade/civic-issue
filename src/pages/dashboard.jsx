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
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Calendar,
  Clock,
  Package,
} from "lucide-react"

export default function Dashboard() {
  // Mock data - in a real app, this would come from API/state
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      trend: "up",
      icon: DollarSign,
      description: "from last month",
    },
    {
      title: "Subscriptions",
      value: "+2,350",
      change: "+180.1%",
      trend: "up",
      icon: Users,
      description: "from last month",
    },
    {
      title: "Sales",
      value: "+12,234",
      change: "+19%",
      trend: "up",
      icon: ShoppingCart,
      description: "from last month",
    },
    {
      title: "Active Now",
      value: "+573",
      change: "+201",
      trend: "down",
      icon: Activity,
      description: "since last hour",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      title: "New order received",
      description: "Order #1234 from John Doe",
      time: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      title: "Payment processed",
      description: "$2,500 payment from Jane Smith",
      time: "15 minutes ago",
      status: "success",
    },
    {
      id: 3,
      title: "New user registered",
      description: "Sarah Johnson joined the platform",
      time: "1 hour ago",
      status: "info",
    },
    {
      id: 4,
      title: "System update completed",
      description: "Version 2.3.0 deployed successfully",
      time: "3 hours ago",
      status: "success",
    },
  ]

  const recentOrders = [
    {
      id: "#ORD-001",
      customer: "John Doe",
      product: "Premium Plan",
      amount: "$99.00",
      status: "completed",
      date: "2024-01-15",
    },
    {
      id: "#ORD-002",
      customer: "Jane Smith",
      product: "Basic Plan",
      amount: "$49.00",
      status: "pending",
      date: "2024-01-15",
    },
    {
      id: "#ORD-003",
      customer: "Mike Johnson",
      product: "Enterprise Plan",
      amount: "$299.00",
      status: "completed",
      date: "2024-01-14",
    },
    {
      id: "#ORD-004",
      customer: "Emily Davis",
      product: "Premium Plan",
      amount: "$99.00",
      status: "processing",
      date: "2024-01-14",
    },
  ]

  return (
    <div className="space-y-4 p-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight
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
                      <TrendIcon
                        className={`h-3 w-3 ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                      <span
                        className={
                          stat.trend === "up" ? "text-green-600" : "text-red-600"
                        }>
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground">
                        {stat.description}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Main Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Activity Feed */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your latest updates and notifications
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">
                            {activity.title}
                          </p>
                          <Badge
                            variant={
                              activity.status === "success"
                                ? "default"
                                : activity.status === "info"
                                ? "secondary"
                                : "outline"
                            }>
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                  Quick summary of your business metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Orders</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Active Users</p>
                    <p className="text-2xl font-bold">5,678</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold">3.2%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <Button className="w-full" variant="outline">
                  View All Metrics
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    A list of your recent orders and transactions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-sm">
                          Order ID
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-sm">
                          Customer
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-sm">
                          Product
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-sm">
                          Amount
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-sm">
                          Status
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-sm">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle text-sm font-medium">
                            {order.id}
                          </td>
                          <td className="p-4 align-middle text-sm">
                            {order.customer}
                          </td>
                          <td className="p-4 align-middle text-sm">
                            {order.product}
                          </td>
                          <td className="p-4 align-middle text-sm font-medium">
                            {order.amount}
                          </td>
                          <td className="p-4 align-middle">
                            <Badge
                              variant={
                                order.status === "completed"
                                  ? "default"
                                  : order.status === "pending"
                                  ? "secondary"
                                  : "outline"
                              }>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {order.date}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
    </div>
  )
}
