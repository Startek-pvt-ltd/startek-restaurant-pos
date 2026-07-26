export default function OrdersLoading() {
  return <div aria-label="Loading orders" className="animate-pulse space-y-5" role="status"><div className="h-16 max-w-md rounded-2xl bg-card" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <div className="h-32 rounded-2xl bg-card" key={index} />)}</div><div className="h-44 rounded-2xl bg-card" /><div className="h-96 rounded-2xl bg-card" /><span className="sr-only">Loading orders…</span></div>;
}
