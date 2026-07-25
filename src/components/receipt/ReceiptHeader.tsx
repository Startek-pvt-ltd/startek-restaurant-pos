import Image from "next/image";

export function ReceiptHeader({ printLogo, priority }: { printLogo: boolean; priority: boolean }) {
  return <header className="receipt-section receipt-header">{printLogo && <Image alt="Rice & Kottu Hut" className="receipt-logo" height={76} priority={priority} src="/logos/rice-kottu-hut-logo.png" width={76} />}<h1>Rice &amp; Kottu Hut</h1><p>No.32, Padukka Road, Meegoda</p><p>0777250493 / 0778375427</p></header>;
}
