"use client"

import { useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { userActivation } from "@/lib/validatoion/user" // Note: validation typo in path is consistent with project structure

type ResetPasswordValues = z.infer<typeof userActivation>

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(userActivation),
  })

  async function onSubmit(data: ResetPasswordValues) {
    if (!token) {
        setError("Invalid or missing token")
        return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token,
            password: data.password
        }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || "Failed to reset password")
      }

      setIsSuccess(true)
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message)
        } else {
             setError("An unknown error occurred")
        }
    } finally {
      setIsLoading(false)
    }
  }
  
    if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
        <Card className="w-full max-w-md animate-fade-in border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900">
          <CardHeader>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-6 w-6" />
              <CardTitle>Password Reset Successfully</CardTitle>
            </div>
            <CardDescription className="pt-2 text-green-700 dark:text-green-300">
              Your password has been updated. You can now use your new password to sign in.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/api/auth/signin">Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

    if (!token) {
        return (
             <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
                <Card className="w-full max-w-md border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-500">Invalid Link</CardTitle>
                        <CardDescription>
                            This password reset link is invalid or missing the token. Please request a new one.
                        </CardDescription>
                    </CardHeader>
                     <CardFooter>
                        <Button asChild className="w-full" variant="outline">
                        <Link href="/forgot-password">Go to Forgot Password</Link>
                        </Button>
                    </CardFooter>
                </Card>
             </div>
        )
    }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md animate-slide-up shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
           <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                 <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 animate-shake">{errors.password.message}</p>
              )}
            </div>
            
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
               <div className="relative">
                <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                     className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                 <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                     {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
               </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 animate-shake">{errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-900">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
