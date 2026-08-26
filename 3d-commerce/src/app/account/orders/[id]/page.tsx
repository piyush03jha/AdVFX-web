import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconArrowLeft,
  IconMapPin,
  IconPackage,
  IconTruck,
} from "@tabler/icons-react";

import { Navbar } from "@/components/layout/SiteNavbar";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { OrderItems } from "@/components/account/OrderItems";
import { OrderSummary } from "@/components/account/OrderSummary";
import { getOrderById } from "@/config/orders";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
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
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
          >
            <IconArrowLeft size={14} />
            Back to orders
          </Link>

          <section className="rounded-2xl border border-border bg-surface/50 p-3.5 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-6">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
                  Shipment
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                  <h2 className="text-base font-semibold text-foreground sm:text-xl">
                    {order.shipment?.carrier ?? "Preparing shipment"}
                  </h2>
                  {order.shipment?.status && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-primary sm:text-[10px]">
                      {order.shipment.status.replaceAll("_", " ")}
                    </span>
                  )}
                </div>
                {order.shipment && (
                  <p className="mt-1 text-xs text-muted sm:text-sm">
                    Tracking {order.shipment.trackingNumber}
                  </p>
                )}
              </div>

              {order.shipment && (
                <div className="sm:text-right">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted sm:text-xs">
                    Estimated delivery
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground sm:text-lg">
                    {order.shipment.estimatedDelivery}
                  </p>
                </div>
              )}
            </div>

            {order.shipment && (
              <div className="mt-5 border-t border-border/60 pt-5 sm:mt-6 sm:pt-6">
                <OrderTimeline events={order.shipment.events} />
              </div>
            )}
          </section>

          <section>
            <div className="mb-2.5 flex items-center gap-2 sm:mb-3">
              <IconPackage size={16} className="text-muted" />
              <h2 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                Items
              </h2>
            </div>
            <OrderItems items={order.items} />
          </section>

          <div className="grid gap-3 lg:grid-cols-2 lg:gap-5">
            <section className="rounded-2xl border border-border bg-surface/50 p-3.5 sm:p-5">
              <div className="flex items-center gap-2">
                <IconMapPin size={16} className="text-muted" />
                <h2 className="text-sm font-semibold text-foreground sm:text-base">
                  Delivery address
                </h2>
              </div>

              <div className="mt-3 text-xs leading-5 sm:mt-4 sm:text-sm sm:leading-6">
                <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
                <p className="text-muted">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p className="text-muted">{order.shippingAddress.addressLine2}</p>
                )}
                <p className="text-muted">
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
                <p className="text-muted">{order.shippingAddress.postalCode}</p>
                <p className="mt-1.5 text-muted">{order.shippingAddress.phone}</p>
              </div>
            </section>

            <OrderSummary order={order} />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {order.shipment?.trackingUrl && (
              <a
                href={order.shipment.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white shadow-[0_0_24px_var(--glow-primary)] hover:bg-primary-hover"
              >
                <IconTruck size={17} />
                Track shipment
              </a>
            )}

            <Link
              href="/account/orders"
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-surface-elevated"
            >
              View all orders
            </Link>
          </div>
        </div>
      </AccountShell>
    </>
  );
}
