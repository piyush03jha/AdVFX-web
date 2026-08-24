import type { OrderItem } from "@/config/orders";

interface OrderItemsProps {
  items: OrderItem[];
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function OrderItems({
  items,
}: OrderItemsProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.productId}
          className="
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-border/70
            bg-surface/40
            p-2.5
            sm:p-3
          "
        >
          <div
            className="
              h-16
              w-16
              shrink-0
              overflow-hidden
              rounded-lg
              bg-surface-elevated
              sm:h-20
              sm:w-20
            "
          >
            <img
              src={item.image}
              alt={item.name}
              className="
                h-full
                w-full
                object-cover
              "
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground sm:text-sm">
              {item.name}
            </p>

            <p className="mt-1 text-[10px] text-muted">
              Qty {item.quantity}
            </p>
          </div>

          <p className="shrink-0 text-xs font-medium text-foreground">
            {formatPrice(
              item.price * item.quantity,
            )}
          </p>
        </div>
      ))}
    </div>
  );
}