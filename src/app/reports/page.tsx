import { ChartNoAxesCombined } from "lucide-react";

import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export default function ReportsPage() {
  return <ModulePlaceholder description="Sales reporting and business analytics are intentionally deferred. No report calculations or exports are active in this stabilization release." icon={ChartNoAxesCombined} title="Reports" />;
}
