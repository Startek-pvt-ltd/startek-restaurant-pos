export function ReceiptFooter({ copy }: { copy: number }) {
  return <footer className="receipt-section receipt-footer"><p className="receipt-message receipt-thanks">Thank You!<br />Please Visit Again</p><div className="receipt-spacer" /><p className="receipt-message">Design &amp; Deploy by<br />Startek (PVT) LTD</p>{copy > 1 && <p className="receipt-copy-label">COPY {copy}</p>}</footer>;
}
