"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { IconArrowRight, IconCheck, IconClock, IconMapPin, IconPackage, IconShoppingBag } from "@tabler/icons-react";

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

  const total = order ? new Intl.NumberFormat("en-IN", { style: "currency", currency: order.currency }).format(order.total.amountMinor / (order.currency === "JPY" ? 1 : 100)) : "—";

  return <><Navbar /><main className="min-h-screen overflow-hidden"><section className="relative pb-24 pt-10 sm:pt-14 lg:pb-32 lg:pt-20"><div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-[150px]" /><Container><div className="mx-auto max-w-3xl text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.08] text-primary shadow-[0_0_45px_rgba(255,255,255,0.04)]"><IconCheck size={29} stroke={1.8} /></div><p className="mt-7 text-[9px] font-medium uppercase tracking-[0.24em] text-primary">Order confirmation</p><h1 className="mt-3 font-serif text-4xl tracking-[-0.05em] text-foreground sm:text-5xl lg:text-6xl">Thank you for your order.</h1><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted">Your order has been received. We'll keep you updated as it moves through preparation and shipping.</p><div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-[10px] uppercase tracking-[0.13em] text-muted"><span>Order</span><span className="text-foreground">{orderId}</span></div></div><div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3"><StatusCard icon={<IconCheck size={17} />} label="Payment" value="Received" /><StatusCard icon={<IconPackage size={17} />} label="Fulfillment" value="Preparing" /><StatusCard icon={<IconClock size={17} />} label="Dispatch" value="2–3 business days" /></div><div className="mx-auto mt-6 grid max-w-4xl gap-5 lg:grid-cols-[1fr_320px]"><section className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-5 sm:p-7"><div className="flex items-center justify-between border-b border-white/[0.07] pb-5"><div><p className="text-[9px] uppercase tracking-[0.2em] text-primary">01</p><h2 className="mt-2 text-xl font-medium text-foreground">What's next</h2></div><IconArrowRight size={17} className="text-muted" /></div><div className="mt-6 space-y-5"><Step icon={<IconCheck size={15} />} title="Order received" text="Your order details have been recorded." /><Step icon={<IconPackage size={15} />} title="Model preparation" text="Our team will prepare your physical model for dispatch." /><Step icon={<IconMapPin size={15} />} title="Shipping & tracking" text="You'll receive tracking information once your order ships." /></div></section><aside className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7"><p className="text-[9px] uppercase tracking-[0.2em] text-primary">Order total</p><p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">{total}</p><div className="mt-5 border-t border-white/[0.07] pt-5"><p className="text-[9px] uppercase tracking-[0.15em] text-muted">Delivery country</p><p className="mt-2 text-sm text-foreground">{order?.country ?? "Your selected country"}</p></div><div className="mt-5 flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-black/[0.06] p-3.5"><IconShoppingBag size={15} className="mt-0.5 shrink-0 text-primary" /><p className="text-[10px] leading-4 text-muted">A confirmation will be sent with your order details and delivery information.</p></div></aside></div><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/shop" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-7 text-sm font-medium text-white transition-colors hover:bg-primary-hover">Continue shopping</Link><Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/[0.1] px-7 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.04]">Back to home</Link></div></Container></section></main></>;
}

function StatusCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">{icon}</span><p className="mt-4 text-[9px] uppercase tracking-[0.16em] text-muted">{label}</p><p className="mt-1.5 text-sm font-medium text-foreground">{value}</p></div>; }
function Step({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="flex gap-4"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/[0.06] text-primary">{icon}</span><div><p className="text-sm font-medium text-foreground">{title}</p><p className="mt-1 text-xs leading-5 text-muted">{text}</p></div></div>; }
