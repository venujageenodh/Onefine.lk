import React, { useEffect, useState } from 'react';
import { apiFetch, formatLKR, formatDateTime, StatusBadge } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

function StatCard({ icon, label, value, sub, color = 'gold' }) {
    const colors = {
        gold: 'border-[#C9A84C] bg-[#C9A84C]/5',
        blue: 'border-blue-400 bg-blue-50',
        green: 'border-green-400 bg-green-50',
        red: 'border-red-400 bg-red-50',
        purple: 'border-purple-400 bg-purple-50',
    };
    return (
        <div className={`rounded-2xl bg-white p-5 shadow-sm border border-l-4 ${colors[color]}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-[#1B2A4A]">{value}</p>
                    {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
                </div>
                <span className="text-3xl">{icon}</span>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { token } = useAdminAuth();
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiFetch('/dashboard/stats', {}, token),
            apiFetch('/dashboard/recent-orders', {}, token),
        ]).then(([s, r]) => { setStats(s); setRecent(r); }).catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div className="py-20 text-center text-slate-400">Loading dashboard…</div>;

    return (
        <div className="space-y-8">
            {/* Stats grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon="📦" label="Orders Today" value={stats?.orders?.today ?? 0}
                    sub={`${stats?.orders?.thisWeek ?? 0} this week`} color="blue" />
                <StatCard icon="💰" label="Revenue Today" value={formatLKR(stats?.revenue?.today ?? 0)}
                    sub={`${formatLKR(stats?.revenue?.thisWeek)} this week`} color="green" />
                <StatCard icon="🚚" label="Pending Delivery" value={stats?.orders?.pending ?? 0}
                    sub={`${stats?.orders?.new ?? 0} new orders`} color="purple" />
                <StatCard icon="⚠️" label="Low Stock Items" value={stats?.inventory?.lowStockItems ?? 0}
                    sub="Need restocking" color="red" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard icon="🧾" label="Unpaid Invoices" value={stats?.payments?.unpaidInvoices ?? 0} color="red" />
                <StatCard icon="💳" label="Part Paid" value={stats?.payments?.partPaidInvoices ?? 0} color="gold" />
                <StatCard icon="✅" label="Completed Orders" value={stats?.orders?.completed ?? 0} color="green" />
            </div>

            {/* Recent orders */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-bold text-[#1B2A4A]">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                            <tr>
                                {['Order #', 'Customer', 'Total', 'Payment', 'Status', 'Date'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recent.map(o => (
                                <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-[11px] text-[#1B2A4A] font-bold">{o.orderNumber || o._id?.slice(-6)}</td>
                                    <td className="px-4 py-3 font-medium text-[#1B2A4A]">{o.customer?.name || '—'}</td>
                                    <td className="px-4 py-3 font-semibold">{formatLKR(o.total)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={o.paymentStatus} /></td>
                                    <td className="px-4 py-3"><StatusBadge status={o.orderStatus} /></td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDateTime(o.createdAt)}</td>
                                </tr>
                            ))}
                            {!recent.length && (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">No orders yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
