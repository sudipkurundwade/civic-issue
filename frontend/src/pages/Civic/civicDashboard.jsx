import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function CivicDashboard() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-bold">Report an Issue</h2>
      <p className="text-muted-foreground">Submit civic issues in your area. Add a photo, location, and description.</p>
      <Card>
        <CardHeader>
          <CardTitle>My Submitted Issues</CardTitle>
          <p className="text-sm text-muted-foreground">Track the status of issues you have reported.</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No issues submitted yet.</p>
            <Button className="mt-4">Submit New Issue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
