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
  MapPin,
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
} from "lucide-react"

export default function ProfilePage() {
  const [isEditingPersonal, setIsEditingPersonal] = React.useState(false)
  const [isEditingBusiness, setIsEditingBusiness] = React.useState(false)
  const [personalData, setPersonalData] = React.useState({
    fullName: "Alex Doe",
    email: "alex.doe@example.com",
    phone: "+1123-456-7890",
    location: "San Francisco, CA",
  })

  const [businessData, setBusinessData] = React.useState({
    companyName: "Innovate Inc.",
    industry: "Technology, SaaS",
    registrationNo: "U12345ABC67890",
    businessAddress: "123 Innovation Drive, Silicon Valley, CA",
  })

  const [socialLinks, setSocialLinks] = React.useState({
    linkedin: "linkedin.com/in/alexdoe",
    github: "github.com/alexdoe",
    portfolio: "innovateinc.com/portfolio",
  })

  const [skills, setSkills] = React.useState([
    "Product Management",
    "SaaS",
    "React",
    "FinTech",
    "Venture Capital",
    "Agile Methodologies",
  ])

  const [uploadedFiles, setUploadedFiles] = React.useState([
    {
      id: 1,
      name: "Certificate_of_Incorporation.pdf",
      date: "12 Jan 2024",
    },
    {
      id: 2,
      name: "Aadhaar_Card_Alex_Doe.pdf",
      date: "10 Jan 2024",
    },
  ])

  const [newSkill, setNewSkill] = React.useState("")

  const handlePersonalChange = (e) => {
    const { name, value } = e.target
    setPersonalData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBusinessChange = (e) => {
    const { name, value } = e.target
    setBusinessData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target
    setSocialLinks((prev) => ({
      ...prev,
      [name]: value,
    }))
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const newFile = {
        id: Date.now(),
        name: file.name,
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }
      setUploadedFiles([...uploadedFiles, newFile])
    }
  }

  const handleDeleteFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== fileId))
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-sm border sticky top-6">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Avatar with Edit Icon */}
                  <div className="relative">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                      <AvatarImage
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                        alt={personalData.fullName}
                      />
                      <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {getInitials(personalData.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Name and Title */}
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold">{personalData.fullName}</h2>
                    <p className="text-sm text-muted-foreground">
                      Founder & CEO at {businessData.companyName}
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

                  <Separator />

                  {/* Social & Portfolio Links */}
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Linkedin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`https://${socialLinks.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        {socialLinks.linkedin}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Github className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`https://${socialLinks.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        {socialLinks.github}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`https://${socialLinks.portfolio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        {socialLinks.portfolio}
                      </a>
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
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="personal">Personal & Business</TabsTrigger>
                    <TabsTrigger value="verification">Verification & KYC</TabsTrigger>
                    <TabsTrigger value="skills">Skills & Focus</TabsTrigger>
                  </TabsList>

                  {/* Personal & Business Tab */}
                  <TabsContent value="personal" className="space-y-6">
                    {/* Personal Information Section */}
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

                      {/* Business Information Section */}
                      <div className="flex items-center justify-between mt-6">
                        <h3 className="text-lg font-semibold">Business Information</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingBusiness(!isEditingBusiness)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>

                      {isEditingBusiness ? (
                        <Card className="rounded-xl border">
                          <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="companyName">Company Name</Label>
                              <Input
                                id="companyName"
                                name="companyName"
                                value={businessData.companyName}
                                onChange={handleBusinessChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="industry">Industry</Label>
                              <Input
                                id="industry"
                                name="industry"
                                value={businessData.industry}
                                onChange={handleBusinessChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="registrationNo">Registration No.</Label>
                              <Input
                                id="registrationNo"
                                name="registrationNo"
                                value={businessData.registrationNo}
                                onChange={handleBusinessChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="businessAddress">Business Address</Label>
                              <Textarea
                                id="businessAddress"
                                name="businessAddress"
                                value={businessData.businessAddress}
                                onChange={handleBusinessChange}
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-3 pt-2">
                              <Button
                                onClick={() => setIsEditingBusiness(false)}
                                className="flex-1"
                              >
                                Save Changes
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setIsEditingBusiness(false)}
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
                                  Company Name
                                </p>
                                <p className="text-sm font-medium">
                                  {businessData.companyName}
                                </p>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Industry
                                </p>
                                <p className="text-sm font-medium">
                                  {businessData.industry}
                                </p>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Registration No.
                                </p>
                                <p className="text-sm font-medium">
                                  {businessData.registrationNo}
                                </p>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Business Address
                                </p>
                                <p className="text-sm font-medium">
                                  {businessData.businessAddress}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  {/* Verification & KYC Tab */}
                  <TabsContent value="verification" className="space-y-6">
                    {/* PAN Verification Status */}
                    <Card className="rounded-xl border">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                PAN Verification Status: Verified
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Re-verify
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* KYC & Business Documents */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">KYC & Business Documents</h3>

                      {/* File Upload Area */}
                      <Card className="rounded-xl border border-dashed">
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="rounded-full bg-muted p-4">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="text-center space-y-2">
                              <p className="text-sm font-medium">
                                Drag & drop files or click to upload
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Supported formats: PDF, JPG, PNG (Max 5MB)
                              </p>
                            </div>
                            <input
                              type="file"
                              id="file-upload"
                              className="hidden"
                              accept=".pdf,.jpg,.png"
                              onChange={handleFileUpload}
                            />
                            <Button
                              variant="outline"
                              onClick={() =>
                                document.getElementById("file-upload").click()
                              }
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Files
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Uploaded Files List */}
                      <div className="space-y-3">
                        {uploadedFiles.map((file) => (
                          <Card key={file.id} className="rounded-xl border">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="rounded-full bg-muted p-2 shrink-0">
                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Uploaded on {file.date}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDeleteFile(file.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Skills & Focus Tab */}
                  <TabsContent value="skills" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Skills & Focus</h3>

                      {/* Skills Tags */}
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

                      {/* Add Skill Input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddSkill()
                            }
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
