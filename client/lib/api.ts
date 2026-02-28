const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("bank_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    const json = await res.json();

    if (!res.ok) {
      return { error: json.message || "Something went wrong" };
    }

    return { data: json };
  } catch {
    return { error: "Network error. Please check your connection." };
  }
}

// Auth API
export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    request<{ user: { _id: string; email: string; name: string }; token: string }>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify(data) }
    ),

  login: (data: { email: string; password: string }) =>
    request<{ user: { id: string; email: string; name: string }; token: string }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify(data) }
    ),

  logout: () =>
    request<{ message: string }>("/api/auth/logout", { method: "POST" }),
};

// Account API
export const accountApi = {
  create: () =>
    request<{ account: { _id: string; user: string; status: string; currency: string } }>(
      "/api/accounts",
      { method: "POST" }
    ),

  get: () =>
    request<{ account: { _id: string; user: string; status: string; currency: string } | null }>(
      "/api/accounts",
      { method: "GET" }
    ),

  getBalance: (accountId: string) =>
    request<{ accountId: string; balance: number }>(
      `/api/accounts/balance/${accountId}`,
      { method: "GET" }
    ),
};

// Transaction API
export const transactionApi = {
  create: (data: {
    fromAccount: string;
    toAccount: string;
    amount: number;
    idempotencyKey: string;
  }) =>
    request<{
      message: string;
      transaction: {
        _id: string;
        fromAccount: string;
        toAccount: string;
        amount: number;
        status: string;
        idempotencyKey: string;
      };
    }>("/api/transactions", { method: "POST", body: JSON.stringify(data) }),
};
