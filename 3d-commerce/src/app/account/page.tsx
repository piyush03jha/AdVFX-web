"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
}

interface Address {
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
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalMinor: number;
  currency: string;
  createdAt: string;
  items: Array<{ productName: string; quantity: number }>;
}

interface CustomBuild {
  id: string;
  title: string;
  status: string;
  revisionCount: number;
  createdAt: string;
  preview: { url: string; status: string } | null;
}

async function api<T>(path: string, options: RequestInit = {}) {
  const token = window.localStorage.getItem("access_token");
  if (!token) throw new Error("Authentication is required");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof body?.message === "string" ? body.message : "Request failed");
  }
  return body as T;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customBuilds, setCustomBuilds] = useState<CustomBuild[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api<UserProfile>("/users/me"),
      api<Address[]>("/addresses"),
      api<Order[]>("/orders"),
      api<CustomBuild[]>("/custom-requests"),
    ])
      .then(([user, userAddresses, userOrders, builds]) => {
        setProfile(user);
        setAddresses(userAddresses);
        setOrders(userOrders);
        setCustomBuilds(builds);
        setName(user.name ?? "");
        setPhone(user.phone ?? "");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unable to load account");
      });
  }, []);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const updated = await api<UserProfile>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name, phone }),
      });
      setProfile(updated);
      setName(updated.name ?? "");
      setPhone(updated.phone ?? "");
      setNotice("Profile updated.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-primary">Account</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl tracking-[-0.04em] sm:text-5xl">Your account</h1>
            <p className="mt-2 text-sm text-muted">Manage your details, addresses, physical orders and custom builds.</p>
          </div>
          {profile?.email && <span className="text-xs text-muted">{profile.email}</span>}
        </div>

        {error && <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-200">{error}</p>}
        {notice && <p className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-200">{notice}</p>}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Profile</p>
            <h2 className="mt-2 font-serif text-2xl">Your details</h2>
            <form onSubmit={saveProfile} className="mt-6 space-y-4">
              <Field label="Email">
                <input value={profile?.email ?? ""} readOnly className={inputClass + " opacity-60"} />
              </Field>
              <Field label="Name">
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your name" />
              </Field>
              <Field label="Phone">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="Phone number" />
              </Field>
              <button type="submit" disabled={saving} className="min-h-11 w-full rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50">
                {saving ? "Saving…" : "Save profile"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Addresses</p>
                <h2 className="mt-2 font-serif text-2xl">Shipping addresses</h2>
              </div>
              <Link href="/account/addresses" className="rounded-full border border-white/[0.08] px-4 py-2 text-xs hover:border-primary/40">Manage</Link>
            </div>
            <div className="mt-5 space-y-3">
              {addresses.length === 0 ? (
                <p className="text-sm text-muted">No saved addresses yet.</p>
              ) : addresses.slice(0, 3).map((address) => (
                <div key={address.id} className="rounded-2xl border border-white/[0.08] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{address.fullName}</p>
                      <p className="mt-1 text-xs leading-5 text-muted">{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.state} {address.postalCode}</p>
                    </div>
                    {address.isDefault && <span className="text-[10px] uppercase tracking-[0.12em] text-primary">Default</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Orders</p>
              <h2 className="mt-2 font-serif text-2xl">Physical orders</h2>
            </div>
            <Link href="/account/orders" className="rounded-full border border-white/[0.08] px-4 py-2 text-xs hover:border-primary/40">View all</Link>
          </div>
          <div className="mt-5 divide-y divide-white/[0.06]">
            {orders.slice(0, 5).map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="grid gap-3 py-4 hover:bg-white/[0.02] sm:grid-cols-[1.3fr_1fr_1fr_auto] sm:items-center sm:px-2">
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted">{order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
                </div>
                <span className="text-xs capitalize text-muted">{order.status.replaceAll("_", " ").toLowerCase()}</span>
                <span className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                <span className="text-sm font-medium">{order.currency} {(order.totalMinor / 100).toLocaleString("en-IN")}</span>
              </Link>
            ))}
            {orders.length === 0 && <p className="py-6 text-sm text-muted">No orders yet.</p>}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Custom Builds</p>
              <h2 className="mt-2 font-serif text-2xl">Your custom models</h2>
            </div>
            <Link href="/custom" className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-hover">Start another</Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {customBuilds.map((build) => (
              <Link key={build.id} href={`/custom/${build.id}`} className="rounded-2xl border border-white/[0.08] p-4 hover:border-primary/30">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{build.title}</p>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-primary">{build.status.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-2 text-xs text-muted">{build.revisionCount} revision{build.revisionCount === 1 ? "" : "s"}</p>
              </Link>
            ))}
            {customBuilds.length === 0 && <p className="text-sm text-muted">No custom builds yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

const inputClass = "min-h-11 w-full rounded-xl border border-white/[0.08] bg-black/10 px-3 text-sm outline-none transition-colors focus:border-primary/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-muted">{label}</span>{children}</label>;
}
