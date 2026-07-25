import { PosBillingScreen } from "@/components/pos/PosBillingScreen";
import { getPosData } from "@/features/pos/services/pos-service";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const data = await getPosData();

  return <PosBillingScreen {...data} />;
}

