"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface CustomRequest {
  id: string;
  title: string;
  requirements: string;
  dimensions: string | null;
  preferredMaterial: string | null;
  preferredScale: string | null;
  status: string;
  revisionCount: number;
  preview: { url: string; status: string } | null;
  quote: { amountMinor: number; currency: string; notes: string | null } | null;
  revisions: Array<{ note: string; createdAt: string }>;
}

export default function CustomBuildReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<CustomRequest | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const token = window.localStorage.getItem("access_token");
    if (!token) {
      router.push(`/login?next=${encodeURIComponent(`/custom/${params.id}`)}`);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/custom-requests/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(typeof body?.message === "string" ? body.message : "Unable to load request");
    setRequest(body);
  }

  useEffect(() => {
    load()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load request"))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function mutate(path: string, body?: unknown) {
    const token = window.localStorage.getItem("access_token");
    if (!token) return router.push(`/login?next=${encodeURIComponent(`/custom/${params.id}`)}`);
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof result?.message === "string" ? result.message : "Unable to update request");
      setRequest(result);
      setNote("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to update request");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <main className="min-h-screen bg-background px-4 py-10 text-foreground">Loading custom build…</main>;
  if (!request) return <main className="min-h-screen bg-background px-4 py-10 text-foreground">{error ?? "Request not found"}</main>;

  const price = request.quote ? `${request.quote.currency} ${(request.quote.amountMinor / 100).toLocaleString("en-IN")}` : null;

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-primary">Custom Build</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl tracking-[-0.04em]">{request.title}</h1>
            <p className="mt-2 text-sm text-muted">Status: {request.status.replaceAll("_", " ").toLowerCase()}</p>
          </div>
          {price && <div className="text-lg font-semibold">{price}</div>}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
            <div className="aspect-square bg-black/20 sm:aspect-[4/3]">
              {request.preview?.url ? (
                <iframe title="Custom 3D preview" src={request.preview.url} className="h-full w-full border-0" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted">Your 3D preview will appear here when ready.</div>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Your requirements</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{request.requirements}</p>
              <div className="mt-5 space-y-2 text-xs text-muted">
                {request.dimensions && <p>Dimensions: {request.dimensions}</p>}
                {request.preferredMaterial && <p>Material: {request.preferredMaterial}</p>}
                {request.preferredScale && <p>Scale: {request.preferredScale}</p>}
              </div>
            </section>

            {request.status === "CUSTOMER_REVIEW" || request.status === "PREVIEW_READY" ? (
              <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
                <p className="text-sm font-medium">Review your model</p>
                <p className="mt-2 text-xs leading-5 text-muted">Approve the preview when it matches your request, or tell us what you want changed.</p>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-4 min-h-24 w-full rounded-2xl border border-white/[0.08] bg-black/10 px-3 py-3 text-sm outline-none focus:border-primary/50" placeholder="Revision notes (optional)" />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button type="button" disabled={busy} onClick={() => mutate(`/custom-requests/${request.id}/approve")} className="min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-white disabled:opacity-50">Approve model</button>
                  <button type="button" disabled={busy || !note.trim()} onClick={() => mutate(`/custom-requests/${request.id}/revision`, { note })} className="min-h-11 rounded-full border border-white/[0.08] px-4 text-sm disabled:opacity-40">Request revision</button>
                </div>
              </section>
            ) : null}

            {request.quote && (
              <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Quote</p>
                <p className="mt-2 text-2xl font-semibold">{price}</p>
                {request.quote.notes && <p className="mt-2 text-xs leading-5 text-muted">{request.quote.notes}</p>}
              </section>
            )}

            {error && <p className="text-sm text-red-200">{error}</p>}
          </aside>
        </div>
      </div>
    </main>
  );
}
