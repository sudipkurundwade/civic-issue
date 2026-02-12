import * as React from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    AlertCircle,
    CheckCircle,
    Clock,
    MapPin,
    ThumbsUp,
    MessageSquare,
    Share2,
    Plus,
    ArrowLeft
} from "lucide-react"

export default function CitizenDashboard() {
    const [isReporting, setIsReporting] = React.useState(false)

    // Stats specific to Kolhapur Region
    const stats = [
        {
            title: "Kolhapur Issues",
            value: "156",
            description: "Total reported in your city",
            icon: MapPin,
        },
        {
            title: "Resolved",
            value: "98",
            description: "Successfully fixed",
            icon: CheckCircle,
        },
        {
            title: "Unresolved",
            value: "58",
            description: "Pending attention",
            icon: AlertCircle,
        },
    ]

    // Mock Data
    const allIssues = [
        {
            id: 1,
            title: "Major Pothole near Rankala Lake",
            description: "This pothole has been getting bigger for weeks. Very dangerous for bikers.",
            region: "Kolhapur",
            area: "Rankala Stand",
            date: "2024-02-12",
            status: "pending",
            image: "/placeholder.svg",
            likes: 45,
            comments: 12
        },
        {
            id: 2,
            title: "Street Light Not Working",
            description: "Whole street is dark at night.",
            region: "Kolhapur",
            area: "Rajarampuri",
            date: "2024-02-11",
            status: "in-progress",
            image: "/placeholder.svg",
            likes: 23,
            comments: 5
        },
        {
            id: 3,
            title: "Water Leakage",
            description: "Clean water wasting on the road.",
            region: "Sangli",
            area: "Vishrambag",
            date: "2024-02-10",
            status: "pending",
            image: "/placeholder.svg",
            likes: 5,
            comments: 1
        },
        {
            id: 4,
            title: "Garbage Dumped",
            description: "Cleared successfully.",
            region: "Kolhapur",
            area: "Shahupuri",
            date: "2024-02-08",
            status: "solved",
            image: "/placeholder.svg",
            likes: 89,
            comments: 20
        }
    ]

    // Filter Logic: Region = Kolhapur AND Status != Solved
    const feedIssues = allIssues.filter(i => i.region === "Kolhapur" && i.status !== "solved")

    if (isReporting) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={() => setIsReporting(false)} className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Button>
                        <h2 className="text-2xl font-bold text-primary">Report New Issue</h2>
                        <div className="w-[100px]"></div> {/* Spacer for centering */}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column: Map Placeholder */}
                        <Card className="h-full min-h-[500px] flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-green-600" /> Select Issue Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 bg-muted/30 m-4 rounded-lg flex items-center justify-center border-2 border-dashed">
                                <div className="text-center text-muted-foreground">
                                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Interactive Map</p>
                                    <p className="text-xs">(Mapbox Integration Placeholder)</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column: Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Issue Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Issue Title *</Label>
                                    <Input placeholder="Enter your issue title" />
                                </div>

                                <div className="space-y-3">
                                    <Label>Issue Type *</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {["Road Infrastructure", "Waste Management", "Environmental Issues", "Utilities & Infrastructure", "Public Safety", "Other"].map((type) => (
                                            <div key={type} className="flex items-center space-x-2">
                                                <input type="radio" id={type} name="issueType" className="aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                                <Label htmlFor={type} className="font-normal cursor-pointer">{type}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Issue Location Address</Label>
                                    <Input placeholder="Enter or select location on map" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Issue Description *</Label>
                                    <Textarea placeholder="Describe the issue in detail..." className="min-h-[100px]" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Upload Media</Label>
                                    <div className="flex items-center gap-2">
                                        <Input type="file" className="cursor-pointer" />
                                    </div>
                                </div>

                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    <Share2 className="mr-2 h-4 w-4" /> Submit Issue
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 p-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Citizen Dashboard</h2>
                    <p className="text-muted-foreground">Stay updated with civic issues in Kolhapur.</p>
                </div>
                <Button onClick={() => setIsReporting(true)} className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Report New Issue
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
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
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Community Feed */}
            <div className="space-y-6">
                <h3 className="text-xl font-semibold">Community Feed (Unresolved Issues)</h3>

                <div className="grid gap-6 md:grid-cols-1 lg:max-w-2xl mx-auto">
                    {feedIssues.length > 0 ? (
                        feedIssues.map((issue) => (
                            <Card key={issue.id} className="overflow-hidden shadow-md border-muted">
                                {/* Post Header */}
                                <div className="p-4 flex items-center gap-3 border-b bg-muted/20">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{issue.area}, {issue.region}</h4>
                                        <p className="text-xs text-muted-foreground">{issue.date}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <Badge variant={issue.status === "pending" ? "destructive" : "secondary"}>
                                            {issue.status}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Post Content */}
                                <div className="p-0">
                                    <div className="aspect-video w-full bg-muted">
                                        <img
                                            src={issue.image}
                                            alt={issue.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <h3 className="font-bold text-lg">{issue.title}</h3>
                                        <p className="text-sm text-foreground/80">{issue.description}</p>
                                    </div>
                                </div>

                                {/* Post Actions */}
                                <div className="p-3 border-t flex items-center justify-around text-muted-foreground bg-muted/10">
                                    <Button variant="ghost" size="sm" className="gap-2 hover:text-blue-600">
                                        <ThumbsUp className="h-4 w-4" />
                                        <span className="text-xs">{issue.likes} Supports</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="gap-2 hover:text-green-600">
                                        <MessageSquare className="h-4 w-4" />
                                        <span className="text-xs">{issue.comments} Comments</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="gap-2 hover:text-purple-600">
                                        <Share2 className="h-4 w-4" />
                                        <span className="text-xs">Share</span>
                                    </Button>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <h3 className="text-lg font-medium">All Clear!</h3>
                            <p className="text-muted-foreground">No unresolved issues in Kolhapur at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
