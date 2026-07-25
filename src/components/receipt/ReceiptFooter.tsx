export function ReceiptFooter({ copy, developerCredit, thankYouMessage }: { copy: number; developerCredit: string; thankYouMessage: string }) {
  return <footer className="receipt-section receipt-footer"><p className="receipt-message receipt-thanks">{thankYouMessage}</p><div className="receipt-spacer" /><p className="receipt-message">{developerCredit}</p>{copy > 1 && <p className="receipt-copy-label">COPY {copy}</p>}</footer>;
}
