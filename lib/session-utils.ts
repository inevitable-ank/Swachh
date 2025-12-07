import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import User from "@/models/User"
import dbConnect from "./db"

export async function refreshUserSession(userId: string) {
  try {
    await dbConnect()
    const user = await User.findById(userId).select("points badges")
    
    if (!user) {
      return null
    }

    return {
      points: user.points || 0,
      badges: user.badges || []
    }
  } catch (error) {
    console.error("Error refreshing user session:", error)
    return null
  }
}


