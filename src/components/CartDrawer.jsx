import React from 'react';
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

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col">

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

                {/* Items */}
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
                        <a
                            href={buildWhatsAppMessage()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5"
                        >
                            <FaWhatsapp className="text-lg" />
                            Order via WhatsApp
                        </a>
                        <button
                            onClick={clearCart}
                            className="w-full rounded-full border border-slate-200 py-2 text-xs font-medium text-slate-500 hover:border-red-200 hover:text-red-500 transition-colors"
                        >
                            Clear Cart
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
