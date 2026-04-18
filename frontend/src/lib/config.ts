export const getApiUrl = () => {
    // If we're on the server (SSR), choose the correct base URL.
    if (typeof window === 'undefined') {
        // In Docker/K8s, INTERNAL_API_URL points to the internal service name (e.g., http://api-gateway).
        // NGINX is configured to handle routes like /products, /auth directly (no /api prefix).
        if (process.env.INTERNAL_API_URL) {
            return process.env.INTERNAL_API_URL;
        }

        // In local development (npm run dev), fall back to localhost NGINX.
        return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    }

    // On the client (browser), we also need to point to the Gateway.
    // Since we don't have a local rewrite to /api, we use the absolute URL.
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
};

