"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function CustomBuildPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [requirements, setRequirements] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [material, setMaterial] = useState("");
  const [scale, setScale] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFilesChange(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files ?? []));
  }

  async function uploadReferenceFiles(requestId: string, token: string) {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/custom-requests/${requestId}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          typeof body?.message === "string"
            ? body.message
            : `Unable to upload ${file.name}`,
        );
      }
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const token = window.localStorage.getItem("access_token");
    if (!token) {
      router.push(`/login?next=${encodeURIComponent("/custom")}`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/custom-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          requirements,
          dimensions: dimensions || undefined,
          preferredMaterial: material || undefined,
          preferredScale: scale || undefined,
          notes: notes || undefined,
          referenceFileCount: files.length,
        }),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          typeof body?.message === "string"
            ? body.message
            : "Unable to submit request",
        );
      }

      await uploadReferenceFiles(body.id, token);
      router.push(`/custom/${body.id}`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to submit request",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-primary">Custom Build</p>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl tracking-[-0.04em] sm:text-5xl">
          Turn your idea into a physical model.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Share your reference photos, dimensions and requirements. We will create the 3D model for you to review in an interactive viewer before you decide to order the physical product.
        </p>

        <form onSubmit={submit} className="mt-10 space-y-6 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-8">
          <Field label="Project title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="My custom collectible" />
          </Field>

          <Field label="What should we build?">
            <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} required className={`${inputClass} min-h-36 rounded-2xl py-3`} placeholder="Describe the object, important details, pose, style, finish and anything we should preserve from the references." />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Dimensions">
              <input value={dimensions} onChange={(e) => setDimensions(e.target.value)} className={inputClass} placeholder="200 × 120 × 80 mm" />
            </Field>
            <Field label="Preferred material">
              <input value={material} onChange={(e) => setMaterial(e.target.value)} className={inputClass} placeholder="Premium resin" />
            </Field>
            <Field label="Preferred scale">
              <input value={scale} onChange={(e) => setScale(e.target.value)} className={inputClass} placeholder="1:8" />
            </Field>
            <Field label="Reference files">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={onFilesChange}
                className="block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-medium file:text-white"
              />
              <p className="mt-2 text-[11px] text-muted">Selected: {files.length}</p>
            </Field>
          </div>

          <Field label="Additional notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} min-h-24 rounded-2xl py-3`} placeholder="Anything else our team should know?" />
          </Field>

          {error && <p className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-200">{error}</p>}

          <button type="submit" disabled={submitting} className="min-h-12 w-full rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50">
            {submitting ? "Submitting and uploading…" : "Send custom build request"}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputClass = "min-h-11 w-full rounded-xl border border-white/[0.08] bg-black/10 px-3 text-sm outline-none transition-colors focus:border-primary/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-muted">{label}</span>
      {children}
    </label>
  );
}
