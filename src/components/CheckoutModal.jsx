import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { HiX, HiCreditCard, HiCash, HiBanknotes } from 'react-icons/hi';

export default function CheckoutModal({ product, onClose }) {
    if (!product) return null;

    const handleWhatsApp = () => {
        const msg =
            `🛍️ *OneFine Order Request*\n\n` +
            `• *Product:* ${product.name}\n` +
            `• *Price:* ${product.price}\n` +
            `• *Qty:* 1\n\n` +
            `Please send me your checkout details. I'd like to confirm this order.\n\n` +
            `(Reply with your: Name / Address / Phone)`;
        window.open(`https://wa.me/94768121701?text=${encodeURIComponent(msg)}`, '_blank');
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
                        <h2 className="font-display text-xl text-navy">Choose Checkout Method</h2>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {product.name} — {product.price}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-navy hover:text-navy transition-colors"
                        aria-label="Close"
                    >
                        <HiX className="text-base" />
                    </button>
                </div>

                {/* Options */}
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
                            <p className="text-[11px] text-navy/70 mt-0.5">Cards, bank & mobile — secure payment</p>
                        </div>
                        <span className="ml-auto text-navy/40 text-lg">→</span>
                    </button>

                    {/* 2) WhatsApp Order */}
                    <button
                        id="checkout-whatsapp-btn"
                        onClick={handleWhatsApp}
                        className="w-full flex items-center gap-4 rounded-2xl border-2 border-[#25D366] px-5 py-4 text-left transition-all hover:bg-[#25D366]/5 hover:-translate-y-0.5 group"
                    >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366]/20 transition-colors">
                            <FaWhatsapp className="text-xl" />
                        </div>
                        <div>
                            <p className="font-bold text-navy text-sm">WhatsApp Order</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Chat with us directly to confirm</p>
                        </div>
                        <span className="ml-auto text-slate-300 text-lg">→</span>
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
                            <p className="text-[11px] text-slate-500 mt-0.5">Direct bank deposit — we confirm manually</p>
                        </div>
                        <span className="ml-auto text-slate-300 text-lg">→</span>
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
                        <span className="ml-auto text-slate-300 text-lg">→</span>
                    </button>
                </div>

                {/* Footer note */}
                <p className="pb-5 text-center text-[10px] text-slate-400">
                    🔒 All transactions are secure and encrypted
                </p>
            </div>
        </div>
    );
}
