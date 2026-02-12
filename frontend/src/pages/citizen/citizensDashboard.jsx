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
    ArrowLeft,
    Camera,
    Upload,
} from "lucide-react"
import { publicService } from "@/services/adminService"
import { issueService } from "@/services/issueService"
import { useToast } from "@/components/ui/use-toast"
import { LocationMap } from "@/components/LocationMap"

const captureLocation = () => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null)
            return
        }
        navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => resolve(null),
            { enableHighAccuracy: true }
        )
    })
}

export default function CitizenDashboard() {
    const { toast } = useToast()
    const [isReporting, setIsReporting] = React.useState(false)
    const [departments, setDepartments] = React.useState([])
    const [myIssues, setMyIssues] = React.useState([])
    const [location, setLocation] = React.useState({ lat: null, lng: null, address: "" })
    const [locationLoading, setLocationLoading] = React.useState(true)
    const [mapSelected, setMapSelected] = React.useState(null)
    const [reportForm, setReportForm] = React.useState({ description: "", departmentId: "", photo: null, photoPreview: null, address: "" })
    const [submitting, setSubmitting] = React.useState(false)
    const cameraInputRef = React.useRef(null)
    const uploadInputRef = React.useRef(null)

    React.useEffect(() => {
        publicService.getDepartments().then(setDepartments).catch(() => {})
    }, [])

    React.useEffect(() => {
        issueService.getMyIssues().then(setMyIssues).catch(() => {})
    }, [isReporting])

    React.useEffect(() => {
        if (isReporting && navigator.geolocation) {
            setLocationLoading(true)
            captureLocation().then((pos) => {
                if (pos) setLocation((l) => ({ ...l, ...pos }))
                setLocationLoading(false)
            })
        } else if (isReporting) setLocationLoading(false)
    }, [isReporting])

    const resolved = myIssues.filter((i) => i.status === "COMPLETED").length
    const unresolved = myIssues.filter((i) => i.status !== "COMPLETED").length
    const stats = [
        { title: "My Issues", value: String(myIssues.length), description: "Total reported by you", icon: MapPin },
        { title: "Resolved", value: String(resolved), description: "Successfully fixed", icon: CheckCircle },
        { title: "Unresolved", value: String(unresolved), description: "Pending attention", icon: AlertCircle },
    ]

    const feedIssues = myIssues.map((i) => ({
        id: i.id,
        title: i.description?.slice(0, 50) || "Issue",
        description: i.description,
        region: i.department?.region?.name || "—",
        area: i.address || `${i.latitude}, ${i.longitude}`,
        date: i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "",
        status: i.status?.toLowerCase() || "pending",
        image: i.photoUrl || "/placeholder.svg",
        likes: 0,
        comments: 0,
    })).filter((i) => i.status !== "completed")

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
                        {/* Left Column: Map - Auto-tracked, click to adjust */}
                        <Card className="h-full min-h-[500px] flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-green-600" /> Issue Location
                                </CardTitle>
                                <CardDescription>Your location is tracked automatically. Click on the map to adjust if the marker is wrong.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 p-4">
                                <LocationMap
                                    center={location.lat ? { lat: location.lat, lng: location.lng } : null}
                                    selected={mapSelected}
                                    onSelect={(pos) => setMapSelected(pos)}
                                    height="400px"
                                />
                                <div className="mt-2 space-y-1">
                                    {locationLoading && !(mapSelected || location.lat) && (
                                        <p className="text-xs text-amber-600">Getting your location... Allow GPS when prompted.</p>
                                    )}
                                    {(mapSelected || (location.lat != null)) && (
                                        <p className="text-xs text-green-600">
                                            ✓ Location: {mapSelected ? `${mapSelected.lat.toFixed(5)}, ${mapSelected.lng.toFixed(5)}` : `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column: Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Issue Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={async (e) => {
                                    e.preventDefault()
                                    const pos = mapSelected || (location.lat != null ? location : null)
                                    const lat = pos?.lat
                                    const lng = pos?.lng
                                    if (!reportForm.photo || !reportForm.description || !reportForm.departmentId || lat == null || lng == null) {
                                        toast({ title: "Please add photo, description, department. Allow location access for auto-tracking.", variant: "destructive" })
                                        return
                                    }
                                    setSubmitting(true)
                                    try {
                                        const fd = new FormData()
                                        fd.append("photo", reportForm.photo)
                                        fd.append("latitude", String(lat))
                                        fd.append("longitude", String(lng))
                                        fd.append("address", reportForm.address || "")
                                        fd.append("description", reportForm.description)
                                        fd.append("departmentId", reportForm.departmentId)
                                        await issueService.submitIssue(fd)
                                        toast({ title: "Issue submitted successfully" })
                                        setIsReporting(false)
                                        setReportForm({ description: "", departmentId: "", photo: null, photoPreview: null, address: "" })
                                        setMapSelected(null)
                                        issueService.getMyIssues().then(setMyIssues)
                                    } catch (err) {
                                        toast({ title: err.message || "Failed to submit", variant: "destructive" })
                                    } finally {
                                        setSubmitting(false)
                                    }
                                }} className="space-y-6">
                                <div className="space-y-3">
                                    <Label>Department *</Label>
                                    <select
                                        value={reportForm.departmentId}
                                        onChange={(e) => setReportForm((f) => ({ ...f, departmentId: e.target.value }))}
                                        className="h-10 w-full rounded-md border px-3 text-sm"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.region?.name})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Address (optional)</Label>
                                    <Input
                                        placeholder="Street, landmark, etc."
                                        value={reportForm.address ?? ""}
                                        onChange={(e) => setReportForm((f) => ({ ...f, address: e.target.value }))}
                                    />
                                    <p className="text-xs text-muted-foreground">Location is auto-tracked. Add address for easier navigation.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Issue Description *</Label>
                                    <Textarea
                                        placeholder="Describe the issue in detail..."
                                        className="min-h-[100px]"
                                        value={reportForm.description}
                                        onChange={(e) => setReportForm((f) => ({ ...f, description: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Issue Photo *</Label>
                                    <p className="text-xs text-muted-foreground">Take a photo or upload one. Your location is captured automatically.</p>
                                    <div className="flex gap-3">
                                        <input
                                            ref={cameraInputRef}
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0]
                                                if (!file) return
                                                setLocationLoading(true)
                                                const pos = await captureLocation()
                                                if (pos) setLocation((l) => ({ ...l, ...pos }))
                                                setLocationLoading(false)
                                                setReportForm((f) => ({ ...f, photo: file, photoPreview: URL.createObjectURL(file) }))
                                                e.target.value = ""
                                            }}
                                        />
                                        <input
                                            ref={uploadInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0]
                                                if (!file) return
                                                setLocationLoading(true)
                                                const pos = await captureLocation()
                                                if (pos) setLocation((l) => ({ ...l, ...pos }))
                                                setLocationLoading(false)
                                                setReportForm((f) => ({ ...f, photo: file, photoPreview: URL.createObjectURL(file) }))
                                                e.target.value = ""
                                            }}
                                        />
                                        <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => cameraInputRef.current?.click()}>
                                            <Camera className="h-4 w-4" /> Take Photo
                                        </Button>
                                        <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => uploadInputRef.current?.click()}>
                                            <Upload className="h-4 w-4" /> Upload
                                        </Button>
                                    </div>
                                    {reportForm.photoPreview && (
                                        <div className="mt-2">
                                            <img src={reportForm.photoPreview} alt="Preview" className="h-24 rounded border object-cover" />
                                            <p className="text-xs text-green-600 mt-1">Photo added. Location captured.</p>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    disabled={submitting || !reportForm.photo || !(mapSelected || (location.lat != null && location.lng != null))}
                                    title={!(mapSelected || location.lat) ? "Waiting for location... Allow GPS access or click on map" : ""}
                                >
                                    <Share2 className="mr-2 h-4 w-4" /> {submitting ? "Submitting..." : "Submit Issue"}
                                </Button>
                                </form>
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

            {/* My Submitted Issues */}
            <div className="space-y-6">
                <h3 className="text-xl font-semibold">My Submitted Issues</h3>

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
                            <h3 className="text-lg font-medium">No issues yet</h3>
                            <p className="text-muted-foreground">Report a civic issue to see it here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
