const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export interface AdminSession {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: "ADMIN";
  };
}

export interface AdminDashboard {
  products: {
    total: number;
    active: number;
    archived: number;
  };
  categories: number;
  lowStockProducts: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  badge: string | null;
  isFeatured: boolean;
  isTrending: boolean;
  isBestseller: boolean;
  material: string | null;
  scale: string | null;
  dimensions: string | null;
  height: string | null;
  base: string | null;
  packaging: string | null;
  weight: string | null;
  category: AdminCategory | null;
  inventory: {
    stock: number;
    lowStockAt: number;
    trackStock: boolean;
    allowBackorder: boolean;
  } | null;
  prices: Array<{
    id: string;
    currency: string;
    amountMinor: number;
    compareAtMinor: number | null;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
  }>;
  media: Array<{
    id: string;
    type: "IMAGE" | "MODEL_PREVIEW";
    url: string;
    altText: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }>;
}

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const { token, headers, ...init } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body?.message === "string"
        ? body.message
        : "Request failed";

    throw new Error(message);
  }

  return body as T;
}

export function loginAdmin(email: string, password: string) {
  return request<AdminSession>("/auth/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getDashboard(token: string) {
  return request<AdminDashboard>("/admin/dashboard", { token });
}

export function getProducts(token: string) {
  return request<AdminProduct[]>("/products?includeArchived=true", { token });
}

export function createProduct(token: string, data: Record<string, unknown>) {
  return request<AdminProduct>("/products", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateProduct(
  token: string,
  id: string,
  data: Record<string, unknown>,
) {
  return request<AdminProduct>(`/products/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

export function archiveProduct(token: string, id: string) {
  return request<{ message: string }>(`/products/${id}`, {
    method: "DELETE",
    token,
  });
}

export function getCategories(token: string) {
  return request<AdminCategory[]>("/categories?includeInactive=true", { token });
}

export function createCategory(token: string, data: Record<string, unknown>) {
  return request<AdminCategory>("/categories", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateCategory(
  token: string,
  id: string,
  data: Record<string, unknown>,
) {
  return request<AdminCategory>(`/categories/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

export function deleteCategory(token: string, id: string) {
  return request<{ message: string }>(`/categories/${id}`, {
    method: "DELETE",
    token,
  });
}
