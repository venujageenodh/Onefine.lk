import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatLKR, formatDateTime, StatusBadge, apiUrl } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

const ORDER_STATUSES = ['NEW', 'CONFIRMED', 'IN_PRODUCTION', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

export default function OrdersPage() {
    const { token, admin } = useAdminAuth();
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filters, setFilters] = useState({ status: '', paymentStatus: '', q: '', page: 1 });
    const [statusNote, setStatusNote] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const qs = new URLSearchParams({ ...filters, limit: 25 }).toString();
            const data = await apiFetch(`/biz/orders?${qs}`, {}, token);
            setOrders(data.orders || []);
            setTotal(data.total || 0);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [filters, token]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const updateStatus = async () => {
        if (!newStatus || !selected) return;
        setUpdating(true);
        try {
            await apiFetch(`/biz/orders/${selected._id}/status`, {
                method: 'PUT', body: JSON.stringify({ status: newStatus, note: statusNote }),
            }, token);
            setStatusNote(''); setNewStatus('');
            fetchOrders();
            setSelected(null);
        } catch (e) { alert(e.message); }
        finally { setUpdating(false); }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <input placeholder="Search name / phone / order #" value={filters.q}
                    onChange={e => setFilters(f => ({ ...f, q: e.target.value, page: 1 }))}
                    className="flex-1 min-w-[180px] rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]">
                    <option value="">All Statuses</option>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
                <select value={filters.paymentStatus} onChange={e => setFilters(f => ({ ...f, paymentStatus: e.target.value, page: 1 }))}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]">
                    <option value="">All Payments</option>
                    {['UNPAID', 'PART_PAID', 'PAID'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <span className="font-bold text-[#1B2A4A]">Orders <span className="text-slate-400 font-normal">({total})</span></span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                            <tr>
                                {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={8} className="py-10 text-center text-slate-400">Loading…</td></tr>
                            ) : orders.map(o => (
                                <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-[11px] font-bold text-[#1B2A4A]">{o.orderNumber || o._id?.slice(-6)}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-[#1B2A4A]">{o.customer?.name || o.customerName}</p>
                                        <p className="text-xs text-slate-400">{o.customer?.phone || o.customerPhone}</p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{o.items?.length ?? 1}</td>
                                    <td className="px-4 py-3 font-semibold">{formatLKR(o.total)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={o.paymentStatus || 'UNPAID'} /></td>
                                    <td className="px-4 py-3"><StatusBadge status={o.orderStatus || o.status || 'NEW'} /></td>
                                    <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(o.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => { setSelected(o); setNewStatus(o.orderStatus || 'NEW'); }}
                                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-[#1B2A4A] hover:text-[#1B2A4A]">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && !orders.length && (
                                <tr><td colSpan={8} className="py-10 text-center text-slate-400">No orders found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order detail modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h2 className="font-bold text-[#1B2A4A]">Order {selected.orderNumber || selected._id?.slice(-6)}</h2>
                            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Customer */}
                            <div className="rounded-xl bg-slate-50 p-4 text-sm">
                                <p className="font-bold text-[#1B2A4A]">{selected.customer?.name || selected.customerName}</p>
                                <p className="text-slate-500">{selected.customer?.phone || selected.customerPhone}</p>
                                <p className="text-slate-500">{selected.customer?.address || selected.customerAddress}, {selected.customer?.city || selected.customerCity}</p>
                            </div>

                            {/* Items */}
                            <div>
                                <p className="font-semibold text-xs text-slate-500 uppercase mb-2">Items</p>
                                {(selected.items || []).map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm py-1.5 border-b border-slate-50">
                                        <span>{item.name} × {item.qty}</span>
                                        <span className="font-semibold">{formatLKR(item.unitPrice * item.qty)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold text-sm pt-2">
                                    <span>Total</span><span>{formatLKR(selected.total)}</span>
                                </div>
                            </div>

                            {/* Timeline */}
                            {selected.timeline?.length > 0 && (
                                <div>
                                    <p className="font-semibold text-xs text-slate-500 uppercase mb-2">Timeline</p>
                                    <div className="space-y-2">
                                        {selected.timeline.map((t, i) => (
                                            <div key={i} className="flex gap-3 text-xs">
                                                <span className="text-slate-400 whitespace-nowrap">{new Date(t.at).toLocaleDateString('en-GB')}</span>
                                                <span className="font-semibold text-[#1B2A4A]">{t.status}</span>
                                                {t.note && <span className="text-slate-500">{t.note}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Update status */}
                            <div className="space-y-2">
                                <p className="font-semibold text-xs text-slate-500 uppercase">Update Status</p>
                                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]">
                                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                                </select>
                                <input placeholder="Add a note (optional)" value={statusNote} onChange={e => setStatusNote(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                                <button onClick={updateStatus} disabled={updating}
                                    className="w-full rounded-full bg-[#C9A84C] py-2.5 text-sm font-bold text-[#1B2A4A] disabled:opacity-60">
                                    {updating ? 'Saving…' : 'Save Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
