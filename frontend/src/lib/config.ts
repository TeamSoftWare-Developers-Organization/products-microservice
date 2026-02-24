export const getApiUrl = () => {
    // If we're on the server, we need an absolute URL for internal K8s communication.
    if (typeof window === 'undefined') {
        const internalUrl = process.env.INTERNAL_API_URL || "http://api-gateway";
        return `${internalUrl}/api`;
    }

    // On the client, we use the relative /api path for unified domain routing.
    return "/api";
};

