import { jwtDecode } from "jwt-decode";

export const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('token', token);
    }
};

export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token') || localStorage.getItem('accessToken');
    }
    return null;
};

export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        window.location.href = '/';
    }
};

export const isAuthenticated = () => {
    return !!getToken();
};

export const getUserRole = (): string | null => {
    const token = getToken();
    if (!token) return null;
    try {
        const decoded: any = jwtDecode(token);
        return decoded.role || null;
    } catch (error) {
        return null;
    }
};
