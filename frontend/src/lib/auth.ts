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
    const token = getToken();
    if (!token) return false;
    try {
        const decoded: any = jwtDecode(token);
        if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
            return false;
        }
        return true;
    } catch { return false; }
};

export const getUserRole = (): string | null => {
    const token = getToken();
    if (!token) return null;
    try {
        const decoded: any = jwtDecode(token);
        return decoded.role ? String(decoded.role).toLowerCase() : null;
    } catch (error) {
        return null;
    }
};

export interface AuthUserIdentity {
    id?: string;
    name: string;
    email: string;
    role: string | null;
}

export const getUserIdentity = (): AuthUserIdentity | null => {
    const token = getToken();
    if (!token) return null;
    try {
        const decoded: any = jwtDecode(token);
        const email = String(decoded.email || '');
        const fallbackName = email ? email.split('@')[0] : 'مستخدم';
        return {
            id: decoded.sub ? String(decoded.sub) : undefined,
            name: String(decoded.name || decoded.fullName || fallbackName),
            email,
            role: decoded.role ? String(decoded.role).toLowerCase() : null,
        };
    } catch {
        return null;
    }
};
