"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@apollo/client/react"
import { ResetPasswordDocument } from "@/graphql/generated/graphql"
import { appToast } from "@/lib/toast"
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
    }
  })

type Values = z.infer<typeof schema>

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)

  const [resetPassword, { loading }] = useMutation(ResetPasswordDocument)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  // No token in URL — invalid link
  if (!token) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-8 font-cabinet">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            Invalid reset link
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            This link is invalid or has expired.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="bg-[#E8A020] text-white font-bold px-6 py-3 rounded-xl text-sm"
        >
          Request New Link
        </Link>
      </div>
    )
  }

  // Success state
  if (done) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-8 font-cabinet">
        <div className="w-20 h-20 rounded-3xl bg-green-500 flex items-center justify-center">
          <CheckCircle2 size={40} color="white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Password reset!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your password has been updated successfully.
            You can now log in with your new password.
          </p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-[#E8A020] text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
        >
          Continue to Login →
        </button>
      </div>
    )
  }

  async function onSubmit(values: Values) {
    try {
      await resetPassword({
        variables: {
          token: token as string,
          newPassword: values.newPassword,
        },
      })
      setDone(true)
    } catch (err: any) {
      const message = err?.graphQLErrors?.[0]?.message ?? "Please try again"

      // Token expired — guide user to request new link
      if (
        message.toLowerCase().includes("expired") ||
        message.toLowerCase().includes("invalid")
      ) {
        appToast.error({
          title: "Link expired",
          description: "Please request a new password reset link",
        })
        router.push("/forgot-password")
        return
      }

      appToast.error({
        title: "Reset failed",
        description: message,
      })
    }
  }

  return (
    <div className="space-y-6 font-cabinet">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">
          Set new password
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a strong password for your Revela account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        {/* New password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            New Password
          </label>
          <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:border-[#E8A020] focus-within:ring-2 focus-within:ring-[#E8A020]/10 bg-white">
            <input
              {...register("newPassword")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="flex-1 px-4 py-3 text-sm outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="px-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Confirm Password
          </label>
          <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:border-[#E8A020] focus-within:ring-2 focus-within:ring-[#E8A020]/10 bg-white">
            <input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              className="flex-1 px-4 py-3 text-sm outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="px-3 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Password rules */}
        <div className="bg-muted/40 rounded-xl p-3 space-y-1">
          {[
            "At least 8 characters",
            "One uppercase letter",
            "One number",
          ].map((rule) => (
            <p key={rule} className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
              {rule}
            </p>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E8A020] text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Resetting..." : "Reset Password →"}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#E8A020]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}