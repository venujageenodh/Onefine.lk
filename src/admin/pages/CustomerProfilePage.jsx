import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { apiFetch, formatLKR, formatDateTime, formatDate, StatusBadge } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';
import { 
    HiSearch, HiUserGroup, HiCurrencyDollar, HiCheckCircle, 
    HiDotsHorizontal, HiChevronRight, HiMail, HiPhone, 
    HiOfficeBuilding, HiTag, HiOutlineDocumentText 
} from 'react-icons/hi';

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

function StatCard({ label, value, icon: Icon, color = "gold" }) {
    const colors = {
        gold: "bg-[#C9A84C]/10 text-[#C9A84C]",
        navy: "bg-[#1B2A4A]/10 text-[#1B2A4A]",
        slate: "bg-slate-100 text-slate-400"
    };
    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-[#C9A84C]/30 transition-all">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${colors[color]}`}>
                <Icon />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-xl font-black text-[#1B2A4A] mt-0.5">{value}</p>
            </div>
        </div>
    );
}

export default function CustomerProfilePage() {
    const { token } = useAdminAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [history, setHistory] = useState({ orders: [], quotations: [] });
    const [filters, setFilters] = useState({ q: '', page: 1 });
    const [total, setTotal] = useState(0);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch(`/customers?q=${filters.q}&page=${filters.page}`, {}, token);
            setCustomers(data.customers || []);
            setTotal(data.total || 0);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [filters, token]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const viewDetails = async (c) => {
        setSelected(c);
        setDetailLoading(true);
        try {
            const data = await apiFetch(`/customers/${c._id}`, {}, token);
            setHistory({ orders: data.orders || [], quotations: data.quotations || [] });
        } catch (e) { console.error(e); }
        finally { setDetailLoading(false); }
    };

    return (
        <div className="space-y-8 pb-20">
            <SectionHeader 
                title="Customer Relations" 
                subtitle="Lifetime Value & Interaction History"
                action={
                    <div className="relative group min-w-[300px]">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C9A84C] transition-colors" />
                        <input 
                            placeholder="Identify customer by name/phone..." 
                            value={filters.q}
                            onChange={e => setFilters(f => ({ ...f, q: e.target.value, page: 1 }))}
                            className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-all bg-white" 
                        />
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden pb-4">
                        <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Accounts</span>
                            <span className="text-[10px] font-black text-[#1B2A4A] bg-[#C9A84C]/20 px-2 py-0.5 rounded-full">{total}</span>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="p-10 text-center animate-pulse">
                                    <HiUserGroup className="mx-auto text-3xl text-slate-200 mb-2" />
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Loading CRM Data...</p>
                                </div>
                            ) : customers.map(c => (
                                <button key={c._id} onClick={() => viewDetails(c)}
                                    className={`w-full px-6 py-5 text-left transition-all hover:bg-slate-50/50 flex items-center justify-between group ${selected?._id === c._id ? 'bg-slate-50 border-l-4 border-[#C9A84C]' : 'border-l-4 border-transparent'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#1B2A4A] flex items-center justify-center text-white text-xs font-black">
                                            {c.name?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#1B2A4A] leading-tight">{c.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">{c.city || 'No Location'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <HiChevronRight className={`text-slate-200 group-hover:text-[#C9A84C] transition-all ${selected?._id === c._id ? 'text-[#C9A84C] translate-x-1' : ''}`} />
                                        <span className="text-[8px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase">{formatLKR(c.totalSpend)}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {!loading && customers.length === 0 && (
                            <p className="p-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No customers found</p>
                        )}
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-2">
                    {!selected ? (
                        <div className="h-full min-h-[500px] bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center opacity-60">
                            <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center text-3xl text-[#1B2A4A] mb-6">
                                <HiUserGroup />
                            </div>
                            <h3 className="text-lg font-black text-[#1B2A4A] tracking-tight">Select a Prospect or Client</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-xs leading-loose">Choose a profile from the sidebar to visualize their lifecycle, spend analytics and interaction history.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Profile Header */}
                            <div className="bg-[#1B2A4A] rounded-[40px] p-8 relative overflow-hidden shadow-xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C] rounded-full blur-[100px] opacity-10 -mr-32 -mt-32"></div>
                                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-3xl font-black text-[#1B2A4A] shadow-2xl ring-4 ring-white/10">
                                            {selected.name?.[0]}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white tracking-tight">{selected.name}</h2>
                                            <div className="flex flex-wrap gap-4 mt-2">
                                                {selected.email && <span className="flex items-center gap-2 text-[10px] font-bold text-white/60 uppercase tracking-widest"><HiMail className="text-[#C9A84C]" /> {selected.email}</span>}
                                                {selected.phone && <span className="flex items-center gap-2 text-[10px] font-bold text-white/60 uppercase tracking-widest"><HiPhone className="text-[#C9A84C]" /> {selected.phone}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                                        <div className="px-4 border-r border-white/10">
                                            <p className="text-[8px] font-black text-[#C9A84C] uppercase tracking-[0.2em] mb-1">Lifetime Value</p>
                                            <p className="text-lg font-black text-white">{formatLKR(selected.totalSpend)}</p>
                                        </div>
                                        <div className="px-4">
                                            <p className="text-[8px] font-black text-[#C9A84C] uppercase tracking-[0.2em] mb-1">Operational Rank</p>
                                            <p className="text-lg font-black text-white">VIP Elite</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard label="Confirmed Orders" value={selected.orderCount || 0} icon={HiCheckCircle} color="gold" />
                                <StatCard label="Avg Order Value" value={formatLKR(selected.totalSpend / (selected.orderCount || 1))} icon={HiCurrencyDollar} color="navy" />
                                <StatCard label="Last Interaction" value={selected.lastOrderAt ? formatDate(selected.lastOrderAt) : 'N/A'} icon={HiOutlineDocumentText} color="slate" />
                            </div>

                            {/* History Tabs */}
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                                    <h3 className="text-xs font-black text-[#1B2A4A] uppercase tracking-widest flex items-center gap-2">
                                        <HiOutlineDocumentText className="text-[#C9A84C]" /> Transactional Narrative
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase">{history.orders.length} Orders</span>
                                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase">{history.quotations.length} Quotes</span>
                                    </div>
                                </div>
                                
                                <div className="p-8">
                                    {detailLoading ? (
                                        <div className="py-20 text-center">
                                            <div className="w-10 h-10 rounded-full border-4 border-[#C9A84C] border-t-transparent animate-spin mx-auto mb-4" />
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Compiling History...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {/* Orders History */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Ledger</h4>
                                                {history.orders.length > 0 ? (
                                                    <div className="grid gap-4">
                                                        {history.orders.map(o => (
                                                            <div key={o._id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#1B2A4A]/20 transition-all">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#1B2A4A] shadow-sm">
                                                                        <HiCheckCircle />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[11px] font-black text-[#1B2A4A] tracking-wider uppercase">{o.orderNumber}</p>
                                                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{formatDate(o.createdAt)} • {o.items?.length} Items</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-black text-[#1B2A4A]">{formatLKR(o.total)}</p>
                                                                    <div className="mt-1 flex justify-end"><StatusBadge status={o.orderStatus} /></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-xs font-bold text-slate-300 italic py-4">No order history available.</p>}
                                            </div>

                                            {/* Quotations History */}
                                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quotation Pipeline</h4>
                                                {history.quotations.length > 0 ? (
                                                    <div className="grid gap-4">
                                                        {history.quotations.map(q => (
                                                            <div key={q._id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                                        <HiOutlineDocumentText />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[11px] font-black text-slate-600 tracking-wider uppercase">{q.qNumber}</p>
                                                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{formatDate(q.createdAt)}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-black text-slate-600">{formatLKR(q.total)}</p>
                                                                    <div className="mt-1 flex justify-end"><StatusBadge status={q.status} /></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-xs font-bold text-slate-300 italic py-4">No quotations on record.</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
