"use client";

interface OrderNotesProps { value: string; onChange: (value: string) => void; }

export function OrderNotes({ value, onChange }: OrderNotesProps) {
  return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-wide text-muted-foreground">Order notes</span><textarea className="min-h-20 w-full resize-y rounded-xl border border-input bg-white px-3 py-2.5 text-sm text-secondary outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10" maxLength={500} onChange={(event) => onChange(event.target.value)} placeholder='e.g. "No onions"' value={value} /></label>;
}

