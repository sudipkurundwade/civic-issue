import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MapPin, ThumbsUp, MessageSquare, ExternalLink, Clock, User } from "lucide-react"
import { LocationMap } from "@/components/LocationMap"

export function IssueDetailDialog({ open, onClose, issue }) {
    if (!issue) return null

    const image = issue.image || issue.photoUrl || "/placeholder.svg"
    const description = issue.description || ""
    const address = issue.area || issue.address || (issue.latitude != null && issue.longitude != null
        ? `${issue.latitude.toFixed(5)}, ${issue.longitude.toFixed(5)}` : "—")
    const region = issue.region || issue.department?.region?.name || "—"
    const reporterName = issue.reporterName || issue.user?.name || "Anonymous"
    const date = issue.date || (issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "")
    const likes = issue.likes ?? 0
    const comments = issue.comments ?? 0
    const status = issue.status || "pending"
    const hasCoords = issue.latitude != null && issue.longitude != null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="z-9999 max-w-2xl max-h-[90vh] overflow-y-auto" overlayClassName="z-9999">
                <DialogHeader>
                    <DialogTitle className="pr-8">Issue Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Image */}
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                        <img
                            src={image}
                            alt="Issue"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Status & Meta */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={status === "completed" || status === "solved" ? "default" : "secondary"}>
                            {String(status).charAt(0).toUpperCase() + String(status).slice(1).replace("-", " ")}
                        </Badge>
                        {date && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {date}
                            </span>
                        )}
                        {reporterName && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <User className="h-3 w-3" />
                                Reported by {reporterName}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
                        <p className="text-sm whitespace-pre-wrap">{description || "—"}</p>
                    </div>

                    {/* Location */}
                    <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Location</h4>
                        <p className="text-sm">{address}</p>
                        {region && region !== "—" && <p className="text-sm text-muted-foreground">{region}</p>}
                        {hasCoords && (
                            <>
                                <div className="mt-2 rounded-md overflow-hidden border h-40">
                                    <LocationMap
                                        center={{ lat: issue.latitude, lng: issue.longitude }}
                                        selected={{ lat: issue.latitude, lng: issue.longitude }}
                                        height="160px"
                                    />
                                </div>
                                <a
                                    href={`https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-2"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Open in Google Maps
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </>
                        )}
                    </div>

                    {/* Likes & Comments */}
                    <div className="flex items-center gap-6 pt-4 border-t">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm font-medium">{likes} Supports</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm font-medium">{comments} Comments</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
