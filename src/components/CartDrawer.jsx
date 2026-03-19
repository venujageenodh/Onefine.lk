import React, { useState } from 'react';
import { HiX, HiPlus, HiMinus, HiTrash, HiShoppingCart } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../hooks/useCart';

const API_BASE = import.meta.env.VITE_API_URL || '';
function resolveImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE}${url}`;
}

export default function CartDrawer() {
    const {
        items, isOpen, setIsOpen, removeItem, updateQty,
        totalItems, totalPrice, buildWhatsAppMessage, clearCart,
    } = useCart();

    const [view, setView] = useState('items'); // 'items' | 'form'
    const [formData, setFormData] = useState({ name: '', address: '', town: '', phone: '' });
    const [submitting, setSubmitting] = useState(false);

    const submitWhatsAppOrder = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const raw = import.meta.env.VITE_API_URL || '';
            const base = raw.replace(/\/?api\/?$/, '').replace(/\/$/, '');
            
            await fetch(`${base}/api/biz/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
                body: JSON.stringify({
                    source: 'WEBSITE',
                    paymentMethod: 'WHATSAPP',
                    customer: {
                        name: formData.name,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.town,
                    },
                    items: items.map(item => {
                        const numericPrice = Number(String(item.price).replace(/[^0-9]/g, '')) || 0;
                        return {
                            productId: item.id || item._id || null,
                            name: item.name,
                            unitPrice: numericPrice,
                            qty: item.qty,
                            image: item.image || '',
                        };
                    }),
                    subtotal: totalPrice,
                    deliveryCharge: 0,
                    total: totalPrice,
                    notes: 'WhatsApp Cart Order',
                }),
            });
        } catch (_) {}

        window.open(buildWhatsAppMessage(formData), '_blank');
        clearCart();
        setSubmitting(false);
        setView('items');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 z-50 h-[100dvh] w-full max-w-sm bg-white shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <HiShoppingCart className="text-xl text-navy" />
                        <h2 className="font-display text-lg text-navy">Your Cart</h2>
                        {totalItems > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-navy">
                                {totalItems}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-colors"
                    >
                        <HiX />
                    </button>
                </div>

                {view === 'items' ? (
                    <>
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                            <HiShoppingCart className="text-6xl text-slate-200" />
                            <p className="text-sm text-slate-500">Your cart is empty.</p>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full bg-navy px-5 py-2 text-xs font-semibold text-white hover:-translate-y-0.5 transition-transform"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                                {/* Image */}
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                    {item.image && (
                                        <img
                                            src={resolveImageUrl(item.image)}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex flex-1 flex-col gap-1.5">
                                    <p className="text-sm font-medium text-navy leading-tight">{item.name}</p>
                                    <p className="text-xs font-semibold text-slate-600">{item.price}</p>

                                    {/* Qty controls */}
                                    <div className="flex items-center gap-2 mt-auto">
                                        <button
                                            onClick={() => updateQty(item.id, item.qty - 1)}
                                            className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-colors"
                                        >
                                            <HiMinus className="text-xs" />
                                        </button>
                                        <span className="w-5 text-center text-sm font-medium text-navy">{item.qty}</span>
                                        <button
                                            onClick={() => updateQty(item.id, item.qty + 1)}
                                            className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-colors"
                                        >
                                            <HiPlus className="text-xs" />
                                        </button>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="ml-auto flex h-6 w-6 items-center justify-center rounded-full border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
                                        >
                                            <HiTrash className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-slate-100 px-5 py-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Subtotal</span>
                            <span className="font-semibold text-navy">
                                Rs. {totalPrice.toLocaleString('en-LK')}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Shipping & taxes calculated at checkout via WhatsApp.
                        </p>
                            <button
                                onClick={() => setView('form')}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5"
                            >
                                <FaWhatsapp className="text-lg" />
                                Order via WhatsApp
                            </button>
                            <button
                                onClick={clearCart}
                                className="w-full rounded-full border border-slate-200 py-2 text-xs font-medium text-slate-500 hover:border-red-200 hover:text-red-500 transition-colors"
                            >
                                Clear Cart
                            </button>
                        </div>
                    )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col bg-slate-50">
                        <div className="px-5 py-3 border-b border-slate-100 bg-white">
                            <h3 className="font-display text-base text-navy">Delivery Details</h3>
                            <p className="text-xs text-slate-500">Enter details to order via WhatsApp</p>
                        </div>
                        <form onSubmit={submitWhatsAppOrder} className="flex-1 overflow-y-auto p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-navy mb-1" htmlFor="cart-wa-name">Name</label>
                                <input 
                                    id="cart-wa-name"
                                    type="text" 
                                    required 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy bg-white"
                                    placeholder="Your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy mb-1" htmlFor="cart-wa-address">Address</label>
                                <textarea 
                                    id="cart-wa-address"
                                    required 
                                    value={formData.address} 
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy resize-none bg-white"
                                    placeholder="House No, Street, Area"
                                    rows="2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy mb-1" htmlFor="cart-wa-town">Town</label>
                                <input 
                                    id="cart-wa-town"
                                    type="text" 
                                    required 
                                    value={formData.town} 
                                    onChange={(e) => setFormData({...formData, town: e.target.value})}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy bg-white"
                                    placeholder="Your town"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy mb-1" htmlFor="cart-wa-phone">Phone number</label>
                                <input 
                                    id="cart-wa-phone"
                                    type="tel" 
                                    required 
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy bg-white"
                                    placeholder="Your phone number"
                                />
                            </div>
                            <div className="pt-2 flex gap-3 h-12">
                                <button 
                                    type="button" 
                                    onClick={() => setView('items')}
                                    className="flex-1 rounded-xl bg-slate-200 px-5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-300"
                                >
                                    Back
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 transition-all hover:bg-[#20bd5a] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <FaWhatsapp className="text-lg" /> {submitting ? 'Processing…' : 'Send'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
}
