import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/AuthContext"

export default function CreateAnnouncement() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [loading, setLoading] = React.useState(false)

    // Form State
    const [title, setTitle] = React.useState("")
    const [category, setCategory] = React.useState("Public Notice")
    const [priority, setPriority] = React.useState("Low")
    const [content, setContent] = React.useState("")
    const [expiryDate, setExpiryDate] = React.useState("")
    const [image, setImage] = React.useState(null) // Base64 string

    // Targeting State
    // Super Admin: Multi-select types
    const [targetRoles, setTargetRoles] = React.useState([]) // 'regional_admin', 'departmental_admin', 'citizen' (Everyone)

    // Regional Admin target type
    const [regionalTargetType, setRegionalTargetType] = React.useState("everyone") // 'departments', 'everyone'

    const [selectedRegions, setSelectedRegions] = React.useState([])
    const [selectedDepartments, setSelectedDepartments] = React.useState([])

    // Data
    const [availableRegions, setAvailableRegions] = React.useState([])
    const [availableDepartments, setAvailableDepartments] = React.useState([])

    const categories = [
        "Public Notice", "Emergency Alert", "Maintenance Notice",
        "Policy Update", "Awareness Campaign", "System Update"
    ]

    const priorities = ["Low", "Medium", "High", "Critical"]

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('civic_token')
                // Fetch Regions (Public or Admin route)
                const regionsRes = await fetch('http://localhost:3001/api/admin/regions/public', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (regionsRes.ok) setAvailableRegions(await regionsRes.json())

                // Fetch Departments
                // Refined: For Super Admin, fetch all. For Regional, ideally fetch only theirs.
                // Using public endpoint for simplicity, filtering client-side.
                const deptsRes = await fetch('http://localhost:3001/api/admin/departments/public', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (deptsRes.ok) setAvailableDepartments(await deptsRes.json())

            } catch (err) {
                console.error("Failed to fetch data", err)
            }
        }

        // Fetch data for both roles now, as Regional Admin also needs department list
        fetchData()
    }, [user])

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Simple size check (e.g. 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({ title: "Image too large", description: "Max 5MB", variant: "destructive" })
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                setImage(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = localStorage.getItem('civic_token')

            let finalTargetRoles = []
            let finalRegions = []
            let finalDepartments = []

            if (user?.role === 'super_admin') {
                // Map Checkbox selections to payload
                // If "Everyone" (citizen) is checked -> implies everyone? Or just citizens?
                // Request said: "If everyone is selected the announcement will be viewed by all admins and users"
                // So if 'citizen' (Everyone checkbox) is in list, we target ALL roles generally.
                // BUT if we want granular, we send specifically what was checked.

                if (targetRoles.includes('everyone')) {
                    finalTargetRoles = ['super_admin', 'regional_admin', 'departmental_admin', 'citizen']
                    // And typically implies global regions/departments unless specified?
                    // Let's assume global unless regions are selected.
                    finalRegions = []
                    finalDepartments = []
                } else {
                    // Granular
                    if (targetRoles.includes('regional_admin')) {
                        finalTargetRoles.push('regional_admin')
                        // Include selected regions if any
                        finalRegions = [...selectedRegions]
                    }

                    if (targetRoles.includes('departmental_admin')) {
                        finalTargetRoles.push('departmental_admin')
                        // Include selected regions (merged unique if also regional admin selected)
                        // In UI, they select regions in one place usually.
                        // So we use `selectedRegions` state.

                        // And selected departments
                        finalDepartments = [...selectedDepartments]
                    }
                }

                // Ensure unique regions
                finalRegions = [...new Set(finalRegions)]

            } else if (user?.role === 'regional_admin') {
                if (regionalTargetType === 'everyone') {
                    // Brochure to everyone in MY region
                    finalTargetRoles = ['departmental_admin', 'citizen'] // + regional_admin?
                    // Backend handles restricting to my region.
                } else if (regionalTargetType === 'departments') {
                    // Only departmental admins? Or citizens interested in that department? 
                    // Usually "For Departments" means Departmental Admins.
                    finalTargetRoles = ['departmental_admin']
                    finalDepartments = selectedDepartments
                }
            }

            const payload = {
                title,
                category,
                priority,
                content,
                image,
                expiryDate,
                targetRoles: finalTargetRoles,
                targetRegions: finalRegions, // Backend will ignore/override for regional_admin
                targetDepartments: finalDepartments,
            }

            console.log("Sending Payload:", payload)

            const res = await fetch('http://localhost:3001/api/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || "Failed to create announcement")
            }

            toast({ title: "Announcement Published Successfully" })
            window.history.back()
        } catch (err) {
            console.error(err)
            toast({ title: "Error publishing", description: err.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const toggleSelection = (list, setList, item) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item))
        } else {
            setList([...list, item])
        }
    }

    // Filter departments:
    // For Super Admin: Filter by selected Regions.
    // For Regional Admin: Filter by their Region (user.regionId logic not fully available here without extra fetch, 
    // so filtering by "Dept.region.name" equals "User's Region Name" if available? 
    // We fetched availableDepartments which has `region` object. 
    // We don't have user's region object in context typically? `user.region` might be ID.
    // Let's assume backend filters correctly or we show all and let them pick (simplified).
    // BETTER: Filter by user.region if available.

    const relevantDepartments = React.useMemo(() => {
        if (user?.role === 'super_admin') {
            if (selectedRegions.length === 0) return [] // Show none if no region selected? Or all? Req says: "list of regions first then the deprtments that are created by that specific region"
            return availableDepartments.filter(d => selectedRegions.includes(d.region?._id || d.region))
        } else if (user?.role === 'regional_admin') {
            // Filter by my region
            // We need to know my region ID. 
            // Ideally AuthContext provides it. Assuming `user.region` is the ID (standard in this app).
            return availableDepartments.filter(d => (d.region?._id || d.region) === user?.region)
        }
        return []
    }, [user, availableDepartments, selectedRegions])

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">Create New Announcement</h2>
                <p className="text-muted-foreground">Publish updates to admins and citizens.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Announcement Title</Label>
                            <Input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                maxLength={120}
                                placeholder="Enter title (max 120 chars)"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Expiry Date</Label>
                                <Input
                                    type="date"
                                    value={expiryDate}
                                    onChange={e => setExpiryDate(e.target.value)}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Priority Level</Label>
                            <RadioGroup value={priority} onValueChange={setPriority} className="flex gap-4">
                                {priorities.map(p => (
                                    <div key={p} className="flex items-center space-x-2">
                                        <RadioGroupItem value={p} id={p} />
                                        <Label htmlFor={p}>{p}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label>Content / Description</Label>
                            <Textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Detailed announcement content..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Image (Optional)</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {image && (
                                <div className="mt-2 relative w-full max-w-sm h-48 bg-muted rounded-md overflow-hidden">
                                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => setImage(null)}
                                        type="button"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )}
                        </div>

                    </CardContent>
                </Card>

                {/* Targeting - Super Admin */}
                {user?.role === 'super_admin' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Target Audience</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="space-y-3">
                                <Label className="text-base">For Whom?</Label>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="ta-regional"
                                            checked={targetRoles.includes('regional_admin')}
                                            onCheckedChange={() => toggleSelection(targetRoles, setTargetRoles, 'regional_admin')}
                                        />
                                        <Label htmlFor="ta-regional">Regional Admins</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="ta-dept"
                                            checked={targetRoles.includes('departmental_admin')}
                                            onCheckedChange={() => toggleSelection(targetRoles, setTargetRoles, 'departmental_admin')}
                                        />
                                        <Label htmlFor="ta-dept">Departmental Admins</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="ta-everyone"
                                            checked={targetRoles.includes('everyone')}
                                            onCheckedChange={() => toggleSelection(targetRoles, setTargetRoles, 'everyone')}
                                        />
                                        <Label htmlFor="ta-everyone">Everyone (All Admins & Citizens)</Label>
                                    </div>
                                </div>
                            </div>

                            {/* Logic: If Regional checked OR Departmental checked, ask for Regions */}
                            {(targetRoles.includes('regional_admin') || targetRoles.includes('departmental_admin')) && !targetRoles.includes('everyone') && (
                                <div className="space-y-3 pt-4 border-t">
                                    <Label className="text-base">Select Regions</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {availableRegions.map(region => (
                                            <div key={region.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`r-${region.id}`}
                                                    checked={selectedRegions.includes(region.id)}
                                                    onCheckedChange={() => toggleSelection(selectedRegions, setSelectedRegions, region.id)}
                                                />
                                                <Label htmlFor={`r-${region.id}`}>{region.name}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Logic: If Departmental checked, ask for Departments (filtered by selected regions) */}
                            {targetRoles.includes('departmental_admin') && !targetRoles.includes('everyone') && (
                                <div className="space-y-3 pt-4 border-t">
                                    <Label className="text-base">Select Departments</Label>
                                    {selectedRegions.length === 0 ? (
                                        <p className="text-sm text-yellow-600">Please select at least one region above to see departments.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {relevantDepartments.length > 0 ? relevantDepartments.map(dept => (
                                                <div key={dept.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`d-${dept.id}`}
                                                        checked={selectedDepartments.includes(dept.name)}
                                                        onCheckedChange={() => toggleSelection(selectedDepartments, setSelectedDepartments, dept.name)}
                                                    />
                                                    <Label htmlFor={`d-${dept.id}`}>
                                                        {dept.name} <span className="text-xs text-muted-foreground">({dept.region?.name})</span>
                                                    </Label>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-muted-foreground">No departments found for the selected regions.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                )}

                {/* Targeting - Regional Admin */}
                {user?.role === 'regional_admin' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Target Audience</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <RadioGroup value={regionalTargetType} onValueChange={setRegionalTargetType} className="flex flex-col gap-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="departments" id="ra-dept" />
                                    <Label htmlFor="ra-dept">For Departments</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="everyone" id="ra-everyone" />
                                    <Label htmlFor="ra-everyone">For Everyone (In My Region)</Label>
                                </div>
                            </RadioGroup>

                            {regionalTargetType === 'departments' && (
                                <div className="space-y-3 pt-4 border-t">
                                    <Label className="text-base">Select Departments</Label>
                                    {relevantDepartments.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No departments found in your region.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {relevantDepartments.map(dept => (
                                                <div key={dept.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`rd-${dept.id}`}
                                                        checked={selectedDepartments.includes(dept.name)}
                                                        onCheckedChange={() => toggleSelection(selectedDepartments, setSelectedDepartments, dept.name)}
                                                    />
                                                    <Label htmlFor={`rd-${dept.id}`}>{dept.name}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => window.history.back()} className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all duration-300">Cancel</Button>
                    <Button type="submit" disabled={loading} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
                        {loading ? "Publishing..." : "Publish Announcement"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
