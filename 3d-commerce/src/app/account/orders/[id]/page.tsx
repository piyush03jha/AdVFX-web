import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconArrowLeft,
  IconMapPin,
  IconPackage,
  IconTruck,
} from "@tabler/icons-react";

import { AccountShell } from "@/components/account/AccountShell";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { OrderItems } from "@/components/account/OrderItems";
import { OrderSummary } from "@/components/account/OrderSummary";
import { getOrderById } from "@/config/orders";
import { Navbar } from "@/components/layout/SiteNavbar";

interface OrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderPage({
  params,
}: OrderPageProps) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <>
    <Navbar />
    <AccountShell
      title={order.orderNumber}
      description={`Placed ${new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`}
    >
      <div className="space-y-4 sm:space-y-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-[10px] text-muted hover:text-foreground"
        >
          <IconArrowLeft size={13} />
          Back to orders
        </Link>

        <section className="rounded-2xl border border-border bg-surface/50 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.16em] text-primary">
                Shipment
              </p>
              <h2 className="mt-1 text-sm font-medium text-foreground">
                {order.shipment?.carrier ?? "Preparing shipment"}
              </h2>
              {order.shipment && (
                <p className="mt-1 text-[10px] text-muted">
                  Tracking {order.shipment.trackingNumber}
                </p>
              )}
            </div>

            {order.shipment && (
              <div className="sm:text-right">
                <p className="text-[9px] uppercase tracking-[0.1em] text-muted">
                  Estimated delivery
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {order.shipment.estimatedDelivery}
                </p>
              </div>
            )}
          </div>

          {order.shipment && (
            <div className="mt-5">
              <OrderTimeline events={order.shipment.events} compact />
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <IconPackage size={15} className="text-muted" />
            <h2 className="text-xs font-medium uppercase tracking-[0.12em]">Items</h2>
          </div>
          <OrderItems items={order.items} />
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-surface/50 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <IconMapPin size={15} className="text-muted" />
              <h2 className="text-xs font-medium uppercase tracking-[0.12em]">Delivery address</h2>
            </div>

            <div className="mt-4 text-xs leading-5">
              <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
              <p className="text-muted">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p className="text-muted">{order.shippingAddress.addressLine2}</p>
              )}
              <p className="text-muted">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              <p className="text-muted">{order.shippingAddress.postalCode}</p>
              <p className="mt-2 text-muted">{order.shippingAddress.phone}</p>
            </div>
          </section>

          <OrderSummary order={order} />
        </div>

        {order.shipment?.trackingUrl && (
          <a
            href={order.shipment.trackingUrl}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-medium text-white shadow-[0_0_25px_var(--glow-primary)] transition-colors hover:bg-primary-hover"
          >
            <IconTruck size={16} />
            Track shipment
          </a>
        )}
      </div>
    </AccountShell>
    </>
  );
}
