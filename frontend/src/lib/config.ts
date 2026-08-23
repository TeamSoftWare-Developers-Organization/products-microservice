export const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    if (typeof window !== 'undefined') {
        if (window.location.hostname.includes('vercel.app')) {
            return "https://eleven-hands-win.loca.lt";
        }
        return `${window.location.protocol}//${window.location.hostname}:8085`;
    }
    return "https://eleven-hands-win.loca.lt";
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
