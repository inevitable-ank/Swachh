import dbConnect from "@/lib/db"
import User from "@/models/User"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    await dbConnect()

    const { email, password } = await request.json()

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const userWithoutPassword = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }

    return NextResponse.json(userWithoutPassword)
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 })
  }
}
