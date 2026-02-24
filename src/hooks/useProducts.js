import React from 'react';

const STORAGE_KEY = 'onefine-products';

const defaultProducts = [
  {
    id: 1,
    name: 'Custom Name Insulated Bottle',
    price: 'Rs. 4,950',
    rating: 5,
    image:
      'https://images.pexels.com/photos/3259629/pexels-photo-3259629.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 2,
    name: 'Executive Corporate Gift Set',
    price: 'Rs. 12,500',
    rating: 5,
    image:
      'https://images.pexels.com/photos/4065405/pexels-photo-4065405.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 3,
    name: 'Premium Desk Essentials Kit',
    price: 'Rs. 9,900',
    rating: 5,
    image:
      'https://images.pexels.com/photos/3787321/pexels-photo-3787321.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export function useProducts() {
  const [products, setProducts] = React.useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch {
        // ignore read errors and fall back to defaults
      }
    }
    return defaultProducts;
  });

  // Persist to localStorage whenever products change
  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      // ignore write errors
    }
  }, [products]);

  return { products, setProducts };
}

