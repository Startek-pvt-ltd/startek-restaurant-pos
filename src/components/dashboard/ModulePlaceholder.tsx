import type { LucideIcon } from "lucide-react";

export function ModulePlaceholder({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-3xl items-center justify-center py-8">
      <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-[0_18px_55px_rgba(74,35,16,0.08)] sm:p-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-[#8a5e00]">
          <Icon aria-hidden="true" className="size-7" />
        </span>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-primary">Planned module</p>
        <h1 className="mt-2 text-2xl font-black text-secondary sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
        <span className="mt-6 inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-black text-secondary">
          Coming in a future task
        </span>
      </div>
    </section>
  );
}
