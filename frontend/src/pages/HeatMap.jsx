import * as React from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.heat"
import { issueService } from "@/services/issueService"
import { IssueDetailDialog } from "@/components/IssueDetailDialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Info } from "lucide-react"

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

// Custom heatmap component to work with react-leaflet
function HeatLayer({ points }) {
    const map = useMap()

    React.useEffect(() => {
        if (!map || !points.length) return

        const heatLayer = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
        }).addTo(map)

        return () => {
            map.removeLayer(heatLayer)
        }
    }, [map, points])

    return null
}

export default function HeatMap() {
    const [issues, setIssues] = React.useState([])
    const [selectedIssue, setSelectedIssue] = React.useState(null)
    const [detailOpen, setDetailOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        issueService.getAllIssues()
            .then(data => {
                setIssues(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const kolhapurCenter = [16.7050, 74.2433]
    const bounds = [
        [16.4, 73.8], // Southwest
        [17.1, 74.7]  // Northeast
    ]

    const heatPoints = issues
        .filter(i => i.latitude && i.longitude)
        .map(i => [i.latitude, i.longitude, 0.5]) // intensity 0.5

    const handleMarkerClick = (issue) => {
        // Map backend format to frontend format used by detail dialog
        const mappedIssue = {
            ...issue,
            image: issue.photoUrl,
            area: issue.address || `${issue.latitude}, ${issue.longitude}`,
            date: issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "",
            likes: issue.likesCount ?? 0,
            comments: issue.commentsCount ?? 0,
            reporterName: issue.user?.name || "Anonymous"
        }
        setSelectedIssue(mappedIssue)
        setDetailOpen(true)
    }

    return (
        <div className="p-6 space-y-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Issue Analytics Heat Map</h2>
                    <p className="text-muted-foreground">Visualizing complaint density across Kolhapur.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        Total Complaints: {issues.length}
                    </Badge>
                </div>
            </div>

            <Card className="flex-1 overflow-hidden pointer-events-auto border-2">
                <CardContent className="p-0 h-full relative">
                    {loading && (
                        <div className="absolute inset-0 z-[1000] bg-background/50 backdrop-blur-sm flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                                <span className="text-sm font-medium">Generating heatmap...</span>
                            </div>
                        </div>
                    )}

                    <MapContainer
                        center={kolhapurCenter}
                        zoom={13}
                        minZoom={11}
                        maxBounds={bounds}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <HeatLayer points={heatPoints} />

                        {issues.filter(i => i.latitude && i.longitude).map((issue) => (
                            <Marker
                                key={issue.id}
                                position={[issue.latitude, issue.longitude]}
                                eventHandlers={{
                                    click: () => handleMarkerClick(issue)
                                }}
                            >
                                <Popup>
                                    <div className="space-y-1 p-1">
                                        <p className="font-bold text-sm leading-tight text-orange-700">{issue.description.slice(0, 40)}{issue.description.length > 40 ? '...' : ''}</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-2 w-2" /> {issue.address?.slice(0, 30) || "Location specified"}
                                        </p>
                                        <div className="pt-2">
                                            <Badge variant="secondary" className="text-[10px] h-4">
                                                {issue.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Legend */}
                    <div className="absolute bottom-6 right-6 z-[1000] bg-background/90 backdrop-blur-md p-3 rounded-lg border shadow-lg space-y-2 pointer-events-none">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Intensity Legend</h4>
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-24 rounded-full bg-gradient-to-r from-blue-500 via-lime-500 to-red-500"></div>
                            <span className="text-[10px] whitespace-nowrap">Low → High</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t text-[10px] text-muted-foreground">
                            <Info className="h-3 w-3" /> Click pins for details
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedIssue && (
                <IssueDetailDialog
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    issue={selectedIssue}
                />
            )}
        </div>
    )
}
