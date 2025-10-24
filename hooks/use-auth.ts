"use client"

import { useToast } from "@/components/ui/use-toast"
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export const useAuth = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const user = session?.user
  const loading = status === "loading"

  const signIn = async (email: string, password: string) => {
    try {
      const result = await nextAuthSignIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Sign in failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })

      router.push("/issues")
      router.refresh()
      return true
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Registration failed",
          description: data.error || "Please try again with different credentials.",
          variant: "destructive",
        })
        return false
      }

      // Sign in the user after successful registration
      return signIn(email, password)
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const signOut = async () => {
    await nextAuthSignOut({ redirect: false })
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    })
    router.push("/")
    router.refresh()
  }

  const refreshUser = async () => {
    try {
      const response = await fetch("/api/user/refresh")
      if (response.ok) {
        // Force a session refresh by reloading the page
        router.refresh()
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  }
}
