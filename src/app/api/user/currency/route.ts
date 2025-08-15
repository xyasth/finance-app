// app/api/user/currency/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateCurrencySchema = z.object({
  currency: z.string().length(3)
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currency } = updateCurrencySchema.parse(body)

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { currency },
      select: { currency: true }
    })

    return NextResponse.json(user)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid currency code" },
        { status: 400 }
      )
    }

    console.error("Update currency error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}