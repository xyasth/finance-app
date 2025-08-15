// app/transactions/page.tsx
"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trash2, Filter, Plus } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: string
  type: "INCOME" | "EXPENSE"
  amount: number
  description: string
  category: string
  date: string
  createdAt: string
}

interface TransactionsData {
  transactions: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function TransactionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<TransactionsData>({
    transactions: [],
    pagination: { page: 1, limit: 10, total: 0, pages: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [currency, setCurrency] = useState("USD")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchTransactions()
  }, [session, filter, currentPage])

  const fetchTransactions = async () => {
    if (!session) return

    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10"
      })

      if (filter !== "ALL") {
        params.append("type", filter)
      }

      const response = await fetch(`/api/transactions?${params}`)
      if (response.ok) {
        const transactionsData = await response.json()
        setData(transactionsData)
      }

      // Also fetch user currency
      const dashboardResponse = await fetch("/api/dashboard")
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json()
        setCurrency(dashboardData.currency)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return
    }

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTransactions()
      } else {
        alert("Failed to delete transaction")
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
      alert("An error occurred while deleting the transaction")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <Link href="/transactions/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Transactions</h1>
          <p className="text-gray-600">View and manage your financial transactions</p>
        </div>

        {/* Filter and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filter} onValueChange={(value: "ALL" | "INCOME" | "EXPENSE") => {
              setFilter(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Transactions</SelectItem>
                <SelectItem value="INCOME">Income Only</SelectItem>
                <SelectItem value="EXPENSE">Expenses Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {data.transactions.length} of {data.pagination.total} transactions
          </div>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filter === "ALL" ? "All Transactions" : 
               filter === "INCOME" ? "Income Transactions" : "Expense Transactions"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading transactions...</p>
              </div>
            ) : data.transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No transactions found</p>
                <Link href="/transactions/add">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Transaction
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.type === "INCOME" ? "bg-green-500" : "bg-red-500"
                        }`} />
                        <div>
                          <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                          <p className="text-sm text-gray-600">
                            {transaction.category} • {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`text-right font-semibold ${
                        transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                      }`}>
                        <div className="text-lg">
                          {transaction.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-xs text-gray-500 font-normal">
                          {transaction.type}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {data.pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              disabled={currentPage === data.pagination.pages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}