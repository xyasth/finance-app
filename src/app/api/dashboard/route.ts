// app/api/dashboard/route.ts
import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { getDashboardData } from "@/lib/dashboard"

export async function GET() {
  try {
    const session = await getAuthSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await getDashboardData(session.user.id)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
