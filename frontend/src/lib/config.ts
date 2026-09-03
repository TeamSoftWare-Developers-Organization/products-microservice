import { _dec, SECURE_ENDPOINTS } from "./security";

export const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    if (typeof window !== 'undefined') {
        if (window.location.hostname.includes('vercel.app')) {
            return _dec(SECURE_ENDPOINTS.CLOUDFLARE_TUNNEL);
        }
        return `${window.location.protocol}//${window.location.hostname}:8085`;
    }
    return _dec(SECURE_ENDPOINTS.CLOUDFLARE_TUNNEL);
};

export const getClientApiUrl = () => {
    return getApiUrl();
};

export const getWsUrl = () => {
    if (process.env.NEXT_PUBLIC_WS_URL) {
        return process.env.NEXT_PUBLIC_WS_URL;
    }
    return getApiUrl();
};
