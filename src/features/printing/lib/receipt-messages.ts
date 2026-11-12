export function receiptMessageLines(thankYou: string, visitAgain: string) {
  const lines = thankYou.split(/\r?\n/);
  const existing = new Set(lines.map((line) => line.trim()));
  return [...lines, ...visitAgain.split(/\r?\n/).filter((line) => line.trim() && !existing.has(line.trim()))];
}
