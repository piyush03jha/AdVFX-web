"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type RequestStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "IN_PRODUCTION"
  | "PREVIEW_READY"
  | "CUSTOMER_REVIEW"
  | "REVISION_REQUESTED"
  | "APPROVED"
  | "ORDERABLE"
  | "CANCELLED";

interface CustomRequest {
  id: string;
  title: string;
  requirements: string;
  dimensions: string | null;
  preferredMaterial: string | null;
  preferredScale: string | null;
  status: RequestStatus;
  revisionCount: number;
  referenceFileCount: number;
  createdAt: string;
  user?: { name: string | null; email: string } | null;
  media?: Array<{ id: string; originalName: string; storageUrl: string | null; mimeType: string | null }>;
  preview?: { url: string; status: string } | null;
  quote?: { amountMinor: number; currency: string; notes: string | null } | null;
}

const statuses: RequestStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "IN_PRODUCTION",
  "PREVIEW_READY",
  "CUSTOMER_REVIEW",
  "REVISION_REQUESTED",
  "APPROVED",
  "ORDERABLE",
  "CANCELLED",
];

export default function AdminCustomRequestsPage() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [selected, setSelected] = useState<CustomRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | RequestStatus>("ALL");
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    const token = window.localStorage.getItem("admin_access_token");
    if (!token) {
      setLoading(false);
      setError("Admin session not found. Please sign in again.");
      return;
    }

    const query = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
    const response = await fetch(`${API_BASE_URL}/custom-requests/admin/list${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(typeof body?.message === "string" ? body.message : "Unable to load requests");
    }
    setRequests(body);
    if (selected) {
      const refreshed = body.find((item: CustomRequest) => item.id === selected.id);
      if (refreshed) {
        setSelected(refreshed);
        setPreviewUrl(refreshed.preview?.url ?? "");
      }
    }
  }

  useEffect(() => {
    load()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load requests"))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filtered = useMemo(() => requests, [requests]);

  async function updateStatus(status: RequestStatus) {
    if (!selected) return;
    const token = window.localStorage.getItem("admin_access_token");
    if (!token) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`${API_BASE_URL}/custom-requests/admin/${selected.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof body?.message === "string" ? body.message : "Unable to update status");
      setSelected(body);
      setNotice(`Status changed to ${status.replaceAll("_", " ").toLowerCase()}.`);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to update request");
    } finally {
      setBusy(false);
    }
  }

  async function setPreview() {
    if (!selected || !previewUrl.trim()) return;
    const token = window.localStorage.getItem("admin_access_token");
    if (!token) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`${API_BASE_URL}/custom-requests/admin/${selected.id}/preview`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: previewUrl.trim() }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof body?.message === "string" ? body.message : "Unable to set preview");
      setNotice("3D preview updated.");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to set preview");
    } finally {
      setBusy(false);
    }
  }

  async function uploadPreview() {
    if (!selected || !previewFile) return;
    const token = window.localStorage.getItem("admin_access_token");
    if (!token) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const formData = new FormData();
      formData.append("file", previewFile);

      const response = await fetch(
        `${API_BASE_URL}/custom-requests/${selected.id}/files/preview`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
          cache: "no-store",
        },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(typeof body?.message === "string" ? body.message : "Unable to upload 3D preview");
      }
      setPreviewFile(null);
      setNotice("3D preview uploaded and queued for processing.");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to upload 3D preview");
    } finally {
      setBusy(false);
    }
  }

  function handlePreviewFile(event: ChangeEvent<HTMLInputElement>) {
    setPreviewFile(event.target.files?.[0] ?? null);
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Custom Build</p>
            <h1 className="mt-2 font-serif text-3xl tracking-[-0.03em] sm:text-4xl">Requests</h1>
            <p className="mt-2 text-sm text-muted">Review references, move projects through production, and publish customer previews.</p>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="min-h-11 rounded-full border border-white/[0.08] bg-background px-4 text-sm outline-none">
            <option value="ALL">All statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
          </select>
        </div>

        {error && <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-200">{error}</p>}
        {notice && <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-200">{notice}</p>}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
          <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
            {loading ? (
              <div className="px-5 py-10 text-sm text-muted">Loading requests…</div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-10 text-sm text-muted">No custom requests found.</div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {filtered.map((request) => (
                  <button key={request.id} type="button" onClick={() => { setSelected(request); setPreviewUrl(request.preview?.url ?? ""); setPreviewFile(null); setError(null); setNotice(null); }} className={`grid w-full gap-3 px-5 py-5 text-left hover:bg-white/[0.03] sm:grid-cols-[1.6fr_1fr_1fr_1fr] ${selected?.id === request.id ? "bg-white/[0.04]" : ""}`}>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{request.title}</span>
                      <span className="mt-1 block truncate text-xs text-muted">{request.user?.email ?? "Unknown customer"}</span>
                    </span>
                    <span className="text-xs text-muted">{request.status.replaceAll("_", " ").toLowerCase()}</span>
                    <span className="text-xs text-muted">{request.referenceFileCount} refs</span>
                    <span className="text-xs text-muted">{new Date(request.createdAt).toLocaleDateString("en-IN")}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
            {!selected ? (
              <div className="py-16 text-center text-sm text-muted">Select a custom request to manage it.</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Request</p>
                  <h2 className="mt-1 font-serif text-2xl">{selected.title}</h2>
                  <p className="mt-2 text-xs text-muted">{selected.user?.email ?? "Unknown customer"}</p>
                </div>

                <section>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-primary">Requirements</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{selected.requirements}</p>
                  <div className="mt-3 space-y-1 text-xs text-muted">
                    {selected.dimensions && <p>Dimensions: {selected.dimensions}</p>}
                    {selected.preferredMaterial && <p>Material: {selected.preferredMaterial}</p>}
                    {selected.preferredScale && <p>Scale: {selected.preferredScale}</p>}
                  </div>
                </section>

                <section>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-primary">Reference files</p>
                  <div className="mt-3 space-y-2">
                    {(selected.media ?? []).map((media) => (
                      <a key={media.id} href={media.storageUrl ?? "#"} target="_blank" rel="noreferrer" className="block rounded-xl border border-white/[0.08] px-3 py-2 text-xs text-muted hover:text-foreground">{media.originalName}</a>
                    ))}
                    {(!selected.media || selected.media.length === 0) && <p className="text-xs text-muted">No uploaded files available.</p>}
                  </div>
                </section>

                <section>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-primary">3D preview</p>
                  <input type="file" accept=".glb,.gltf,model/gltf-binary,model/gltf+json" onChange={handlePreviewFile} className="mt-3 block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-medium file:text-white" />
                  {previewFile && <p className="mt-2 text-[11px] text-muted">Selected: {previewFile.name}</p>}
                  <button type="button" onClick={uploadPreview} disabled={busy || !previewFile} className="mt-3 min-h-10 rounded-full bg-primary px-4 text-xs font-medium text-white disabled:opacity-50">Upload 3D preview</button>
                  <div className="mt-4 border-t border-white/[0.06] pt-4">
                    <p className="text-[11px] text-muted">Existing processed preview URL</p>
                    <input value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} placeholder="Preview URL" className="mt-2 min-h-11 w-full rounded-xl border border-white/[0.08] bg-black/10 px-3 text-sm outline-none focus:border-primary/50" />
                    <button type="button" onClick={setPreview} disabled={busy || !previewUrl.trim()} className="mt-3 min-h-10 rounded-full border border-white/[0.08] px-4 text-xs font-medium disabled:opacity-50">Save preview URL</button>
                  </div>
                </section>

                <section>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-primary">Workflow</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {statuses.filter((status) => status !== "SUBMITTED" && status !== "CANCELLED").map((status) => (
                      <button key={status} type="button" disabled={busy || !isAllowedTransition(selected.status, status)} onClick={() => updateStatus(status)} className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs text-left disabled:cursor-not-allowed disabled:opacity-30 hover:border-primary/40">{status.replaceAll("_", " ").toLowerCase()}</button>
                    ))}
                    <button type="button" disabled={busy || selected.status === "CANCELLED" || selected.status === "ORDERABLE"} onClick={() => updateStatus("CANCELLED")} className="rounded-xl border border-red-400/20 px-3 py-2 text-xs text-left text-red-200 disabled:opacity-30">Cancel request</button>
                  </div>
                </section>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function isAllowedTransition(current: RequestStatus, next: RequestStatus) {
  const map: Record<RequestStatus, RequestStatus[]> = {
    SUBMITTED: ["UNDER_REVIEW"],
    UNDER_REVIEW: ["IN_PRODUCTION", "REVISION_REQUESTED"],
    IN_PRODUCTION: ["PREVIEW_READY"],
    PREVIEW_READY: ["CUSTOMER_REVIEW"],
    CUSTOMER_REVIEW: ["REVISION_REQUESTED", "APPROVED"],
    REVISION_REQUESTED: ["IN_PRODUCTION"],
    APPROVED: ["ORDERABLE"],
    ORDERABLE: [],
    CANCELLED: [],
  };
  return map[current]?.includes(next) ?? false;
}
