import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AnnouncementsList from "../shared/AnnouncementsList"

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      {/* Reusing the shared list component. 
           By default it shows "active" (public/all). 
           We can add a toggle or just two sections if needed, 
           or relying on the Tabs inside AnnouncementsList.
       */}
      <AnnouncementsList mode="my" />

      <div className="pt-8 border-t">
        <h2 className="text-2xl font-bold mb-4 px-6">All System Announcements</h2>
        <AnnouncementsList mode="public" />
      </div>
    </div>
  )
}
