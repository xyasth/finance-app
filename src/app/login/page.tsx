"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("credentials")
  const router = useRouter()

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const result = await signIn("credentials", {
        email: loginForm.email,
        password: loginForm.password,
        callbackUrl: "/dashboard", // always go to dashboard
        redirect: false,
      })

      if (result?.error) {
        setErrors({ general: "Invalid email or password" })
      } else if (result?.ok) {
        router.push("/dashboard")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    if (registerForm.password !== registerForm.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" })
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      })

      const data = await res.json()

      if (res.ok) {
        await signIn("credentials", {
          email: registerForm.email,
          password: registerForm.password,
          callbackUrl: "/dashboard",
          redirect: false,
        })
        router.push("/dashboard")
      } else {
        setErrors({ general: data.error || "Registration failed" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleWorkOSSignIn = () => {
    setIsLoading(true)
    // Let NextAuth handle redirect here
    signIn("workos", { callbackUrl: "/dashboard" })
  }

  const fillTestCredentials = () => {
    setLoginForm({ email: "test@example.com", password: "password123" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in or create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="credentials">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
                <TabsTrigger value="sso">WorkOS SSO</TabsTrigger>
              </TabsList>

              {/* Login */}
              <TabsContent value="credentials" className="mt-6">
                <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                  </div>
                  {errors.general && <p className="text-red-600 text-sm">{errors.general}</p>}
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={fillTestCredentials} className="w-full text-xs">
                    Use Test Credentials
                  </Button>
                </form>
              </TabsContent>

              {/* Register */}
              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    required
                  />
                  {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword}</p>}
                  {errors.general && <p className="text-red-600 text-sm">{errors.general}</p>}
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

              {/* SSO */}
              <TabsContent value="sso" className="mt-6 text-center">
                <Button onClick={handleWorkOSSignIn} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="animate-spin" /> : "Sign in with WorkOS"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
