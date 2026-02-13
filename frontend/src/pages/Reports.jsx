import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { adminService } from "@/services/adminService"
import { departmentalService } from "@/services/departmentalService"
import { useToast } from "@/components/ui/use-toast"

export default function ReportsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [report, setReport] = React.useState(null)

  const role = user?.role

  const loadReport = async () => {
    if (!role) return
    setLoading(true)
    try {
      if (role === "super_admin") {
        const data = await adminService.getSystemReport()
        setReport({ scope: "system", data })
      } else if (role === "regional_admin") {
        const data = await adminService.getRegionReport()
        setReport({ scope: "region", data })
      } else if (role === "departmental_admin") {
        const data = await departmentalService.getReportSummary()
        setReport({ scope: "department", data })
      } else {
        toast({ title: "Reports not available for this role", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: err.message || "Failed to generate report", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = () => {
    const imgs = Array.from(document.querySelectorAll('.report-image'))
    const waits = imgs.map((img) => new Promise((resolve) => {
      if (img.complete) resolve()
      else img.addEventListener('load', resolve, { once: true })
    }))
    Promise.all(waits).then(() => {
      window.print()
    })
  }

  const regionName = user?.region?.name || report?.data?.regionName || ""
  const departmentName = user?.department?.name || report?.data?.departmentName || ""
  const scopeLabel =
    role === "super_admin"
      ? "System-wide Report"
      : role === "regional_admin"
      ? `Region Report${regionName ? ` — ${regionName}` : ""}`
      : role === "departmental_admin"
      ? `Department Report${departmentName ? ` — ${departmentName}` : ""}`
      : "Reports"

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{scopeLabel}</h2>
          <p className="text-muted-foreground text-sm">
            Generate and download a PDF summary of key metrics for your level.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadReport} disabled={loading}>
            {loading ? "Generating..." : "Generate Report"}
          </Button>
          {report && (
            <Button onClick={handleDownloadPdf}>
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {role === "civic" && (
        <Card>
          <CardHeader>
            <CardTitle>Reports not available</CardTitle>
            <CardDescription>Civic users do not have access to admin reports.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {report && (
        <Card className="print:border-0 print:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">
              {scopeLabel} Summary
            </CardTitle>
            <CardDescription>Snapshot at {new Date().toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {report.scope === "department" && (
              <>
                {departmentName && (
                  <p>
                    <span className="font-semibold">Department:</span> {departmentName}
                  </p>
                )}
                {regionName && (
                  <p className="text-muted-foreground">
                    Region: {regionName}
                  </p>
                )}
                <p>
                  <span className="font-semibold">Total Issues:</span> {report.data.totalIssues}
                </p>
                <p className="text-muted-foreground">
                  Pending: {report.data.pending} · In Progress: {report.data.inProgress} · Completed:{" "}
                  {report.data.completed}
                </p>
                {report.data.insightsText && (
                  <p className="text-sm mt-2">{report.data.insightsText}</p>
                )}
                {(report.data.issuesWithPhotos || []).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="font-semibold">Issues with photos</p>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      {report.data.issuesWithPhotos.map((i) => (
                        <div key={i.id} className="border rounded-md p-3 space-y-2">
                          <p className="text-sm">{i.description}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Before</p>
                              {i.beforePhotoUrl ? (
                                <img
                                  src={i.beforePhotoUrl}
                                  alt="Before"
                                  loading="eager"
                                  className="report-image w-full h-32 object-cover rounded print:h-auto print:object-contain"
                                />
                              ) : (
                                <div className="w-full h-32 bg-muted rounded"></div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">After</p>
                              {i.afterPhotoUrl ? (
                                <img
                                  src={i.afterPhotoUrl}
                                  alt="After"
                                  loading="eager"
                                  className="report-image w-full h-32 object-cover rounded print:h-auto print:object-contain"
                                />
                              ) : (
                                <div className="w-full h-32 bg-muted rounded"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {report.scope === "region" && (
              <>
                {regionName && (
                  <p>
                    <span className="font-semibold">Region:</span> {regionName}
                  </p>
                )}
                <p>
                  <span className="font-semibold">Total Issues:</span> {report.data.totalIssues}
                </p>
                <div>
                  <p className="font-semibold">Status Distribution:</p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {Object.entries(report.data.statusDistribution || {}).map(([status, count]) => (
                      <li key={status}>
                        {status}: {count}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Departments:</p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {(report.data.departments || []).map((d) => (
                      <li key={d.id || d.name}>
                        {d.name}: {d.completed}/{d.totalIssues} completed
                        {d.averageResolutionHours != null && ` · avg ${d.averageResolutionHours.toFixed(1)}h`}
                      </li>
                    ))}
                  </ul>
                </div>
                {report.data.insightsText && (
                  <p className="text-sm mt-2">{report.data.insightsText}</p>
                )}
              </>
            )}

            {report.scope === "system" && (
              <>
                <p>
                  <span className="font-semibold">Total Issues:</span> {report.data.totalIssues}
                </p>
                <div>
                  <p className="font-semibold">Status Distribution:</p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {Object.entries(report.data.statusDistribution || {}).map(([status, count]) => (
                      <li key={status}>
                        {status}: {count}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Regions:</p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {(report.data.regionPerformance || []).map((r) => (
                      <li key={r.id || r.name}>
                        {r.name}: {r.completed}/{r.totalIssues} completed
                        {r.averageResolutionHours != null && ` · avg ${r.averageResolutionHours.toFixed(1)}h`} · SLA
                        breaches: {r.slaBreaches}
                      </li>
                    ))}
                  </ul>
                </div>
                {report.data.insightsText && (
                  <p className="text-sm mt-2">{report.data.insightsText}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

