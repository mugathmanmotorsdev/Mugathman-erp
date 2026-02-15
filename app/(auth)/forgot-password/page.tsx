"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordValues) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
         // handle specific error cases if needed, otherwise fallback to generic
         const result = await response.json().catch(() => ({}))
         throw new Error(result.error || "Failed to send reset link")
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
              <CardTitle>Check your email</CardTitle>
            </div>
            <CardDescription className="pt-2 text-green-700 dark:text-green-300">
              We have sent a password reset link to your email address. Please check your inbox and spam folder.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link href="/api/auth/signin">Back to Login</Link>
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
          <CardTitle className="text-2xl font-bold tracking-tight">Forgot password</CardTitle>
          <CardDescription>
            Enter your email address and we will send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                 className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 animate-shake">{errors.email.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-900">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        </CardContent>
        <CardFooter>
            <Button variant="link" className="w-full" asChild>
                <Link href="/api/auth/signin" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
