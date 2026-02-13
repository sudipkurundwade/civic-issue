import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { adminService } from "@/services/adminService"

function BarChart({ data, xKey, yKey, color = "rgb(59,130,246)" }) {
  const width = 100
  const height = 60
  const padding = 10
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const maxValue = Math.max(...data.map((d) => Number(d[yKey] || 0)), 1)
  const barWidth = chartWidth / (data.length || 1) - 4
  return (
    <div className="w-full h-24 mt-2">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        {data.map((item, i) => {
          const val = Number(item[yKey] || 0)
          const labelVal = Number.isFinite(val) ? (Number.isInteger(val) ? String(val) : val.toFixed(2)) : String(val)
          const barHeight = (val / maxValue) * chartHeight
          const x = padding + i * (chartWidth / (data.length || 1))
          const y = height - padding - barHeight
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barHeight} fill={color} rx="2">
                <title>{`${String(item[xKey] ?? "")}: ${labelVal}`}</title>
              </rect>
              <text x={x + barWidth / 2} y={Math.max(y - 2, 8)} textAnchor="middle" fontSize="6" fill="#111">{labelVal}</text>
            </g>
          )
        })}
      </svg>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        {data.map((d, i) => (
          <span key={i} className="truncate">{String(d[xKey] ?? "").slice(0, 10)}</span>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = React.useState(false)
  const [system, setSystem] = React.useState(null)
  const [region, setRegion] = React.useState(null)

  const isSuper = user?.role === "super_admin"
  const isRegional = user?.role === "regional_admin"

  React.useEffect(() => {
    setLoading(true)
    const run = async () => {
      try {
        if (isSuper) {
          const s = await adminService.getSystemReport()
          setSystem(s)
        } else if (isRegional) {
          const r = await adminService.getRegionReport()
          setRegion(r)
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [isSuper, isRegional])

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground text-sm">
              {isSuper ? "System-wide performance across regions" : "Department performance within your region"}
            </p>
          </div>
          <Button variant="outline" onClick={() => window.print()}>Export</Button>
        </div>

        {loading && (
          <div className="h-24 flex items-center justify-center text-muted-foreground">Loading…</div>
        )}

        {isSuper && system && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Region-wise Issues</CardTitle>
                <CardDescription>Total issues reported per region</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={(system.regionPerformance || []).map(r => ({ name: r.name, count: r.totalIssues }))} xKey="name" yKey="count" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Region Work Speed (Avg Resolution Hours)</CardTitle>
                <CardDescription>Average resolution time per region</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={(system.regionPerformance || []).map(r => ({ name: r.name, hrs: r.averageResolutionHours ?? 0 }))} xKey="name" yKey="hrs" color="rgb(34,197,94)" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>SLA Breaches by Region</CardTitle>
                <CardDescription>{system?.sla?.thresholdHours ? `Completed issues exceeding >${system.sla.thresholdHours}h` : "Completed issues exceeding SLA resolution time"}</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={(system.regionPerformance || []).map(r => ({ name: r.name, breaches: r.slaBreaches }))} xKey="name" yKey="breaches" color="rgb(239,68,68)" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Departments by Completion</CardTitle>
                <CardDescription>Departments with highest number of completed issues</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[...(system.departmentEfficiency || [])]
                    .sort((a, b) => b.completed - a.completed)
                    .slice(0, 8)
                    .map(d => ({ name: `${d.name}`, done: d.completed }))}
                  xKey="name"
                  yKey="done"
                  color="rgb(59,130,246)"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {isRegional && region && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Issues</CardTitle>
                <CardDescription>Total issues reported per department</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={(region.departments || []).map(d => ({ name: d.name, count: d.totalIssues }))} xKey="name" yKey="count" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Department Work Speed (Avg Resolution Hours)</CardTitle>
                <CardDescription>Average resolution time per department</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={(region.departments || []).map(d => ({ name: d.name, hrs: d.averageResolutionHours ?? 0 }))} xKey="name" yKey="hrs" color="rgb(34,197,94)" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Department Completion Count</CardTitle>
                <CardDescription>Number of completed issues per department</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={(region.departments || []).map(d => ({ name: d.name, done: d.completed }))} xKey="name" yKey="done" color="rgb(59,130,246)" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>SLA Breaches by Department</CardTitle>
                <CardDescription>Completed issues exceeding SLA resolution time</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={(region.departments || []).map(d => ({ name: d.name, breaches: d.slaBreaches }))} xKey="name" yKey="breaches" color="rgb(239,68,68)" />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

