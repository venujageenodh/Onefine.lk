import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatLKR, formatDateTime, StatusBadge, apiUrl } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

export default function ProformaInvoicesPage() {
    const { token } = useAdminAuth();
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ paymentStatus: 'UNPAID', q: '', page: 1 });

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            // Reusing the biz orders endpoint but focusing on unpaid/part-paid for proforma
            const qs = new URLSearchParams({ ...filters, limit: 25 }).toString();
            const data = await apiFetch(`/biz/orders?${qs}`, {}, token);
            setOrders(data.orders || []);
            setTotal(data.total || 0);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [filters, token]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const downloadPdf = (id) => window.open(apiUrl(`/pdf/proforma/${id}?token=${token}`), '_blank');

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#1B2A4A] text-xl tracking-tight">Proforma Invoices</h2>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <input placeholder="Search name / phone / order #" value={filters.q}
                    onChange={e => setFilters(f => ({ ...f, q: e.target.value, page: 1 }))}
                    className="flex-1 min-w-[180px] rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                <select value={filters.paymentStatus} onChange={e => setFilters(f => ({ ...f, paymentStatus: e.target.value, page: 1 }))}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#C9A84C]">
                    <option value="">All Payments</option>
                    {['UNPAID', 'PART_PAID', 'PAID'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <span className="font-bold text-[#1B2A4A]">Draft Orders <span className="text-slate-400 font-normal">({total})</span></span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                            <tr>
                                {['Order #', 'Customer', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={7} className="py-10 text-center text-slate-400">Loading…</td></tr>
                            ) : orders.map(o => (
                                <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-[11px] font-bold text-[#1B2A4A]">{o.orderNumber || o._id?.slice(-6)}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-[#1B2A4A]">{o.customer?.name || o.customerName}</p>
                                        <p className="text-xs text-slate-400">{o.customer?.phone || o.customerPhone}</p>
                                    </td>
                                    <td className="px-4 py-3 font-semibold">{formatLKR(o.total)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={o.paymentStatus || 'UNPAID'} /></td>
                                    <td className="px-4 py-3"><StatusBadge status={o.orderStatus || o.status || 'NEW'} /></td>
                                    <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(o.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => downloadPdf(o._id)}
                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-[#1B2A4A] hover:border-[#C9A84C] hover:bg-slate-50 transition-all shadow-sm">
                                            <span>📄</span> Download PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && !orders.length && (
                                <tr><td colSpan={7} className="py-10 text-center text-slate-400">No matching orders found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
