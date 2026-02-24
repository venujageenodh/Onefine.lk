import { useState, useCallback } from 'react';

const TOKEN_KEY = 'onefine_admin_token';

export function useAuth() {
    const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isAuthenticated = Boolean(token);

    const login = useCallback(async (password) => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Incorrect password');
                return false;
            }
            sessionStorage.setItem(TOKEN_KEY, data.token);
            setToken(data.token);
            return true;
        } catch {
            setError('Unable to connect to server');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setError('');
    }, []);

    return { token, isAuthenticated, login, logout, error, loading };
}
