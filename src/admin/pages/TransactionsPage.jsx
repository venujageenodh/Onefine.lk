import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatLKR, formatDate } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

const TYPES = ['income', 'expense'];
const CATEGORIES = {
    income: ['sales', 'other_income'],
    expense: ['purchase', 'salary', 'rent', 'utilities', 'asset', 'liability', 'other_expense'],
};
const ALL_CATS = ['sales', 'purchase', 'salary', 'rent', 'utilities', 'asset', 'liability', 'other_income', 'other_expense'];
const PAYMENT_METHODS = ['cash', 'bank', 'online', 'cheque'];

function emptyForm() {
    return {
        type: 'expense',
        category: 'purchase',
        amount: '',
        paymentMethod: 'cash',
        accountType: 'cash',
        date: new Date().toISOString().split('T')[0],
        note: '',
    };
}

export default function TransactionsPage() {
    const { token, admin } = useAdminAuth();
    const [transactions, setTransactions] = useState([]);
    const [total, setTotal] = useState(0);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm());
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState({ type: '', category: '', from: '', to: '', page: 1 });
    const [showForm, setShowForm] = useState(false);
    const canEdit = admin?.role === 'OWNER' || admin?.role === 'DEVELOPER' || admin?.role === 'ACCOUNT_ADMIN';

    const buildQuery = (f) => {
        const p = new URLSearchParams();
        if (f.type) p.set('type', f.type);
        if (f.category) p.set('category', f.category);
        if (f.from) p.set('from', f.from);
        if (f.to) p.set('to', f.to);
        p.set('page', f.page);
        p.set('limit', 30);
        return p.toString();
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [txData, sumData] = await Promise.all([
                apiFetch(`/transactions?${buildQuery(filter)}`, {}, token),
                apiFetch(`/transactions/summary?${filter.from ? `from=${filter.from}` : ''}&${filter.to ? `to=${filter.to}` : ''}`, {}, token),
            ]);
            setTransactions(txData.transactions || []);
            setTotal(txData.total || 0);
            setSummary(sumData);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [token, filter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => {
            const updated = { ...f, [name]: value };
            // Auto sync accountType with paymentMethod
            if (name === 'paymentMethod') updated.accountType = value === 'bank' || value === 'cheque' ? 'bank' : 'cash';
            // Reset category when type changes
            if (name === 'type') updated.category = value === 'income' ? 'sales' : 'purchase';
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, amount: Number(form.amount) };
            if (editingId) {
                await apiFetch(`/transactions/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) }, token);
            } else {
                await apiFetch('/transactions', { method: 'POST', body: JSON.stringify(payload) }, token);
            }
            setForm(emptyForm());
            setEditingId(null);
            setShowForm(false);
            fetchData();
        } catch (e) { alert(e.message); }
        finally { setSaving(false); }
    };

    const handleEdit = (tx) => {
        setEditingId(tx._id);
        setForm({
            type: tx.type, category: tx.category, amount: tx.amount,
            paymentMethod: tx.paymentMethod, accountType: tx.accountType,
            date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : '',
            note: tx.note || '',
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction? This will also reverse the account balance.')) return;
        try {
            await apiFetch(`/transactions/${id}`, { method: 'DELETE' }, token);
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const cats = CATEGORIES[form.type] || ALL_CATS;

    return (
        <div className="space-y-6">
            {/* Summary Bar */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Total Income</p>
                        <p className="text-2xl font-black text-emerald-700">{formatLKR(summary.totalIncome)}</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
                        <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest mb-1">Total Expenses</p>
                        <p className="text-2xl font-black text-rose-700">{formatLKR(summary.totalExpense)}</p>
                    </div>
                    <div className={`border rounded-2xl p-5 ${summary.isProfit ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${summary.isProfit ? 'text-blue-700' : 'text-amber-700'}`}>
                            {summary.isProfit ? 'Profit' : 'Loss'}
                        </p>
                        <p className={`text-2xl font-black ${summary.isProfit ? 'text-blue-700' : 'text-amber-700'}`}>{formatLKR(Math.abs(summary.profit))}</p>
                    </div>
                </div>
            )}

            {/* Filters + Add Button */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                    <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value, page: 1 }))}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] bg-white">
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                    <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value, page: 1 }))}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] bg-white">
                        <option value="">All Categories</option>
                        {ALL_CATS.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                    </select>
                    <input type="date" value={filter.from} onChange={e => setFilter(f => ({ ...f, from: e.target.value, page: 1 }))}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" placeholder="From" />
                    <input type="date" value={filter.to} onChange={e => setFilter(f => ({ ...f, to: e.target.value, page: 1 }))}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" placeholder="To" />
                </div>
                {canEdit && (
                    <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); }}
                        className="shrink-0 rounded-2xl bg-[#C9A84C] hover:bg-[#b0903b] transition-colors px-5 py-2.5 text-sm font-bold text-[#1B2A4A] shadow-sm">
                        + New Transaction
                    </button>
                )}
            </div>

            {/* Form Modal */}
            {showForm && canEdit && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-[#1B2A4A]">{editingId ? 'Edit Transaction' : 'Record Transaction'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Type *</label>
                                    <select name="type" value={form.type} onChange={handleChange} required
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] bg-white">
                                        {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Category *</label>
                                    <select name="category" value={form.category} onChange={handleChange} required
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] bg-white">
                                        {cats.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Amount (Rs.) *</label>
                                    <input type="number" name="amount" value={form.amount} onChange={handleChange} required min="0" step="0.01"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Date *</label>
                                    <input type="date" name="date" value={form.date} onChange={handleChange} required
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Payment Method *</label>
                                    <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} required
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] bg-white">
                                        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Account</label>
                                    <select name="accountType" value={form.accountType} onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] bg-white">
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Note / Description</label>
                                <textarea name="note" value={form.note} onChange={handleChange} rows={3} placeholder="Optional description..."
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 rounded-full bg-[#C9A84C] hover:bg-[#b0903b] py-3 text-sm font-bold text-[#1B2A4A] disabled:opacity-60 shadow-md">
                                    {saving ? 'Saving...' : editingId ? 'Update' : 'Save Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transactions Table */}
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="font-black text-[#1B2A4A]">Transactions <span className="text-slate-400 font-semibold text-sm">({total})</span></h2>
                </div>
                {loading ? (
                    <div className="py-16 text-center text-slate-400">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#C9A84C] border-t-transparent mb-4" />
                        Loading...
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">No transactions found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 text-left">Ref</th>
                                    <th className="px-6 py-4 text-left">Type</th>
                                    <th className="px-6 py-4 text-left">Category</th>
                                    <th className="px-6 py-4 text-left">Method</th>
                                    <th className="px-6 py-4 text-left">Note</th>
                                    <th className="px-6 py-4 text-left">Date</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    {canEdit && <th className="px-6 py-4 text-center">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.map(t => (
                                    <tr key={t._id} className="hover:bg-slate-50/40 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{t.transactionNumber}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {t.type === 'income' ? '↑' : '↓'} {t.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-slate-600 capitalize">{t.category?.replace(/_/g, ' ')}</td>
                                        <td className="px-6 py-4 text-xs font-semibold capitalize">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500">
                                                {t.paymentMethod === 'cash' ? '💵' : t.paymentMethod === 'bank' ? '🏦' : '💳'} {t.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 max-w-[160px] truncate">{t.note || '—'}</td>
                                        <td className="px-6 py-4 text-xs text-slate-400 font-semibold whitespace-nowrap">{formatDate(t.date)}</td>
                                        <td className={`px-6 py-4 text-right font-black text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.type === 'income' ? '+' : '-'}{formatLKR(t.amount)}
                                        </td>
                                        {canEdit && (
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(t)}
                                                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-[#1B2A4A]">Edit</button>
                                                    <button onClick={() => handleDelete(t._id)}
                                                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50">Del</button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Pagination */}
                {Math.ceil(total / 30) > 1 && (
                    <div className="p-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Page {filter.page} of {Math.ceil(total / 30)}</span>
                        <div className="flex gap-2">
                            <button disabled={filter.page <= 1} onClick={() => setFilter(f => ({ ...f, page: f.page - 1 }))}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 disabled:opacity-40">← Prev</button>
                            <button disabled={filter.page >= Math.ceil(total / 30)} onClick={() => setFilter(f => ({ ...f, page: f.page + 1 }))}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 disabled:opacity-40">Next →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
