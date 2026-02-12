import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function DepartmentalDashboard() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-bold">Department Dashboard</h2>
      <p className="text-muted-foreground">View and manage issues assigned to your department.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">being worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">resolved</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Department Issues</CardTitle>
          <p className="text-sm text-muted-foreground">Issues will appear here when civic users report them.</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            No issues in your department yet.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
