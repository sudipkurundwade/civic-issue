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
    MapPin,
} from "lucide-react"
import { departmentalService } from "@/services/departmentalService"
import { useToast } from "@/components/ui/use-toast"

export default function DepartmentAdminDashboard() {
    const { toast } = useToast()
    const [filter, setFilter] = React.useState("all")
    const [complaints, setComplaints] = React.useState([])
    const [selectedIssue, setSelectedIssue] = React.useState(null)
    const [completeChecked, setCompleteChecked] = React.useState(false)
    const [inProgressChecked, setInProgressChecked] = React.useState(false)
    const [completionPhoto, setCompletionPhoto] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [sheetOpen, setSheetOpen] = React.useState(false)

    React.useEffect(() => {
        departmentalService.getIssues().then((data) => {
            setComplaints(data.map((i) => ({
                id: i.id || i._id,
                title: i.description?.slice(0, 50) || "Issue",
                date: i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "-",
                location: i.address || `${i.latitude}, ${i.longitude}`,
                status: (i.status === "COMPLETED" ? "completed" : i.status?.toLowerCase().replace("_", "-")) || "pending",
                image: i.photoUrl || "/placeholder.svg",
                description: i.description,
            })))
        }).catch(() => toast({ title: "Failed to load issues", variant: "destructive" }))
    }, [filter])

    const pending = complaints.filter((c) => c.status !== "completed").length
    const solved = complaints.filter((c) => c.status === "completed").length
    const stats = [
        { title: "Total Complaints", value: String(complaints.length), description: "assigned to this department", icon: AlertCircle },
        { title: "Solved", value: String(solved), description: "successfully resolved", icon: CheckCircle },
        { title: "Unsolved", value: String(pending), description: "currently pending", icon: Clock },
    ]

    const filteredComplaints = complaints.filter((c) => {
        if (filter === "all") return true
        if (filter === "solved") return c.status === "completed"
        if (filter === "unsolved") return c.status !== "completed"
        return true
    })

    const handleUpdateStatus = async (e) => {
        e.preventDefault()
        if (!selectedIssue) return
        if (completeChecked && !completionPhoto) {
            toast({ title: "Completion photo is required", variant: "destructive" })
            return
        }
        setLoading(true)
        try {
            if (completeChecked) {
                const formData = new FormData()
                formData.append("completionPhoto", completionPhoto)
                await departmentalService.completeIssue(selectedIssue.id, formData)
                toast({ title: "Issue marked as completed" })
                setSheetOpen(false)
                setComplaints((prev) => prev.map((c) => c.id === selectedIssue.id ? { ...c, status: "completed" } : c))
            } else if (inProgressChecked) {
                await departmentalService.updateStatus(selectedIssue.id, "IN_PROGRESS")
                toast({ title: "Status updated to In Progress" })
                setSheetOpen(false)
                setComplaints((prev) => prev.map((c) => c.id === selectedIssue.id ? { ...c, status: "in-progress" } : c))
            }
        } catch (err) {
            toast({ title: err.message || "Failed to update", variant: "destructive" })
        } finally {
            setLoading(false)
        }
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
                                                    <Badge variant={complaint.status === "completed" ? "default" : "secondary"}>
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
                                                <Button size="sm" onClick={() => {
                                                    setSelectedIssue(complaint)
                                                    setCompleteChecked(complaint.status === "completed")
                                                    setInProgressChecked(complaint.status === "in-progress")
                                                    setCompletionPhoto(null)
                                                    setSheetOpen(true)
                                                }}>View Details & Update</Button>
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

            <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) setCompletionPhoto(null) }}>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Complaint Details</SheetTitle>
                        <SheetDescription>Review details and update status.</SheetDescription>
                    </SheetHeader>
                    {selectedIssue && (
                        <div className="mt-6 space-y-6">
                            <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
                                <img src={selectedIssue.image} alt="Evidence" className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Description</h4>
                                <p className="text-sm text-muted-foreground">{selectedIssue.description}</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Location</h4>
                                <p className="text-sm text-muted-foreground">{selectedIssue.location}</p>
                            </div>
                            <div className="border-t pt-4 space-y-4">
                                <h4 className="font-medium">Update Status</h4>
                                <form onSubmit={handleUpdateStatus} className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="in-progress" checked={inProgressChecked} onCheckedChange={(c) => { setInProgressChecked(c); if (c) setCompleteChecked(false) }} />
                                        <Label htmlFor="in-progress">In Progress</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="completed" checked={completeChecked} onCheckedChange={(c) => { setCompleteChecked(c); if (c) setInProgressChecked(false) }} />
                                        <Label htmlFor="completed">Completed (Mark as Solved)</Label>
                                    </div>
                                    {completeChecked && (
                                        <div className="space-y-2 border p-3 rounded-md bg-muted/50">
                                            <Label htmlFor="completion-photo" className="text-xs font-semibold uppercase text-muted-foreground">Mandatory: Upload Completion Photo</Label>
                                            <Input id="completion-photo" type="file" required={completeChecked} accept="image/*" onChange={(e) => setCompletionPhoto(e.target.files?.[0])} />
                                            <p className="text-[10px] text-muted-foreground">You must upload a photo of the completed work to close this ticket.</p>
                                        </div>
                                    )}
                                    <SheetFooter className="mt-4">
                                        <Button type="submit" className="w-full" disabled={loading}>Update Status</Button>
                                    </SheetFooter>
                                </form>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
