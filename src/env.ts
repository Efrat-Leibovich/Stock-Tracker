/**
 * Environment variables — works in both Vite (browser) and Jest (Node/CommonJS).
 *
 * In development: Vite proxies /api → http://localhost:3001 (via vite.config.ts)
 * In production:  VITE_API_URL points to the Render backend URL
 */

// @ts-ignore — import.meta.env is valid in Vite but not in Jest's CommonJS
const viteEnv = typeof import.meta !== 'undefined'
  // @ts-ignore
  ? (import.meta.env as Record<string, string> | undefined)
  : undefined;

// API base URL — in dev this is '/api' (proxied by Vite), in prod it's the full backend URL
export const API_BASE_URL: string =
  viteEnv?.VITE_API_URL ?? '/api';

// Alpha Vantage key kept for backwards compatibility (no longer used)
export const ALPHA_VANTAGE_KEY: string =
  viteEnv?.VITE_ALPHA_VANTAGE_KEY
  ?? (typeof process !== 'undefined' ? (process.env?.VITE_ALPHA_VANTAGE_KEY ?? '') : '');
