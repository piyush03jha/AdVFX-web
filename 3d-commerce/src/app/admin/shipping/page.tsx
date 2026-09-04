"use client";

import { FormEvent, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type RuleType = "FREE" | "FLAT_RATE" | "FREE_ABOVE" | "WEIGHT_BASED";

interface ShippingRule {
  id: string;
  name: string;
  type: RuleType;
  amountMinor: number | null;
  freeAboveMinor: number | null;
  minWeightGrams: number | null;
  maxWeightGrams: number | null;
  countryCode: string | null;
  stateCode: string | null;
  estimatedMinDays: number | null;
  estimatedMaxDays: number | null;
  priority: number;
  isActive: boolean;
}

export default function AdminShippingPage() {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<RuleType>("FLAT_RATE");
  const [amount, setAmount] = useState("0");
  const [freeAbove, setFreeAbove] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [country, setCountry] = useState("IN");
  const [state, setState] = useState("");
  const [minDays, setMinDays] = useState("3");
  const [maxDays, setMaxDays] = useState("7");
  const [priority, setPriority] = useState("0");
  const [saving, setSaving] = useState(false);

  async function loadRules() {
    const token = window.localStorage.getItem("admin_access_token");
    if (!token) throw new Error("Admin session not found");
    const response = await fetch(`${API_BASE_URL}/shipping/rules?includeInactive=true`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(typeof body?.message === "string" ? body.message : "Unable to load shipping rules");
    setRules(body);
  }

  useEffect(() => {
    loadRules().catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load shipping rules")).finally(() => setLoading(false));
  }, []);

  async function createRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = window.localStorage.getItem("admin_access_token");
    if (!token) return setError("Admin session not found");

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload: Record<string, unknown> = {
        name,
        type,
        countryCode: country || undefined,
        stateCode: state || undefined,
        estimatedMinDays: Number(minDays),
        estimatedMaxDays: Number(maxDays),
        priority: Number(priority),
      };
      if (type === "FLAT_RATE" || type === "FREE_ABOVE" || type === "WEIGHT_BASED") payload.amountMinor = Math.round(Number(amount) * 100);
      if (type === "FREE_ABOVE") payload.freeAboveMinor = Math.round(Number(freeAbove) * 100);
      if (type === "WEIGHT_BASED") {
        payload.minWeightGrams = minWeight ? Number(minWeight) : undefined;
        payload.maxWeightGrams = maxWeight ? Number(maxWeight) : undefined;
      }

      const response = await fetch(`${API_BASE_URL}/shipping/rules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof body?.message === "string" ? body.message : "Unable to create shipping rule");
      await loadRules();
      setNotice("Shipping rule created.");
      setName("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create shipping rule");
    } finally {
      setSaving(false);
    }
  }

  async function deactivateRule(id: string) {
    const token = window.localStorage.getItem("admin_access_token");
    if (!token) return;
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/shipping/rules/${id}/deactivate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof body?.message === "string" ? body.message : "Unable to deactivate rule");
      await loadRules();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to deactivate rule");
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Admin</p>
        <h1 className="mt-2 font-serif text-3xl tracking-[-0.03em] sm:text-4xl">Shipping</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">Configure physical delivery pricing and estimated delivery windows used by checkout.</p>

        {error && <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-200">{error}</p>}
        {notice && <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-200">{notice}</p>}

        <section className="mt-6 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
          <h2 className="font-medium">Add shipping rule</h2>
          <form onSubmit={createRule} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Rule name" className={inputClass} />
            <select value={type} onChange={(e) => setType(e.target.value as RuleType)} className={inputClass}>
              <option value="FREE">Free shipping</option>
              <option value="FLAT_RATE">Flat rate</option>
              <option value="FREE_ABOVE">Free above threshold</option>
              <option value="WEIGHT_BASED">Weight based</option>
            </select>
            {type !== "FREE" && <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="Shipping amount (₹)" className={inputClass} />}
            {type === "FREE_ABOVE" && <input value={freeAbove} onChange={(e) => setFreeAbove(e.target.value)} type="number" min="0" step="0.01" placeholder="Free above (₹)" className={inputClass} />}
            {type === "WEIGHT_BASED" && <>
              <input value={minWeight} onChange={(e) => setMinWeight(e.target.value)} type="number" min="0" placeholder="Min weight (g)" className={inputClass} />
              <input value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} type="number" min="0" placeholder="Max weight (g)" className={inputClass} />
            </>}
            <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country (IN)" className={inputClass} />
            <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State code (optional)" className={inputClass} />
            <input value={minDays} onChange={(e) => setMinDays(e.target.value)} type="number" min="0" placeholder="Min delivery days" className={inputClass} />
            <input value={maxDays} onChange={(e) => setMaxDays(e.target.value)} type="number" min="0" placeholder="Max delivery days" className={inputClass} />
            <input value={priority} onChange={(e) => setPriority(e.target.value)} type="number" min="0" placeholder="Priority" className={inputClass} />
            <button disabled={saving} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving…" : "Create rule"}</button>
          </form>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
          <div className="border-b border-white/[0.06] px-5 py-4"><h2 className="font-medium">Rules</h2></div>
          {loading ? <div className="px-5 py-10 text-sm text-muted">Loading…</div> : rules.length === 0 ? <div className="px-5 py-10 text-sm text-muted">No shipping rules configured.</div> : (
            <div className="divide-y divide-white/[0.06]">
              {rules.map((rule) => (
                <div key={rule.id} className="grid gap-3 px-5 py-5 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto] sm:items-center">
                  <div><p className="text-sm font-medium">{rule.name}</p><p className="mt-1 text-xs text-muted">{rule.type.replaceAll("_", " ")}</p></div>
                  <div className="text-xs text-muted">{rule.amountMinor != null ? `₹${(rule.amountMinor / 100).toLocaleString("en-IN")}` : "Free"}</div>
                  <div className="text-xs text-muted">{rule.countryCode ?? "All"}{rule.stateCode ? ` / ${rule.stateCode}` : ""}</div>
                  <div className="text-xs text-muted">{rule.estimatedMinDays != null && rule.estimatedMaxDays != null ? `${rule.estimatedMinDays}–${rule.estimatedMaxDays} days` : "—"}</div>
                  <div className="flex items-center gap-2"><span className={`text-[10px] uppercase tracking-[0.12em] ${rule.isActive ? "text-emerald-300" : "text-muted"}`}>{rule.isActive ? "Active" : "Inactive"}</span>{rule.isActive && <button type="button" onClick={() => deactivateRule(rule.id)} className="rounded-full border border-white/[0.08] px-3 py-1.5 text-[11px] text-muted hover:text-foreground">Deactivate</button>}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const inputClass = "min-h-11 w-full rounded-xl border border-white/[0.08] bg-black/10 px-3 text-sm outline-none transition-colors focus:border-primary/50";
