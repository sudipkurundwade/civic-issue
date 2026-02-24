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
    Sparkles,
    Mic,
    MicOff,
    AlertTriangle,
    Volume2,
    X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { issueService } from "@/services/issueService"
import { useToast } from "@/components/ui/use-toast"
import { LocationMap } from "@/components/LocationMap"
import { CameraCapture } from "@/components/CameraCapture"
import { IssueDetailDialog } from "@/components/IssueDetailDialog"
import { publicService } from "@/services/adminService"
import { useLanguage } from "@/context/LanguageContext"
import { useIssueTranslation } from "@/hooks/useIssueTranslation"


const VOICE_LANGS = [
    { code: "en-IN", label: "English" },
    { code: "hi-IN", label: "हिंदी" },
    { code: "mr-IN", label: "मराठी" },
]

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

// Keyword → department auto-routing map
const KEYWORD_TO_DEPT = {
    "Roads & Infrastructure": ["road", "pothole", "bridge", "footpath", "pavement", "highway", "construction", "crater", "asphalt", "tar"],
    "Water Supply": ["water", "pipe", "leak", "tap", "supply", "drinking", "bore"],
    "Sanitation & Garbage": ["garbage", "waste", "trash", "dump", "litter", "sanitation", "dustbin", "rubbish", "smell", "stink"],
    "Electricity / Street Lights": ["light", "electricity", "electric", "streetlight", "power", "bulb", "wire", "transformer"],
    "Drainage & Sewage": ["drain", "sewage", "sewer", "flood", "waterlog", "overflow", "gutter", "manhole"],
    "Public Health": ["health", "hospital", "clinic", "mosquito", "dengue", "malaria", "disease", "vaccination"],
    "Encroachment / Illegal Construction": ["encroach", "illegal", "unauthorised", "unauthorised", "building", "encroachment"],
    "Traffic & Public Safety": ["traffic", "signal", "accident", "speed", "safety", "zebra", "crosswalk", "parking"],
    "Parks & Public Spaces": ["park", "garden", "playground", "tree", "bench", "open space", "ground"],
    "Animal Control": ["dog", "stray", "animal", "cow", "cattle", "rabies", "bite"],
}

function autoDetectDepartment(text) {
    if (!text || text.length < 6) return null
    const lower = text.toLowerCase()
    let best = null, bestCount = 0
    for (const [dept, keywords] of Object.entries(KEYWORD_TO_DEPT)) {
        const count = keywords.filter(k => lower.includes(k)).length
        if (count > bestCount) { bestCount = count; best = dept }
    }
    return bestCount > 0 ? best : null
}

