"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { ArrowRight, CheckCircle, MapPin, ThumbsUp, Users } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const { user, loading } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                CivicSync
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Empowering citizens to report, track, and resolve community issues together.
              </p>
            </div>

            {loading ? (
              <div className="mt-4 animate-pulse text-muted-foreground">Loading...</div>
            ) : user ? (
              <div className="space-y-4">
                <p className="text-muted-foreground md:text-lg">
                  Welcome back, <span className="font-bold">{user.name}</span>!
                </p>
                <div className="space-x-4">
                  <Link href="/issues">
                    <Button className="px-8">
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/issues/new">
                    <Button variant="outline" className="px-8">
                      Report New Issue
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <Link href="/issues">
                  <Button className="px-8">
                    Browse Issues <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="px-8">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            <Feature
              icon={<MapPin className="h-6 w-6 text-primary" />}
              title="Report Issues"
              description="Easily report civic issues like potholes, broken streetlights, and more with location details and photos."
            />
            <Feature
              icon={<ThumbsUp className="h-6 w-6 text-primary" />}
              title="Vote on Priorities"
              description="Vote on issues that matter most to your community to help prioritize resolution efforts."
            />
            <Feature
              icon={<CheckCircle className="h-6 w-6 text-primary" />}
              title="Track Progress"
              description="Follow the status of reported issues from pending to resolved and see real-time updates."
            />
          </div>
        </div>
      </section>

      {!user && !loading && (
        <section className="py-12 md:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Join Your Community Today
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Be part of the solution. Register now to start reporting and voting on issues in your area.
                </p>
              </div>
              <Link href="/auth/register">
                <Button size="lg" className="px-8">
                  Sign Up Now <Users className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center space-y-4 text-center">
      <div className="p-4 bg-primary/10 rounded-full">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
