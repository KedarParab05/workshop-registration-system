/**
 * API utility for making authenticated requests to the backend services.
 * Automatically attaches JWT Bearer token from localStorage.
 */

export const getApiBase = (): string => {
  const envBase = (import.meta.env.VITE_API_BASE || '').trim();
  // If an explicit backend URL (like https://your-backend.onrender.com) is provided, use it
  if (envBase && !envBase.includes('localhost:8081')) {
    // If running in development with default localhost, prefer Vite proxy '' unless explicitly configured
    if (envBase.includes('localhost:8080') && typeof window !== 'undefined') {
      return '';
    }
    return envBase.replace(/\/$/, '');
  }
  // When running in the browser with relative routing (Vite proxy or same-domain), use ''
  if (typeof window !== 'undefined') {
    return '';
  }
  return 'http://localhost:8080';
};

export const API_BASE = getApiBase();

/**
 * Fetch with AbortController timeout (default 15s).
 * Throws an AbortError when the timeout fires so callers can show a friendly message.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
  timeoutMs = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);
  const token = localStorage.getItem('wh_jwt_token');
  const base = getApiBase();
  try {
    return await fetch(`${base}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timerId);
  }
}

export function saveToken(token: string) {
  localStorage.setItem('wh_jwt_token', token);
}

export function clearToken() {
  localStorage.removeItem('wh_jwt_token');
}

export function getToken(): string | null {
  return localStorage.getItem('wh_jwt_token');
}

