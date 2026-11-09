/**
 * API utility for making authenticated requests to the Spring Boot backend.
 * Automatically attaches JWT Bearer token from localStorage.
 */

export const getApiBase = (): string => {
  // When running in the browser, always use relative path '' so all /api calls
  // go through the Vite reverse proxy (or same-origin server).
  // This works identically on localhost, LAN IP (192.168.x.x), tunnels, or deployed domains.
  if (typeof window !== 'undefined') {
    return '';
  }
  return import.meta.env.VITE_API_BASE || 'http://localhost:8080';
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

