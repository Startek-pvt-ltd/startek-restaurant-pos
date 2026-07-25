import { notFound } from "next/navigation";

import { OrderDetails } from "@/components/orders/OrderDetails";
import type { UserRole } from "@/generated/prisma/client";
import { getOrderDetail } from "@/features/orders/services/order-service";
import { ORDER_CANCEL_ROLES } from "@/features/orders/types";
import { orderIdSchema } from "@/features/orders/validations/order";
import { hasRole, requireAuth } from "@/lib/auth-utils";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session] = await Promise.all([params, requireAuth()]);
  const parsedId = orderIdSchema.safeParse(id);
  if (!parsedId.success) notFound();
  const order = await getOrderDetail(parsedId.data);
  if (!order) notFound();

  return <OrderDetails canCancel={hasRole(session.user.role, ORDER_CANCEL_ROLES as readonly UserRole[])} order={order} />;
}
