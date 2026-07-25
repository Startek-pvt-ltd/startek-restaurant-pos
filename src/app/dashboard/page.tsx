import Image from "next/image";
import { BadgeCheck } from "lucide-react";

import { requireAuth } from "@/lib/auth-utils";

import { LogoutButton } from "./logout-button";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <main className="min-h-screen bg-background px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-5 rounded-2xl border border-primary/20 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              alt="Rice & Kottu Hut logo"
              className="h-16 w-16 rounded-xl object-contain"
              height={256}
              priority
              src="/logos/rice-kottu-hut-logo.png"
              width={256}
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Startek Restaurant POS
              </p>
              <h1 className="mt-1 text-xl font-bold text-foreground">Welcome, {session.user.name}</h1>
            </div>
          </div>
          <LogoutButton />
        </header>

        <section className="mt-8 rounded-3xl border border-primary/20 bg-card p-7 shadow-[0_18px_60px_rgba(74,35,16,0.1)] sm:p-10">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-success/10 text-success">
            <BadgeCheck aria-hidden="true" className="size-8" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-foreground">Authentication setup successful</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Your secure session is active. Dashboard analytics will be introduced in a future milestone.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-muted/60 p-5">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full name</dt>
              <dd className="mt-2 text-lg font-semibold text-foreground">{session.user.name}</dd>
            </div>
            <div className="rounded-2xl bg-muted/60 p-5">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</dt>
              <dd className="mt-2 text-lg font-semibold text-foreground">
                {session.user.role.replaceAll("_", " ")}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
