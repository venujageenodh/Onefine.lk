import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch } from './utils';

const TOKEN_KEY = 'onefine_biz_token';
const ADMIN_KEY = 'onefine_biz_admin';

const AuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
    const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || null);
    const [admin, setAdmin] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem(ADMIN_KEY) || 'null'); } catch { return null; }
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const login = useCallback(async ({ email, password }) => {
        setError(''); setLoading(true);
        try {
            const data = await apiFetch('/auth/admin-login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            sessionStorage.setItem(TOKEN_KEY, data.token);
            sessionStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
            setToken(data.token);
            setAdmin(data.admin);
            return true;
        } catch (err) {
            setError(err.message || 'Login failed');
            return false;
        } finally { setLoading(false); }
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(ADMIN_KEY);
        setToken(null); setAdmin(null);
    }, []);

    const hasPermission = useCallback((perm) => {
        if (!admin) return false;
        const perms = admin.permissions || [];
        return perms.includes('*') || perms.includes(perm);
    }, [admin]);

    return (
        <AuthContext.Provider value={{ token, admin, error, loading, login, logout, hasPermission, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAdminAuth() { return useContext(AuthContext); }
