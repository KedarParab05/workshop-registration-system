/**
 * API utility for making authenticated requests to the backend services.
 * Automatically attaches JWT Bearer token from localStorage.
 */

const RENDER_BACKEND_URL = 'https://workshop-registration-system-9fbd.onrender.com';

export const getApiBase = (): string => {
  const envBase = (import.meta.env.VITE_API_BASE || '').trim();
  // If an explicit backend URL is configured in environment, use it
  if (envBase && !envBase.includes('localhost:8081')) {
    if (envBase.includes('localhost:8080') && typeof window !== 'undefined') {
      return '';
    }
    return envBase.replace(/\/$/, '');
  }
  // When running in local development (localhost or 127.0.0.1), use relative proxy
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return '';
  }
  // In production (Vercel, mobile browsers), connect directly to the Render cloud backend
  // This bypasses Vercel's strict 10s serverless proxy timeout and prevents 504 Gateway Timeouts
  return RENDER_BACKEND_URL;
};

export const API_BASE = getApiBase();

/**
 * Fetch with AbortController timeout (default 45s to accommodate Render cloud cold-starts).
 * Throws an AbortError when the timeout fires so callers can show a friendly message.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
  timeoutMs = 45000
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