const REGION_SUGGESTIONS_DEFAULT = [
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
    const { t } = useLanguage()
    const [isReporting, setIsReporting] = React.useState(false)
    const [allIssues, setAllIssues] = React.useState([])
    const getDesc = useIssueTranslation(allIssues)
    const [myIssues, setMyIssues] = React.useState([])
    const [location, setLocation] = React.useState({ lat: null, lng: null, address: "" })
    const [locationLoading, setLocationLoading] = React.useState(true)
    const [mapSelected, setMapSelected] = React.useState(null)
    const [reportForm, setReportForm] = React.useState({ description: "", regionName: "", departmentName: "", photos: [], photoPreviews: [], address: "" })
    const [submitting, setSubmitting] = React.useState(false)
    const [analyzing, setAnalyzing] = React.useState(false)
    const [aiGenerated, setAiGenerated] = React.useState(false)
    const [cameraOpen, setCameraOpen] = React.useState(false)
    const [selectedIssue, setSelectedIssue] = React.useState(null)
    const [detailOpen, setDetailOpen] = React.useState(false)
    const [openCommentsId, setOpenCommentsId] = React.useState(null)
    const [commentsByIssue, setCommentsByIssue] = React.useState({})
    const [commentTextByIssue, setCommentTextByIssue] = React.useState({})
    const uploadInputRef = React.useRef(null)

    // Voice-to-text state
    const [isListening, setIsListening] = React.useState(false)
    const recognitionRef = React.useRef(null)
    const voicePrefixRef = React.useRef("")
    const speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    const [voiceLang, setVoiceLang] = React.useState(VOICE_LANGS[0])

    // Auto-routing state
    const [autoDept, setAutoDept] = React.useState(null) // dept name auto-detected
    const [deptManual, setDeptManual] = React.useState(false) // user manually picked dept

    // Duplicate detection state
    const [duplicate, setDuplicate] = React.useState(null) // { issueId, daysAgo } or null

    React.useEffect(() => {
        issueService.getAllIssues().then(setAllIssues).catch(() => { })
    }, [])
    React.useEffect(() => {
        issueService.getMyIssues().then(setMyIssues).catch(() => { })
    }, [isReporting])

    const [regions, setRegions] = React.useState(REGION_SUGGESTIONS_DEFAULT)
    React.useEffect(() => {
        publicService.getRegions()
            .then(data => {
                if (data && data.length > 0) {
                    setRegions(data.map(r => r.name))
                }
            })
            .catch(err => console.error("Failed to fetch regions:", err))
    }, [])

    React.useEffect(() => {
        if (isReporting && navigator.geolocation) {
            setLocationLoading(true)
            captureLocation().then((pos) => {
                if (pos) setLocation((l) => ({ ...l, ...pos }))
                setLocationLoading(false)
            })
        } else if (isReporting) setLocationLoading(false)
    }, [isReporting])

    // Voice-to-text toggle
    const toggleVoice = () => {
        if (!speechSupported) return
        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
            return
        }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        const rec = new SR()
        rec.lang = voiceLang.code
        rec.continuous = true
        rec.interimResults = true

        // Capture existing text to append to
        voicePrefixRef.current = reportForm.description ? reportForm.description + " " : ""

        rec.onresult = (e) => {
            const transcript = Array.from(e.results)
                .map(r => r[0].transcript)
                .join('')

            const fullText = voicePrefixRef.current + transcript
            setReportForm(f => ({ ...f, description: fullText }))

            // try auto-routing on full voice result
            const detected = autoDetectDepartment(fullText)
            if (detected && !deptManual) {
                setAutoDept(detected)
                setReportForm(f => ({ ...f, description: fullText, departmentName: detected }))
            }
        }
        rec.onend = () => setIsListening(false)
        rec.onerror = () => setIsListening(false)
        recognitionRef.current = rec
        rec.start()
        setIsListening(true)
    }

    // Debounced duplicate detection
    React.useEffect(() => {
        if (!reportForm.description || reportForm.description.length < 10) {
            setDuplicate(null)
            return
        }
        const timer = setTimeout(async () => {
            const pos = mapSelected || (location.lat != null ? location : null)
            const result = await issueService.checkDuplicate({
                description: reportForm.description,
                regionName: reportForm.regionName,
                departmentName: reportForm.departmentName,
                lat: pos?.lat,
                lng: pos?.lng
            })
            setDuplicate(result.duplicate ? result : null)
        }, 900)
        return () => clearTimeout(timer)
    }, [reportForm.description, reportForm.regionName, reportForm.departmentName, mapSelected, location.lat, location.lng])

    const handleAnalyzeImage = async () => {
        if (!reportForm.photos.length) {
            toast({ title: "No photo to analyze", variant: "destructive" })
            return
        }

        setAnalyzing(true)
        try {
            // Convert first photo to base64 for AI analysis
            const reader = new FileReader()
            reader.onloadend = async () => {
                try {
                    const base64 = reader.result
                    const mimeType = reportForm.photos[0].type || 'image/jpeg'

                    const result = await issueService.analyzeImage(base64, mimeType)

                    setReportForm(f => ({ ...f, description: result.description }))
                    setAiGenerated(true)
                    toast({
                        title: "✨ AI Analysis Complete",
                        description: "Description generated! You can edit it before submitting."
                    })
                } catch (error) {
                    console.error('Analysis error:', error)
                    toast({
                        title: "Analysis failed",
                        description: error.message || "Please write the description manually.",
                        variant: "destructive"
                    })
                } finally {
                    setAnalyzing(false)
                }
            }
            reader.readAsDataURL(reportForm.photos[0])
        } catch (error) {
            console.error('File read error:', error)
            toast({ title: "Failed to read image", variant: "destructive" })
            setAnalyzing(false)
        }
    }

    const addPhotos = (files) => {
        setReportForm(f => {
            const remaining = 4 - f.photos.length
            if (remaining <= 0) {
                toast({ title: "Maximum 4 photos allowed", variant: "destructive" })
                return f
            }
            const newFiles = files.slice(0, remaining)
            const newPreviews = newFiles.map(file => URL.createObjectURL(file))
            return {
                ...f,
                photos: [...f.photos, ...newFiles],
                photoPreviews: [...f.photoPreviews, ...newPreviews],
            }
        })
    }

    const removePhoto = (index) => {
        setReportForm(f => {
            const newPhotos = [...f.photos]
            const newPreviews = [...f.photoPreviews]
            URL.revokeObjectURL(newPreviews[index])
            newPhotos.splice(index, 1)
            newPreviews.splice(index, 1)
            return { ...f, photos: newPhotos, photoPreviews: newPreviews }
        })
    }

    const resolved = myIssues.filter((i) => i.status === "COMPLETED").length
    const unresolved = myIssues.filter((i) => i.status !== "COMPLETED").length
    const stats = [
        { title: t("citizen.myIssues"), value: String(myIssues.length), description: t("citizen.totalReported"), icon: MapPin },
        { title: t("citizen.resolved"), value: String(resolved), description: t("citizen.successfullyFixed"), icon: CheckCircle },
        { title: t("citizen.unresolved"), value: String(unresolved), description: t("citizen.pendingAttention"), icon: AlertCircle },
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
        photoUrls: i.photoUrls || [],
    }))

    if (isReporting) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={() => setIsReporting(false)} className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> {t("form.backDashboard")}
                        </Button>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">{t("form.reportTitle")}</h2>
                        <div className="w-[100px]"></div> {/* Spacer for centering */}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column: Map - Auto-tracked, click to adjust */}
                        <Card className="h-full min-h-[500px] flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-orange-600" /> {t("form.issueLocation")}
                                </CardTitle>
                                <CardDescription>{t("form.locationDesc")}</CardDescription>
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
                                        <p className="text-xs text-orange-600 font-medium">{t("form.gettingLocation")}</p>
                                    )}
                                    {!locationLoading && !(mapSelected || location.lat) && (
                                        <p className="text-xs text-destructive font-medium">{t("form.locationRequired")}</p>
                                    )}
                                    {(mapSelected || (location.lat != null)) && (
                                        <p className="text-xs text-emerald-600 font-medium">
                                            ✓ {mapSelected ? t("form.locationUpdated") : t("form.currentLocation")}: {mapSelected ? `${mapSelected.lat.toFixed(5)}, ${mapSelected.lng.toFixed(5)}` : `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column: Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("form.issueDetails")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault()
                                        const pos = mapSelected || (location.lat != null ? location : null)
                                        const lat = pos?.lat
                                        const lng = pos?.lng
                                        if (!reportForm.photos.length || !reportForm.description || !reportForm.regionName || !reportForm.departmentName) {
                                            toast({ title: "Please add region, department, description, and at least 1 photo.", variant: "destructive" })
                                            return
                                        }
                                        if (lat == null || lng == null) {
                                            toast({ title: "Please select location on map (could not get your current location)", variant: "destructive" })
                                            return
                                        }
                                        setSubmitting(true)
                                        try {
                                            const fd = new FormData()
                                            reportForm.photos.forEach((photo) => {
                                                fd.append("photos", photo)
                                            })
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
                                            setReportForm({ description: "", regionName: "", departmentName: "", photos: [], photoPreviews: [], address: "" })
                                            setMapSelected(null)
                                            issueService.getMyIssues().then(setMyIssues)
                                            issueService.getAllIssues().then(setAllIssues)
                                        } catch (err) {
                                            // Handle duplicate rejection specifically
                                            if (err.message?.toLowerCase().includes('duplicate')) {
                                                toast({
                                                    title: "Duplicate Prevented",
                                                    description: err.message,
                                                    variant: "destructive"
                                                })
                                            } else {
                                                toast({ title: err.message || "Failed to submit", variant: "destructive" })
                                            }
                                        } finally {
                                            setSubmitting(false)
                                        }
                                    }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <Label>{t("form.region")}</Label>
                                        <select
                                            value={reportForm.regionName}
                                            onChange={(e) => setReportForm((f) => ({ ...f, regionName: e.target.value }))}
                                            className="h-10 w-full rounded-md border px-3 text-sm"
                                            required
                                        >
                                            <option value="">{t("form.selectRegion")}</option>
                                            {regions.map((name) => (
                                                <option key={name} value={name}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Label>{t("form.department")}</Label>
                                            {autoDept && !deptManual && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-0.5">
                                                    🤖 {t("form.autoDetected")}
                                                </span>
                                            )}
                                        </div>
                                        <select
                                            value={reportForm.departmentName}
                                            onChange={(e) => {
                                                setDeptManual(true)
                                                setAutoDept(null)
                                                setReportForm((f) => ({ ...f, departmentName: e.target.value }))
                                            }}
                                            className="h-10 w-full rounded-md border px-3 text-sm"
                                            required
                                        >
                                            <option value="">{t("form.selectDepartment")}</option>
                                            {DEPARTMENT_OPTIONS.map((name) => (
                                                <option key={name} value={name}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t("form.address")}</Label>
                                        <Input
                                            placeholder={t("form.addressPlaceholder")}
                                            value={reportForm.address ?? ""}
                                            onChange={(e) => setReportForm((f) => ({ ...f, address: e.target.value }))}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t("form.addressHint")}
                                        </p>
                                    </div>



                                    <div className="space-y-2">
                                        <Label>{t("form.issuePhoto")}</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Add 1 to 4 photos of the issue ({reportForm.photos.length}/4)
                                        </p>
                                        <div className="flex gap-3">
                                            <input
                                                ref={uploadInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const files = Array.from(e.target.files || [])
                                                    if (!files.length) return
                                                    setLocationLoading(true)
                                                    const pos = await captureLocation()
                                                    if (pos) setLocation((l) => ({ ...l, ...pos }))
                                                    setLocationLoading(false)
                                                    addPhotos(files)
                                                    e.target.value = ""
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1 gap-2"
                                                onClick={() => {
                                                    if (reportForm.photos.length >= 4) {
                                                        toast({ title: "Maximum 4 photos allowed", variant: "destructive" })
                                                        return
                                                    }
                                                    setCameraOpen(true)
                                                }}
                                            >
                                                <Camera className="h-4 w-4" /> {t("form.takePhoto")}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1 gap-2"
                                                onClick={() => {
                                                    if (reportForm.photos.length >= 4) {
                                                        toast({ title: "Maximum 4 photos allowed", variant: "destructive" })
                                                        return
                                                    }
                                                    uploadInputRef.current?.click()
                                                }}
                                            >
                                                <Upload className="h-4 w-4" /> {t("form.upload")}
                                            </Button>
                                        </div>
                                        {reportForm.photoPreviews.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                <div className="grid grid-cols-4 gap-2">
                                                    {reportForm.photoPreviews.map((preview, idx) => (
                                                        <div key={idx} className="relative group">
                                                            <img
                                                                src={preview}
                                                                alt={`Preview ${idx + 1}`}
                                                                className="h-20 w-full rounded border object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removePhoto(idx)}
                                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-emerald-600 font-medium">
                                                        {reportForm.photos.length} photo{reportForm.photos.length > 1 ? 's' : ''} added
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100 text-purple-700"
                                                        onClick={handleAnalyzeImage}
                                                        disabled={analyzing}
                                                    >
                                                        <Sparkles className="h-3 w-3" />
                                                        {analyzing ? t("form.analyzing") : t("form.analyzeAI")}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Label className="font-semibold text-sm">{t("form.issueDesc")}</Label>
                                                {speechSupported && (
                                                    <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-full border border-orange-100/50 backdrop-blur-sm">
                                                        {/* Voice language selector */}
                                                        <select
                                                            value={voiceLang.code}
                                                            onChange={e => setVoiceLang(VOICE_LANGS.find(l => l.code === e.target.value) || VOICE_LANGS[0])}
                                                            className="h-7 rounded-full border-none text-[10px] px-2 text-muted-foreground bg-background/50 focus:ring-1 focus:ring-orange-200 outline-none transition-all"
                                                            disabled={isListening}
                                                            title={t("form.voiceLang")}
                                                        >
                                                            {VOICE_LANGS.map(l => (
                                                                <option key={l.code} value={l.code}>{l.label}</option>
                                                            ))}
                                                        </select>

                                                        <AnimatePresence mode="popLayout">
                                                            {isListening && (
                                                                <motion.div
                                                                    initial={{ width: 0, opacity: 0, x: -5 }}
                                                                    animate={{ width: "auto", opacity: 1, x: 0 }}
                                                                    exit={{ width: 0, opacity: 0, x: -5 }}
                                                                    className="overflow-hidden flex items-center gap-[2px] h-4 px-1"
                                                                >
                                                                    {[1, 2, 3, 4].map((i) => (
                                                                        <motion.div
                                                                            key={i}
                                                                            animate={{
                                                                                height: [4, 12, 6, 14, 4],
                                                                            }}
                                                                            transition={{
                                                                                duration: 0.6,
                                                                                repeat: Infinity,
                                                                                delay: i * 0.1,
                                                                                ease: "easeInOut"
                                                                            }}
                                                                            className="w-1 bg-orange-500 rounded-full"
                                                                        />
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>

                                                        <motion.button
                                                            type="button"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={toggleVoice}
                                                            title={isListening ? t("form.stopVoice") : t("form.voice")}
                                                            className={`relative flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold transition-all shadow-sm shrink-0 ${isListening
                                                                ? "bg-red-500 text-white shadow-red-200"
                                                                : "bg-white border-orange-100 text-orange-600 hover:bg-orange-50 hover:border-orange-200"
                                                                }`}
                                                        >
                                                            {isListening && (
                                                                <motion.span
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: [1, 1.5, 1] }}
                                                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                                                    className="absolute inset-0 rounded-full bg-red-400/20"
                                                                />
                                                            )}

                                                            <span className="relative z-10 flex items-center gap-1.5">
                                                                {isListening ? (
                                                                    <motion.div
                                                                        animate={{ opacity: [1, 0.5, 1] }}
                                                                        transition={{ repeat: Infinity, duration: 1 }}
                                                                    >
                                                                        <MicOff className="h-3 w-3" />
                                                                    </motion.div>
                                                                ) : (
                                                                    <Mic className="h-3 w-3" />
                                                                )}
                                                                {isListening ? t("form.stopVoice") : t("form.voice")}
                                                            </span>
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </div>
                                            {aiGenerated && (
                                                <Badge variant="outline" className="gap-1 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700">
                                                    <Sparkles className="h-3 w-3" />
                                                    {t("form.aiGenerated")}
                                                </Badge>
                                            )}
                                        </div>
                                        {duplicate && (
                                            <div className="flex items-start gap-2 rounded-md border-2 border-orange-500 bg-orange-50 px-3 py-2 text-orange-900 text-sm font-bold shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
                                                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-orange-600" />
                                                <div className="flex flex-col gap-1">
                                                    <span>
                                                        ⚠️ {t("form.duplicateWarning")}
                                                        {duplicate.daysAgo === 0 ? ` ${t("form.duplicateToday")}` : ` ${duplicate.daysAgo} ${t("form.daysAgo_other")}`}.
                                                    </span>
                                                    <p className="font-normal text-xs text-orange-800 italic">
                                                        {t("form.duplicateHint")}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <Textarea
                                            placeholder={t("form.descPlaceholder")}
                                            className="min-h-[100px]"
                                            value={reportForm.description}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                setReportForm((f) => ({ ...f, description: val }))
                                                if (aiGenerated) setAiGenerated(false)
                                                // Auto-routing on typing
                                                if (!deptManual) {
                                                    const detected = autoDetectDepartment(val)
                                                    if (detected) {
                                                        setAutoDept(detected)
                                                        setReportForm(f => ({ ...f, description: val, departmentName: detected }))
                                                    } else {
                                                        setAutoDept(null)
                                                    }
                                                }
                                            }}
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
                                        disabled={
                                            submitting ||
                                            !reportForm.photos.length ||
                                            !reportForm.regionName ||
                                            !reportForm.departmentName ||
                                            !(mapSelected || (location.lat != null && location.lng != null))
                                        }
                                        title={
                                            !(mapSelected || location.lat)
                                                ? t("form.selectLocation")
                                                : ""
                                        }
                                    >
                                        <Share2 className="mr-2 h-4 w-4" />{" "}
                                        {submitting ? t("form.submitting") : t("form.submitIssue")}
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
                            addPhotos([file])
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
                    <h2 className="text-3xl font-bold tracking-tight">{t("citizen.title")}</h2>
                    <p className="text-muted-foreground">{t("citizen.subtitle")}</p>
                </div>
                <Button onClick={() => setIsReporting(true)} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                    <Plus className="mr-2 h-4 w-4" /> {t("citizen.reportBtn")}
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
                <h3 className="text-xl font-semibold">{t("citizen.allIssues")}</h3>

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
                                        <a
                                            href={`https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-start gap-2.5 p-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-orange-100 transition-all duration-300 group"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="h-9 w-9 rounded-full bg-orange-100/50 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                                                <MapPin className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="font-bold text-sm text-foreground group-hover:text-orange-700 transition-colors line-clamp-1">{issue.area}, {issue.region}</h4>
                                                <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                                                    {issue.date} <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span> {t("citizen.reportedBy")} {issue.reporterName}
                                                </p>
                                            </div>
                                        </a>
                                        <div className="ml-auto">
                                            <Badge variant={issue.status === "pending" ? "destructive" : "secondary"}>
                                                {issue.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Post Content */}
                                    <div className="p-0 cursor-pointer" onClick={() => { setSelectedIssue(issue); setDetailOpen(true) }}>
                                        {(() => {
                                            const photos = issue.photoUrls?.length > 0 ? issue.photoUrls : [issue.image]
                                            const count = photos.length
                                            if (count === 1) {
                                                return (
                                                    <div className="aspect-video w-full bg-muted">
                                                        <img src={photos[0]} alt={issue.title} className="w-full h-full object-cover" />
                                                    </div>
                                                )
                                            }
                                            if (count === 2) {
                                                return (
                                                    <div className="grid grid-cols-2 gap-0.5 aspect-video w-full bg-muted">
                                                        {photos.map((p, i) => (
                                                            <img key={i} src={p} alt={`${issue.title} ${i + 1}`} className="w-full h-full object-cover" />
                                                        ))}
                                                    </div>
                                                )
                                            }
                                            if (count === 3) {
                                                return (
                                                    <div className="grid grid-cols-2 grid-rows-2 gap-0.5 aspect-video w-full bg-muted">
                                                        <img src={photos[0]} alt={`${issue.title} 1`} className="w-full h-full object-cover row-span-2" />
                                                        <img src={photos[1]} alt={`${issue.title} 2`} className="w-full h-full object-cover" />
                                                        <img src={photos[2]} alt={`${issue.title} 3`} className="w-full h-full object-cover" />
                                                    </div>
                                                )
                                            }
                                            // 4 photos — 2×2 grid
                                            return (
                                                <div className="grid grid-cols-2 grid-rows-2 gap-0.5 aspect-video w-full bg-muted">
                                                    {photos.slice(0, 4).map((p, i) => (
                                                        <img key={i} src={p} alt={`${issue.title} ${i + 1}`} className="w-full h-full object-cover" />
                                                    ))}
                                                </div>
                                            )
                                        })()}
                                        {issue.photoUrls?.length > 1 && (
                                            <div className="px-3 py-1 bg-muted/30 flex items-center gap-1.5">
                                                <span className="text-[10px] font-medium text-muted-foreground">{issue.photoUrls.length} photos</span>
                                            </div>
                                        )}
                                        <div className="p-4 space-y-2">
                                            <h3 className="font-bold text-lg">{issue.title}</h3>
                                            <p className="text-sm text-foreground/80">{getDesc(issue)}</p>
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
                                            <span className="text-xs">{issue.likes} {t("citizen.supports")}</span>
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
                                            <span className="text-xs">{issue.comments} {t("citizen.comments")}</span>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="gap-2 hover:text-purple-600">
                                            <Share2 className="h-4 w-4" />
                                            <span className="text-xs">{t("citizen.share")}</span>
                                        </Button>
                                    </div>
                                    {/* Inline Comments Thread */}
                                    {isCommentsOpen && (
                                        <div className="border-t px-4 pb-4 pt-3 space-y-3 bg-muted/10">
                                            {comments.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">
                                                    {t("comment.noComments")}
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
                                                    placeholder={t("comment.placeholder")}
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
                                                    {t("comment.post")}
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
                            <h3 className="text-lg font-semibold text-foreground">{t("citizen.noIssues")}</h3>
                            <p className="text-muted-foreground">{t("citizen.beFirst")}</p>
                        </div>
                    )}
                </div>
            </div>

            <IssueDetailDialog open={detailOpen} onClose={() => setDetailOpen(false)} issue={selectedIssue} />
        </div>
    )
}
