import { useState, useEffect } from 'react';

function apiUrl(path) {
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
    return `${base}/api${path.startsWith('/') ? path : `/${path}`}`;
}

export function useCollections() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(apiUrl('/collections'))
            .then((r) => r.json())
            .then((data) => setCollections(Array.isArray(data) ? data : []))
            .catch(() => setCollections([]))
            .finally(() => setLoading(false));
    }, []);

    return { collections, loading };
}
