"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconMapPin,
  IconPackage,
  IconShoppingBag,
} from "@tabler/icons-react";

import { Navbar } from "@/components/layout/SiteNavbar";
import { Container } from "@/components/ui/Container";

interface OrderSnapshot {
  id: string;
  createdAt: string;
  country: string;
  currency: string;
  total: { amountMinor: number; currency: string };
  paymentStatus: string;
  fulfillmentStatus: string;
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<OrderSnapshot | null>(null);
  const [orderId, setOrderId] = useState("—");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("forma-last-order");
      const stored = raw ? (JSON.parse(raw) as OrderSnapshot) : null;
      setOrder(stored);
      const queryOrder = new URLSearchParams(window.location.search).get("order");
      setOrderId(queryOrder ?? stored?.id ?? "—");
    } catch {
      setOrder(null);
      setOrderId("—");
    }
  }, []);

  const total = order
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: order.currency,
      }).format(
        order.total.amountMinor / (order.currency === "JPY" ? 1 : 100),
      )
    : "—";

  return (
    <>
      <Navbar />

      <main className="min-h-screen overflow-hidden">
        <section className="relative pb-14 pt-5 sm:pb-20 sm:pt-10 lg:pb-28 lg:pt-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-[130px] sm:h-[500px] sm:w-[500px] sm:blur-[150px]"
          />

          <Container>
            {/* Confirmation header */}
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.08] text-primary sm:h-16 sm:w-16">
                <IconCheck size={23} stroke={1.8} className="sm:h-7 sm:w-7" />
              </div>

              <p className="mt-4 text-[8px] font-medium uppercase tracking-[0.22em] text-primary sm:mt-7 sm:text-[9px]">
                Order confirmation
              </p>

              <h1 className="mt-2 font-serif text-[30px] leading-[1.05] tracking-[-0.05em] text-foreground sm:mt-3 sm:text-5xl lg:text-6xl">
                Thank you for your order.
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-xs leading-5 text-muted sm:mt-4 sm:text-sm sm:leading-6">
                Your order has been received. We'll keep you updated as it moves through preparation and shipping.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-[9px] uppercase tracking-[0.11em] text-muted sm:mt-6 sm:gap-3 sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.13em]">
                <span>Order</span>
                <span className="text-foreground">{orderId}</span>
              </div>
            </div>

            {/* Status — compact on mobile */}
            <div className="mx-auto mt-6 grid max-w-4xl grid-cols-3 gap-2 sm:mt-10 sm:gap-5">
              <StatusCard
                icon={<IconCheck size={14} />}
                label="Payment"
                value="Received"
              />
              <StatusCard
                icon={<IconPackage size={14} />}
                label="Fulfillment"
                value="Preparing"
              />
              <StatusCard
                icon={<IconClock size={14} />}
                label="Dispatch"
                value="2–3 days"
              />
            </div>

            {/* Main information */}
            <div className="mx-auto mt-3 grid max-w-4xl gap-3 sm:mt-6 sm:gap-5 lg:grid-cols-[1fr_320px]">
              <section className="rounded-xl border border-white/[0.08] bg-white/[0.015] p-4 sm:rounded-2xl sm:p-7">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-3.5 sm:pb-5">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.2em] text-primary sm:text-[9px]">
                      01
                    </p>
                    <h2 className="mt-1.5 text-base font-medium text-foreground sm:mt-2 sm:text-xl">
                      What's next
                    </h2>
                  </div>
                  <IconArrowRight size={15} className="text-muted sm:h-[17px] sm:w-[17px]" />
                </div>

                <div className="mt-4 space-y-3.5 sm:mt-6 sm:space-y-5">
                  <Step
                    icon={<IconCheck size={13} />}
                    title="Order received"
                    text="Your order details have been recorded."
                  />
                  <Step
                    icon={<IconPackage size={13} />}
                    title="Model preparation"
                    text="Our team will prepare your physical model for dispatch."
                  />
                  <Step
                    icon={<IconMapPin size={13} />}
                    title="Shipping & tracking"
                    text="You'll receive tracking information once your order ships."
                  />
                </div>
              </section>

              <aside className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 sm:rounded-2xl sm:p-7">
                <div className="flex items-end justify-between gap-4 sm:block">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.2em] text-primary sm:text-[9px]">
                      Order total
                    </p>
                    <p className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:mt-3 sm:text-3xl">
                      {total}
                    </p>
                  </div>

                  <div className="sm:mt-5 sm:border-t sm:border-white/[0.07] sm:pt-5">
                    <p className="text-[8px] uppercase tracking-[0.15em] text-muted sm:text-[9px]">
                      Delivery country
                    </p>
                    <p className="mt-1 text-xs text-foreground sm:mt-2 sm:text-sm">
                      {order?.country ?? "Your selected country"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-lg border border-white/[0.07] bg-black/[0.06] p-2.5 sm:mt-5 sm:gap-2.5 sm:rounded-xl sm:p-3.5">
                  <IconShoppingBag size={14} className="mt-0.5 shrink-0 text-primary" />
                  <p className="text-[9px] leading-3.5 text-muted sm:text-[10px] sm:leading-4">
                    A confirmation will be sent with your order details and delivery information.
                  </p>
                </div>
              </aside>
            </div>

            <div className="mt-4 flex flex-col justify-center gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
              <Link
                href="/shop"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-xs font-medium text-white transition-colors hover:bg-primary-hover sm:min-h-12 sm:px-7 sm:text-sm"
              >
                Continue shopping
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.1] px-6 text-xs font-medium text-foreground transition-colors hover:bg-white/[0.04] sm:min-h-12 sm:px-7 sm:text-sm"
              >
                Back to home
              </Link>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}

function StatusCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.015] p-3 sm:rounded-2xl sm:p-5">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/[0.08] text-primary sm:h-8 sm:w-8">
        {icon}
      </span>
      <p className="mt-2.5 truncate text-[7px] uppercase tracking-[0.12em] text-muted sm:mt-4 sm:text-[9px] sm:tracking-[0.16em]">
        {label}
      </p>
      <p className="mt-1 truncate text-[10px] font-medium text-foreground sm:mt-1.5 sm:text-sm">
        {value}
      </p>
    </div>
  );
}

function Step({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 sm:gap-4">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/[0.06] text-primary sm:h-7 sm:w-7">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground sm:text-sm">{title}</p>
        <p className="mt-0.5 text-[9px] leading-3.5 text-muted sm:mt-1 sm:text-xs sm:leading-5">
          {text}
        </p>
      </div>
    </div>
  );
}
