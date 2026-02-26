import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';
// Bypass localtunnel's guard page for programmatic requests
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
];

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper for consistent API pathing
  const api = useCallback((endpoint) => {
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
    return `${base}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }, []);

  // Fetch all products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(api('/products'), { headers: baseHeaders() });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data.length > 0 ? data : defaultProducts);
    } catch {
      // Fallback to defaults if server is unavailable
      setProducts(defaultProducts);
      setError('Using demo data — backend unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add product (requires auth token)
  const addProduct = useCallback(async ({ name, price, rating = 5, image }, token) => {
    const res = await fetch(api('/products'), {
      method: 'POST',
      headers: {
        ...baseHeaders(),
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, price, rating, image }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create product');
    }
    const created = await res.json();
    setProducts((prev) => [created, ...prev]);
    return created;
  }, []);

  // Update product (requires auth token)
  const updateProduct = useCallback(async (id, updates, token) => {
    const res = await fetch(api(`/products/${id}`), {
      method: 'PUT',
      headers: {
        ...baseHeaders(),
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product');
    }
    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
    return updated;
  }, []);

  // Delete product (requires auth token)
  const deleteProduct = useCallback(async (id, token) => {
    const res = await fetch(api(`/products/${id}`), {
      method: 'DELETE',
      headers: { ...baseHeaders(), Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete product');
    }
    setProducts((prev) => prev.filter((p) => p._id !== id));
  }, []);

  // Upload image (requires auth token)
  const uploadImage = useCallback(async (file, token) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(api('/upload'), {
      method: 'POST',
      headers: { ...baseHeaders(), Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
  };
}
