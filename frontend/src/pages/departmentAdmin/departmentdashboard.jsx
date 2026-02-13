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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
    ExternalLink,
} from "lucide-react"
import { departmentalService } from "@/services/departmentalService"
import { useToast } from "@/components/ui/use-toast"
import { LocationMap } from "@/components/LocationMap"
import { useAuth } from "@/context/AuthContext"

export default function DepartmentAdminDashboard() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [filter, setFilter] = React.useState("all")
    const [complaints, setComplaints] = React.useState([])
    const [selectedIssue, setSelectedIssue] = React.useState(null)
    const [selectedStatus, setSelectedStatus] = React.useState("assigned")
    const [completionPhoto, setCompletionPhoto] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [sheetOpen, setSheetOpen] = React.useState(false)

    React.useEffect(() => {
        departmentalService.getIssues().then((data) => {
            setComplaints(data.map((i) => {
                const statusKey = i.status || "PENDING"
                const displayStatus =
                    statusKey === "COMPLETED" ? "resolved" :
                        statusKey === "IN_PROGRESS" ? "in-progress" :
                            "assigned"
                return ({
                    id: i.id || i._id,
                    title: i.description?.slice(0, 50) || "Issue",
                    date: i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "-",
                    location: i.address || `${i.latitude}, ${i.longitude}`,
                    latitude: i.latitude,
                    longitude: i.longitude,
                    status: displayStatus,
                    image: i.photoUrl || "/placeholder.svg",
                    beforeImage: i.photoUrl || "/placeholder.svg",
                    afterImage: i.completionPhotoUrl || null,
                    description: i.description,
                })
            }))
        }).catch(() => toast({ title: "Failed to load issues", variant: "destructive" }))
    }, [filter])

    const pending = complaints.filter((c) => c.status !== "resolved").length
    const solved = complaints.filter((c) => c.status === "resolved").length
    const stats = [
        { title: "Total Complaints", value: String(complaints.length), description: "assigned to this department", icon: AlertCircle },
        { title: "Solved", value: String(solved), description: "successfully resolved", icon: CheckCircle },
        { title: "Unsolved", value: String(pending), description: "currently pending", icon: Clock },
    ]

    const filteredComplaints = complaints.filter((c) => {
        if (filter === "all") return true
        if (filter === "solved") return c.status === "resolved"
        if (filter === "unsolved") return c.status !== "resolved"
        return true
    })

    const handleUpdateStatus = async (e) => {
        e.preventDefault()
        if (!selectedIssue) return
        setLoading(true)
        try {
            if (selectedStatus === "assigned") {
                await departmentalService.updateStatus(selectedIssue.id, "PENDING")
                toast({ title: "Status updated to Assigned" })
                setSheetOpen(false)
                setComplaints((prev) => prev.map((c) => c.id === selectedIssue.id ? { ...c, status: "assigned" } : c))
            } else if (selectedStatus === "in-progress") {
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

    const handleResolve = async (e) => {
        e.preventDefault()
        if (!selectedIssue) return
        if (!completionPhoto) {
            toast({ title: "Completion photo is required", variant: "destructive" })
            return
        }
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("completionPhoto", completionPhoto)
            const updated = await departmentalService.completeIssue(selectedIssue.id, formData)
            toast({ title: "Issue marked as Resolved" })
            setSheetOpen(false)
            setComplaints((prev) => prev.map((c) =>
                c.id === selectedIssue.id
                    ? { ...c, status: "resolved", afterImage: updated.completionPhotoUrl || c.afterImage }
                    : c
            ))
        } catch (err) {
            toast({ title: err.message || "Failed to resolve", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {user?.department?.name ? user.department.name : "Department Dashboard"}
                    </h2>
                    <p className="text-muted-foreground">
                        Manage issues assigned to your department.
                    </p>
                </div>
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
                                                    <Badge variant={complaint.status === "resolved" ? "default" : "secondary"}>
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
                                                    setSelectedStatus(complaint.status === "in-progress" ? "in-progress" : "assigned")
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
                <SheetContent className="overflow-y-auto w-full sm:max-w-md md:max-w-xl lg:max-w-2xl p-6 sm:p-8">
                    <SheetHeader>
                        <SheetTitle>Complaint Details</SheetTitle>
                        <SheetDescription>Review details and update status.</SheetDescription>
                    </SheetHeader>

                    {selectedIssue && (
                        <div className="mt-6 flex flex-col gap-6">
                            {/* 1. Image */}
                            <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
                                <img src={selectedIssue.image} alt="Evidence" className="w-full h-full object-cover" />
                            </div>

                            {/* 2. Description and Title */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-xl">{selectedIssue.title}</h3>
                                    <h4 className="font-medium text-sm text-muted-foreground">Description</h4>
                                    <p className="text-sm">{selectedIssue.description}</p>
                                </div>
                            </div>

                            {/* 3. Map and Link */}
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">Location</h4>
                                <p className="text-sm">{selectedIssue.location}</p>
                                {selectedIssue.latitude != null && selectedIssue.longitude != null && (
                                    <>
                                        <div className="rounded-md overflow-hidden border h-64 w-full">
                                            <LocationMap
                                                center={{ lat: selectedIssue.latitude, lng: selectedIssue.longitude }}
                                                selected={{ lat: selectedIssue.latitude, lng: selectedIssue.longitude }}
                                                height="100%"
                                            />
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps?q=${selectedIssue.latitude},${selectedIssue.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <MapPin className="h-4 w-4" />
                                            Get Directions / Open in Google Maps
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </>
                                )}
                            </div>

                            {/* 4. Update Status and Resolve */}
                            <div className="border-t pt-6 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-lg">Update Status</h4>
                                    <form onSubmit={handleUpdateStatus} className="space-y-4">
                                        <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus} className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem id="status-assigned" value="assigned" />
                                                <Label htmlFor="status-assigned">Assigned</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem id="status-in-progress" value="in-progress" />
                                                <Label htmlFor="status-in-progress">In Progress</Label>
                                            </div>
                                        </RadioGroup>
                                        <Button type="submit" className="w-full" disabled={loading}>Save Status</Button>
                                    </form>
                                </div>

                                <div className="space-y-4 border-t pt-6">
                                    <h4 className="font-medium text-lg">Resolve Issue</h4>
                                    <p className="text-sm text-muted-foreground">Add an after-completion photo to mark the issue as resolved.</p>
                                    <form onSubmit={handleResolve} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="completion-photo" className="text-xs font-semibold uppercase text-muted-foreground">Upload Completion Photo</Label>
                                            <Input id="completion-photo" type="file" required accept="image/*" onChange={(e) => setCompletionPhoto(e.target.files?.[0])} />
                                        </div>
                                        <Button type="submit" className="w-full" variant="secondary" disabled={loading}>Mark as Resolved</Button>
                                    </form>
                                </div>
                            </div>

                            {/* Before / After (if resolved) */}
                            {selectedIssue?.afterImage && (
                                <div className="border-t pt-6 space-y-4">
                                    <h4 className="font-medium text-lg">Resolution Evidence</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs text-muted-foreground mb-1 block">Before</Label>
                                            <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
                                                <img src={selectedIssue.beforeImage || selectedIssue.image} alt="Before" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground mb-1 block">After</Label>
                                            <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
                                                <img src={selectedIssue.afterImage} alt="After" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </SheetContent>
            </Sheet>
        </div>
    )
}
