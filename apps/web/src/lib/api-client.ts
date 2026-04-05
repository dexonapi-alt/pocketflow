const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return false;
    }

    const json = await res.json();
    const tokens = json?.data ?? json;
    localStorage.setItem("access_token", tokens.accessToken);
    localStorage.setItem("refresh_token", tokens.refreshToken);
    return true;
  } catch {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return false;
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...options.headers,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && !path.startsWith("/auth/")) {
    // Deduplicate concurrent refresh attempts
    if (!refreshPromise) {
      refreshPromise = tryRefresh().finally(() => { refreshPromise = null; });
    }

    const refreshed = await refreshPromise;
    if (refreshed) {
      const retryHeaders = { ...headers };
      const newToken = getToken();
      if (newToken) retryHeaders.Authorization = `Bearer ${newToken}`;

      const retry = await fetch(`${API_URL}${path}`, {
        method: options.method ?? "GET",
        headers: retryHeaders,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!retry.ok) {
        const error = await retry.json().catch(() => ({}));
        throw new ApiError(error.message ?? `Request failed: ${retry.status}`, retry.status);
      }
      return retry.json();
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.message ?? `Request failed: ${response.status}`,
      response.status,
    );
  }

  return response.json();
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Typed API helpers ──────────────────────

export const apiGet = <T>(path: string) => api<T>(path);

export const apiPost = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "POST", body });

export const apiPatch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "PATCH", body });

export const apiDelete = <T>(path: string) =>
  api<T>(path, { method: "DELETE" });
