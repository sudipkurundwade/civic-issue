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
import { issueService } from "@/services/issueService"
import { useToast } from "@/components/ui/use-toast"
import { LocationMap } from "@/components/LocationMap"
import { CameraCapture } from "@/components/CameraCapture"
import { IssueDetailDialog } from "@/components/IssueDetailDialog"

const DEPARTMENT_OPTIONS = [
    "Roads & Infrastructure",
    "Water Supply",
    "Sanitation & Garbage",
    "Electricity / Street Lights",
    "Drainage & Sewage",
    "Public Health",
    "Encroachment / Illegal Construction",
    "Traffic & Public Safety",
    "Parks & Public Spaces",
    "Animal Control",
    "Other",
]

const REGION_SUGGESTIONS = [
    "Gadhinglaj",
    "Jaysingpur",
    "Panahala",
    "Murgud",
    "Kurundwad",
    "Kagal",
    "Wadgaon (Hatkanangale)",
    "Malkapur (Shahuwadi)",
    "Ajara",
    "Chandgad",
    "Hupari",
    "Kolhapur",
    "Ichalkaranji"
]

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
    const [allIssues, setAllIssues] = React.useState([])
    const [myIssues, setMyIssues] = React.useState([])
    const [location, setLocation] = React.useState({ lat: null, lng: null, address: "" })
    const [locationLoading, setLocationLoading] = React.useState(true)
    const [mapSelected, setMapSelected] = React.useState(null)
    const [reportForm, setReportForm] = React.useState({ description: "", regionName: "", departmentName: "", photo: null, photoPreview: null, address: "" })
    const [submitting, setSubmitting] = React.useState(false)
    const [cameraOpen, setCameraOpen] = React.useState(false)
    const [selectedIssue, setSelectedIssue] = React.useState(null)
    const [detailOpen, setDetailOpen] = React.useState(false)
    const [openCommentsId, setOpenCommentsId] = React.useState(null)
    const [commentsByIssue, setCommentsByIssue] = React.useState({})
    const [commentTextByIssue, setCommentTextByIssue] = React.useState({})
    const uploadInputRef = React.useRef(null)

    React.useEffect(() => {
        issueService.getAllIssues().then(setAllIssues).catch(() => { })
    }, [])
    React.useEffect(() => {
        issueService.getMyIssues().then(setMyIssues).catch(() => { })
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

    const feedIssues = allIssues.map((i) => ({
        id: i.id,
        title: i.description?.slice(0, 50) || "Issue",
        description: i.description,
        region: i.region?.name || i.requestedRegionName || i.department?.region?.name || "—",
        area: i.address || `${i.latitude}, ${i.longitude}`,
        date: i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "",
        status: i.status?.toLowerCase() || "pending",
        image: i.photoUrl || "/placeholder.svg",
        likes: i.likesCount ?? 0,
        comments: i.commentsCount ?? 0,
        likedByMe: i.likedByMe ?? false,
        reporterName: i.user?.name || "Anonymous",
        latitude: i.latitude,
        longitude: i.longitude,
    }))

    if (isReporting) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={() => setIsReporting(false)} className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Button>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">Report New Issue</h2>
                        <div className="w-[100px]"></div> {/* Spacer for centering */}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column: Map - Auto-tracked, click to adjust */}
                        <Card className="h-full min-h-[500px] flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-orange-600" /> Issue Location
                                </CardTitle>
                                <CardDescription>Your current location is pinned by default. Click on the map to change it if needed.</CardDescription>
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
                                        <p className="text-xs text-orange-600 font-medium">Getting your current location... Allow GPS when prompted.</p>
                                    )}
                                    {!locationLoading && !(mapSelected || location.lat) && (
                                        <p className="text-xs text-destructive font-medium">Required: Select location on map (could not get your current location)</p>
                                    )}
                                    {(mapSelected || (location.lat != null)) && (
                                        <p className="text-xs text-emerald-600 font-medium">
                                            ✓ {mapSelected ? "Location updated" : "Your current location"}: {mapSelected ? `${mapSelected.lat.toFixed(5)}, ${mapSelected.lng.toFixed(5)}` : `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
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
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault()
                                        const pos = mapSelected || (location.lat != null ? location : null)
                                        const lat = pos?.lat
                                        const lng = pos?.lng
                                        if (!reportForm.photo || !reportForm.description || !reportForm.regionName || !reportForm.departmentName) {
                                            toast({ title: "Please add region, department, description, and photo.", variant: "destructive" })
                                            return
                                        }
                                        if (lat == null || lng == null) {
                                            toast({ title: "Please select location on map (could not get your current location)", variant: "destructive" })
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
                                            fd.append("regionName", reportForm.regionName)
                                            fd.append("departmentName", reportForm.departmentName)
                                            const result = await issueService.submitIssue(fd)
                                            if (result.status === "PENDING_DEPARTMENT") {
                                                toast({
                                                    title: "Issue submitted. Awaiting department creation by regional admin.",
                                                    description: `"${reportForm.departmentName}" will be created and your issue assigned.`,
                                                })
                                            } else {
                                                toast({ title: "Issue submitted successfully" })
                                            }
                                            setIsReporting(false)
                                            setReportForm({ description: "", regionName: "", departmentName: "", photo: null, photoPreview: null, address: "" })
                                            setMapSelected(null)
                                            issueService.getMyIssues().then(setMyIssues)
                                            issueService.getAllIssues().then(setAllIssues)
                                        } catch (err) {
                                            toast({ title: err.message || "Failed to submit", variant: "destructive" })
                                        } finally {
                                            setSubmitting(false)
                                        }
                                    }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <Label>Region *</Label>
                                        <select
                                            value={reportForm.regionName}
                                            onChange={(e) => setReportForm((f) => ({ ...f, regionName: e.target.value }))}
                                            className="h-10 w-full rounded-md border px-3 text-sm"
                                            required
                                        >
                                            <option value="">Select region</option>
                                            {REGION_SUGGESTIONS.map((name) => (
                                                <option key={name} value={name}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Department *</Label>
                                        <select
                                            value={reportForm.departmentName}
                                            onChange={(e) => setReportForm((f) => ({ ...f, departmentName: e.target.value }))}
                                            className="h-10 w-full rounded-md border px-3 text-sm"
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {DEPARTMENT_OPTIONS.map((name) => (
                                                <option key={name} value={name}>
                                                    {name}
                                                </option>
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
                                        <p className="text-xs text-muted-foreground">
                                            Location is auto-tracked. Add address for easier navigation.
                                        </p>
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
                                        <p className="text-xs text-muted-foreground">
                                            Take a photo with camera or upload one. Location is captured automatically.
                                        </p>
                                        <div className="flex gap-3">
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
                                                    setReportForm((f) => ({
                                                        ...f,
                                                        photo: file,
                                                        photoPreview: URL.createObjectURL(file),
                                                    }))
                                                    e.target.value = ""
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1 gap-2"
                                                onClick={() => setCameraOpen(true)}
                                            >
                                                <Camera className="h-4 w-4" /> Take Photo
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1 gap-2"
                                                onClick={() => uploadInputRef.current?.click()}
                                            >
                                                <Upload className="h-4 w-4" /> Upload
                                            </Button>
                                        </div>
                                        {reportForm.photoPreview && (
                                            <div className="mt-2">
                                                <img
                                                    src={reportForm.photoPreview}
                                                    alt="Preview"
                                                    className="h-24 rounded border object-cover"
                                                />
                                                <p className="text-xs text-emerald-600 mt-1 font-medium">
                                                    Photo added. Location captured.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
                                        disabled={
                                            submitting ||
                                            !reportForm.photo ||
                                            !reportForm.regionName ||
                                            !reportForm.departmentName ||
                                            !(mapSelected || (location.lat != null && location.lng != null))
                                        }
                                        title={
                                            !(mapSelected || location.lat)
                                                ? "Select location on map if GPS is not available"
                                                : ""
                                        }
                                    >
                                        <Share2 className="mr-2 h-4 w-4" />{" "}
                                        {submitting ? "Submitting..." : "Submit Issue"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                    <CameraCapture
                        open={cameraOpen}
                        onClose={() => setCameraOpen(false)}
                        onCapture={async (file) => {
                            setLocationLoading(true)
                            const pos = await captureLocation()
                            if (pos) setLocation((l) => ({ ...l, ...pos }))
                            setLocationLoading(false)
                            setReportForm((f) => ({ ...f, photo: file, photoPreview: URL.createObjectURL(file) }))
                        }}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Citizen Dashboard</h2>
                    <p className="text-muted-foreground">Stay updated with civic issues in Kolhapur.</p>
                </div>
                <Button onClick={() => setIsReporting(true)} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                    <Plus className="mr-2 h-4 w-4" /> Report New Issue
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    const colorClasses = [
                        "bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50",
                        "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50",
                        "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50"
                    ]
                    const iconColors = [
                        "text-orange-600",
                        "text-emerald-600",
                        "text-amber-600"
                    ]
                    const valueColors = [
                        "text-orange-700",
                        "text-emerald-700",
                        "text-amber-700"
                    ]
                    return (
                        <Card key={index} className={`${colorClasses[index]} border-2 shadow-sm hover:shadow-md transition-all duration-300`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-semibold text-foreground">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-5 w-5 ${iconColors[index]}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-bold ${valueColors[index]}`}>{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* All Issues (visible to all users) */}
            <div className="space-y-6">
                <h3 className="text-xl font-semibold">All Issues</h3>

                <div className="grid gap-6 md:grid-cols-1 lg:max-w-2xl mx-auto">
                    {feedIssues.length > 0 ? (
                        feedIssues.map((issue) => {
                            const comments = commentsByIssue[issue.id] || []
                            const commentText = commentTextByIssue[issue.id] || ""
                            const isCommentsOpen = openCommentsId === issue.id
                            return (
                                <Card
                                    key={issue.id}
                                    className="overflow-hidden shadow-md border-muted hover:shadow-lg transition-shadow"
                                >
                                    {/* Post Header */}
                                    <div className="p-4 flex items-center gap-3 border-b bg-muted/20">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <MapPin className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm">{issue.area}, {issue.region}</h4>
                                            <p className="text-xs text-muted-foreground">{issue.date} · Reported by {issue.reporterName}</p>
                                        </div>
                                        <div className="ml-auto">
                                            <Badge variant={issue.status === "pending" ? "destructive" : "secondary"}>
                                                {issue.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Post Content */}
                                    <div className="p-0 cursor-pointer" onClick={() => { setSelectedIssue(issue); setDetailOpen(true) }}>
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
                                        <Button
                                            variant={issue.likedByMe ? "default" : "ghost"}
                                            size="sm"
                                            className="gap-2 hover:text-blue-600"
                                            onClick={async (e) => {
                                                e.stopPropagation()
                                                try {
                                                    const result = await issueService.toggleLike(issue.id)
                                                    setAllIssues((prev) =>
                                                        prev.map((it) =>
                                                            it.id === issue.id
                                                                ? {
                                                                    ...it,
                                                                    likesCount: result.likesCount,
                                                                    likedByMe: result.liked,
                                                                }
                                                                : it
                                                        )
                                                    )
                                                } catch {
                                                    toast({ title: "Failed to update like", variant: "destructive" })
                                                }
                                            }}
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            <span className="text-xs">{issue.likes} Supports</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2 hover:text-green-600"
                                            onClick={async (e) => {
                                                e.stopPropagation()
                                                if (!isCommentsOpen) {
                                                    // Opening comments: fetch if not already loaded
                                                    if (!commentsByIssue[issue.id]) {
                                                        try {
                                                            const data = await issueService.getComments(issue.id)
                                                            setCommentsByIssue((prev) => ({ ...prev, [issue.id]: data }))
                                                        } catch {
                                                            toast({ title: "Failed to load comments", variant: "destructive" })
                                                        }
                                                    }
                                                    setOpenCommentsId(issue.id)
                                                } else {
                                                    setOpenCommentsId(null)
                                                }
                                            }}
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            <span className="text-xs">{issue.comments} Comments</span>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="gap-2 hover:text-purple-600">
                                            <Share2 className="h-4 w-4" />
                                            <span className="text-xs">Share</span>
                                        </Button>
                                    </div>
                                    {/* Inline Comments Thread */}
                                    {isCommentsOpen && (
                                        <div className="border-t px-4 pb-4 pt-3 space-y-3 bg-muted/10">
                                            {comments.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">
                                                    No comments yet. Be the first to comment.
                                                </p>
                                            ) : (
                                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                                    {comments.map((c) => (
                                                        <div key={c.id} className="text-xs border rounded-md px-2 py-1 bg-background">
                                                            <div className="flex justify-between items-center mb-0.5">
                                                                <span className="font-semibold">
                                                                    {c.user?.name || c.user?.email || "User"}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs whitespace-pre-wrap">{c.text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <form
                                                className="flex gap-2 pt-1"
                                                onSubmit={async (e) => {
                                                    e.preventDefault()
                                                    const text = (commentTextByIssue[issue.id] || "").trim()
                                                    if (!text) return
                                                    try {
                                                        const newComment = await issueService.addComment(issue.id, text)
                                                        setCommentsByIssue((prev) => ({
                                                            ...prev,
                                                            [issue.id]: [newComment, ...(prev[issue.id] || [])],
                                                        }))
                                                        setCommentTextByIssue((prev) => ({ ...prev, [issue.id]: "" }))
                                                        // Increment comment count on the issue in allIssues
                                                        setAllIssues((prev) =>
                                                            prev.map((it) =>
                                                                it.id === issue.id
                                                                    ? {
                                                                        ...it,
                                                                        commentsCount: (it.commentsCount || 0) + 1,
                                                                    }
                                                                    : it
                                                            )
                                                        )
                                                    } catch {
                                                        toast({ title: "Failed to add comment", variant: "destructive" })
                                                    }
                                                }}
                                            >
                                                <Input
                                                    placeholder="Write a comment..."
                                                    value={commentText}
                                                    onChange={(e) =>
                                                        setCommentTextByIssue((prev) => ({
                                                            ...prev,
                                                            [issue.id]: e.target.value,
                                                        }))
                                                    }
                                                    className="text-xs"
                                                />
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    disabled={!commentText.trim()}
                                                >
                                                    Post
                                                </Button>
                                            </form>
                                        </div>
                                    )}
                                </Card>
                            )
                        })
                    ) : (
                        <div className="text-center py-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 mb-4">
                                <CheckCircle className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">No issues yet</h3>
                            <p className="text-muted-foreground">Be the first to report a civic issue.</p>
                        </div>
                    )}
                </div>
            </div>

            <IssueDetailDialog open={detailOpen} onClose={() => setDetailOpen(false)} issue={selectedIssue} />
        </div>
    )
}
