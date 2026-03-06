import { useState, useEffect } from 'react';

const EC2_BACKEND = 'http://13.60.254.1:4000';
function apiUrl(path) {
    const base = (import.meta.env.VITE_API_URL || EC2_BACKEND).replace(/\/api\/?$/, '').replace(/\/$/, '');
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
