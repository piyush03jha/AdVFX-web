"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type Quote = {
  currency: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPriceMinor: number;
    lineTotalMinor: number;
    imageUrl: string | null;
  }>;
  shippingAddress: Address;
  summary: {
    subtotalMinor: number;
    shippingMinor: number;
    taxMinor: number;
    discountMinor: number;
    totalMinor: number;
  };
  payment: {
    required: boolean;
    status: string;
    provider: string;
  };
};

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoting, setQuoting] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("access_token");
  }, []);

  useEffect(() => {
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/checkout")}`);
      return;
    }

    fetch(`${API_BASE_URL}/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(typeof body?.message === "string" ? body.message : "Unable to load addresses");
        }
        return body as Address[];
      })
      .then((body) => {
        setAddresses(body);
        const preferred = body.find((item) => item.isDefault) ?? body[0];
        if (preferred) setAddressId(preferred.id);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load checkout"))
      .finally(() => setLoading(false));
  }, [router, token]);

  async function refreshQuote() {
    if (!token || !addressId) return;
    setQuoting(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shippingAddressId: addressId }),
        cache: "no-store",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof body?.message === "string" ? body.message : "Unable to calculate checkout");
      setQuote(body as Quote);
    } catch (err: unknown) {
      setQuote(null);
      setError(err instanceof Error ? err.message : "Unable to calculate checkout");
    } finally {
      setQuoting(false);
    }
  }

  useEffect(() => {
    void refreshQuote();
    // addressId is the only changing checkout input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressId]);

  async function placeOrder() {
    if (!token || !addressId) return;
    setPlacing(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shippingAddressId: addressId }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(typeof body?.message === "string" ? body.message : "Unable to create order");
      }
      router.push(`/account/orders/${body.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create order");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-background px-4 py-10 text-foreground">Loading checkout…</main>;
  }

  const formatMoney = (minor: number, currency = quote?.currency ?? "INR") =>
    `${currency} ${(minor / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Checkout</p>
        <h1 className="mt-2 font-serif text-4xl tracking-[-0.04em]">Review your physical order.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Confirm your shipping address and order total. The next step will be payment; no digital delivery is involved.
        </p>

        {error && <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-200">{error}</p>}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Shipping address</p>
                  <h2 className="mt-1 text-lg font-medium">Where should we ship it?</h2>
                </div>
                <button type="button" onClick={() => router.push("/account/addresses")} className="text-xs text-primary hover:text-primary-hover">
                  Manage addresses
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-white/[0.1] px-4 py-6 text-sm text-muted">
                  Add a shipping address before continuing.
                  <button type="button" onClick={() => router.push("/account/addresses")} className="ml-2 text-primary hover:text-primary-hover">Add address</button>
                </div>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => setAddressId(address.id)}
                      className={`rounded-2xl border p-4 text-left transition-colors ${address.id === addressId ? "border-primary/60 bg-primary/[0.06]" : "border-white/[0.08] bg-black/10 hover:border-white/[0.16]"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-medium">{address.fullName}</span>
                        {address.isDefault && <span className="text-[10px] uppercase tracking-[0.1em] text-primary">Default</span>}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted">
                        {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
                        {address.city}, {address.state} {address.postalCode}<br />
                        {address.phone}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Items</p>
              <div className="mt-4 space-y-4">
                {quote?.items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/20">
                      {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="mt-1 text-xs text-muted">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{formatMoney(item.lineTotalMinor, item.currency)}</p>
                  </div>
                ))}
                {!quote && <p className="text-sm text-muted">Select an address to calculate your order.</p>}
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 lg:sticky lg:top-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Order summary</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><span className="text-muted">Subtotal</span><span>{quote ? formatMoney(quote.summary.subtotalMinor) : "—"}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted">Shipping</span><span>{quote ? formatMoney(quote.summary.shippingMinor) : "—"}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted">Tax</span><span>{quote ? formatMoney(quote.summary.taxMinor) : "—"}</span></div>
              {quote && quote.summary.discountMinor > 0 && <div className="flex justify-between gap-4"><span className="text-muted">Discount</span><span>-{formatMoney(quote.summary.discountMinor)}</span></div>}
            </div>
            <div className="my-5 h-px bg-white/[0.08]" />
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-muted">Total</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.02em]">{quote ? formatMoney(quote.summary.totalMinor) : "—"}</p>
              </div>
              <span className="rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-primary">Physical delivery</span>
            </div>
            <button
              type="button"
              onClick={placeOrder}
              disabled={placing || quoting || !quote || !addressId}
              className="mt-6 min-h-12 w-full rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {placing ? "Creating order…" : quoting ? "Recalculating…" : "Continue to payment"}
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-muted">Your order will be reserved before payment. Payment gateway integration will complete the next step.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
