import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

let cachedCollections = null;

export function useCollections() {
    const [collections, setCollections] = useState(cachedCollections || []);
    const [loading, setLoading] = useState(!cachedCollections);

    useEffect(() => {
        if (cachedCollections) return;
        fetch(`${API_BASE}/collections`)
            .then((r) => r.json())
            .then((data) => {
                cachedCollections = Array.isArray(data) ? data : [];
                setCollections(cachedCollections);
            })
            .catch(() => setCollections([]))
            .finally(() => setLoading(false));
    }, []);

    return { collections, loading };
}
