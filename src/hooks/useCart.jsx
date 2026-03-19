import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const saved = localStorage.getItem('cartItems');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to parse cart items from local storage', error);
            return [];
        }
    });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(items));
    }, [items]);

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
            (i) => `📦 *Product:* ${i.name}\n💰 *Price:* ${i.price}\n🔢 *Quantity:* ${i.qty}` +
                (i.id ? `\n🔗 *Link:* ${window.location.origin}/product/${i.id}` : '')
        );
        const productsText = lines.join('\n\n');
        
        const msg = `🛍️ *NEW ORDER REQUEST - ONEFINE* 🛍️\n\n` +
            `Hello! I'm interested in purchasing ${items.length === 1 ? 'this item' : 'these items'}:\n\n` +
            `${productsText}\n\n` +
            `🛒 *Total Price:* Rs. ${totalPrice.toLocaleString('en-LK')}\n\n` +
            `*📍 My Delivery Details:*\n` +
            `👤 Name: \n` +
            `🏠 Address: \n` +
            `📱 Phone: \n` +
            `\n` +
            `_Please let me know the next steps to confirm my order!_ ✨`;

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
