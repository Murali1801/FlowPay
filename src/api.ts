const base = (import.meta.env.VITE_API_BASE_URL || "https://flow-pay-api.vercel.app").replace(/\/$/, "");

export type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

export type ShippingAddress = {
  full_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type CustomerDetails = {
  name?: string;
  email?: string;
  phone?: string;
};

export type Order = {
  order_id: string;
  amount: string;
  status: string;
  utr_number: string | null;
  merchant_id?: string | null;
  customer_details?: CustomerDetails;
  shipping_address?: ShippingAddress;
  items?: OrderItem[];
  return_url?: string | null;
};

export type UserProfile = {
  uid: string;
  email: string | null;
  role: string;
};

export type MerchantSummary = {
  merchant_id: string;
  name: string;
  domain: string;
  created_at: string | null;
};

export type MerchantResponse = {
  merchant_id: string;
  name: string;
  domain: string;
  api_key: string;
  created_at: string | null;
};

export type StatsResponse = {
  total_orders: number;
  pending: number;
  paid: number;
  total_paid_amount: string;
};

export type AdminOrderRow = {
  order_id: string;
  amount: string;
  status: string;
  utr_number: string | null;
  merchant_id: string | null;
  created_at: string | null;
};

async function parseError(res: Response): Promise<string> {
  const t = await res.text();
  try {
    const j = JSON.parse(t) as { detail?: unknown };
    if (typeof j.detail === "string") return j.detail;
    if (Array.isArray(j.detail)) return JSON.stringify(j.detail);
  } catch {
    /* ignore */
  }
  return t || res.statusText || "Request failed";
}

export async function checkout(
  amount: string,
  opts?: { apiKey?: string; merchantId?: string; returnUrl?: string }
): Promise<{ order_id: string; amount: string; return_url?: string | null }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts?.apiKey) headers["X-API-Key"] = opts.apiKey;
  const body: Record<string, unknown> = { amount: Number(amount) };
  if (opts?.merchantId) body.merchant_id = opts.merchantId;
  if (opts?.returnUrl) body.return_url = opts.returnUrl;
  const res = await fetch(`${base}/api/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getOrder(orderId: string): Promise<Order> {
  const res = await fetch(`${base}/api/orders/${orderId}`);
  if (!res.ok) throw new Error("Order not found");
  return res.json();
}

export async function authBootstrap(token: string): Promise<UserProfile> {
  const res = await fetch(`${base}/api/auth/bootstrap`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getMe(token: string): Promise<UserProfile> {
  const res = await fetch(`${base}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function listMerchants(token: string): Promise<MerchantSummary[]> {
  const res = await fetch(`${base}/api/merchants`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createMerchant(
  token: string,
  body: { name: string; domain: string }
): Promise<MerchantResponse> {
  const res = await fetch(`${base}/api/merchants`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getMerchantApiKey(token: string, merchantId: string): Promise<string> {
  const res = await fetch(`${base}/api/merchants/${merchantId}/api-key`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  const j = (await res.json()) as { api_key?: string };
  return j.api_key ?? "";
}

export async function rotateMerchantKey(token: string, merchantId: string): Promise<MerchantResponse> {
  const res = await fetch(`${base}/api/merchants/${merchantId}/rotate-key`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getAdminStats(token: string): Promise<StatsResponse> {
  const res = await fetch(`${base}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getAdminOrders(token: string): Promise<AdminOrderRow[]> {
  const res = await fetch(`${base}/api/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function simulateSmsSync(
  body: { amount: number; utr: string; merchant_id?: string },
  bearerToken: string
): Promise<{ matched: boolean; order_id?: string; message: string }> {
  const res = await fetch(`${base}/api/webhook/sms-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: bearerToken.startsWith("Bearer ") ? bearerToken : `Bearer ${bearerToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
