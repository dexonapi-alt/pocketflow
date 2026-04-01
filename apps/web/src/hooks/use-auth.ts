"use client";

import { useState, useCallback, useEffect, useSyncExternalStore } from "react";
import { isAuthenticated, login, register, logout } from "@/lib/auth";
import type { RegisterDto, LoginDto } from "@plannerflow/types";

// Shared across all useAuth() instances so login in one component
// triggers re-render in every other component using useAuth()
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notifyAll() {
  listeners.forEach((cb) => cb());
}

function getSnapshot() {
  return isAuthenticated();
}

export function useAuth() {
  const authenticated = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleLogin = useCallback(async (data: LoginDto) => {
    await login(data);
    notifyAll();
  }, []);

  const handleRegister = useCallback(async (data: RegisterDto) => {
    await register(data);
    notifyAll();
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    notifyAll();
  }, []);

  return {
    authenticated,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}
