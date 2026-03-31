"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Req() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5 ml-1 align-middle" />;
}

/* Google "G" logo SVG */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      setError("root", { message: "Invalid email or password" });
    }
  }

  async function handleGoogleSignIn() {
    await signIn("google", { callbackUrl: "/admin/dashboard" });
  }

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col items-center justify-center bg-primary text-primary-foreground p-12 gap-8 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="login-orb-1 absolute -top-24 -left-24 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="login-orb-2 absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
        <div className="login-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="w-full relative z-10">
          <Image
            src="/images/illustration/lodgebit-illustration.png"
            alt="Lodgebit dashboard preview"
            width={1080}
            height={1080}
            className="w-full h-auto rounded-2xl"
          />
        </div>
        <div className="text-center space-y-2 max-w-xs relative z-10">
          <h1 className="text-2xl font-bold">Manage your properties with ease</h1>
          <p className="text-sm text-primary-foreground/70">
            Lodgebit — track bookings, scan contracts, and keep everything in one place.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <Image src="/images/logo/logo.svg" alt="Lodgebit" width={130} height={40} className="h-10 w-auto" />
            <p className="text-sm text-muted-foreground">Sign in to the admin panel</p>
          </div>

          <div className="space-y-4">
            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn}>
              <GoogleIcon />
              <span className="ml-2">Sign in with Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">
                  Email <Req />
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">
                  Password <Req />
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password")}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              {errors.root && <p className="text-sm text-destructive text-center">{errors.root.message}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
