import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { refreshUserSession } from "@/lib/session-utils"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = await refreshUserSession(session.user.id)

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(userData)
  } catch (error: any) {
    console.error("Refresh user error:", error)
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 })
  }
}
