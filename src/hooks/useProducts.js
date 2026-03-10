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
      const prods = data.length > 0 ? data : defaultProducts;
      // Apply localStorage sort order (works even if remote server lacks sortOrder)
      try {
        const saved = localStorage.getItem('onefine_product_order');
        if (saved) {
          const orderMap = JSON.parse(saved);
          prods.sort((a, b) => (orderMap[a._id] ?? 9999) - (orderMap[b._id] ?? 9999));
        }
      } catch (_) {}
      setProducts(prods);
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

  const updateProductOrder = useCallback(async (orderedProducts, token) => {
    // 1. Persist order locally right away — works even without remote server changes
    const orderMap = {};
    orderedProducts.forEach((p, i) => { orderMap[p._id] = i; });
    localStorage.setItem('onefine_product_order', JSON.stringify(orderMap));

    // 2. Try to persist on the server (silent — won't throw if remote lacks sortOrder support)
    try {
      await Promise.all(
        orderedProducts.map((product, index) =>
          fetch(api(`/products/${product._id}`), {
            method: 'PUT',
            headers: { ...baseHeaders(), 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              name: product.name,
              price: product.price,
              rating: product.rating ?? 5,
              image: product.image,
              isBestSeller: product.isBestSeller,
              isPublic: product.isPublic,
              collectionSlug: product.collectionSlug || '',
              sortOrder: index,
            }),
          })
        )
      );
    } catch (_) {
      // Silent — localStorage order is already saved above
    }
  }, [api]);


  // Direct browser → Cloudinary upload (HTTPS, no backend needed)
  const uploadImage = useCallback((file) => uploadToCloudinary(file), []);

  return { products, setProducts, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct, updateProductOrder, uploadImage };
}

