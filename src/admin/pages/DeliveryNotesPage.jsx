import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch, formatDateTime, StatusBadge, apiUrl, formatDate } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';
import { HiTruck, HiSearch, HiFilter, HiPrinter, HiChevronRight, HiLocationMarker, HiClock } from 'react-icons/hi';

function SectionHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-2xl font-black text-[#1B2A4A] tracking-tight">{title}</h2>
                {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

const SHIPPING_STATUSES = ['PACKED', 'SHIPPED', 'DELIVERED'];

export default function DeliveryNotesPage() {
    const { token } = useAdminAuth();
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: 'PACKED', q: '', page: 1 });

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

    const downloadPdf = (id) => window.open(apiUrl(`/pdf/delivery/${id}?token=${token}`), '_blank');

    return (
        <div className="space-y-4">
            <SectionHeader 
                title="Logistics Pipeline" 
                subtitle="Dispatch & Fulfillment Tracking"
                action={
                    <div className="flex gap-4">
                        <div className="relative group min-w-[280px]">
                            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C9A84C] transition-colors" />
                            <input placeholder="Locate by route / client / order..." value={filters.q}
                                onChange={e => setFilters(f => ({ ...f, q: e.target.value, page: 1 }))}
                                className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 text-xs outline-none focus:border-[#C9A84C] transition-all bg-white" />
                        </div>
                    </div>
                }
            />

            {/* Logistics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Pending Dispatch', value: orders.filter(o => o.orderStatus === 'PACKED').length, icon: HiClock, color: 'navy' },
                    { label: 'In Transit', value: orders.filter(o => o.orderStatus === 'SHIPPED').length, icon: HiTruck, color: 'gold' },
                    { label: 'Operational Capacity', value: total, icon: HiLocationMarker, color: 'navy' },
                ].map((s, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-[#1B2A4A]/20 transition-all">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${s.color === 'gold' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'bg-[#1B2A4A]/10 text-[#1B2A4A]'}`}>
                            <s.icon />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <p className="text-xl font-black text-[#1B2A4A] mt-0.5">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                {['ALL', ...SHIPPING_STATUSES].map(s => (
                    <button key={s} onClick={() => setFilters(f => ({ ...f, status: s === 'ALL' ? '' : s }))}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all border ${
                            (filters.status === s || (s === 'ALL' && !filters.status)) ? 'bg-[#1B2A4A] border-[#1B2A4A] text-[#C9A84C] shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Desktop Logistics Grid */}
            <div className="hidden sm:block rounded-[40px] bg-white border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] border-b border-slate-50">
                            <tr>
                                <th className="px-8 py-6 text-left">Manifest Ref</th>
                                <th className="px-8 py-6 text-left">Cargo & Client</th>
                                <th className="px-8 py-6 text-left">Destination</th>
                                <th className="px-8 py-6 text-center">Fulfillment Status</th>
                                <th className="px-8 py-6 text-center">Manifest</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="py-24 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full border-4 border-[#C9A84C] border-t-transparent animate-spin mb-4" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Syncing Logistics Grid...</p>
                                    </div>
                                </td></tr>
                            ) : (orders || []).map(o => (
                                <tr key={o._id} className="hover:bg-slate-50/30 group transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs font-black text-[#1B2A4A]">{o.orderNumber}</span>
                                            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{formatDate(o.createdAt)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#1B2A4A] flex items-center justify-center text-white text-[10px] font-black group-hover:bg-[#C9A84C] group-hover:text-[#1B2A4A] transition-all">
                                                {o.customer?.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1B2A4A] leading-tight">{o.customer?.name || o.customerName}</p>
                                                <p className="text-[9px] text-[#C9A84C] font-black uppercase mt-0.5 tracking-tighter">{o.items?.length || 1} Payload Items</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 group/loc">
                                            <HiLocationMarker className="text-slate-200 group-hover/loc:text-[#C9A84C]" />
                                            <span className="font-bold text-[#1B2A4A] text-[11px] uppercase tracking-wide">{o.customer?.city || o.customerCity || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center"><StatusBadge status={o.orderStatus || o.status || 'NEW'} /></td>
                                    <td className="px-8 py-6 text-center">
                                        <button onClick={() => downloadPdf(o._id)}
                                            className="px-6 py-2.5 rounded-2xl bg-slate-50 text-[10px] font-black text-[#1B2A4A] uppercase tracking-widest hover:bg-[#1B2A4A] hover:text-[#C9A84C] transition-all shadow-sm flex items-center gap-2 mx-auto">
                                            <HiPrinter className="text-lg" /> Print Note
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Logistics Deck */}
            <div className="sm:hidden space-y-4">
                {loading ? (
                    <div className="py-20 text-center animate-pulse">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Scanning Dispatch Queue...</p>
                    </div>
                ) : (orders || []).map(o => (
                    <div key={o._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-black text-[#1B2A4A]">{o.orderNumber}</span>
                            <StatusBadge status={o.orderStatus || o.status || 'NEW'} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1B2A4A] text-xs font-black">
                                {o.customer?.name?.[0]}
                            </div>
                            <div>
                                <p className="text-xs font-black text-[#1B2A4A]">{o.customer?.name || o.customerName}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{o.customer?.city || o.customerCity || '—'}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-[9px] font-black text-[#C9A84C] uppercase tracking-widest">{o.items?.length || 0} Items Packed</span>
                            <button onClick={() => downloadPdf(o._id)}
                                className="px-5 py-2 rounded-xl bg-[#1B2A4A] text-[9px] font-black text-[#C9A84C] uppercase tracking-widest shadow-lg">
                                Print Note
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
