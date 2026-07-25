import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12 sm:px-8">
      <div aria-hidden="true" className="absolute -left-28 -top-28 size-80 rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-28 -right-28 size-80 rounded-full bg-primary/20 blur-3xl" />
      <section className="relative w-full max-w-xl rounded-3xl border border-primary/20 bg-card p-7 text-center shadow-[0_24px_80px_rgba(74,35,16,0.12)] sm:p-12">
        <Image className="mx-auto h-auto w-44 sm:w-52" src="/logos/rice-kottu-hut-logo.png" alt="Rice & Kottu Hut logo" width={2000} height={2000} priority />
        <div className="mt-7">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Rice &amp; Kottu Hut</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Startek Restaurant POS</h1>
          <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-semibold text-success">
            <CheckCircle2 className="size-5" aria-hidden="true" />
            <span>System setup successful</span>
          </div>
          <p className="mt-5 text-sm font-medium text-muted-foreground">Version 1.0.0</p>
        </div>
        <div className="my-7 h-px bg-border" />
        <p className="text-sm text-muted-foreground">Developed by <span className="font-semibold text-foreground">Startek (PVT) LTD</span></p>
      </section>
    </main>
  );
}
