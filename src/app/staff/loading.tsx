export default function StaffLoading() {
  return <div aria-label="Loading staff accounts" className="space-y-5" role="status"><div className="h-44 animate-pulse rounded-3xl bg-secondary/15" /><div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div className="h-24 animate-pulse rounded-2xl bg-muted" key={index} />)}</div><div className="h-96 animate-pulse rounded-2xl bg-muted" /><span className="sr-only">Loading staff accounts…</span></div>;
}
