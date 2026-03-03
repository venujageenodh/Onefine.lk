import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import logo from './assets/onefine-logo.png';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const ORDER_STATUS_OPTIONS = ['New', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_STATUS_OPTIONS = ['Pending', 'Paid', 'Failed'];

const STATUS_COLORS = {
    New: 'bg-blue-50 text-blue-700 border-blue-100',
    Processing: 'bg-amber-50 text-amber-700 border-amber-100',
    Shipped: 'bg-purple-50 text-purple-700 border-purple-100',
    Delivered: 'bg-green-50 text-green-700 border-green-100',
    Cancelled: 'bg-red-50 text-red-500 border-red-100',
};

const PAYMENT_COLORS = {
    Pending: 'bg-slate-100 text-slate-600',
    Paid: 'bg-green-100 text-green-700',
    Failed: 'bg-red-100 text-red-600',
};

const METHOD_LABELS = {
    payhere: '💳 PayHere',
    bank_transfer: '🏦 Bank Transfer',
    cod: '💵 Cash on Delivery',
    whatsapp: '💬 WhatsApp',
};

function LoginScreen({ onLogin }) {
    const { login, error, loading } = onLogin;
    const [password, setPassword] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy to-slate-800 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="OneFine" className="h-16 w-auto object-contain mb-3" />
                    <h1 className="font-display text-2xl tracking-[0.18em] text-white">ONEFINE ADMIN</h1>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 mt-0.5">Orders Management</p>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-7 shadow-2xl">
                    <h2 className="text-white font-semibold text-lg mb-1">Sign in</h2>
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Admin password"
                            autoFocus
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                        />
                        {error && <p className="text-xs text-red-400">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full rounded-full bg-gold py-2.5 text-sm font-semibold text-navy disabled:opacity-50"
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>
                </div>
                <p className="text-center text-xs text-slate-600 mt-4">
                    <a href="/admin" className="hover:text-slate-400">← Products Dashboard</a>
                </p>
            </div>
        </div>
    );
}

export default function AdminOrdersPage() {
    const auth = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState('All');
    const [expandedOrder, setExpandedOrder] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchOrders = async () => {
        if (!auth.token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/orders`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load orders');
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth.isAuthenticated) fetchOrders();
    }, [auth.isAuthenticated, auth.token]);

    const updateStatus = async (orderId, field, value) => {
        try {
            const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({ [field]: value }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Update failed');
            setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
            showToast('Status updated');
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    if (!auth.isAuthenticated) return <LoginScreen onLogin={auth} />;

    const filteredOrders =
        filter === 'All' ? orders : orders.filter((o) => o.orderStatus === filter);

    const stats = {
        total: orders.length,
        new: orders.filter((o) => o.orderStatus === 'New').length,
        paid: orders.filter((o) => o.paymentStatus === 'Paid').length,
        revenue: orders
            .filter((o) => o.paymentStatus === 'Paid')
            .reduce((sum, o) => sum + (o.total || 0), 0),
    };

    return (
        <div className="min-h-screen bg-slate-50 text-navy font-sans">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-2.5 text-sm font-medium shadow-soft ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-navy text-white'}`}>
                    {toast.msg}
                </div>
            )}

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="OneFine" className="h-10 w-auto object-contain" />
                        <div className="leading-tight">
                            <h1 className="font-display text-xl tracking-[0.18em] text-navy">ONEFINE — Orders</h1>
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Admin Panel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href="/admin" className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:border-navy hover:text-navy transition-colors">
                            Products
                        </a>
                        <button
                            onClick={fetchOrders}
                            className="rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-navy hover:bg-gold/20 transition-colors"
                        >
                            ↻ Refresh
                        </button>
                        <button
                            onClick={auth.logout}
                            className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Orders', value: stats.total },
                        { label: 'New Orders', value: stats.new, highlight: Boolean(stats.new) },
                        { label: 'Paid Orders', value: stats.paid },
                        { label: 'Revenue (Paid)', value: `Rs. ${stats.revenue.toLocaleString('en-LK')}` },
                    ].map((s) => (
                        <div key={s.label} className={`rounded-2xl bg-white p-5 shadow-sm border ${s.highlight ? 'border-gold' : 'border-slate-100'}`}>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500">{s.label}</p>
                            <p className={`mt-1 font-display text-xl ${s.highlight ? 'text-gold' : 'text-navy'}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 flex-wrap mb-6">
                    {['All', ...ORDER_STATUS_OPTIONS].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${filter === status
                                    ? 'bg-navy text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-navy'
                                }`}
                        >
                            {status}
                            {status !== 'All' && (
                                <span className="ml-1.5 opacity-60">
                                    ({orders.filter((o) => o.orderStatus === status).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Orders Table / List */}
                {loading ? (
                    <div className="py-24 text-center text-slate-400 text-sm">Loading orders…</div>
                ) : error ? (
                    <div className="py-24 text-center text-red-500 text-sm">{error}</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-24 text-center text-slate-400 text-sm">No orders found.</div>
                ) : (
                    <div className="space-y-3">
                        {filteredOrders.map((order) => {
                            const isExpanded = expandedOrder === order._id;
                            return (
                                <div key={order._id} className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                                    {/* Row */}
                                    <div
                                        className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_160px_140px_120px_auto] gap-4 items-center px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-navy">
                                                {order.customerName}
                                                <span className="ml-2 font-mono text-[10px] text-slate-400">#{order._id.slice(-6).toUpperCase()}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">{order.customerPhone} · {order.customerCity}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleString('en-LK')}</p>
                                        </div>

                                        <div className="hidden sm:block">
                                            <p className="text-xs text-slate-500">Method</p>
                                            <p className="text-xs font-medium text-navy mt-0.5">{METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</p>
                                        </div>

                                        <div className="hidden sm:block">
                                            <p className="text-xs text-slate-500">Total</p>
                                            <p className="text-sm font-bold text-navy mt-0.5">Rs. {(order.total || 0).toLocaleString('en-LK')}</p>
                                        </div>

                                        <div className="hidden sm:flex flex-col gap-1.5">
                                            <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[order.orderStatus] || 'bg-slate-50 text-slate-500'}`}>
                                                {order.orderStatus}
                                            </span>
                                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${PAYMENT_COLORS[order.paymentStatus] || 'bg-slate-100 text-slate-500'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>

                                        <div className="text-slate-400 text-sm">
                                            {isExpanded ? '▲' : '▼'}
                                        </div>
                                    </div>

                                    {/* Expanded Detail */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 px-5 py-5 space-y-5 bg-slate-50/50">
                                            {/* Items */}
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Order Items</p>
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3 rounded-xl bg-white border border-slate-100 px-4 py-3">
                                                        {item.image && (
                                                            <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover border border-slate-100" />
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="text-xs font-semibold text-navy">{item.name}</p>
                                                            <p className="text-[11px] text-slate-500">{item.price} × {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Customer Details */}
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Customer Info</p>
                                                    <div className="rounded-xl bg-white border border-slate-100 p-4 text-xs space-y-1.5">
                                                        <p><span className="text-slate-500">Name: </span><span className="font-semibold text-navy">{order.customerName}</span></p>
                                                        <p><span className="text-slate-500">Phone: </span><a href={`tel:${order.customerPhone}`} className="font-semibold text-navy hover:text-gold">{order.customerPhone}</a></p>
                                                        <p><span className="text-slate-500">Address: </span><span className="font-semibold text-navy">{order.customerAddress}</span></p>
                                                        <p><span className="text-slate-500">City: </span><span className="font-semibold text-navy">{order.customerCity}</span></p>
                                                        {order.customerNotes && <p><span className="text-slate-500">Notes: </span><span className="italic text-slate-600">{order.customerNotes}</span></p>}
                                                    </div>
                                                </div>

                                                {/* Update Status */}
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Update Status</p>
                                                    <div className="rounded-xl bg-white border border-slate-100 p-4 space-y-3">
                                                        <div>
                                                            <label className="text-[10px] text-slate-500 uppercase tracking-wider">Order Status</label>
                                                            <select
                                                                value={order.orderStatus}
                                                                onChange={(e) => updateStatus(order._id, 'orderStatus', e.target.value)}
                                                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-navy outline-none focus:border-gold"
                                                            >
                                                                {ORDER_STATUS_OPTIONS.map((s) => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-slate-500 uppercase tracking-wider">Payment Status</label>
                                                            <select
                                                                value={order.paymentStatus}
                                                                onChange={(e) => updateStatus(order._id, 'paymentStatus', e.target.value)}
                                                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-navy outline-none focus:border-gold"
                                                            >
                                                                {PAYMENT_STATUS_OPTIONS.map((s) => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price Summary */}
                                            <div className="flex justify-end">
                                                <div className="rounded-xl bg-white border border-slate-100 px-5 py-3 text-xs space-y-1 min-w-[180px]">
                                                    <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>Rs. {(order.subtotal || 0).toLocaleString('en-LK')}</span></div>
                                                    <div className="flex justify-between text-slate-500"><span>Delivery</span><span>Rs. {(order.deliveryCharge || 0).toLocaleString('en-LK')}</span></div>
                                                    <div className="flex justify-between font-bold text-navy border-t border-slate-100 pt-1 mt-1"><span>Total</span><span>Rs. {(order.total || 0).toLocaleString('en-LK')}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
