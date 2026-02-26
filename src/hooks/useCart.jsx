import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]); // { id, name, price, image, qty }
    const [isOpen, setIsOpen] = useState(false);

    const addToCart = useCallback((product) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === product.id);
            if (existing) {
                return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...product, qty: 1 }];
        });
        setIsOpen(true);
    }, []);

    const removeItem = useCallback((id) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const updateQty = useCallback((id, qty) => {
        if (qty < 1) return;
        setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
    const totalPrice = items.reduce((sum, i) => {
        const num = Number(String(i.price).replace(/[^0-9]/g, ''));
        return sum + num * i.qty;
    }, 0);

    // Build WhatsApp message for checkout
    const buildWhatsAppMessage = useCallback(() => {
        if (items.length === 0) return '';
        const lines = items.map(
            (i) => `• ${i.name} x${i.qty} @ ${i.price}`
        );
        const msg = [
            '🛍️ *New Order from OneFine.lk*',
            '',
            ...lines,
            '',
            `*Total: Rs. ${totalPrice.toLocaleString('en-LK')}*`,
            '',
            'Please confirm my order. Thank you!',
        ].join('\n');
        return `https://wa.me/94768121701?text=${encodeURIComponent(msg)}`;
    }, [items, totalPrice]);

    return (
        <CartContext.Provider value={{
            items, addToCart, removeItem, updateQty, clearCart,
            totalItems, totalPrice, isOpen, setIsOpen, buildWhatsAppMessage,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
