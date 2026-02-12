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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Filter,
    ImageIcon,
    MapPin,
} from "lucide-react"

export default function DepartmentAdminDashboard() {
    const [filter, setFilter] = React.useState("all")
    const [selectedIssue, setSelectedIssue] = React.useState(null)
    const [completeChecked, setCompleteChecked] = React.useState(false)
    const [inProgressChecked, setInProgressChecked] = React.useState(false)

    // Mock Data
    const stats = [
        {
            title: "Total Complaints",
            value: "45",
            description: "assigned to this department",
            icon: AlertCircle,
        },
        {
            title: "Solved",
            value: "28",
            description: "successfully resolved",
            icon: CheckCircle,
        },
        {
            title: "Unsolved",
            value: "17",
            description: "currently pending",
            icon: Clock,
        },
    ]

    const complaints = [
        {
            id: 1,
            title: "Broken Pipe at Main Square",
            date: "2024-02-10",
            location: "Main Square, Ward 4",
            status: "pending",
            image: "/placeholder.svg",
            description: "Large water leak detected near the central fountain.",
        },
        {
            id: 2,
            title: "Low Water Pressure",
            date: "2024-02-11",
            location: "Shivaji Park",
            status: "in-progress",
            image: "/placeholder.svg",
            description: "Residents reporting low pressure since morning.",
        },
        {
            id: 3,
            title: "Contaminated Water Supply",
            date: "2024-02-09",
            location: "Market Yard",
            status: "solved",
            image: "/placeholder.svg",
            description: "Water appearing muddy. Pipe flushed and fixed.",
            completionParams: {
                completionImage: "/placeholder.svg"
            }
        },
    ]

    const filteredComplaints = complaints.filter((c) => {
        if (filter === "all") return true
        if (filter === "solved") return c.status === "solved"
        if (filter === "unsolved") return c.status !== "solved"
        return true
    })

    const handleUpdateStatus = (e) => {
        e.preventDefault()
        console.log("Updating status...", { inProgressChecked, completeChecked })
        // Logic to update status would go here
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Department Dashboard</h2>
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

            {/* Filters & List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filter:</span>
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === "solved" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("solved")}
                    >
                        Solved
                    </Button>
                    <Button
                        variant={filter === "unsolved" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("unsolved")}
                    >
                        Unsolved
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-1">
                    {filteredComplaints.length > 0 ? (
                        filteredComplaints.map((complaint) => (
                            <Card key={complaint.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="w-full md:w-48 h-32 bg-muted relative">
                                            <img
                                                src={complaint.image}
                                                alt="Complaint"
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold text-lg">{complaint.title}</h3>
                                                    <Badge variant={complaint.status === "solved" ? "default" : "secondary"}>
                                                        {complaint.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> {complaint.location}
                                                </p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> Reported: {complaint.date}
                                                </p>
                                            </div>
                                            <div className="mt-4 flex justify-end">
                                                <Sheet>
                                                    <SheetTrigger asChild>
                                                        <Button size="sm" onClick={() => {
                                                            setSelectedIssue(complaint)
                                                            setCompleteChecked(complaint.status === "solved")
                                                            setInProgressChecked(complaint.status === "in-progress")
                                                        }}>View Details & Update</Button>
                                                    </SheetTrigger>
                                                    <SheetContent className="overflow-y-auto">
                                                        <SheetHeader>
                                                            <SheetTitle>Complaint Details</SheetTitle>
                                                            <SheetDescription>
                                                                Review details and update status.
                                                            </SheetDescription>
                                                        </SheetHeader>

                                                        <div className="mt-6 space-y-6">
                                                            <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
                                                                <img src={complaint.image} alt="Evidence" className="w-full h-full object-cover" />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-sm">Description</h4>
                                                                <p className="text-sm text-muted-foreground">{complaint.description}</p>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-sm">Location</h4>
                                                                <p className="text-sm text-muted-foreground">{complaint.location}</p>
                                                            </div>

                                                            <div className="border-t pt-4 space-y-4">
                                                                <h4 className="font-medium">Update Status</h4>
                                                                <form onSubmit={handleUpdateStatus} className="space-y-4">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id="in-progress"
                                                                            checked={inProgressChecked}
                                                                            onCheckedChange={(checked) => {
                                                                                setInProgressChecked(checked)
                                                                                if (checked) setCompleteChecked(false)
                                                                            }}
                                                                        />
                                                                        <Label htmlFor="in-progress">In Progress</Label>
                                                                    </div>

                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id="completed"
                                                                            checked={completeChecked}
                                                                            onCheckedChange={(checked) => {
                                                                                setCompleteChecked(checked)
                                                                                if (checked) setInProgressChecked(false)
                                                                            }}
                                                                        />
                                                                        <Label htmlFor="completed">Completed (Mark as Solved)</Label>
                                                                    </div>

                                                                    {completeChecked && (
                                                                        <div className="space-y-2 border p-3 rounded-md bg-muted/50">
                                                                            <Label htmlFor="completion-photo" className="text-xs font-semibold uppercase text-muted-foreground">
                                                                                Mandatory: Upload Completion Photo
                                                                            </Label>
                                                                            <Input id="completion-photo" type="file" required={completeChecked} accept="image/*" />
                                                                            <p className="text-[10px] text-muted-foreground">
                                                                                You must upload a photo of the completed work to close this ticket.
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    <SheetFooter className="mt-4">
                                                                        <Button type="submit" className="w-full">Update Status</Button>
                                                                    </SheetFooter>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </SheetContent>
                                                </Sheet>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No complaints found matching this filter.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
