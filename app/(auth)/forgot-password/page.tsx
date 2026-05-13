"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { ForgotPasswordDocument } from "@/graphql/generated/graphql";
import { appToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Loader2, CheckCircle2, AtSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/textfield";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const [forgotPassword, { loading }] = useMutation(ForgotPasswordDocument);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: Values) {
    try {
      await forgotPassword({
        variables: { email: values.email },
      });
      setSentTo(values.email);
      setSent(true);
    } catch (err: any) {
      appToast.error({
        title: "Something went wrong",
        description: err?.graphQLErrors?.[0]?.message ?? "Please try again",
      });
    }
  }

  // ── Sent state ─────────────────────────────────────────
  if (sent) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-8 font-cabinet">
        <div className="w-20 h-20 rounded-3xl bg-[#FFF7E4] flex items-center justify-center">
          <Mail size={36} className="text-[#E8A020]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            We sent a password reset link to{" "}
            <span className="font-bold text-foreground">{sentTo}</span>. It
            expires in 15 minutes.
          </p>
        </div>

        <div className="w-full bg-[#FFF7E4] border border-[#E8A020]/30 rounded-2xl p-4 space-y-2 text-left">
          <p className="text-xs font-bold text-[#E8A020]">Didn't receive it?</p>
          <p className="text-xs text-muted-foreground">
            Check your spam folder. If it's still not there, you can request
            another link below.
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-xs font-bold text-[#E8A020] hover:underline"
          >
            Send again →
          </button>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to login
        </Link>
      </div>
    );
  }

  // ── Form state ─────────────────────────────────────────
  return (
    <div className="space-y-6 font-cabinet">
      <div>
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to login
        </Link>
        <h1 className="text-2xl font-extrabold text-foreground">
          Forgot password?
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          No worries — enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <TextField
          id="email"
          label={"Email Address"}
          required={true}
          rightIcon={<AtSign color="#BDCABB" />}
          placeholder="name@revelaafrica.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full bg-[#E8A020] text-white font-bold  rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
        >
          Send Reset Link
        </Button>
      </form>
    </div>
  );
}
