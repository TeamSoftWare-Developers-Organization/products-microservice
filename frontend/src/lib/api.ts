import { getApiUrl } from './config';
import { getToken } from './auth';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = getApiUrl().replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullPath = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;
    const fullUrl = `${baseUrl}${fullPath}`;

    const headers = new Headers(options.headers || {});
    headers.set('Bypass-Tunnel-Reminder', 'true');
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const token = getToken();
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(fullUrl, {
        ...options,
        headers,
    });
};
