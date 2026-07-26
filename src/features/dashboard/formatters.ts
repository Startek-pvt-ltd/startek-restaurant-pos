export function formatDashboardMoney(value: string | number) {
  return `Rs. ${Number(value).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDashboardTime(value: string) {
  return new Date(value).toLocaleTimeString("en-LK", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit" });
}

export function formatDashboardDate(value: string) {
  return new Date(value).toLocaleDateString("en-LK", { timeZone: "Asia/Colombo", day: "numeric", month: "short" });
}

export function relativeDashboardTime(value: string) {
  const difference = new Date(value).getTime() - Date.now();
  const seconds = Math.round(difference / 1_000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  return formatter.format(Math.round(hours / 24), "day");
}

export function readableEnum(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}
