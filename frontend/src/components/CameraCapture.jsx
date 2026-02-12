import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"

export function CameraCapture({ open, onClose, onCapture }) {
    const videoRef = React.useRef(null)
    const streamRef = React.useRef(null)
    const canvasRef = React.useRef(null)
    const [error, setError] = React.useState(null)
    const [ready, setReady] = React.useState(false)

    React.useEffect(() => {
        if (!open) return

        setError(null)
        setReady(false)

        const startCamera = async () => {
            try {
                let stream
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
                        audio: false,
                    })
                } catch {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                        audio: false,
                    })
                }
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.play()
                }
                setReady(true)
            } catch (err) {
                console.error(err)
                setError(err.message || "Could not access camera. Please allow camera permission or use Upload.")
            }
        }

        startCamera()
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop())
            }
        }
    }, [open])

    const capture = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas || !streamRef.current) return

        const ctx = canvas.getContext("2d")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        canvas.toBlob(
            (blob) => {
                if (!blob) return
                const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" })
                onCapture(file)
                onClose()
            },
            "image/jpeg",
            0.9
        )
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="z-9999 sm:max-w-lg" overlayClassName="z-9999">
                <DialogHeader>
                    <DialogTitle>Take Photo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {error ? (
                        <p className="text-sm text-destructive">{error}</p>
                    ) : (
                        <>
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                                <video
                                    ref={videoRef}
                                    playsInline
                                    muted
                                    className="h-full w-full object-cover"
                                />
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                            <Button
                                className="w-full gap-2"
                                onClick={capture}
                                disabled={!ready}
                            >
                                <Camera className="h-5 w-5" />
                                Capture Photo
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
