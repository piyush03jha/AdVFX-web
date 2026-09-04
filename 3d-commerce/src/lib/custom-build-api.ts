const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export interface CustomRequestSummary {
  id: string;
  title: string;
  requirements: string;
  dimensions: string | null;
  preferredMaterial: string | null;
  preferredScale: string | null;
  status: string;
  revisionCount: number;
  createdAt: string;
  preview: { url: string; status: string } | null;
  quote: { amountMinor: number; currency: string; notes: string | null } | null;
}

export interface CustomRequestMedia {
  id: string;
  originalName: string;
  storageUrl: string | null;
  mimeType: string | null;
  fileSize: number;
  createdAt: string;
}

async function request<T>(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      typeof body?.message === "string" ? body.message : "Request failed",
    );
  }
  return body as T;
}

export function createCustomRequest(token: string, data: Record<string, unknown>) {
  return request<CustomRequestSummary>("/custom-requests", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCustomRequest(token: string, id: string) {
  return request<CustomRequestSummary & { media: CustomRequestMedia[] }>(
    `/custom-requests/${id}`,
    token,
  );
}

export function uploadCustomReference(token: string, requestId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<CustomRequestMedia>(
    `/custom-requests/${requestId}/files`,
    token,
    { method: "POST", body: formData },
  );
}

export function approveCustomRequest(token: string, id: string) {
  return request(`/custom-requests/${id}/approve`, token, {
    method: "POST",
  });
}

export function requestCustomRevision(token: string, id: string, note: string) {
  return request(`/custom-requests/${id}/revision`, token, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}
