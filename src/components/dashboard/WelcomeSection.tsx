interface WelcomeSectionProps {
  fullName: string;
  greeting: string;
}

export function WelcomeSection({ fullName, greeting }: WelcomeSectionProps) {
  const firstName = fullName.split(" ")[0] || fullName;

  return (
    <section className="dashboard-fade-in rounded-2xl border border-primary/20 bg-gradient-to-r from-card via-card to-primary/8 p-5 shadow-[0_10px_32px_rgba(74,35,16,0.07)] sm:p-7">
      <p className="text-sm font-semibold text-primary">Welcome back</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {greeting}, {firstName}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Here&apos;s today&apos;s overview for Rice &amp; Kottu Hut. Have a productive service.
      </p>
    </section>
  );
}
