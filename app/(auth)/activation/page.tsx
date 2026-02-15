"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { userActivationSchema } from "@/lib/validatoion/user"; // Preserving existing path with typo

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


type ActivationFormValues = z.infer<typeof userActivationSchema>;

function ActivationFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActivationFormValues>({
    resolver: zodResolver(userActivationSchema),
  });

  async function onSubmit(data: ActivationFormValues) {
    setError(null);

    if (!token) {
      setError("Activation token is missing. Please check your email link.");
      return;
    }

    try {
      const response = await fetch("/api/activation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to activate account");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/api/auth/signin");
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="text-xl text-red-600">Invalid Link</CardTitle>
          <CardDescription className="text-red-600/80">
            The activation link is missing a token. Please check your email and try again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">Account Activated!</CardTitle>
          <CardDescription className="text-green-700/80">
            Your account has been successfully activated. Redirecting you to login...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Activate Account</CardTitle>
        <CardDescription className="text-center">
          Set your password to activate your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activating...
              </>
            ) : (
              "Activate Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ActivationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Suspense fallback={<div className="flex items-center space-x-2"><Loader2 className="h-6 w-6 animate-spin" /><span>Loading...</span></div>}>
        <ActivationFormContent />
      </Suspense>
    </div>
  );
}
