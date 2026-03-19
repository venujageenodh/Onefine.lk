import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatLKR } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

export default function AccountsPage() {
    const { token, admin } = useAdminAuth();
    const [data, setData] = useState({ accounts: [], totalBalance: 0 });
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [adjustForm, setAdjustForm] = useState({ accountId: '', adjustment: '', note: '' });
    const [newForm, setNewForm] = useState({ name: '', type: 'cash', balance: '', description: '' });
    const [saving, setSaving] = useState(false);
    const canEdit = admin?.role === 'OWNER' || admin?.role === 'DEVELOPER' || admin?.role === 'ACCOUNT_ADMIN';

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await apiFetch('/accounts', {}, token);
            setData(d);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const handleAddAccount = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiFetch('/accounts', { method: 'POST', body: JSON.stringify({ ...newForm, balance: Number(newForm.balance) }) }, token);
            setNewForm({ name: '', type: 'cash', balance: '', description: '' });
            setShowAdd(false);
            load();
        } catch (e) { alert(e.message); }
        finally { setSaving(false); }
    };

    const handleAdjust = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiFetch('/accounts/adjust', { method: 'POST', body: JSON.stringify({ ...adjustForm, adjustment: Number(adjustForm.adjustment) }) }, token);
            setAdjustForm({ accountId: '', adjustment: '', note: '' });
            load();
        } catch (e) { alert(e.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight">Account Balances</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Real-Time Cash & Bank Management</p>
                </div>
                {canEdit && (
                    <button onClick={() => setShowAdd(true)}
                        className="rounded-2xl bg-[#C9A84C] hover:bg-[#b0903b] transition-colors px-5 py-2.5 text-sm font-bold text-[#1B2A4A] shadow-sm">
                        + Add Account
                    </button>
                )}
            </div>

            {/* Total Balance Hero */}
            <div className="rounded-3xl bg-[#1B2A4A] text-white p-8 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #C9A84C, transparent 60%)' }} />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Total Balance Across All Accounts</p>
                <p className="text-5xl font-black tracking-tight text-[#C9A84C]">{formatLKR(data.totalBalance)}</p>
                <p className="text-xs font-bold text-white/40 mt-3 uppercase">{data.accounts?.length || 0} Active Accounts</p>
            </div>

            {/* Account Cards */}
            {loading ? (
                <div className="flex py-16 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C9A84C] border-t-transparent" />
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {data.accounts?.map(acc => (
                        <div key={acc._id} className="relative bg-white rounded-3xl border border-slate-100 shadow-sm p-7 overflow-hidden hover:shadow-md transition-shadow">
                            <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-3xl ${acc.type === 'cash' ? 'bg-emerald-400' : acc.type === 'bank' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="text-3xl">{acc.type === 'cash' ? '💵' : acc.type === 'bank' ? '🏦' : '💳'}</span>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${acc.type === 'cash' ? 'bg-emerald-100 text-emerald-700' : acc.type === 'bank' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {acc.type}
                                </span>
                            </div>
                            <h3 className="font-black text-[#1B2A4A] text-lg mb-1">{acc.name}</h3>
                            {acc.description && <p className="text-xs text-slate-400 mb-4">{acc.description}</p>}
                            <p className={`text-3xl font-black tracking-tight ${acc.balance >= 0 ? 'text-[#1B2A4A]' : 'text-rose-600'}`}>{formatLKR(acc.balance)}</p>
                            
                            {canEdit && (
                                <div className="mt-5 pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Adjustment</p>
                                    <form onSubmit={handleAdjust} className="flex gap-2">
                                        <input type="number" step="0.01" placeholder="± Amount"
                                            value={adjustForm.accountId === acc._id ? adjustForm.adjustment : ''}
                                            onChange={e => setAdjustForm({ accountId: acc._id, adjustment: e.target.value, note: '' })}
                                            className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#C9A84C]" />
                                        <button type="submit" disabled={saving || adjustForm.accountId !== acc._id}
                                            className="rounded-xl bg-[#C9A84C] hover:bg-[#b0903b] px-3 py-1.5 text-xs font-bold text-[#1B2A4A] disabled:opacity-40">
                                            Apply
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Account Modal */}
            {showAdd && canEdit && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-[#1B2A4A]">Add New Account</h2>
                            <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleAddAccount} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Account Name *</label>
                                <input required value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Petty Cash, Savings"
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                                    <select value={newForm.type} onChange={e => setNewForm(f => ({ ...f, type: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] bg-white">
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank</option>
                                        <option value="online">Online</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Opening Balance</label>
                                    <input type="number" step="0.01" value={newForm.balance} onChange={e => setNewForm(f => ({ ...f, balance: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                                <input value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional note"
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAdd(false)}
                                    className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-bold text-slate-500">Cancel</button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 rounded-full bg-[#C9A84C] hover:bg-[#b0903b] py-3 text-sm font-bold text-[#1B2A4A] disabled:opacity-60 shadow-md">
                                    {saving ? 'Saving...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
