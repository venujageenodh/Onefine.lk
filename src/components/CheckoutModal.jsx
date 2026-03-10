import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { HiX, HiCreditCard, HiCash } from 'react-icons/hi';

export default function CheckoutModal({ product, onClose }) {
    const [view, setView] = useState('options');
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
    const [submitting, setSubmitting] = useState(false);

    if (!product) return null;

    const handleWhatsAppClick = () => {
        setView('whatsapp_form');
    };

    const getApiBase = () => {
        const raw = import.meta.env.VITE_API_URL || '';
        return raw.replace(/\/api\/?$/, '').replace(/\/$/, '');
    };

    const submitWhatsAppOrder = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const productUrl = product._id ? `${window.location.origin}/product/${product._id}` : window.location.origin;

        const msg = `🛍️ *NEW ORDER REQUEST - ONEFINE* 🛍️\n\n` +
            `Hello! I'm interested in purchasing this item:\n\n` +
            `📦 *Product:* ${product.name}\n` +
            `💰 *Price:* ${product.price}\n` +
            `🔢 *Quantity:* 1\n` +
            (product._id ? `🔗 *Link:* ${productUrl}\n` : '') +
            `\n` +
            `*📍 My Delivery Details:*\n` +
            `👤 Name: ${formData.name}\n` +
            `🏠 Address: ${formData.address}\n` +
            `📱 Phone: ${formData.phone}\n` +
            `\n` +
            `_Please let me know the next steps to confirm my order!_ ✨`;

        // Save order to backend (silent — WhatsApp opens regardless)
        try {
            const base = getApiBase();
            await fetch(`${base}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
                body: JSON.stringify({
                    customerName: formData.name,
                    customerPhone: formData.phone,
                    customerAddress: formData.address,
                    customerCity: '',
                    customerNotes: '',
                    items: [{
                        productId: product._id || '',
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        image: product.image || '',
                    }],
                    subtotal: 0,
                    deliveryCharge: 0,
                    total: 0,
                    paymentMethod: 'whatsapp',
                }),
            });
        } catch (_) {
            // Silent — don't block WhatsApp even if DB save fails
        }

        window.open(`https://api.whatsapp.com/send?phone=94768121701&text=${encodeURIComponent(msg)}`, '_blank');
        setSubmitting(false);
        onClose();
    };

    const goToCheckout = (method) => {
        const params = new URLSearchParams({
            productId: product._id || '',
            productName: product.name,
            productPrice: product.price,
            productImage: product.image || '',
            method,
        });
        window.location.href = `/checkout?${params.toString()}`;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Choose Checkout Method"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100">
                    <div>
                        {view === 'options' ? (
                            <>
                                <h2 className="font-display text-xl text-navy">Choose Checkout Method</h2>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                    {product.name} â€” {product.price}
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="font-display text-xl text-navy">Delivery Details</h2>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                    Enter details to order via WhatsApp
                                </p>
                            </>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-navy hover:text-navy transition-colors"
                        aria-label="Close"
                    >
                        <HiX className="text-base" />
                    </button>
                </div>

                {/* Options and Form */}
                {view === 'options' ? (
                    <div className="p-7 space-y-3">
                    {/* 1) Pay Online (PayHere) */}
                    <button
                        id="checkout-payhere-btn"
                        onClick={() => goToCheckout('payhere')}
                        className="w-full flex items-center gap-4 rounded-2xl bg-gold px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg group"
                    >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-navy/10 text-navy group-hover:bg-navy/20 transition-colors">
                            <HiCreditCard className="text-xl" />
                        </div>
                        <div>
                            <p className="font-bold text-navy text-sm">Pay Online (PayHere)</p>
                            <p className="text-[11px] text-navy/70 mt-0.5">Cards, bank & mobile â€” secure payment</p>
                        </div>
                        <span className="ml-auto text-navy/40 text-lg">â†’</span>
                    </button>

                    {/* 2) WhatsApp Order */}
                    <button
                        id="checkout-whatsapp-btn"
                        onClick={handleWhatsAppClick}
                        className="w-full flex items-center gap-4 rounded-2xl border-2 border-[#25D366] px-5 py-4 text-left transition-all hover:bg-[#25D366]/5 hover:-translate-y-0.5 group"
                    >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366]/20 transition-colors">
                            <FaWhatsapp className="text-xl" />
                        </div>
                        <div>
                            <p className="font-bold text-navy text-sm">WhatsApp Order</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Chat with us directly to confirm</p>
                        </div>
                        <span className="ml-auto text-slate-300 text-lg">â†’</span>
                    </button>

                    {/* 3) Bank Transfer */}
                    <button
                        id="checkout-bank-btn"
                        onClick={() => goToCheckout('bank_transfer')}
                        className="w-full flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left transition-all hover:border-navy hover:bg-white hover:-translate-y-0.5 group"
                    >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-navy/10 group-hover:text-navy transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-navy text-sm">Bank Transfer</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Direct bank deposit â€” we confirm manually</p>
                        </div>
                        <span className="ml-auto text-slate-300 text-lg">â†’</span>
                    </button>

                    {/* 4) Cash on Delivery */}
                    <button
                        id="checkout-cod-btn"
                        onClick={() => goToCheckout('cod')}
                        className="w-full flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left transition-all hover:border-navy hover:bg-white hover:-translate-y-0.5 group"
                    >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-navy/10 group-hover:text-navy transition-colors">
                            <HiCash className="text-xl" />
                        </div>
                        <div>
                            <p className="font-bold text-navy text-sm">Cash on Delivery</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Pay when your order arrives</p>
                        </div>
                        <span className="ml-auto text-slate-300 text-lg">â†’</span>
                    </button>
                    </div>
                ) : (
                    <form onSubmit={submitWhatsAppOrder} className="p-7 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div>
                            <label className="block text-sm font-medium text-navy mb-1" htmlFor="wa-name">Name</label>
                            <input 
                                id="wa-name"
                                type="text" 
                                required 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                                placeholder="Your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-navy mb-1" htmlFor="wa-address">Address</label>
                            <textarea 
                                id="wa-address"
                                required 
                                value={formData.address} 
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy resize-none"
                                placeholder="Your delivery address"
                                rows="2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-navy mb-1" htmlFor="wa-phone">Phone number</label>
                            <input 
                                id="wa-phone"
                                type="tel" 
                                required 
                                value={formData.phone} 
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                                placeholder="Your phone number"
                            />
                        </div>
                        <div className="pt-2 flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setView('options')}
                                className="flex-1 rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
                            >
                                Back
                            </button>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 transition-all hover:-translate-y-0.5 hover:bg-[#20bd5a] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <FaWhatsapp className="text-lg" /> {submitting ? 'Saving…' : 'Send'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Footer note */}
                <p className="pb-5 text-center text-[10px] text-slate-400">
                    ðŸ”’ All transactions are secure and encrypted
                </p>
            </div>
        </div>
    );
}
