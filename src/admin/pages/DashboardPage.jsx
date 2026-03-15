import React, { useEffect, useState } from 'react';
import { apiFetch, formatLKR, formatDateTime, StatusBadge } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';
import { HiArrowUp, HiArrowDown, HiCalendar, HiDownload } from 'react-icons/hi';

function StatCard({ icon, label, value, sub, trend, color = 'gold' }) {
    const colors = {
        gold: 'border-[#C9A84C] bg-white',
        blue: 'border-blue-500 bg-white',
        green: 'border-emerald-500 bg-white',
        red: 'border-rose-500 bg-white',
        purple: 'border-indigo-500 bg-white',
    };
    return (
        <div className={`rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${colors[color].split(' ')[0]}`}></div>
            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">{label}</p>
                    <p className="text-2xl font-black text-[#1B2A4A] tracking-tight">{value}</p>
                    <div className="flex items-center gap-2">
                        {trend && (
                            <span className={`text-[10px] font-bold flex items-center ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {trend > 0 ? <HiArrowUp className="mb-0.5" /> : <HiArrowDown className="mb-0.5" />}
                                {Math.abs(trend)}%
                            </span>
                        )}
                        {sub && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sub}</p>}
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner bg-slate-50 group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-lg font-black text-[#1B2A4A] tracking-tight">{title}</h2>
                {subtitle && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

export default function DashboardPage() {
    const { token } = useAdminAuth();
    const [data, setData] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const load = async () => {
            try {
                const [s, r] = await Promise.all([
                    apiFetch('/dashboard/stats', {}, token),
                    apiFetch('/dashboard/recent-orders', {}, token),
                ]);
                setData(s);
                setRecentOrders(r);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, [token]);

    const exportStats = () => {
        if (!data) return;
        const csvRows = [
            ['Metric', 'Value'],
            ['Total Sales Today', data.revenue.today],
            ['Total Sales This Month', data.revenue.thisMonth],
            ['Pending Orders', data.orders.pending],
            ['Completed Orders', data.orders.completed]
        ];
        const csvString = csvRows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `Dashboard_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (loading) return (
        <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C9A84C] border-t-transparent" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Gathering Business Intelligence...</p>
        </div>
    );

    const maxTrend = data ? Math.max(...(data.salesTrend?.map(t => t.total) || []), 1) : 1;

    return (
        <div className="space-y-10 pb-10">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight">Business Intelligence</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        <HiCalendar className="text-[#C9A84C] text-sm" />
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={exportStats} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                        <HiDownload className="text-base" /> Export CSV
                    </button>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System Live" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Live</span>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon="💰" label="Monthly Revenue" value={formatLKR(data?.revenue?.thisMonth)} color="gold" sub="Net Sales" />
                <StatCard icon="📦" label="Pending Fulfilment" value={data?.orders?.pending} color="blue" sub={`${data?.orders?.new} New Orders`} />
                <StatCard icon="✅" label="Orders Completed" value={data?.orders?.completed} color="green" sub="Total this month" />
                <StatCard icon="⚠️" label="Inventory Alerts" value={data?.inventory?.lowStockItems} color="red" sub="Items below threshold" />
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                <div className="space-y-8">
                    {/* Sales Trend Chart */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                        <SectionHeader title="Sales Performance" subtitle="7-Day Revenue Trend" />
                        <div className="relative h-[240px] flex items-end justify-between px-2 pt-10">
                            {/* Y-Axis Guideline */}
                            <div className="absolute inset-x-0 top-10 flex flex-col justify-between h-full pointer-events-none">
                                {[1, 0.75, 0.5, 0.25, 0].map(v => (
                                    <div key={v} className="border-t border-slate-50 w-full relative">
                                        <span className="absolute -left-1 text-[8px] font-bold text-slate-300 -translate-y-1/2">
                                            {formatLKR(maxTrend * v)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {(data?.salesTrend || []).map((t, i) => (
                                <div key={i} className="group relative flex flex-col items-center flex-1">
                                    <div className="mb-2 text-[10px] font-bold text-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6">
                                        {formatLKR(t.total)}
                                    </div>
                                    <div 
                                        style={{ height: `${(t.total / maxTrend) * 100}%` }}
                                        className="w-8 min-h-[4px] rounded-t-lg bg-gradient-to-t from-[#1B2A4A] to-[#2d4679] group-hover:from-[#C9A84C] group-hover:to-yellow-500 transition-all duration-500 shadow-sm"
                                    />
                                    <div className="mt-4 text-[9px] font-bold text-slate-400 uppercase transform -rotate-45 sm:rotate-0">
                                        {t._id.split('-').slice(1).join('/')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders Table */}
                    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-lg font-black text-[#1B2A4A] tracking-tight">Recent Dispatch Queue</h2>
                            <button className="text-xs font-bold text-[#1B2A4A] hover:text-[#C9A84C] uppercase tracking-[0.1em]">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Order Reference</th>
                                        <th className="px-6 py-4 text-left">Client</th>
                                        <th className="px-6 py-4 text-right">Value</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(recentOrders || []).map(o => (
                                        <tr key={o._id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#1B2A4A] font-mono text-xs">{o.orderNumber}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{formatDateTime(o.createdAt).split(',')[0]}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 font-bold text-[#1B2A4A]">{o.customer?.name}</td>
                                            <td className="px-6 py-5 text-right font-black text-[#1B2A4A]">{formatLKR(o.total)}</td>
                                            <td className="px-6 py-5 text-center"><StatusBadge status={o.orderStatus} /></td>
                                            <td className="px-6 py-5 text-center"><StatusBadge status={o.paymentStatus} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column Panels */}
                <div className="space-y-8">
                    {/* Top Products */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <SectionHeader title="Top Performers" subtitle="By Volume" />
                        <div className="space-y-5">
                            {(data?.topProducts || []).map((p, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-black text-slate-300">
                                        0{i+1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-[#1B2A4A] truncate">{p._id}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{p.totalSold} Units Sold</p>
                                    </div>
                                    <p className="text-xs font-black text-emerald-500">{formatLKR(p.revenue)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Quotations */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <SectionHeader title="Quotations" subtitle="Recent Activity" />
                        <div className="space-y-5">
                            {(data?.recentQuotations || []).map((q, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-black text-[#1B2A4A] font-mono">{q.qNumber}</span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${q.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                            {q.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{q.customer?.name}</p>
                                        <p className="text-xs font-black text-[#1B2A4A]">{formatLKR(q.total)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 rounded-2xl bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-[#1B2A4A] hover:text-white transition-all shadow-inner">
                            Manage Pipeline
                        </button>
                    </div>

                    {/* Quick Alert */}
                    {data?.inventory?.lowStockItems > 0 && (
                        <div className="rounded-3xl bg-rose-50 border border-rose-100 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xl">🚨</span>
                                <h3 className="text-sm font-black text-rose-900 leading-none">Restock Required</h3>
                            </div>
                            <p className="text-xs font-medium text-rose-800/80 mb-4 leading-relaxed">
                                {data.inventory.lowStockItems} items are currently below their safety threshold and require attention.
                            </p>
                            <button className="w-full py-2.5 rounded-xl bg-white text-[10px] font-black text-rose-600 uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
                                Open Inventory
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
