import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatLKR, formatDate } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

const LIABILITY_TYPES = ['loan', 'credit', 'payable', 'lease', 'other'];
const TYPE_COLORS = { loan: 'rose', credit: 'orange', payable: 'amber', lease: 'purple', other: 'slate' };

function emptyForm() {
    return { name: '', type: 'loan', originalAmount: '', dueDate: '', creditor: '', description: '' };
}

export default function LiabilitiesPage() {
    const { token, admin } = useAdminAuth();
    const [data, setData] = useState({ liabilities: [], totalOutstanding: 0, totalOriginal: 0 });
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm());
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [repayModal, setRepayModal] = useState(null); // { liability, amount, note }
    const [saving, setSaving] = useState(false);
    const canEdit = admin?.role === 'OWNER' || admin?.role === 'DEVELOPER' || admin?.role === 'ACCOUNT_ADMIN';

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await apiFetch('/liabilities', {}, token);
            setData(d);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, originalAmount: Number(form.originalAmount) };
            if (editingId) {
                await apiFetch(`/liabilities/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) }, token);
            } else {
                await apiFetch('/liabilities', { method: 'POST', body: JSON.stringify(payload) }, token);
            }
            setForm(emptyForm());
            setEditingId(null);
            setShowForm(false);
            load();
        } catch (e) { alert(e.message); }
        finally { setSaving(false); }
    };

    const handleRepay = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiFetch(`/liabilities/${repayModal.liability._id}/repay`, {
                method: 'POST',
                body: JSON.stringify({ amount: Number(repayModal.amount), note: repayModal.note }),
            }, token);
            setRepayModal(null);
            load();
        } catch (e) { alert(e.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this liability?')) return;
        await apiFetch(`/liabilities/${id}`, { method: 'DELETE' }, token);
        load();
    };

    const outstanding = data.liabilities?.filter(l => !l.isSettled) || [];
    const settled = data.liabilities?.filter(l => l.isSettled) || [];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight">Liabilities</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Loans, Credits & Payables</p>
                </div>
                {canEdit && (
                    <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); }}
                        className="rounded-2xl bg-[#C9A84C] hover:bg-[#b0903b] transition-colors px-5 py-2.5 text-sm font-bold text-[#1B2A4A] shadow-sm">
                        + Add Liability
                    </button>
                )}
            </div>

            {/* Hero Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-rose-600 text-white p-7 shadow-lg col-span-1 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-rose-300 to-transparent" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Total Outstanding</p>
                    <p className="text-3xl font-black">{formatLKR(data.totalOutstanding)}</p>
                    <p className="text-xs text-white/40 mt-1 font-semibold">{outstanding.length} Active Liabilities</p>
                </div>
                <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-7">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Original Total</p>
                    <p className="text-3xl font-black text-[#1B2A4A]">{formatLKR(data.totalOriginal)}</p>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">{data.liabilities?.length || 0} All Liabilities</p>
                </div>
                <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-7">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Repaid So Far</p>
                    <p className="text-3xl font-black text-emerald-600">{formatLKR(data.totalOriginal - data.totalOutstanding)}</p>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">{settled.length} Fully Settled</p>
                </div>
            </div>

            {/* Active Liabilities */}
            {loading ? (
                <div className="flex py-16 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C9A84C] border-t-transparent" />
                </div>
            ) : outstanding.length === 0 ? (
                <div className="py-16 text-center rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                    <span className="text-4xl block mb-3">✅</span>
                    <p className="font-semibold">No Outstanding Liabilities</p>
                    <p className="text-sm mt-1">All debts are cleared!</p>
                </div>
            ) : (
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-4">Outstanding ({outstanding.length})</p>
                    <div className="space-y-4">
                        {outstanding.map(lib => {
                            const paidPct = lib.originalAmount > 0 ? ((lib.originalAmount - lib.outstandingBalance) / lib.originalAmount) * 100 : 0;
                            return (
                                <div key={lib._id} className="rounded-3xl border border-slate-100 bg-white shadow-sm p-6 hover:shadow-md transition-shadow group">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="font-black text-[#1B2A4A]">{lib.name}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-${TYPE_COLORS[lib.type] || 'slate'}-100 text-${TYPE_COLORS[lib.type] || 'slate'}-700 capitalize`}>
                                                    {lib.type}
                                                </span>
                                            </div>
                                            {lib.creditor && <p className="text-xs text-slate-500 font-semibold">Creditor: {lib.creditor}</p>}
                                            {lib.description && <p className="text-xs text-slate-400 mt-0.5">{lib.description}</p>}
                                            {lib.dueDate && (
                                                <p className={`text-xs font-bold mt-1 ${new Date(lib.dueDate) < new Date() ? 'text-rose-600' : 'text-slate-400'}`}>
                                                    📅 Due: {formatDate(lib.dueDate)}{new Date(lib.dueDate) < new Date() ? ' ⚠️ Overdue' : ''}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400 font-semibold">Outstanding</p>
                                            <p className="text-2xl font-black text-rose-600">{formatLKR(lib.outstandingBalance)}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">of {formatLKR(lib.originalAmount)}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                            <span>{paidPct.toFixed(0)}% Repaid</span>
                                            <span>{formatLKR(lib.originalAmount - lib.outstandingBalance)} paid</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${paidPct}%` }} />
                                        </div>
                                    </div>

                                    {canEdit && (
                                        <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2">
                                            <button onClick={() => setRepayModal({ liability: lib, amount: '', note: '' })}
                                                className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 text-xs font-bold hover:bg-emerald-100 transition-colors">
                                                💳 Record Repayment
                                            </button>
                                            <button onClick={() => handleDelete(lib._id)}
                                                className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50">Delete</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Settled Liabilities */}
            {settled.length > 0 && (
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-4">Settled ({settled.length})</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {settled.map(lib => (
                            <div key={lib._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 flex items-center gap-4">
                                <span className="text-2xl">✅</span>
                                <div>
                                    <p className="font-bold text-slate-600 text-sm">{lib.name}</p>
                                    <p className="text-xs text-slate-400">{formatLKR(lib.originalAmount)} — Fully settled</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showForm && canEdit && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-[#1B2A4A]">{editingId ? 'Edit Liability' : 'Add Liability'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Liability Name *</label>
                                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Bank Loan 2024"
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] bg-white">
                                        {LIABILITY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Amount (Rs.) *</label>
                                    <input type="number" required step="0.01" min="0" value={form.originalAmount} onChange={e => setForm(f => ({ ...f, originalAmount: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Creditor</label>
                                    <input value={form.creditor} onChange={e => setForm(f => ({ ...f, creditor: e.target.value }))} placeholder="Who you owe"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Due Date</label>
                                    <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional..."
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-bold text-slate-500">Cancel</button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 rounded-full bg-[#C9A84C] hover:bg-[#b0903b] py-3 text-sm font-bold text-[#1B2A4A] disabled:opacity-60 shadow-md">
                                    {saving ? 'Saving...' : editingId ? 'Update' : 'Add Liability'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Repayment Modal */}
            {repayModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black text-[#1B2A4A]">Record Repayment</h2>
                            <button onClick={() => setRepayModal(null)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">
                            Outstanding: <strong className="text-rose-600">{formatLKR(repayModal.liability.outstandingBalance)}</strong>
                        </p>
                        <form onSubmit={handleRepay} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Repayment Amount (Rs.) *</label>
                                <input type="number" required step="0.01" min="1" max={repayModal.liability.outstandingBalance}
                                    value={repayModal.amount}
                                    onChange={e => setRepayModal(r => ({ ...r, amount: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Note</label>
                                <input value={repayModal.note} onChange={e => setRepayModal(r => ({ ...r, note: e.target.value }))} placeholder="e.g. Monthly instalment"
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setRepayModal(null)}
                                    className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-bold text-slate-500">Cancel</button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 rounded-full bg-emerald-500 hover:bg-emerald-600 py-3 text-sm font-bold text-white disabled:opacity-60 shadow-md">
                                    {saving ? 'Saving...' : 'Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
