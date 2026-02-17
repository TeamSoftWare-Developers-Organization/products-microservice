export const getApiUrl = () => {
    // Client-side: Use public URL (baked in at build time or default to localhost)
    if (typeof window !== "undefined") {
        return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    }
    // Server-side: Use internal K8s service URL (runtime env or default)
    return process.env.INTERNAL_API_URL || "http://gateway-service";
};
