import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch, formatLKR, formatDateTime, StatusBadge, apiUrl, formatDate } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';
import { HiSearch, HiFilter, HiChevronRight, HiDownload, HiPrinter, HiTruck, HiCheckCircle, HiXCircle, HiDotsVertical, HiCalendar } from 'react-icons/hi';

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'DISPATCHED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

function SectionHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-lg font-black text-[#1B2A4A] tracking-tight">{title}</h2>
                {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

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

    const downloadPdf = (type, id) => window.open(apiUrl(`/pdf/${type}/${id}?token=${token}`), '_blank');

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 group">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C9A84C] transition-colors" />
                        <input placeholder="Find client, phone or order reference..." value={filters.q}
                            onChange={e => setFilters(f => ({ ...f, q: e.target.value, page: 1 }))}
                            className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3.5 text-sm outline-none focus:border-[#C9A84C] transition-all bg-slate-50/50 focus:bg-white" />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-48">
                            <HiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
                                className="w-full appearance-none rounded-2xl border border-slate-200 pl-11 pr-4 py-3.5 text-xs font-black uppercase tracking-widest outline-none focus:border-[#C9A84C] bg-slate-50/50 cursor-pointer">
                                <option value="">Order Stages</option>
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="relative flex-1 sm:w-48">
                            <select value={filters.paymentStatus} onChange={e => setFilters(f => ({ ...f, paymentStatus: e.target.value, page: 1 }))}
                                className="w-full appearance-none rounded-2xl border border-slate-200 px-6 py-3.5 text-xs font-black uppercase tracking-widest outline-none focus:border-[#C9A84C] bg-slate-50/50 cursor-pointer">
                                <option value="">Payments</option>
                                {['UNPAID', 'PARTIALLY_PAID', 'PAID'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {['ALL', 'PENDING', 'PROCESSING', 'DISPATCHED'].map(s => (
                        <button key={s} onClick={() => setFilters(f => ({ ...f, status: s === 'ALL' ? '' : s }))}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all border ${
                                (filters.status === s || (s === 'ALL' && !filters.status)) ? 'bg-[#1B2A4A] border-[#1B2A4A] text-[#C9A84C] shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                            }`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Layout Toggle and Summary */}
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Operational Pipeline <span className="text-[#1B2A4A] ml-2">{total} Total Orders</span>
                </p>
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#1B2A4A] transition-colors"><HiDownload /></button>
                </div>
            </div>

            {/* Premium Table Content */}
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] border-b border-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-left">Internal Reference</th>
                                <th className="px-8 py-5 text-left">Client Information</th>
                                <th className="px-8 py-5 text-right">Value (LKR)</th>
                                <th className="px-8 py-5 text-center">Settlement</th>
                                <th className="px-8 py-5 text-center">Operation Stage</th>
                                <th className="px-8 py-5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-full border-4 border-[#C9A84C] border-t-transparent animate-spin mb-4" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Querying Operational Database...</p>
                                    </div>
                                </td></tr>
                            ) : orders.map(o => (
                                <tr key={o._id} className="hover:bg-slate-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-[#1B2A4A] font-mono text-xs">{o.orderNumber}</span>
                                            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{formatDateTime(o.createdAt).split(',')[0]}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-[#1B2A4A]">
                                                {o.customer?.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1B2A4A] leading-tight">{o.customer?.name || o.customerName}</p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{o.customer?.phone || o.customerPhone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="font-black text-[#1B2A4A]">{formatLKR(o.total)}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{o.items?.length || 1} Items</p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <StatusBadge status={o.paymentStatus || 'UNPAID'} />
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <StatusBadge status={o.orderStatus || o.status || 'NEW'} />
                                            {o.timeline?.length > 0 && (
                                                <span className="text-[8px] font-black text-slate-400 mt-1.5 uppercase tracking-widest">Last: {formatDate(o.timeline[o.timeline.length-1].at)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <button onClick={() => { setSelected(o); setNewStatus(o.orderStatus || 'PENDING'); }}
                                            className="px-4 py-2 rounded-xl bg-slate-50 text-[10px] font-black text-[#1B2A4A] uppercase tracking-widest hover:bg-[#1B2A4A] hover:text-[#C9A84C] transition-all shadow-sm">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && !orders.length && (
                                <tr><td colSpan={6} className="py-20 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No active orders matching criteria</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order detail view overlay */}
            {selected && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end bg-[#1B2A4A]/40 backdrop-blur-sm transition-all">
                    <div className="h-full w-full max-w-2xl bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
                            <div>
                                <h2 className="text-xl font-black text-[#1B2A4A] tracking-tight">Order {selected.orderNumber}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Placed on {formatDateTime(selected.createdAt)}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#1B2A4A] transition-all text-2xl">×</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            {/* Workflow Stepper */}
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                <SectionHeader title="Fulfilment Progress" subtitle="Current Order Stage" />
                                <div className="relative flex items-center justify-between px-2 pt-4">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
                                    {['PENDING', 'PROCESSING', 'DISPATCHED', 'COMPLETED'].map((s, i) => {
                                        const stages = ['PENDING', 'PROCESSING', 'DISPATCHED', 'COMPLETED'];
                                        const currentIdx = stages.indexOf(selected.orderStatus);
                                        const thisIdx = stages.indexOf(s);
                                        const isActive = thisIdx <= currentIdx;
                                        const isCurrent = thisIdx === currentIdx;

                                        return (
                                            <div key={s} className="relative z-10 flex flex-col items-center">
                                                <div onClick={() => !updating && setNewStatus(s)} className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-300 cursor-pointer ${
                                                    isActive ? 'bg-[#1B2A4A] border-[#C9A84C] text-white' : 'bg-white border-slate-200 text-slate-300'
                                                } ${isCurrent ? 'ring-4 ring-[#C9A84C]/20 scale-110' : 'hover:scale-105'}`}>
                                                    {isActive && thisIdx < currentIdx ? <HiCheckCircle className="text-sm" /> : <span className="text-[10px] font-black">{i + 1}</span>}
                                                </div>
                                                <span className={`mt-2 text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-[#1B2A4A]' : 'text-slate-300'}`}>{s}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-8 space-y-3">
                                    <div className="relative group">
                                        <input placeholder="Attach progress note..." value={statusNote} onChange={e => setStatusNote(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-[#C9A84C] transition-all bg-white" />
                                    </div>
                                    <button onClick={updateStatus} disabled={updating}
                                        className="w-full rounded-xl bg-[#1B2A4A] py-3 text-xs font-black text-[#C9A84C] uppercase tracking-widest shadow-md hover:bg-[#243a5e] transition-all disabled:opacity-50">
                                        {updating ? 'Updating Pipeline...' : `Update Status to ${newStatus}`}
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-8 grid-cols-2">
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Client Details</h3>
                                    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Customer Name</p>
                                            <p className="text-sm font-bold text-[#1B2A4A]">{selected.customer?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Phone / Email</p>
                                            <p className="text-xs font-medium text-slate-600">{selected.customer?.phone} • {selected.customer?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Delivery Address</p>
                                            <p className="text-xs font-medium text-slate-600 leading-relaxed">{selected.customer?.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Financials</h3>
                                    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Total Value</p>
                                            <p className="text-sm font-black text-[#1B2A4A]">{formatLKR(selected.total)}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Settlement</p>
                                            <StatusBadge status={selected.paymentStatus} />
                                        </div>
                                        <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Items</p>
                                            <p className="text-[10px] font-black text-[#C9A84C]">{selected.items?.length} SKUs</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#1B2A4A] rounded-3xl p-8 relative overflow-hidden shadow-xl">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <h3 className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest mb-6 relative z-10">Order Timeline</h3>
                                <div className="space-y-6 relative z-10">
                                    {(selected.timeline || []).map((t, i) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-[#C9A84C] group-last:bg-[#C9A84C] ring-4 ring-[#C9A84C]/20" />
                                                <div className="w-0.5 h-full bg-slate-700/50 group-last:bg-transparent my-1" />
                                            </div>
                                            <div className="pb-2">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[9px] font-black text-[#C9A84C] uppercase tracking-widest">{t.status}</p>
                                                    <span className="text-[8px] text-white/30 font-bold">• {formatDateTime(t.at)}</span>
                                                </div>
                                                <p className="text-[11px] text-white/70 font-medium mt-1 uppercase tracking-wide">{t.note}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selected.timeline || selected.timeline.length === 0) && (
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-center py-4">No activity history yet</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                            <button onClick={() => downloadPdf('proforma', selected._id)} className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] hover:bg-slate-100 transition-all">
                                <HiPrinter className="text-lg" /> Download Invoice
                            </button>
                            <button onClick={() => downloadPdf('delivery', selected._id)} className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] hover:bg-slate-100 transition-all">
                                <HiTruck className="text-lg" /> Delivery Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
