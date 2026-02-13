import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Clock, Calendar, Megaphone, AlertTriangle, Lock, Eye } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function AnnouncementsList({ mode = "public" }) {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = React.useState("active")
    const [announcements, setAnnouncements] = React.useState([])
    const [loading, setLoading] = React.useState(true)

    const observerRef = React.useRef(null)
    const viewedIds = React.useRef(new Set())

    // Fetch announcements based on tab
    React.useEffect(() => {
        const fetchAnnouncements = async () => {
            setLoading(true)
            try {
                const token = localStorage.getItem('civic_token')
                let url = `http://localhost:3001/api/announcements?filter=${activeTab}`

                if (mode === 'my') {
                    url = `http://localhost:3001/api/announcements/my`
                }

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    setAnnouncements(data)
                }
            } catch (error) {
                console.error("Failed to fetch announcements", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAnnouncements()
    }, [activeTab, mode])

    const incrementViewCount = async (id) => {
        try {
            const token = localStorage.getItem('civic_token');
            const response = await fetch(`http://localhost:3001/api/announcements/${id}/view`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const { views } = await response.json();
                setAnnouncements(prev => prev.map(a =>
                    a._id === id ? { ...a, views } : a
                ));
            }
        } catch (error) {
            console.error("Failed to increment view count", error);
        }
    };

    React.useEffect(() => {
        if (loading || announcements.length === 0) return;

        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.dataset.id;
                    if (id && !viewedIds.current.has(id)) {
                        viewedIds.current.add(id);
                        incrementViewCount(id);
                    }
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.announcement-card').forEach((el) => {
            observerRef.current.observe(el);
        });

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        }
    }, [announcements, loading]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'bg-red-500 hover:bg-red-600'
            case 'High': return 'bg-orange-500 hover:bg-orange-600'
            case 'Medium': return 'bg-yellow-500 hover:bg-yellow-600'
            default: return 'bg-blue-500 hover:bg-blue-600'
        }
    }

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">{mode === 'my' ? 'My Announcements' : 'Announcements'}</h2>
                {(mode === 'my' || (user && ['super_admin', 'regional_admin'].includes(user?.role))) && (
                    <a
                        href="/create-announcement"
                        onClick={(e) => {
                            e.preventDefault();
                            window.history.pushState({}, "", "/create-announcement");
                            window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        Create New
                    </a>
                )}
            </div>

            <Tabs defaultValue="active" onValueChange={setActiveTab}>
                {mode !== 'my' && (
                    <TabsList>
                        <TabsTrigger value="active">Active Announcements</TabsTrigger>
                        <TabsTrigger value="past">Past Announcements</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>
                )}

                <div className="mt-6 space-y-4">
                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No {activeTab} announcements found.
                        </div>
                    ) : (
                        announcements.map((announcement) => (
                            <Card key={announcement._id} data-id={announcement._id} className="announcement-card overflow-hidden">
                                <div className={`h-1 w-full ${getPriorityColor(announcement.priority)}`} />
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline">{announcement.category}</Badge>
                                                <Badge className={getPriorityColor(announcement.priority)}>{announcement.priority}</Badge>
                                            </div>
                                            <CardTitle className="text-xl">{announcement.title}</CardTitle>
                                        </div>
                                        {new Date(announcement.expiryDate) < new Date() && (
                                            <Badge variant="secondary"><Lock className="w-3 h-3 mr-1" /> Expired</Badge>
                                        )}
                                    </div>
                                    <CardDescription className="flex items-center gap-4 text-xs mt-1">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Posted: {new Date(announcement.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1 text-red-500">
                                            <Clock className="w-3 h-3" />
                                            Expires: {new Date(announcement.expiryDate).toLocaleDateString()}
                                        </span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {announcement.image && (
                                        <div className="mb-4 rounded-md overflow-hidden">
                                            <img
                                                src={announcement.image}
                                                alt={announcement.title}
                                                className="w-full h-48 object-cover"
                                            />
                                        </div>
                                    )}
                                    <p className="whitespace-pre-wrap">{announcement.content}</p>
                                </CardContent>
                                <CardFooter>
                                    <div className="flex items-center gap-2 font-semibold text-base px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200 ml-auto border border-blue-200 dark:border-blue-800">
                                        <Eye className="w-5 h-5" />
                                        {announcement.views || 0} views
                                    </div>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </Tabs >
        </div >
    )
}
