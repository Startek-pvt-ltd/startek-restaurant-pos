import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { LoginForm } from "./login-form";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

function getSafeCallbackUrl(callbackUrl: string | undefined) {
  if (!callbackUrl?.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/dashboard";
  }

  return callbackUrl;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (session?.user) redirect("/dashboard");

  const { callbackUrl } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10 sm:px-8">
      <div aria-hidden="true" className="absolute -left-32 -top-32 size-96 rounded-full bg-primary/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-36 -right-28 size-[28rem] rounded-full bg-secondary/10 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-primary/20 bg-card p-6 shadow-[0_24px_80px_rgba(74,35,16,0.14)] sm:p-9">
        <div className="text-center">
          <Image
            alt="Rice & Kottu Hut logo"
            className="mx-auto h-auto w-36 sm:w-44"
            height={2000}
            priority
            src="/logos/rice-kottu-hut-logo.png"
            width={2000}
          />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.28em] text-primary">
            Rice &amp; Kottu Hut
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Startek Restaurant POS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue to your workspace</p>
        </div>

        <LoginForm callbackUrl={getSafeCallbackUrl(callbackUrl)} />

        <div className="mt-8 border-t border-border pt-5 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="font-semibold text-foreground">Startek (PVT) LTD</span>
          </p>
        </div>
      </section>
    </main>
  );
}
