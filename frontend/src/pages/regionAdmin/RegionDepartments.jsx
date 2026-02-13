import * as React from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Mail, User, Building2 } from "lucide-react"
import { adminService } from "@/services/adminService"
import { useToast } from "@/components/ui/use-toast"

export default function RegionDepartments() {
    const { toast } = useToast()
    const [departments, setDepartments] = React.useState([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        loadDepartments()
    }, [])

    const loadDepartments = async () => {
        try {
            setLoading(true)
            const data = await adminService.getDepartments()
            setDepartments(data)
        } catch (err) {
            toast({
                title: "Failed to load departments",
                description: err?.message || "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">Departments</h2>
                    <p className="text-muted-foreground">
                        Manage and view all departments in your region.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Departments</CardTitle>
                    <CardDescription>
                        A list of all departments and their assigned administrators.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex h-32 items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                    ) : departments.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-orange-200 rounded-lg bg-gradient-to-br from-orange-50/50 to-transparent">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 mb-4">
                                    <Building2 className="h-8 w-8 text-orange-600" />
                                </div>
                                <p className="text-lg font-semibold text-foreground">No departments found</p>
                                <p className="text-sm">Create a new department to get started.</p>
                            </div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Department Name</TableHead>
                                    <TableHead>Assigned Email</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {departments.map((dept) => (
                                    <TableRow key={dept.id}>
                                        {/* Department Name */}
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-orange-600" />
                                                {dept.name}
                                            </div>
                                        </TableCell>

                                        {/* Email */}
                                        <TableCell>
                                            {dept.assignedAdmin?.email ? (
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Mail className="h-4 w-4 text-primary" />
                                                    {dept.assignedAdmin.email}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">
                                                    No Email
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
