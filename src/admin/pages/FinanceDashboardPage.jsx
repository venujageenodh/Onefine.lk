import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatLKR, formatDate } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function KpiCard({ icon, label, value, sub, accent = '#C9A84C', negative = false }) {
    return (
        <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-1 h-full rounded-l-3xl" style={{ background: accent }} />
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">{label}</p>
                    <p className={`text-2xl font-black tracking-tight ${negative ? 'text-rose-600' : 'text-[#1B2A4A]'}`}>{value}</p>
                    {sub && <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">{sub}</p>}
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner bg-slate-50 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function MiniChart({ incomeData, expenseData }) {
    const allValues = [...incomeData.map(d => d.total), ...expenseData.map(d => d.total)];
    const maxVal = Math.max(...allValues, 1);
    // Build a 6-month axis
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return { year: d.getFullYear(), month: d.getMonth() + 1, label: MONTH_NAMES[d.getMonth()] };
    });

    return (
        <div className="space-y-3">
            <div className="flex items-end justify-between gap-2 h-40 px-1">
                {months.map((m, i) => {
                    const inc = incomeData.find(d => d._id.year === m.year && d._id.month === m.month)?.total || 0;
                    const exp = expenseData.find(d => d._id.year === m.year && d._id.month === m.month)?.total || 0;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="absolute -top-7 hidden group-hover:flex flex-col items-center z-10 bg-[#1B2A4A] rounded-xl px-3 py-2 shadow-xl text-[9px] font-bold text-white whitespace-nowrap gap-0.5">
                                <span className="text-emerald-300">Inc: {formatLKR(inc)}</span>
                                <span className="text-rose-300">Exp: {formatLKR(exp)}</span>
                            </div>
                            <div className="w-full flex items-end gap-0.5 h-32">
                                <div className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-400 to-emerald-300 min-h-[2px] transition-all duration-500"
                                    style={{ height: `${(inc / maxVal) * 100}%` }} />
                                <div className="flex-1 rounded-t-lg bg-gradient-to-t from-rose-400 to-rose-300 min-h-[2px] transition-all duration-500"
                                    style={{ height: `${(exp / maxVal) * 100}%` }} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400">{m.label}</span>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-4 justify-center text-[10px] font-bold">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />Income</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-rose-400 inline-block" />Expenses</span>
            </div>
        </div>
    );
}

export default function FinanceDashboardPage() {
    const { token } = useAdminAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await apiFetch('/finance/dashboard', {}, token);
            setData(d);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    if (loading) return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C9A84C] border-t-transparent" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Financial Data...</p>
        </div>
    );

    const allTime = data?.allTime || {};
    const thisMonth = data?.thisMonth || {};
    const isProfit = (allTime.profit || 0) >= 0;
    const isMonthProfit = (thisMonth.profit || 0) >= 0;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight">Financial Overview</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Live Accounting Dashboard · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`px-4 py-2 rounded-full text-xs font-black shadow-sm ${isProfit ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {isProfit ? '📈 Profitable' : '📉 Net Loss'}
                    </div>
                </div>
            </div>

            {/* All-time KPIs */}
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-4">All-Time Financial Position</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard icon="💰" label="Total Income" value={formatLKR(allTime.totalIncome)} sub="All recorded income" accent="#10b981" />
                    <KpiCard icon="💸" label="Total Expenses" value={formatLKR(allTime.totalExpense)} sub="All recorded expenses" accent="#f43f5e" />
                    <KpiCard icon={isProfit ? '📈' : '📉'} label="Gross Profit" value={formatLKR(Math.abs(allTime.profit))} sub={isProfit ? 'In Profit' : 'In Loss'} accent={isProfit ? '#10b981' : '#f43f5e'} negative={!isProfit} />
                    <KpiCard icon="🏦" label="Net Position" value={formatLKR(Math.abs(allTime.netProfit))} sub={`After Rs. ${(data?.totalLiabilities || 0).toLocaleString()} liabilities`} accent="#6366f1" negative={(allTime.netProfit || 0) < 0} />
                </div>
            </div>

            {/* This Month */}
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-4">This Month</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard icon="📥" label="Monthly Income" value={formatLKR(thisMonth.income)} sub="This month" accent="#10b981" />
                    <KpiCard icon="📤" label="Monthly Expenses" value={formatLKR(thisMonth.expense)} sub="This month" accent="#f43f5e" />
                    <KpiCard icon={isMonthProfit ? '✅' : '⚠️'} label="Monthly Profit" value={formatLKR(Math.abs(thisMonth.profit))} sub={isMonthProfit ? 'Surplus' : 'Shortfall'} accent={isMonthProfit ? '#10b981' : '#f43f5e'} negative={!isMonthProfit} />
                    <KpiCard icon="🏧" label="Cash Balance" value={formatLKR(data?.cashBalance)} sub="Across all accounts" accent="#C9A84C" />
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                {/* Chart */}
                <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                    <h2 className="text-lg font-black text-[#1B2A4A] tracking-tight mb-1">Income vs Expenses</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">6-Month Trend</p>
                    <MiniChart incomeData={data?.monthlyIncomeTrend || []} expenseData={data?.monthlyExpenseTrend || []} />
                </div>

                {/* Accounts & Alerts */}
                <div className="space-y-6">
                    {/* Account Balances */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-black text-[#1B2A4A] mb-4">Account Balances</h2>
                        <div className="space-y-3">
                            {(data?.accounts || []).map(acc => (
                                <div key={acc._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{acc.type === 'cash' ? '💵' : acc.type === 'bank' ? '🏦' : '💳'}</span>
                                        <div>
                                            <p className="text-xs font-bold text-[#1B2A4A]">{acc.name}</p>
                                            <p className="text-[10px] text-slate-400 font-semibold capitalize">{acc.type}</p>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-black ${acc.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatLKR(acc.balance)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    {(data?.lowStockItems || []).length > 0 && (
                        <div className="rounded-3xl border border-rose-100 bg-rose-50/30 p-6 shadow-sm">
                            <h2 className="text-sm font-black text-rose-700 mb-4 flex items-center gap-2">
                                ⚠️ Low Stock Alerts
                            </h2>
                            <div className="space-y-3">
                                {data.lowStockItems.map(item => (
                                    <div key={item._id} className="flex items-center justify-between p-3 rounded-2xl bg-white/60">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-[#1B2A4A] truncate">{item.productId?.name}</p>
                                            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">
                                                Only {item.stockQty} left
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-bold">Min: {item.minStockQty}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assets & Liabilities Summary */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-black text-[#1B2A4A] mb-4">Balance Sheet Snapshot</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50">
                                <span className="text-xs font-bold text-emerald-700">📦 Total Assets</span>
                                <span className="text-sm font-black text-emerald-700">{formatLKR(data?.totalAssets)}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50">
                                <span className="text-xs font-bold text-rose-700">⚖️ Total Liabilities</span>
                                <span className="text-sm font-black text-rose-700">{formatLKR(data?.totalLiabilities)}</span>
                            </div>
                            <div className={`flex items-center justify-between p-3 rounded-2xl ${(data?.totalAssets - data?.totalLiabilities) >= 0 ? 'bg-blue-50' : 'bg-amber-50'}`}>
                                <span className="text-xs font-bold text-blue-700">🧾 Net Worth</span>
                                <span className={`text-sm font-black ${(data?.totalAssets - data?.totalLiabilities) >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                                    {formatLKR((data?.totalAssets || 0) - (data?.totalLiabilities || 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                    <h2 className="text-lg font-black text-[#1B2A4A] tracking-tight">Recent Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-left">Reference</th>
                                <th className="px-6 py-4 text-left">Type</th>
                                <th className="px-6 py-4 text-left">Category</th>
                                <th className="px-6 py-4 text-left">Note</th>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(data?.recentTransactions || []).map(t => (
                                <tr key={t._id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs font-bold text-slate-500">{t.transactionNumber}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {t.type === 'income' ? '↑' : '↓'} {t.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 capitalize">{t.category?.replace(/_/g, ' ')}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate">{t.note || '—'}</td>
                                    <td className="px-6 py-4 text-xs text-slate-400 font-semibold">{formatDate(t.date)}</td>
                                    <td className={`px-6 py-4 text-right font-black text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatLKR(t.amount)}
                                    </td>
                                </tr>
                            ))}
                            {(data?.recentTransactions || []).length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">No transactions recorded yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
