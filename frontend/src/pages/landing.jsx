import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2, Users, Shield, Building2, MapPin, Camera, CheckCircle2, FileText, Bell, BarChart3, Globe } from "lucide-react"
import Spline from "@splinetool/react-spline"
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack"

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <span className="font-semibold">Civic Issue Reporter</span>
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
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 lg:gap-12 xl:gap-16 items-center">
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
              <div className="order-1 lg:order-1 lg:col-span-4 relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px]">
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

        {/* How It Works - ScrollStack Section */}
        <section className="relative h-screen">
          <ScrollStack>
            <h1 className="text-4xl font-bold mb-8">How It Works</h1>
            {/* Card 1: Report Issues */}
            <ScrollStackItem itemClassName="bg-white  border border-blue-500/20">
              <div className="flex flex-col md:flex-row items-center gap-8 h-full">
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-blue-500/15 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">Step 1</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Report Issues</h3>
                  <p className="text-muted-foreground text-base leading-relaxed mb-4">
                    Snap a photo, pin the exact location on the map, and describe the civic issue in detail. 
                    Your report is instantly sent to the relevant municipal department.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Camera className="h-4 w-4 text-blue-500" />
                      <span>Photo Upload</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span>GPS Location</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span>Detailed Description</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollStackItem>

            {/* Card 2: Track Progress */}
            <ScrollStackItem itemClassName="bg-white border border-amber-500/20">
              <div className="flex flex-col md:flex-row items-center gap-8 h-full">
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-amber-500/15 flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">Step 2</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Track Progress</h3>
                  <p className="text-muted-foreground text-base leading-relaxed mb-4">
                    Monitor every submitted issue with real-time status updates. Get notified as department admins 
                    review, assign, and work towards resolving your reports.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Bell className="h-4 w-4 text-amber-500" />
                      <span>Real-time Notifications</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-amber-500" />
                      <span>Status Updates</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BarChart3 className="h-4 w-4 text-amber-500" />
                      <span>Progress Timeline</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollStackItem>

            {/* Card 3: Get Resolved */}
            <ScrollStackItem itemClassName="bg-white border border-green-500/20">
              <div className="flex flex-col md:flex-row items-center gap-8 h-full">
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-green-500/15 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-3 py-1 rounded-full">Step 3</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Get Resolved</h3>
                  <p className="text-muted-foreground text-base leading-relaxed mb-4">
                    Issues are assigned to the appropriate municipal department. Once resolved, completion photos 
                    are uploaded as proof, and you receive a resolution confirmation.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 text-green-500" />
                      <span>Department Assignment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Camera className="h-4 w-4 text-green-500" />
                      <span>Completion Photos</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Verified Resolution</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollStackItem>

            {/* Card 4: Department Dashboard */}
            <ScrollStackItem itemClassName="bg-white border border-purple-500/20">
              <div className="flex flex-col md:flex-row items-center gap-8 h-full">
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-purple-500/15 flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-purple-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full">For Admins</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Department Dashboard</h3>
                  <p className="text-muted-foreground text-base leading-relaxed mb-4">
                    Regional and department admins get a centralized dashboard to manage all incoming issues, 
                    assign tasks, track resolution metrics, and ensure accountability across teams.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span>Team Management</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      <span>Analytics & Metrics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-purple-500" />
                      <span>Role-based Access</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollStackItem>

            {/* Card 5: Community Impact */}
            <ScrollStackItem itemClassName="bg-white border border-rose-500/20">
              <div className="flex flex-col md:flex-row items-center gap-8 h-full">
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-rose-500/15 flex items-center justify-center">
                  <Globe className="h-12 w-12 text-rose-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full">Impact</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Community Impact</h3>
                  <p className="text-muted-foreground text-base leading-relaxed mb-4">
                    Every report you file contributes to a better community. See aggregated statistics, resolved 
                    issue maps, and community engagement scores that highlight the collective impact of civic participation.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-rose-500" />
                      <span>Issue Heatmaps</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-rose-500" />
                      <span>Community Stats</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4 text-rose-500" />
                      <span>Public Transparency</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollStackItem>
          </ScrollStack>
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
