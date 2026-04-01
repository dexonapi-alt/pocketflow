import { apiPost } from "./api-client";
import type { RegisterDto, LoginDto } from "@plannerflow/types";

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

// API wraps responses as { success, data } — extract the inner data
function unwrap<T>(response: any): T {
  return response?.data ?? response;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

function storeTokens(tokens: { accessToken: string; refreshToken: string }) {
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function register(data: RegisterDto) {
  const raw = await apiPost("/auth/register", data);
  const tokens = unwrap<{ accessToken: string; refreshToken: string }>(raw);
  storeTokens(tokens);
  return tokens;
}

export async function login(data: LoginDto) {
  const raw = await apiPost("/auth/login", data);
  const tokens = unwrap<{ accessToken: string; refreshToken: string }>(raw);
  storeTokens(tokens);
  return tokens;
}

export async function refreshToken() {
  const token = localStorage.getItem(REFRESH_KEY);
  if (!token) return null;

  try {
    const raw = await apiPost("/auth/refresh", { refreshToken: token });
    const tokens = unwrap<{ accessToken: string; refreshToken: string }>(raw);
    storeTokens(tokens);
    return tokens;
  } catch {
    clearTokens();
    return null;
  }
}

export async function logout() {
  const token = localStorage.getItem(REFRESH_KEY);
  if (token) {
    await apiPost("/auth/logout", { refreshToken: token }).catch(() => {});
  }
  clearTokens();
}
