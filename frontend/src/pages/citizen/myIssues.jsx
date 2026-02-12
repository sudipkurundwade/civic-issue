import * as React from "react"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    MapPin,
    AlertCircle,
    CheckCircle,
    Clock,
    Search
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { issueService } from "@/services/issueService"
import { IssueDetailDialog } from "@/components/IssueDetailDialog"

const statusMap = { PENDING: "pending", PENDING_DEPARTMENT: "awaiting-department", IN_PROGRESS: "in-progress", COMPLETED: "solved" }

export default function MyIssuesPage() {
    const [searchTerm, setSearchTerm] = React.useState("")
    const [myIssues, setMyIssues] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [selectedIssue, setSelectedIssue] = React.useState(null)
    const [detailOpen, setDetailOpen] = React.useState(false)

    React.useEffect(() => {
        issueService.getMyIssues()
            .then((data) => setMyIssues(data))
            .catch(() => setMyIssues([]))
            .finally(() => setLoading(false))
    }, [])

    const normalizedIssues = myIssues.map((i) => ({
        id: i.id,
        title: i.description?.slice(0, 60) || "Issue",
        description: i.description,
        region: i.department?.region?.name || "—",
        area: i.address || `${i.latitude}, ${i.longitude}`,
        date: i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "",
        status: statusMap[i.status] || "pending",
        image: i.photoUrl || "/placeholder.svg",
        ticketId: `TKT-${String(i.id ?? i._id ?? "").slice(-6).toUpperCase() || "------"}`,
        latitude: i.latitude,
        longitude: i.longitude,
        likes: 0,
        comments: 0,
    }))

    const filteredIssues = normalizedIssues.filter((issue) =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status) => {
        switch (status) {
            case "solved": return "bg-green-100 text-green-800 hover:bg-green-100"
            case "in-progress": return "bg-blue-100 text-blue-800 hover:bg-blue-100"
            case "awaiting-department": return "bg-amber-100 text-amber-800 hover:bg-amber-100"
            default: return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "solved": return <CheckCircle className="h-4 w-4 mr-1" />
            case "in-progress": return <Clock className="h-4 w-4 mr-1" />
            case "awaiting-department": return <AlertCircle className="h-4 w-4 mr-1" />
            default: return <AlertCircle className="h-4 w-4 mr-1" />
        }
    }

    return (
        <div className="space-y-6 p-6 max-w-5xl mx-auto">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">My Issues</h2>
                <p className="text-muted-foreground">Track the status of issues you have reported.</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by title or ticket ID..."
                    className="pl-8 md:w-[300px] lg:w-[400px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Issues List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading your issues...</div>
                ) : filteredIssues.length > 0 ? (
                    filteredIssues.map((issue) => (
                        <Card
                            key={issue.id}
                            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => { setSelectedIssue(issue); setDetailOpen(true) }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && (setSelectedIssue(issue), setDetailOpen(true))}
                        >
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Image Section */}
                                    <div className="w-full md:w-48 h-32 bg-muted relative shrink-0">
                                        <img
                                            src={issue.image}
                                            alt={issue.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 left-2">
                                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                                                {issue.ticketId}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                                <h3 className="font-semibold text-lg">{issue.title}</h3>
                                                <Badge className={`${getStatusColor(issue.status)} border-0`}>
                                                    {getStatusIcon(issue.status)}
                                                    {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center text-sm text-muted-foreground mt-1 gap-4">
                                                <span className="flex items-center">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {issue.area}, {issue.region}
                                                </span>
                                                <span className="flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {issue.date}
                                                </span>
                                            </div>

                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                {issue.description}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex justify-end">
                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedIssue(issue); setDetailOpen(true) }}>
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <AlertCircle className="h-10 w-10 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No issues found</p>
                            <p className="text-sm">You haven't reported any issues matching your search.</p>
                        </div>
                    </div>
                )}
            </div>

            <IssueDetailDialog open={detailOpen} onClose={() => setDetailOpen(false)} issue={selectedIssue} />
        </div>
    )
}
