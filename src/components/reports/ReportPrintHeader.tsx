export function ReportPrintHeader({ range, title }: { range: string; title: string }) {
  return <header className="report-print-header hidden"><h1>Rice &amp; Kottu Hut</h1><p>No.32, Padukka Road, Meegoda · 0777250493 / 0778375427</p><h2>{title}</h2><p>Date range: {range}</p><p>Generated: {new Date().toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}</p></header>;
}
