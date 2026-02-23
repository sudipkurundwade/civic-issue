import * as React from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Star } from "lucide-react"
import { authService } from "@/services/authService"
import { useToast } from "@/components/ui/use-toast"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function Leaderboard() {
    const { toast } = useToast()
    const [leaderboard, setLeaderboard] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [currentUser, setCurrentUser] = React.useState(null)

    React.useEffect(() => {
        fetchLeaderboard()
        fetchCurrentUser()
    }, [])

    const fetchLeaderboard = async () => {
        try {
            const token = authService.getToken()
            const res = await fetch(`${API_URL}/users/leaderboard`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch leaderboard')
            const data = await res.json()
            setLeaderboard(data)
        } catch (err) {
            toast({ title: "Failed to load leaderboard", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const fetchCurrentUser = async () => {
        try {
            const token = authService.getToken()
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch user')
            const data = await res.json()
            setCurrentUser(data)
        } catch (err) {
            console.error('Failed to fetch current user:', err)
        }
    }

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-6 w-6 text-yellow-500" />
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />
            case 3:
                return <Award className="h-6 w-6 text-amber-600" />
            default:
                return <Star className="h-5 w-5 text-muted-foreground" />
        }
    }

    const getRankColor = (rank) => {
        switch (rank) {
            case 1:
                return "bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200"
            case 2:
                return "bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200"
            case 3:
                return "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200"
            default:
                return "bg-background"
        }
    }

    const isCurrentUser = (userId) => {
        return currentUser && userId.toString() === currentUser.id?.toString()
    }

    if (loading) {
        return (
            <div className="space-y-6 p-6 max-w-5xl mx-auto">
                <div className="flex flex-col gap-4">
                    <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-orange-600" />
                    <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
                </div>
                <p className="text-muted-foreground">
                    Top citizens ranked by points earned for reporting civic issues. Earn 10 points for each issue you report!
                </p>
            </div>

            {/* Current User Stats */}
            {currentUser && (
                <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50/30 to-transparent">
                    <CardHeader>
                        <CardTitle className="text-lg">Your Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Your Points</p>
                                <p className="text-3xl font-bold text-orange-600">{currentUser.points || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Your Rank</p>
                                <p className="text-3xl font-bold text-orange-600">
                                    #{leaderboard.findIndex(u => u.id.toString() === currentUser.id?.toString()) + 1 || '-'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Leaderboard List */}
            <div className="space-y-3">
                {leaderboard.length > 0 ? (
                    leaderboard.map((user) => (
                        <Card
                            key={user.id}
                            className={`transition-all duration-200 ${getRankColor(user.rank)} ${isCurrentUser(user.id)
                                    ? "border-2 border-orange-500 shadow-md"
                                    : "border hover:shadow-md"
                                }`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    {/* Rank Icon */}
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/50">
                                        {getRankIcon(user.rank)}
                                    </div>

                                    {/* Rank Number */}
                                    <div className="flex items-center justify-center w-12">
                                        <span className={`text-2xl font-bold ${user.rank <= 3 ? "text-foreground" : "text-muted-foreground"
                                            }`}>
                                            #{user.rank}
                                        </span>
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg truncate">
                                                {user.name}
                                            </h3>
                                            {isCurrentUser(user.id) && (
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                                    You
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>

                                    {/* Points */}
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Points</p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {user.points}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                No citizens yet
                            </h3>
                            <p className="text-muted-foreground">
                                Be the first to report an issue and earn points!
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
