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
import { issueService } from "@/services/issueService"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function IssueDetailDialog({ open, onClose, issue }) {
    const [commentsList, setCommentsList] = React.useState([])
    const [commentText, setCommentText] = React.useState("")
    const [loadingComments, setLoadingComments] = React.useState(false)
    const [addingComment, setAddingComment] = React.useState(false)

    React.useEffect(() => {
        if (!open || !issue?.id) return
        setLoadingComments(true)
        issueService.getComments(issue.id)
            .then(setCommentsList)
            .catch(() => setCommentsList([]))
            .finally(() => setLoadingComments(false))
    }, [open, issue?.id])

    if (!issue) return null

    const image = issue.image || issue.photoUrl || "/placeholder.svg"
    const description = issue.description || ""
    const address = issue.area || issue.address || (issue.latitude != null && issue.longitude != null
        ? `${issue.latitude.toFixed(5)}, ${issue.longitude.toFixed(5)}` : "—")
    const region = (typeof issue.region === 'string' ? issue.region : (issue.region?.name || issue.requestedRegionName)) || issue.department?.region?.name || "—"
    const reporterName = issue.reporterName || issue.user?.name || "Anonymous"
    const date = issue.date || (issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "")
    const likes = issue.likes ?? 0
    const commentsCount = issue.comments ?? commentsList.length ?? 0
    const status = issue.status || "pending"
    const hasCoords = issue.latitude != null && issue.longitude != null
    const requestedDept = issue.requestedDepartmentName

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
                        <Badge variant={status === "completed" || status === "solved" ? "default" : status === "awaiting-department" ? "outline" : "secondary"}>
                            {String(status).charAt(0).toUpperCase() + String(status).slice(1).replace(/-/g, " ")}
                        </Badge>
                        {requestedDept && (
                            <span className="text-sm text-muted-foreground">Awaiting: {requestedDept}</span>
                        )}
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

                    {/* Likes & Comments summary */}
                    <div className="flex items-center gap-6 pt-4 border-t">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm font-medium">{likes} Supports</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm font-medium">{commentsCount} Comments</span>
                        </div>
                    </div>

                    {/* Comment thread */}
                    <div className="pt-4 border-t space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground">Comments</h4>
                        {loadingComments ? (
                            <p className="text-xs text-muted-foreground">Loading comments...</p>
                        ) : commentsList.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No comments yet. Be the first to comment.</p>
                        ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {commentsList.map((c) => (
                                    <div key={c.id} className="text-xs border rounded-md px-2 py-1 bg-muted/40">
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
                                if (!commentText.trim() || !issue?.id) return
                                setAddingComment(true)
                                try {
                                    const newComment = await issueService.addComment(issue.id, commentText.trim())
                                    setCommentsList((prev) => [newComment, ...prev])
                                    setCommentText("")
                                } finally {
                                    setAddingComment(false)
                                }
                            }}
                        >
                            <Input
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="text-xs"
                            />
                            <Button type="submit" size="sm" disabled={addingComment || !commentText.trim()}>
                                Post
                            </Button>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
