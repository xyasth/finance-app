// app/transactions/add/page.tsx
"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Rental",
  "Other Income"
]

const expenseCategories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Travel",
  "Education",
  "Other"
]

function AddTransactionForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = searchParams.get("type") || "expense"
  
  const [activeTab, setActiveTab] = useState(initialType)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent, type: "INCOME" | "EXPENSE") => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          amount: parseFloat(formData.amount),
          description: formData.description,
          category: formData.category,
          date: new Date(formData.date).toISOString()
        }),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        const error = await response.json()
        console.error("Error creating transaction:", error)
        alert("Failed to create transaction. Please try again.")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split('T')[0]
    })
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    resetForm()
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

  const TransactionForm = ({ type, categories }: { type: "INCOME" | "EXPENSE", categories: string[] }) => (
    <form onSubmit={(e) => handleSubmit(e, type)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleInputChange("amount", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          type="text"
          placeholder={`Enter ${type.toLowerCase()} description`}
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange("date", e.target.value)}
          required
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading || !formData.amount || !formData.description || !formData.category}
          className={`flex-1 ${type === "INCOME" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            `Add ${type === "INCOME" ? "Income" : "Expense"}`
          )}
        </Button>
        <Button type="button" variant="outline" onClick={resetForm}>
          Clear
        </Button>
      </div>
    </form>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Transaction</h1>
          <p className="text-gray-600 mt-2">Record your income or expenses</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-600">
                  Expense
                </TabsTrigger>
                <TabsTrigger value="income" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-600">
                  Income
                </TabsTrigger>
              </TabsList>

              <TabsContent value="expense" className="mt-6">
                <TransactionForm type="EXPENSE" categories={expenseCategories} />
              </TabsContent>

              <TabsContent value="income" className="mt-6">
                <TransactionForm type="INCOME" categories={incomeCategories} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function AddTransactionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <AddTransactionForm />
    </Suspense>
  )
}