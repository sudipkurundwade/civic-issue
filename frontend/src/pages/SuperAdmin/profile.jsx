import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Mail,
  Phone,
  Edit2,
  CheckCircle2,
  Upload,
  Eye,
  Trash2,
  Plus,
  Link2,
  Linkedin,
  Github,
  X,
  Lock,
  User,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function ProfilePage() {
  const { user } = useAuth()

  // --- STATE FOR REGULAR PROFILE (ADMINS) ---
  const [isEditingPersonal, setIsEditingPersonal] = React.useState(false)
  const [isEditingBusiness, setIsEditingBusiness] = React.useState(false)
  const [personalData, setPersonalData] = React.useState({
    fullName: user?.name || "Alex Doe",
    email: user?.email || "alex.doe@example.com",
    phone: "+1123-456-7890",
    location: "San Francisco, CA",
  })

  // Update state when user context loads
  React.useEffect(() => {
    if (user) {
      setPersonalData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email
      }))
    }
  }, [user])

  const [businessData, setBusinessData] = React.useState({
    companyName: "Civic Corp.",
    industry: "Government Tech",
    registrationNo: "U12345ABC67890",
    businessAddress: "123 Innovation Drive, Silicon Valley, CA",
  })

  const [socialLinks, setSocialLinks] = React.useState({
    linkedin: "linkedin.com/in/alexdoe",
    github: "github.com/alexdoe",
    portfolio: "innovateinc.com/portfolio",
  })

  const [skills, setSkills] = React.useState([
    "Administration", "Public Policy", "Management"
  ])

  const [uploadedFiles, setUploadedFiles] = React.useState([
    {
      id: 1,
      name: "ID_Card.pdf",
      date: "12 Jan 2024",
    },
  ])

  const [newSkill, setNewSkill] = React.useState("")

  // --- HANDLERS ---
  const handlePersonalChange = (e) => {
    const { name, value } = e.target
    setPersonalData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBusinessChange = (e) => {
    const { name, value } = e.target
    setBusinessData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // --- SIMPLIFIED VIEW FOR CIVIC USERS ---
  if (user?.role === 'civic') {
    return (
      <div className="container max-w-2xl mx-auto py-10 px-4 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">My Profile</h2>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        {/* Personal Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} />
                <AvatarFallback>{getInitials(user?.name || "User")}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">Citizen</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={user?.name || ""} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={user?.email || ""} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Change Password
            </CardTitle>
            <CardDescription>Update your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Update Password</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // --- FULL VIEW FOR ADMINS ---
  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-sm border sticky top-6">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${personalData.fullName}`}
                        alt={personalData.fullName}
                      />
                      <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {getInitials(personalData.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Name and Title */}
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold">{personalData.fullName}</h2>
                    <p className="text-sm text-muted-foreground capitalize">
                      {user?.role?.replace("_", " ") || "Admin"}
                    </p>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground break-all">
                        {personalData.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">
                        {personalData.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Tabs */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-sm border">
              <CardContent className="pt-6">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="skills">Skills & Focus</TabsTrigger>
                  </TabsList>

                  {/* Personal & Business Tab */}
                  <TabsContent value="personal" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Personal Information</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>

                      {isEditingPersonal ? (
                        <Card className="rounded-xl border">
                          <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="fullName">Full Name</Label>
                              <Input
                                id="fullName"
                                name="fullName"
                                value={personalData.fullName}
                                onChange={handlePersonalChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={personalData.email}
                                onChange={handlePersonalChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                name="phone"
                                value={personalData.phone}
                                onChange={handlePersonalChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                name="location"
                                value={personalData.location}
                                onChange={handlePersonalChange}
                              />
                            </div>
                            <div className="flex gap-3 pt-2">
                              <Button
                                onClick={() => setIsEditingPersonal(false)}
                                className="flex-1"
                              >
                                Save Changes
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setIsEditingPersonal(false)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="rounded-xl border">
                          <CardContent className="pt-6 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Full Name
                                </p>
                                <p className="text-sm font-medium">
                                  {personalData.fullName}
                                </p>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Email Address
                                </p>
                                <p className="text-sm font-medium">
                                  {personalData.email}
                                </p>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Phone Number
                                </p>
                                <p className="text-sm font-medium">
                                  {personalData.phone}
                                </p>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Location
                                </p>
                                <p className="text-sm font-medium">
                                  {personalData.location}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  {/* Skills & Focus Tab */}
                  <TabsContent value="skills" className="space-y-6">
                    {/* ... Skills content ... */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Skills & Focus</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="default"
                            className="px-3 py-1.5 text-sm rounded-full"
                          >
                            {skill}
                            <button
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddSkill()
                          }}
                          className="flex-1"
                        />
                        <Button onClick={handleAddSkill}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

