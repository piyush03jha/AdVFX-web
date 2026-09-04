"use client";

import { FormEvent, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

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

const blank = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
  isDefault: false,
};

type FormState = typeof blank;

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
  if (!response.ok) throw new Error(typeof body?.message === "string" ? body.message : "Request failed");
  return body as T;
}

export default function AddressManagementPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<FormState>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setAddresses(await api<Address[]>("/addresses"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load addresses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function edit(address: Address) {
    setEditingId(address.id);
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setError(null);
    setNotice(null);
  }

  function reset() {
    setEditingId(null);
    setForm(blank);
    setError(null);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const result = editingId
        ? await api<Address>(`/addresses/${editingId}`, { method: "PATCH", body: JSON.stringify(form) })
        : await api<Address>("/addresses", { method: "POST", body: JSON.stringify(form) });
      if (editingId) {
        setAddresses((current) => current.map((item) => item.id === result.id ? result : (result.isDefault ? { ...item, isDefault: false } : item)));
      } else {
        setAddresses((current) => [result, ...(result.isDefault ? current.map((item) => ({ ...item, isDefault: false })) : current)]);
      }
      setNotice(editingId ? "Address updated." : "Address added.");
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to save address");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this address?")) return;
    try {
      await api(`/addresses/${id}`, { method: "DELETE" });
      await load();
      setNotice("Address deleted.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to delete address");
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-primary">Account</p>
        <h1 className="mt-2 font-serif text-4xl tracking-[-0.04em]">Shipping addresses</h1>
        <p className="mt-2 text-sm text-muted">Keep the addresses you use for physical product deliveries ready for checkout.</p>

        {error && <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-200">{error}</p>}
        {notice && <p className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-200">{notice}</p>}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="space-y-3">
            {loading ? <div className="rounded-3xl border border-white/[0.08] p-5 text-sm text-muted">Loading addresses…</div> : null}
            {!loading && addresses.length === 0 ? <div className="rounded-3xl border border-white/[0.08] p-5 text-sm text-muted">No addresses saved.</div> : null}
            {addresses.map((address) => (
              <article key={address.id} className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{address.fullName}</p>
                    <p className="mt-1 text-xs text-muted">{address.phone}</p>
                  </div>
                  {address.isDefault && <span className="text-[10px] uppercase tracking-[0.12em] text-primary">Default</span>}
                </div>
                <p className="mt-4 text-sm leading-6 text-muted">
                  {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
                  {address.city}, {address.state} {address.postalCode}<br />
                  {address.country}
                </p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => edit(address)} className="rounded-full border border-white/[0.08] px-4 py-2 text-xs hover:border-primary/40">Edit</button>
                  <button type="button" onClick={() => remove(address.id)} className="rounded-full border border-red-400/20 px-4 py-2 text-xs text-red-200 hover:border-red-400/40">Delete</button>
                </div>
              </article>
            ))}
          </section>

          <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-primary">{editingId ? "Edit address" : "New address"}</p>
                <h2 className="mt-2 font-serif text-2xl">Delivery details</h2>
              </div>
              {editingId && <button type="button" onClick={reset} className="text-xs text-muted hover:text-foreground">Cancel</button>}
            </div>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <Field label="Full name"><input required value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} className={inputClass} /></Field>
              <Field label="Phone"><input required value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={inputClass} /></Field>
              <Field label="Address line 1"><input required value={form.line1} onChange={(e) => setField("line1", e.target.value)} className={inputClass} /></Field>
              <Field label="Address line 2"><input value={form.line2} onChange={(e) => setField("line2", e.target.value)} className={inputClass} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City"><input required value={form.city} onChange={(e) => setField("city", e.target.value)} className={inputClass} /></Field>
                <Field label="State"><input required value={form.state} onChange={(e) => setField("state", e.target.value)} className={inputClass} /></Field>
                <Field label="Postal code"><input required value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} className={inputClass} /></Field>
                <Field label="Country"><input required value={form.country} onChange={(e) => setField("country", e.target.value)} className={inputClass} /></Field>
              </div>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.isDefault} onChange={(e) => setField("isDefault", e.target.checked)} className="h-4 w-4 accent-primary" /> Make this my default address</label>
              <button type="submit" disabled={saving} className="min-h-11 w-full rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50">{saving ? "Saving…" : editingId ? "Save address" : "Add address"}</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

const inputClass = "min-h-11 w-full rounded-xl border border-white/[0.08] bg-black/10 px-3 text-sm outline-none transition-colors focus:border-primary/50";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-muted">{label}</span>{children}</label>; }
