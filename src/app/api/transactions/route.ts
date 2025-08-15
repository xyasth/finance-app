// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive(),
  description: z.string().min(1),
  category: z.string().min(1),
  date: z.string().datetime().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type")

    const skip = (page - 1) * limit

    const where = {
      userId: session.user.id,
      ...(type && { type: type as "INCOME" | "EXPENSE" })
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          category: true,
          date: true,
          createdAt: true
        }
      }),
      prisma.transaction.count({ where })
    ])

    return NextResponse.json({
      transactions: transactions.map(t => ({
        ...t,
        amount: Number(t.amount),
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString()
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Get transactions error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createTransactionSchema.parse(body)

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: validatedData.type,
        amount: validatedData.amount,
        description: validatedData.description,
        category: validatedData.category,
        date: validatedData.date ? new Date(validatedData.date) : new Date()
      }
    })

    return NextResponse.json({
      ...transaction,
      amount: Number(transaction.amount),
      date: transaction.date.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString()
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error },
        { status: 400 }
      )
    }

    console.error("Create transaction error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}