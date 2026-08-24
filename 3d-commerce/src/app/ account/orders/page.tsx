import { AccountShell } from "@/components/account/AccountShell";
import { OrderCard } from "@/components/account/OrderCard";
import { orders } from "@/config/orders";

export default function OrdersPage() {
  return (
    <AccountShell
      title="Orders"
      description="Track your FORMA purchases from confirmation to delivery."
    >
      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
          />
        ))}
      </div>
    </AccountShell>
  );
}