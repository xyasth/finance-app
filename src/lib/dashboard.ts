// lib/dashboard.ts
import { prisma } from "./prisma"

export async function getDashboardData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currency: true },
  })

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: {
      type: true,
      amount: true,
    },
  })

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpenses

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      type: true,
      amount: true,
      description: true,
      category: true,
      date: true,
    },
  })

  return {
    totalIncome,
    totalExpenses,
    balance,
    recentTransactions: recentTransactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
      date: t.date.toISOString(),
    })),
    currency: user?.currency || "USD",
  }
}
