export const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
    }
};

export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return null;
};

export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        window.location.href = '/';
    }
};

export const isAuthenticated = () => {
    return !!getToken();
};
