import React, { useState, useEffect } from 'react';
import { HiOutlineShoppingBag, HiCheck, HiArrowLeft } from 'react-icons/hi';
import logo from './assets/onefine-logo.png';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const DELIVERY_CHARGE = 350;

const PAYHERE_MERCHANT_ID = import.meta.env.VITE_PAYHERE_MERCHANT_ID || '1228941';
const PAYHERE_SANDBOX = import.meta.env.VITE_PAYHERE_SANDBOX === 'true';
const PAYHERE_URL = PAYHERE_SANDBOX
    ? 'https://sandbox.payhere.lk/pay/checkout'
    : 'https://www.payhere.lk/pay/checkout';

function extractNumericPrice(priceStr) {
    if (!priceStr) return 0;
    const cleaned = String(priceStr).replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
}

const BANK_DETAILS = {
    bank: 'Sampath Bank',
    accountName: 'OneFine (Pvt) Ltd',
    accountNumber: '1234 5678 9012',
    branch: 'Imbulgoda',
};

export default function CheckoutPage() {
    const params = new URLSearchParams(window.location.search);
    const productName = params.get('productName') || '';
    const productPrice = params.get('productPrice') || '';
    const productImage = params.get('productImage') || '';
    const productId = params.get('productId') || '';
    const method = params.get('method') || 'payhere';

    const numericPrice = extractNumericPrice(productPrice);
    const total = numericPrice + DELIVERY_CHARGE;

    const [form, setForm] = useState({
        name: '', phone: '', address: '', city: '', notes: '',
    });
    const [qty, setQty] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [orderId, setOrderId] = useState(null);

    const subtotal = numericPrice * qty;
    const orderTotal = subtotal + DELIVERY_CHARGE;

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const buildOrderPayload = () => ({
        customerName: form.name,
        customerPhone: form.phone,
        customerAddress: form.address,
        customerCity: form.city,
        customerNotes: form.notes,
        items: [{ productId, name: productName, price: productPrice, quantity: qty, image: productImage }],
        subtotal,
        deliveryCharge: DELIVERY_CHARGE,
        total: orderTotal,
        paymentMethod: method,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buildOrderPayload()),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Order failed');

            const createdOrderId = data.orderId;

            if (method === 'payhere') {
                // Submit PayHere form
                setOrderId(createdOrderId);
                setTimeout(() => {
                    document.getElementById('payhere-form')?.submit();
                }, 200);
            } else {
                // Bank transfer or COD — go to confirmation
                window.location.href = `/order-confirmation?orderId=${createdOrderId}&method=${method}&name=${encodeURIComponent(form.name)}`;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const methodLabel = {
        payhere: 'Pay Online (PayHere)',
        bank_transfer: 'Bank Transfer',
        cod: 'Cash on Delivery',
    }[method] || method;

    const methodColor = {
        payhere: 'bg-gold text-navy',
        bank_transfer: 'bg-slate-100 text-slate-700',
        cod: 'bg-slate-100 text-slate-700',
    }[method] || 'bg-slate-100 text-slate-700';

    return (
        <div className="min-h-screen bg-slate-50 text-navy">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
                    <a href="/" className="flex items-center gap-3">
                        <img src={logo} alt="OneFine" className="h-10 w-auto object-contain" />
                        <div className="leading-tight">
                            <div className="font-display text-lg tracking-[0.18em] text-navy">ONEFINE</div>
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Checkout</p>
                        </div>
                    </a>
                    <a
                        href={productId ? `/shop` : `/`}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-navy transition-colors"
                    >
                        <HiArrowLeft /> Back
                    </a>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

                    {/* ── Left: Form ──────────────────────────────────────── */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="font-display text-2xl text-navy">Complete Your Order</h1>
                            <p className="text-xs text-slate-500 mt-1">Fill in your delivery details below.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5" id="checkout-form">
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                                <h2 className="font-semibold text-sm text-navy uppercase tracking-widest">
                                    Delivery Details
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Your full name"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="+94 7X XXX XXXX"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="House No, Street, Area"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={form.notes}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder="Any special instructions for your order..."
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* Bank Transfer Details */}
                            {method === 'bank_transfer' && (
                                <div className="rounded-2xl bg-navy/5 border border-navy/10 p-6 space-y-3">
                                    <h2 className="font-semibold text-sm text-navy uppercase tracking-widest">
                                        Bank Transfer Details
                                    </h2>
                                    <p className="text-xs text-slate-600">
                                        Please transfer the total amount to the account below and place your order. We'll confirm once payment is received.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <span className="text-slate-500">Bank</span>
                                        <span className="font-semibold text-navy">{BANK_DETAILS.bank}</span>
                                        <span className="text-slate-500">Account Name</span>
                                        <span className="font-semibold text-navy">{BANK_DETAILS.accountName}</span>
                                        <span className="text-slate-500">Account No.</span>
                                        <span className="font-semibold text-navy font-mono">{BANK_DETAILS.accountNumber}</span>
                                        <span className="text-slate-500">Branch</span>
                                        <span className="font-semibold text-navy">{BANK_DETAILS.branch}</span>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                id="checkout-submit-btn"
                                className="w-full rounded-xl bg-gold py-4 text-sm font-bold text-navy shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lg hover:bg-gold-soft disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Processing…' : method === 'payhere' ? 'Continue to Payment →' : 'Place Order →'}
                            </button>
                        </form>
                    </div>

                    {/* ── Right: Order Summary ─────────────────────────────── */}
                    <aside>
                        <div className="sticky top-24 space-y-4">
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                                <h2 className="font-display text-lg text-navy mb-4">Order Summary</h2>
                                <div className="flex gap-4 items-start pb-4 border-b border-slate-100">
                                    {productImage && (
                                        <img
                                            src={productImage}
                                            alt={productName}
                                            className="h-16 w-16 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-navy line-clamp-2">{productName}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{productPrice}</p>
                                    </div>
                                </div>

                                {/* Qty */}
                                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                    <span className="text-xs text-slate-500">Quantity</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                                            className="h-7 w-7 rounded-full border border-slate-200 text-slate-500 text-sm hover:border-navy hover:text-navy transition-colors"
                                        >−</button>
                                        <span className="w-6 text-center text-sm font-semibold text-navy">{qty}</span>
                                        <button
                                            type="button"
                                            onClick={() => setQty((q) => q + 1)}
                                            className="h-7 w-7 rounded-full border border-slate-200 text-slate-500 text-sm hover:border-navy hover:text-navy transition-colors"
                                        >+</button>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-3">
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Subtotal</span>
                                        <span>Rs. {subtotal.toLocaleString('en-LK')}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Delivery</span>
                                        <span>Rs. {DELIVERY_CHARGE.toLocaleString('en-LK')}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-sm text-navy pt-2 border-t border-slate-100">
                                        <span>Total</span>
                                        <span>Rs. {orderTotal.toLocaleString('en-LK')}</span>
                                    </div>
                                </div>

                                <div className={`mt-4 rounded-xl px-3 py-2 text-[11px] font-medium text-center ${methodColor}`}>
                                    {methodLabel}
                                </div>
                            </div>

                            <p className="text-center text-[10px] text-slate-400">🔒 Secure checkout — Island-wide delivery</p>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Hidden PayHere form — submitted programmatically after order is created */}
            {orderId && (
                <form
                    id="payhere-form"
                    method="POST"
                    action={PAYHERE_URL}
                    style={{ display: 'none' }}
                >
                    <input type="hidden" name="merchant_id" value={PAYHERE_MERCHANT_ID} />
                    <input type="hidden" name="return_url" value={`${window.location.origin}/order-confirmation?orderId=${orderId}&method=payhere&name=${encodeURIComponent(form.name)}`} />
                    <input type="hidden" name="cancel_url" value={window.location.href} />
                    <input type="hidden" name="notify_url" value={`${window.location.origin}/api/payhere/notify`} />
                    <input type="hidden" name="order_id" value={orderId} />
                    <input type="hidden" name="items" value={productName} />
                    <input type="hidden" name="currency" value="LKR" />
                    <input type="hidden" name="amount" value={orderTotal.toFixed(2)} />
                    <input type="hidden" name="first_name" value={form.name.split(' ')[0]} />
                    <input type="hidden" name="last_name" value={form.name.split(' ').slice(1).join(' ') || '-'} />
                    <input type="hidden" name="email" value="customer@onefine.lk" />
                    <input type="hidden" name="phone" value={form.phone} />
                    <input type="hidden" name="address" value={form.address} />
                    <input type="hidden" name="city" value={form.city} />
                    <input type="hidden" name="country" value="Sri Lanka" />
                </form>
            )}
        </div>
    );
}
