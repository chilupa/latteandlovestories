import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-rose-50 via-white to-amber-50/90 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 font-display text-lg font-semibold text-[#3f2d30]"
        >
          <Sparkles className="h-5 w-5 text-rose-400" aria-hidden />
          Latte & Love Stories
        </Link>

        <div className="rounded-[1.5rem] border border-white/80 bg-white/85 p-8 shadow-xl shadow-rose-900/10 backdrop-blur">
          <h1 className="font-display text-3xl font-semibold text-[#2d2424]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Private editor login. Visitors only see your public link page.
          </p>
          <div className="mt-8">
            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">Loading form…</p>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>

      </div>
    </div>
  );
}
