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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
                description: err.message,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
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
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : departments.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No departments found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Department Name</TableHead>
                                    <TableHead>Assigned Email</TableHead>
                                    <TableHead>Admin Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departments.map((dept) => (
                                    <TableRow key={dept.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                {dept.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {dept.assignedAdmin?.email ? (
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Mail className="h-4 w-4 text-primary" />
                                                    {dept.assignedAdmin.email}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">No Email</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <User className="h-4 w-4" />
                                                {dept.assignedAdmin?.name || "Unassigned"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem>
                                                        View department
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Edit department
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">
                                                        Delete department
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
