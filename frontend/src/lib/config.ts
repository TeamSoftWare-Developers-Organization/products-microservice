import { _dec, SECURE_ENDPOINTS } from './security';

const normalize = (value?: string) => (value || '').replace(/\/+$/, '');

export const getApiUrl = () => {
  const configured = normalize(process.env.NEXT_PUBLIC_API_URL);
  if (configured) return configured;

  // Browser requests use same origin. Next.js proxies /api and /uploads internally,
  // so the app works on :3000, :8085, WSL IPs and reverse proxies without stale ports.
  if (typeof window !== 'undefined') return '';

  // Server-side fallback for environments not using the Next rewrite.
  return normalize(process.env.INTERNAL_API_URL) || normalize(_dec(SECURE_ENDPOINTS.CLOUDFLARE_TUNNEL));
};

export const getClientApiUrl = getApiUrl;

export const getWsUrl = () => {
  const configured = normalize(process.env.NEXT_PUBLIC_WS_URL);
  if (configured) return configured;
  if (typeof window !== 'undefined') return window.location.origin;
  return getApiUrl();
};
