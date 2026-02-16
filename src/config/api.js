import { getErrorMessage } from '../utils/errorHandler';
import { checkRateLimit } from '../utils/rateLimiter';

// ─── Base URL from environment ───
export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Token helpers (single source of truth) ───
const TOKEN_KEY = 'token';

/**
 * Retrieve the stored JWT access token.
 * Returns null when no token is available.
 */
export const getToken = () => localStorage.getItem(TOKEN_KEY);

/**
 * Quick check: is a JWT structurally present and not yet expired?
 * NOTE: This performs a *client-side* check only. The server is the true
 * authority – it validates signature, fingerprint and revocation status.
 */
export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // 30-second buffer to avoid edge-case race conditions
    return Date.now() >= (payload.exp * 1000) - 30_000;
  } catch {
    return true; // malformed token → treat as expired
  }
};

/**
 * Build Authorization + Content-Type headers for API requests.
 *
 * @param {boolean} isFormData – pass true for multipart/form-data uploads
 *                               (Content-Type is omitted so the browser sets
 *                               the correct boundary automatically).
 * @returns {Record<string, string>} headers object
 */
export const getAuthHeaders = (isFormData = false) => {
  const token = getToken();

  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

/**
 * Dispatch a global auth-error event so AuthContext / AuthErrorBoundary
 * can react (clear session, redirect to login, etc.).
 */
const emitAuthError = (message, status) => {
  window.dispatchEvent(
    new CustomEvent('app-error', { detail: { message, status } })
  );
};

/**
 * Enhanced fetch wrapper with:
 *  • Automatic auth-header injection
 *  • Client-side token-expiry guard
 *  • Rate-limit pre-check
 *  • Centralised 401 handling (fires `app-error` event)
 *  • User-friendly error messages
 *
 * @param {string}  url      – Full API endpoint URL
 * @param {object}  options  – Standard fetch init + optional `isFormData`
 * @param {object}  config   – { skipRateLimit, rateLimitType, skipAuth }
 * @returns {Promise<Response>}
 */
export const enhancedFetch = async (url, options = {}, config = {}) => {
  const {
    skipRateLimit = false,
    rateLimitType = 'api',
    skipAuth = false,
  } = config;

  // ── Rate-limit guard ──
  if (!skipRateLimit) {
    const rateCheck = checkRateLimit(url, rateLimitType);
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.message);
    }
  }

  // ── Client-side token-expiry guard ──
  if (!skipAuth && isTokenExpired()) {
    emitAuthError('Session expired. Please log in again.', 401);
    const error = new Error('Session expired. Please log in again.');
    error.status = 401;
    error.userMessage = error.message;
    throw error;
  }

  // ── Build headers ──
  const headers = skipAuth
    ? options.headers || {}
    : { ...getAuthHeaders(options.isFormData), ...options.headers };

  try {
    const response = await fetch(url, { ...options, headers });

    // ── Handle 401 Unauthorized ──
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || 'Unauthorized – please log in again.';

      emitAuthError(message, 401);

      const error = new Error(message);
      error.status = 401;
      error.data = errorData;
      error.userMessage = message;
      throw error;
    }

    // ── Handle other HTTP errors ──
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response;
  } catch (error) {
    if (!error.userMessage) {
      error.userMessage = getErrorMessage(error);
    }
    throw error;
  }
};
