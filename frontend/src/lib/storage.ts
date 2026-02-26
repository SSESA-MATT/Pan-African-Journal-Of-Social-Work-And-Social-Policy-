/**
 * Client-side storage for authentication tokens and user data.
 * Single source of truth — every module reads/writes through here.
 */

const TOKEN_KEY = 'paj_token';
const REFRESH_KEY = 'paj_refresh_token';
const USER_KEY = 'paj_user';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export const tokenStorage = {
  // ── Access token ──────────────────────────────────────────
  getAccessToken(): string | null {
    return isBrowser() ? localStorage.getItem(TOKEN_KEY) : null;
  },
  setAccessToken(token: string) {
    if (isBrowser()) localStorage.setItem(TOKEN_KEY, token);
  },

  // ── Refresh token ─────────────────────────────────────────
  getRefreshToken(): string | null {
    return isBrowser() ? localStorage.getItem(REFRESH_KEY) : null;
  },
  setRefreshToken(token: string) {
    if (isBrowser()) localStorage.setItem(REFRESH_KEY, token);
  },

  // ── User object ───────────────────────────────────────────
  getUser<T = any>(): T | null {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser(user: any) {
    if (isBrowser()) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // ── Batch helpers ─────────────────────────────────────────
  /** Store the complete auth response from login / register */
  setAuthData(data: { user: any; token: string; refresh_token: string }) {
    this.setAccessToken(data.token);
    this.setRefreshToken(data.refresh_token);
    this.setUser(data.user);
  },
  /** Wipe everything on logout */
  clearAuth() {
    if (!isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
