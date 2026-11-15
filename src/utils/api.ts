/**
 * API utility for making authenticated requests to the Spring Boot backend.
 * Automatically attaches JWT Bearer token from localStorage.
 */

export const getApiBase = (): string => {
  // If an external production backend URL is specified (e.g. Vercel frontend calling a deployed backend)
  const envBase = import.meta.env.VITE_API_BASE;
  if (envBase && typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    return envBase.replace(/\/+$/, '');
  }
  // When running locally or on same-origin (Docker / Render full-stack), use relative path ''
  return '';
};

export const API_BASE = getApiBase();

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('wh_jwt_token');
  const base = getApiBase();
  return fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
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

