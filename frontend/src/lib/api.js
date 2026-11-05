/**
 * Centralized API client for Dikaios Amanah.
 *
 * NOTE: This module preserves the existing backend contract exactly —
 * same base URL, same paths, same headers, same request/response shapes.
 * It only removes the duplicated inline `fetch` boilerplate from pages.
 */

// Configurable so the same build can talk to a local or a hosted API.
// VITE_API_URL is set in frontend/.env.local locally and in the Vercel project
// settings for preview/production deployments.
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const TOKEN_KEY = 'token';

export const getAuthHeaders = (json = true) => {
  const headers = { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` };
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
};

/**
 * Perform a request against the platform API.
 * Returns `{ ok, status, data }` — callers decide how to present errors,
 * exactly as they did with inline fetch.
 */
export const apiRequest = async (path, { method = 'GET', body, formData = false } = {}) => {
  const headers = method === 'GET' ? getAuthHeaders(false) : getAuthHeaders(!formData);
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: formData ? body : body ? JSON.stringify(body) : undefined
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
};

/** File (multipart) upload helper — mirrors previous FormData fetches. */
export const apiUpload = async (path, formData) => {
  const headers = getAuthHeaders(false);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
};
