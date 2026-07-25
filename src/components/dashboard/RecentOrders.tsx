import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

const orders = [
  {
    invoice: "#RKH-1086",
    customer: "Nimal Perera",
    orderType: "Dine-In",
    cashier: "Kevin",
    payment: "Cash",
    status: "Completed",
    amount: "Rs. 4,850.00",
    time: "10:42 AM",
  },
  {
    invoice: "#RKH-1085",
    customer: "Walk-in Customer",
    orderType: "Takeaway",
    cashier: "Kevin",
    payment: "Card",
    status: "Completed",
    amount: "Rs. 2,450.00",
    time: "10:34 AM",
  },
  {
    invoice: "#RKH-1084",
    customer: "Shanika Silva",
    orderType: "Delivery",
    cashier: "Amali",
    payment: "QR",
    status: "Pending",
    amount: "Rs. 6,780.00",
    time: "10:28 AM",
  },
  {
    invoice: "#RKH-1083",
    customer: "D. Fernando",
    orderType: "Dine-In",
    cashier: "Amali",
    payment: "Cash",
    status: "Completed",
    amount: "Rs. 3,920.00",
    time: "10:15 AM",
  },
  {
    invoice: "#RKH-1082",
    customer: "Walk-in Customer",
    orderType: "Takeaway",
    cashier: "Kevin",
    payment: "Card",
    status: "Cancelled",
    amount: "Rs. 1,850.00",
    time: "09:58 AM",
  },
];

const statusStyles = {
  Pending: "bg-primary/15 text-[#8a5e00]",
  Completed: "bg-success/10 text-[#147338]",
  Cancelled: "bg-destructive/10 text-destructive",
};

export function RecentOrders() {
  return (
    <article className="dashboard-card dashboard-fade-in overflow-hidden rounded-2xl border border-border/80 bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-bold text-foreground">Recent Orders</h2>
          <p className="mt-1 text-xs text-muted-foreground">Latest orders across all sales channels</p>
        </div>
        <button
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-secondary transition hover:bg-muted hover:text-accent focus-visible:ring-2 focus-visible:ring-primary"
          type="button"
        >
          View all <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto dashboard-scrollbar">
        <table className="w-full min-w-[980px] text-left">
          <thead>
            <tr className="bg-muted/45 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              {["Invoice Number", "Customer", "Order Type", "Cashier", "Payment Method", "Status", "Amount", "Time"].map(
                (heading) => (
                  <th className="px-5 py-3 font-bold first:pl-6" key={heading} scope="col">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/75">
            {orders.map((order) => (
              <tr className="text-xs transition hover:bg-muted/30" key={order.invoice}>
                <td className="whitespace-nowrap px-5 py-4 pl-6 font-bold text-foreground">{order.invoice}</td>
                <td className="whitespace-nowrap px-5 py-4 font-medium text-foreground">{order.customer}</td>
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{order.orderType}</td>
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{order.cashier}</td>
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{order.payment}</td>
                <td className="whitespace-nowrap px-5 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold",
                      statusStyles[order.status as keyof typeof statusStyles],
                    )}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-bold text-foreground">{order.amount}</td>
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
