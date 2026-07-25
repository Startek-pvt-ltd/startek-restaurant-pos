export default function ExpensesLoading() {
  return <div aria-label="Loading expenses" className="animate-pulse space-y-5" role="status"><div className="h-16 max-w-md rounded-2xl bg-card" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div className="h-32 rounded-2xl bg-card" key={index} />)}</div><div className="h-44 rounded-2xl bg-card" /><div className="h-96 rounded-2xl bg-card" /><span className="sr-only">Loading expenses…</span></div>;
}
