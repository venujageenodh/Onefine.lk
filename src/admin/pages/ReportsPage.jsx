import React, { useState, useCallback } from 'react';
import { apiFetch, formatLKR, formatDate } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

const PERIODS = [
    { key: 'daily', label: 'Today' },
    { key: 'weekly', label: 'This Week' },
    { key: 'monthly', label: 'This Month' },
    { key: 'custom', label: 'Custom Range' },
];

function SummaryRow({ label, value, color = 'slate', bold = false }) {
    const colorCls = { emerald: 'text-emerald-600', rose: 'text-rose-600', blue: 'text-blue-600', slate: 'text-[#1B2A4A]', amber: 'text-amber-600', purple: 'text-purple-600' };
    return (
        <div className={`flex items-center justify-between py-3 ${bold ? 'border-t-2 border-slate-200 mt-2 pt-4' : 'border-b border-slate-50'}`}>
            <span className={`text-sm ${bold ? 'font-black text-[#1B2A4A]' : 'font-semibold text-slate-600'}`}>{label}</span>
            <span className={`text-sm font-black ${colorCls[color] || colorCls.slate}`}>{value}</span>
        </div>
    );
}

export default function ReportsPage() {
    const { token } = useAdminAuth();
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [customFrom, setCustomFrom] = useState(() => {
        const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0];
    });
    const [customTo, setCustomTo] = useState(new Date().toISOString().split('T')[0]);
    const [report, setReport] = useState(null);
    const [plData, setPlData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            let query = `period=${selectedPeriod}`;
            if (selectedPeriod === 'custom') query = `from=${customFrom}&to=${customTo}`;

            const [rpt, pl] = await Promise.all([
                apiFetch(`/finance/report?${query}`, {}, token),
                apiFetch(`/finance/profit-loss?${selectedPeriod === 'custom' ? `from=${customFrom}&to=${customTo}` : ''}`, {}, token),
            ]);
            setReport(rpt);
            setPlData(pl);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [token, selectedPeriod, customFrom, customTo]);

    const exportCSV = () => {
        if (!report) return;
        const s = report.summary;
        const rows = [
            ['OneFine Financial Report'],
            ['Period', `${formatDate(report.period?.from)} to ${formatDate(report.period?.to)}`],
            ['Generated', new Date().toLocaleString()],
            [''],
            ['SUMMARY'],
            ['Total Income', s.totalIncome],
            ['Total Expenses', s.totalExpense],
            ['Gross Profit', s.grossProfit],
            ['Net Profit (after liabilities)', s.netProfit],
            ['Cash Balance', s.cashBalance],
            ['Total Assets', s.totalAssets],
            ['Total Liabilities', s.totalLiabilities],
            [''],
            ['TRANSACTIONS'],
            ['Reference', 'Type', 'Category', 'Payment Method', 'Amount', 'Date', 'Note'],
            ...(report.transactions || []).map(t => [
                t.transactionNumber, t.type, t.category, t.paymentMethod, t.amount,
                new Date(t.date).toLocaleDateString(), t.note,
            ]),
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OneFine_Report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportJSON = () => {
        if (!report) return;
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OneFine_Report_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const s = report?.summary;
    const isProfit = s ? s.grossProfit >= 0 : true;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight">Financial Reports</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Generate Period-Based P&L and Summaries</p>
                </div>
                {report && (
                    <div className="flex gap-3">
                        <button onClick={exportCSV}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm">
                            📊 Export CSV
                        </button>
                        <button onClick={exportJSON}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm">
                            📄 Export JSON
                        </button>
                    </div>
                )}
            </div>

            {/* Period Selector */}
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Select Report Period</p>
                <div className="flex flex-wrap gap-3 mb-4">
                    {PERIODS.map(p => (
                        <button key={p.key} onClick={() => setSelectedPeriod(p.key)}
                            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${selectedPeriod === p.key ? 'bg-[#1B2A4A] text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:border-[#1B2A4A]'}`}>
                            {p.label}
                        </button>
                    ))}
                </div>

                {selectedPeriod === 'custom' && (
                    <div className="grid grid-cols-2 gap-3 max-w-md mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">From</label>
                            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">To</label>
                            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                        </div>
                    </div>
                )}

                <button onClick={fetchReport} disabled={loading}
                    className="rounded-2xl bg-[#C9A84C] hover:bg-[#b0903b] px-8 py-3 text-sm font-black text-[#1B2A4A] shadow-md disabled:opacity-60 transition-colors">
                    {loading ? '⏳ Generating...' : '📊 Generate Report'}
                </button>
            </div>

            {/* Report Output */}
            {loading && (
                <div className="flex py-20 items-center justify-center flex-col gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C9A84C] border-t-transparent" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculating financials...</p>
                </div>
            )}

            {report && !loading && (
                <div className="space-y-8">
                    {/* Period Banner */}
                    <div className={`rounded-3xl p-6 flex items-center justify-between ${isProfit ? 'bg-gradient-to-r from-emerald-600 to-emerald-700' : 'bg-gradient-to-r from-rose-600 to-rose-700'} text-white shadow-lg`}>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">
                                {formatDate(report.period?.from)} — {formatDate(report.period?.to)}
                            </p>
                            <h2 className="text-2xl font-black">{isProfit ? '📈 Profitable Period' : '📉 Loss Period'}</h2>
                            <p className="text-white/70 text-sm mt-1">
                                Gross {isProfit ? 'Profit' : 'Loss'}: <strong>{formatLKR(Math.abs(s?.grossProfit))}</strong>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest opacity-70">Net Position</p>
                            <p className="text-3xl font-black">{formatLKR(Math.abs(s?.netProfit))}</p>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* P&L Statement */}
                        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-7">
                            <h3 className="font-black text-[#1B2A4A] text-base mb-5 pb-3 border-b border-slate-100">Profit & Loss Statement</h3>
                            <SummaryRow label="Total Income" value={formatLKR(s?.totalIncome)} color="emerald" />
                            <SummaryRow label="Total Expenses" value={`— ${formatLKR(s?.totalExpense)}`} color="rose" />
                            <SummaryRow label="Gross Profit / (Loss)" value={`${isProfit ? '+' : '-'}${formatLKR(Math.abs(s?.grossProfit))}`} color={isProfit ? 'emerald' : 'rose'} bold />
                            <SummaryRow label="Total Liabilities" value={`— ${formatLKR(s?.totalLiabilities)}`} color="rose" />
                            <SummaryRow label="Net Profit / (Loss)" value={`${(s?.netProfit || 0) >= 0 ? '+' : '-'}${formatLKR(Math.abs(s?.netProfit))}`} color={(s?.netProfit || 0) >= 0 ? 'emerald' : 'rose'} bold />
                        </div>

                        {/* Balance Sheet Snapshot */}
                        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-7">
                            <h3 className="font-black text-[#1B2A4A] text-base mb-5 pb-3 border-b border-slate-100">Balance Sheet Snapshot</h3>
                            <SummaryRow label="Cash Balance" value={formatLKR(s?.cashBalance)} color="blue" />
                            <SummaryRow label="Total Assets" value={formatLKR(s?.totalAssets)} color="emerald" />
                            <SummaryRow label="Total Liabilities" value={formatLKR(s?.totalLiabilities)} color="rose" />
                            <SummaryRow label="Net Worth" value={formatLKR((s?.totalAssets || 0) - (s?.totalLiabilities || 0))} color={(s?.totalAssets || 0) >= (s?.totalLiabilities || 0) ? 'emerald' : 'rose'} bold />
                        </div>
                    </div>

                    {/* Income / Expense Breakdown */}
                    {plData && (
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-7">
                                <h3 className="font-black text-emerald-600 text-base mb-4">Income Breakdown</h3>
                                {plData.incomeByCategory?.length > 0 ? (
                                    <div className="space-y-3">
                                        {plData.incomeByCategory.sort((a, b) => b.total - a.total).map(item => (
                                            <div key={item._id} className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-xs font-bold text-slate-600 capitalize">{item._id?.replace(/_/g, ' ')}</span>
                                                        <span className="text-xs font-black text-emerald-600">{formatLKR(item.total)}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-400 rounded-full"
                                                            style={{ width: `${plData.totalIncome > 0 ? (item.total / plData.totalIncome) * 100 : 0}%` }} />
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 w-10 text-right">
                                                    {plData.totalIncome > 0 ? ((item.total / plData.totalIncome) * 100).toFixed(0) : 0}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 py-4">No income recorded for this period.</p>
                                )}
                            </div>

                            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-7">
                                <h3 className="font-black text-rose-600 text-base mb-4">Expense Breakdown</h3>
                                {plData.expenseByCategory?.length > 0 ? (
                                    <div className="space-y-3">
                                        {plData.expenseByCategory.sort((a, b) => b.total - a.total).map(item => (
                                            <div key={item._id} className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-xs font-bold text-slate-600 capitalize">{item._id?.replace(/_/g, ' ')}</span>
                                                        <span className="text-xs font-black text-rose-600">{formatLKR(item.total)}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-rose-400 rounded-full"
                                                            style={{ width: `${plData.totalExpense > 0 ? (item.total / plData.totalExpense) * 100 : 0}%` }} />
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 w-10 text-right">
                                                    {plData.totalExpense > 0 ? ((item.total / plData.totalExpense) * 100).toFixed(0) : 0}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 py-4">No expenses recorded for this period.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Transactions Table */}
                    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-black text-[#1B2A4A]">All Transactions in Period ({(report.transactions || []).length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                    <tr>
                                        <th className="px-5 py-4 text-left">Ref</th>
                                        <th className="px-5 py-4 text-left">Type</th>
                                        <th className="px-5 py-4 text-left">Category</th>
                                        <th className="px-5 py-4 text-left">Note</th>
                                        <th className="px-5 py-4 text-left">Date</th>
                                        <th className="px-5 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(report.transactions || []).map(t => (
                                        <tr key={t._id} className="hover:bg-slate-50/40 transition-colors">
                                            <td className="px-5 py-3 font-mono text-xs font-bold text-slate-400">{t.transactionNumber}</td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {t.type === 'income' ? '↑' : '↓'} {t.type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs font-semibold text-slate-600 capitalize">{t.category?.replace(/_/g, ' ')}</td>
                                            <td className="px-5 py-3 text-xs text-slate-500 max-w-[160px] truncate">{t.note || '—'}</td>
                                            <td className="px-5 py-3 text-xs text-slate-400 font-semibold whitespace-nowrap">{formatDate(t.date)}</td>
                                            <td className={`px-5 py-3 text-right font-black text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.type === 'income' ? '+' : '-'}{formatLKR(t.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                    {(report.transactions || []).length === 0 && (
                                        <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">No transactions in this period.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
