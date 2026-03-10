import { useState, useEffect, useCallback } from 'react';
import { uploadToCloudinary } from '../lib/cloudinary';

// Use relative paths in production (routes through Vercel HTTPS backend).
// In local dev, VITE_API_URL points to localhost:4000.
const getBase = () => {
  const raw = import.meta.env.VITE_API_URL || '';
  return raw.replace(/\/api\/?$/, '').replace(/\/$/, '');
};

const baseHeaders = () => ({ 'bypass-tunnel-reminder': 'true' });

const defaultProducts = [
  {
    _id: 'default-1',
    name: 'Custom Name Insulated Bottle',
    price: 'Rs. 4,950',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
  },
  {
    _id: 'default-2',
    name: 'Executive Corporate Gift Set',
    price: 'Rs. 12,500',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
  },
  {
    _id: 'default-3',
    name: 'Premium Desk Essentials Kit',
    price: 'Rs. 9,900',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&auto=format&fit=crop&q=80',
  },
  {
    _id: 'default-4',
    name: 'Luxgear Toyota Edition Bottle',
    price: 'Rs. 4,950',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
  },
];

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = useCallback((endpoint) => {
    const base = getBase();
    return `${base}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }, []);

  const fetchProducts = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = token ? '/admin/products' : '/products';
      const headers = { ...baseHeaders() };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(api(endpoint), { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data.length > 0 ? data : defaultProducts);
    } catch {
      setProducts(defaultProducts);
      setError('Using demo data — backend unavailable');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addProduct = useCallback(async ({ name, price, rating = 5, image, isBestSeller, isPublic, collectionSlug, sortOrder }, token) => {
    const res = await fetch(api('/products'), {
      method: 'POST',
      headers: { ...baseHeaders(), 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, price, rating, image, isBestSeller, isPublic, collectionSlug: collectionSlug || '', sortOrder }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to create product'); }
    const created = await res.json();
    setProducts((prev) => [created, ...prev]);
    return created;
  }, [api]);

  const updateProduct = useCallback(async (id, updates, token) => {
    const res = await fetch(api(`/products/${id}`), {
      method: 'PUT',
      headers: { ...baseHeaders(), 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: updates.name, price: updates.price, rating: updates.rating ?? 5,
        image: updates.image, isBestSeller: updates.isBestSeller,
        isPublic: updates.isPublic, collectionSlug: updates.collectionSlug || '',
        sortOrder: updates.sortOrder,
      }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update product'); }
    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
    return updated;
  }, [api]);

  const deleteProduct = useCallback(async (id, token) => {
    const res = await fetch(api(`/products/${id}`), {
      method: 'DELETE',
      headers: { ...baseHeaders(), Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to delete product'); }
    setProducts((prev) => prev.filter((p) => p._id !== id));
  }, [api]);

  const reorderProducts = useCallback(async (updates, token) => {
    // Optimistic update
    setProducts((prev) => {
      const copy = [...prev];
      updates.forEach(u => {
        const item = copy.find(p => p._id === u.id);
        if (item) item.sortOrder = u.sortOrder;
      });
      return copy.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    });

    const res = await fetch(api('/products/reorder'), {
      method: 'POST',
      headers: { ...baseHeaders(), 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ updates }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to reorder products'); }
  }, [api]);

  // Direct browser → Cloudinary upload (HTTPS, no backend needed)
  const uploadImage = useCallback((file) => uploadToCloudinary(file), []);

  return { products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct, reorderProducts, uploadImage };
}
