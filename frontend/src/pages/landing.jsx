import { useState } from "react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle, 
  Loader2, 
  Users, 
  Shield, 
  Building2, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  FileText, 
  Bell, 
  BarChart3, 
  Globe 
} from "lucide-react"
import Spline from "@splinetool/react-spline"
import logoImg from "@/assets/logo.png"

export default function Landing() {
  const [splineLoading, setSplineLoading] = useState(true)
  const [splineError, setSplineError] = useState(false)

  const navigate = (path) => {
    window.history.pushState({}, "", path)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  const handleSplineLoad = () => {
    setSplineLoading(false)
    setSplineError(false)
  }

  const handleSplineError = () => {
    setSplineLoading(false)
    setSplineError(true)
  }

  const steps = [
    {
      step: "01",
      title: "Report Issues",
      description: "Snap a photo, pin the exact location on the map, and describe the civic issue in detail. Your report is instantly sent to the relevant department.",
      icon: Camera,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      features: ["Photo Upload", "GPS Location", "Detailed Description"]
    },
    {
      step: "02",
      title: "Track Progress",
      description: "Monitor every submitted issue with real-time status updates. Get notified as department admins review, assign, and work towards resolution.",
      icon: BarChart3,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      features: ["Real-time Notifications", "Status Updates", "Progress Timeline"]
    },
    {
      step: "03",
      title: "Get Resolved",
      description: "Issues are assigned to the appropriate department. Once resolved, completion photos are uploaded as proof, and you receive verification.",
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      features: ["Department Assignment", "Completion Photos", "Verified Resolution"]
    },
    {
      step: "Admin",
      title: "Management",
      description: "Admins get a centralized dashboard to manage incoming issues, assign tasks, track resolution metrics, and ensure team accountability.",
      icon: Building2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      features: ["Team Management", "Analytics & Metrics", "Role-based Access"]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/")}
           >
            <div className="shrink-0 w-9 h-9">
              <img
                src={logoImg}
                alt="Civic Issue Reporter Logo"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <h2 className="font-semibold text-lg bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent truncate">
              Civic Setu
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/login")}>Log in</Button>
            <Button onClick={() => navigate("/signup")}>Sign up</Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
          {/* Container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 lg:gap-12 xl:gap-16 items-center py-12 lg:py-20">
              {/* Text Section */}
              <div className="order-2 lg:order-1 lg:col-span-3 max-w-2xl mx-auto lg:mx-0">
                <Badge className="mb-4" variant="outline">Report. Track. Resolve.</Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                  Report civic issues and make your community better
                </h1>
                <p className="mt-5 text-muted-foreground text-lg max-w-prose">
                  A comprehensive platform for citizens to report civic issues like potholes, broken streetlights, 
                  water supply problems, and more. Track your reports in real-time and see them get resolved by 
                  dedicated departments.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Button size="lg" onClick={() => navigate("/signup")}>Report an Issue</Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/login")}>I already have an account</Button>
                </div>
                <div className="mt-6 text-sm text-muted-foreground">
                  Free to use. Help improve your community.
                </div>
              </div>

              {/* 3D Model Section - Spans 3 grid columns */}
              <div className="order-1 lg:order-1 lg:col-span-4 relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]">
                {/* Loading state */}
                {splineLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-2xl">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Loading 3D model...</p>
                    </div>
                  </div>
                )}
                
                {/* Error fallback */}
                {splineError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
                    <div className="text-center p-6">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                      <p className="text-sm text-muted-foreground">3D model unavailable</p>
                    </div>
                  </div>
                )}

                {/* Spline container */}
                <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
                  {!splineError && (
                    <Spline
                      scene="https://prod.spline.design/vzxPkRGHgxpZGsYs/scene.splinecode"
                      onLoad={handleSplineLoad}
                      onError={handleSplineError}
                      className="w-full h-full"
                      style={{
                        width: '100%',
                        height: '100%',
                        minHeight: '400px'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Process</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">How it works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our platform streamlines the connection between citizens and municipal authorities in four simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <Card className="h-full border-muted/50 hover:border-primary/50 transition-colors bg-card shadow-sm hover:shadow-md">
                    <CardContent className="pt-6 px-6 pb-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-xl ${item.bgColor}`}>
                          <item.icon className={`h-6 w-6 ${item.color}`} />
                        </div>
                        <span className="text-4xl font-black text-muted/20 select-none">{item.step}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                        {item.description}
                      </p>

                      <div className="space-y-2 mt-auto">
                        {item.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className={`h-1 w-1 rounded-full ${item.color}`} />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-muted/40 py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">About Civic Issue Reporter</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Civic Issue Reporter is a comprehensive platform that connects citizens with local government departments 
              to report and resolve civic issues efficiently. From potholes and broken streetlights to water supply problems 
              and sanitation issues, our system ensures that every report is tracked, assigned to the right department, 
              and resolved with transparency. With real-time status updates, photo verification, and a structured workflow 
              for regional and departmental admins, we make civic engagement simple and effective.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-20">
        <div className="mx-auto w-[95%] px-10 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-14">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">Civic Issue Reporter</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                Empowering citizens to report civic issues and connect with local government departments
                for faster resolution and better community engagement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-foreground">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:underline">Our Story</a></li>
                <li><a href="#" className="hover:underline">Team</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Press</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:underline">Privacy Policy</a></li>
                <li><a href="#" className="hover:underline">Terms & Conditions</a></li>
                <li><a href="#" className="hover:underline">Cookies Policy</a></li>
                <li><a href="#" className="hover:underline">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-foreground">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:underline">Contact Us</a></li>
                <li><a href="#" className="hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:underline">LinkedIn</a></li>
                <li><a href="#" className="hover:underline">Twitter</a></li>
              </ul>
            </div>
          </div>

          <Separator className="my-10" />
          <div className="flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Civic Issue Reporter. All rights reserved.</p>
            <div className="flex gap-4 mt-2 md:mt-0">
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
