import * as React from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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

export default function MyIssuesPage() {
    const [searchTerm, setSearchTerm] = React.useState("")

    // Mock Data - In a real app, fetch issues where creatorId === currentUser.id
    const myIssues = [
        {
            id: 1,
            title: "Major Pothole near Rankala Lake",
            description: "This pothole has been getting bigger for weeks. Very dangerous for bikers.",
            region: "Kolhapur",
            area: "Rankala Stand",
            date: "2024-02-12",
            status: "pending",
            image: "/placeholder.svg",
            ticketId: "TKT-2024-001"
        },
        {
            id: 101,
            title: "Overflowing Garbage Bin",
            description: "Bin hasn't been collected for 3 days.",
            region: "Kolhapur",
            area: "Tarabai Park",
            date: "2024-02-05",
            status: "solved",
            image: "/placeholder.svg",
            ticketId: "TKT-2024-045"
        }
    ]

    const filteredIssues = myIssues.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status) => {
        switch (status) {
            case "solved": return "bg-green-100 text-green-800 hover:bg-green-100"
            case "in-progress": return "bg-blue-100 text-blue-800 hover:bg-blue-100"
            default: return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "solved": return <CheckCircle className="h-4 w-4 mr-1" />
            case "in-progress": return <Clock className="h-4 w-4 mr-1" />
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
                {filteredIssues.length > 0 ? (
                    filteredIssues.map((issue) => (
                        <Card key={issue.id} className="overflow-hidden hover:shadow-md transition-shadow">
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
                                            <Button variant="outline" size="sm">View Details</Button>
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
        </div>
    )
}
