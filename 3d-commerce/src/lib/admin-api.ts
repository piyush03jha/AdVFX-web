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
  inventory: {
    availableUnits: number;
    reservedUnits: number;
  };
  orders: {
    total: number;
    pendingPayment: number;
    processing: number;
    readyToShip: number;
  };
  customBuilds: {
    total: number;
    needsAttention: number;
  };
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
    reserved: number;
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

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status:
    | "PENDING_PAYMENT"
    | "CONFIRMED"
    | "PROCESSING"
    | "READY_TO_SHIP"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  currency: string;
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  totalMinor: number;
  appliedCouponCode: string | null;
  user: { id: string; email: string; name: string | null } | null;
  payment: { status: string } | null;
  shipment: {
    status: string;
    carrier: string | null;
    trackingNumber: string | null;
  } | null;
  createdAt: string;
}

export interface AdminInventoryItem {
  id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  inventory: {
    stock: number;
    reserved: number;
    lowStockAt: number;
    trackStock: boolean;
    allowBackorder: boolean;
  } | null;
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
      typeof body?.message === "string" ? body.message : "Request failed";
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

export function getAdminOrders(token: string, status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<AdminOrder[]>(`/orders/admin/list${query}`, { token });
}

export function getAdminOrder(token: string, id: string) {
  return request<AdminOrder>(`/orders/admin/${id}`, { token });
}

export function updateAdminOrderStatus(
  token: string,
  id: string,
  status: AdminOrder["status"],
) {
  return request<AdminOrder>(`/orders/admin/${id}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

export function getAdminInventory(token: string) {
  return request<AdminInventoryItem[]>("/products?includeArchived=true", { token });
}

export function getAdminReturns(token: string) {
  return request("/orders/admin/returns", { token });
}

export function updateAdminReturn(
  token: string,
  id: string,
  status: "APPROVED" | "REJECTED" | "RECEIVED" | "REFUNDED",
) {
  return request(`/orders/admin/returns/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
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

export function setProductPrice(
  token: string,
  id: string,
  data: Record<string, unknown>,
) {
  return request<AdminProduct>(`/products/${id}/pricing`, {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateProductInventory(
  token: string,
  id: string,
  data: Record<string, unknown>,
) {
  return request<AdminProduct>(`/products/${id}/inventory`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

export function addProductMedia(
  token: string,
  id: string,
  data: Record<string, unknown>,
) {
  return request<AdminProduct>(`/products/${id}/media`, {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function removeProductMedia(token: string, id: string, mediaId: string) {
  return request<AdminProduct>(`/products/${id}/media/${mediaId}`, {
    method: "DELETE",
    token,
  });
}

export interface AdminProductFile {
  id: string;
  productId: string;
  originalName: string;
  storageKey: string;
  storageUrl: string | null;
  format: string;
  fileType: "MODEL" | "IMAGE" | "DOCUMENT";
  mimeType: string | null;
  fileSize: number;
  processingStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  processingError: string | null;
}

export async function uploadProductFile(
  token: string,
  productId: string,
  file: File,
) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/products/${productId}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body?.message === "string" ? body.message : "File upload failed";
    throw new Error(message);
  }

  return body as AdminProductFile;
}

export function getProductFiles(token: string, productId: string) {
  return request<AdminProductFile[]>(`/products/${productId}/files`, { token });
}

export function deleteProductFile(
  token: string,
  productId: string,
  fileId: string,
) {
  return request<{ message: string }>(`/products/${productId}/files/${fileId}`, {
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
