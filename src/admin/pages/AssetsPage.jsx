import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatLKR, formatDate } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

const ASSET_TYPES = ['inventory', 'equipment', 'vehicle', 'property', 'tool', 'other'];
const TYPE_ICONS = { inventory: '📦', equipment: '🔧', vehicle: '🚗', property: '🏢', tool: '🛠️', other: '💼' };

function emptyForm() {
    return { name: '', type: 'equipment', value: '', purchaseDate: new Date().toISOString().split('T')[0], description: '' };
}

export default function AssetsPage() {
    const { token, admin } = useAdminAuth();
    const [data, setData] = useState({ assets: [], totalValue: 0 });
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm());
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const canEdit = admin?.role === 'OWNER' || admin?.role === 'DEVELOPER' || admin?.role === 'ACCOUNT_ADMIN';

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await apiFetch('/assets', {}, token);
            setData(d);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, value: Number(form.value) };
            if (editingId) {
                await apiFetch(`/assets/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) }, token);
            } else {
                await apiFetch('/assets', { method: 'POST', body: JSON.stringify(payload) }, token);
            }
            setForm(emptyForm());
            setEditingId(null);
            setShowForm(false);
            load();
        } catch (e) { alert(e.message); }
        finally { setSaving(false); }
    };

    const handleEdit = (asset) => {
        setEditingId(asset._id);
        setForm({
            name: asset.name, type: asset.type, value: asset.value,
            purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
            description: asset.description || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this asset?')) return;
        try {
            await apiFetch(`/assets/${id}`, { method: 'DELETE' }, token);
            load();
        } catch (e) { alert(e.message); }
    };

    // Group by type
    const byType = {};
    (data.assets || []).forEach(a => {
        if (!byType[a.type]) byType[a.type] = [];
        byType[a.type].push(a);
    });

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight">Asset Management</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Track all business assets and their value</p>
                </div>
                {canEdit && (
                    <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); }}
                        className="rounded-2xl bg-[#C9A84C] hover:bg-[#b0903b] transition-colors px-5 py-2.5 text-sm font-bold text-[#1B2A4A] shadow-sm">
                        + Add Asset
                    </button>
                )}
            </div>

            {/* Total Value Hero */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-12 translate-x-12" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">Total Asset Value</p>
                <p className="text-4xl font-black tracking-tight">{formatLKR(data.totalValue)}</p>
                <p className="text-xs font-bold text-white/50 mt-2 uppercase">{(data.assets || []).length} Active Assets</p>
            </div>

            {/* Asset Type Breakdown */}
            {Object.keys(byType).length > 0 && (
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {ASSET_TYPES.map(type => {
                        const items = byType[type] || [];
                        const val = items.reduce((s, a) => s + a.value, 0);
                        return (
                            <div key={type} className={`rounded-2xl p-4 border ${items.length > 0 ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
                                <span className="text-2xl block mb-2">{TYPE_ICONS[type]}</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">{type}</p>
                                <p className="text-xs font-black text-[#1B2A4A] mt-0.5">{items.length} items</p>
                                {val > 0 && <p className="text-[10px] font-bold text-emerald-600 mt-1">{formatLKR(val)}</p>}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Assets List */}
            {loading ? (
                <div className="flex py-16 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C9A84C] border-t-transparent" />
                </div>
            ) : (data.assets || []).length === 0 ? (
                <div className="py-16 text-center rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                    <span className="text-4xl block mb-3">📦</span>
                    <p className="font-semibold">No assets recorded yet</p>
                    <p className="text-sm mt-1">Add your first asset to start tracking business value</p>
                </div>
            ) : (
                <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-left">Asset</th>
                                <th className="px-6 py-4 text-left">Type</th>
                                <th className="px-6 py-4 text-left">Description</th>
                                <th className="px-6 py-4 text-left">Purchase Date</th>
                                <th className="px-6 py-4 text-right">Value</th>
                                {canEdit && <th className="px-6 py-4 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(data.assets || []).map(asset => (
                                <tr key={asset._id} className="hover:bg-slate-50/40 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{TYPE_ICONS[asset.type] || '💼'}</span>
                                            <span className="font-bold text-[#1B2A4A]">{asset.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 capitalize">{asset.type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 max-w-[180px] truncate">{asset.description || '—'}</td>
                                    <td className="px-6 py-4 text-xs text-slate-400 font-semibold">{formatDate(asset.purchaseDate)}</td>
                                    <td className="px-6 py-4 text-right font-black text-emerald-600">{formatLKR(asset.value)}</td>
                                    {canEdit && (
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(asset)}
                                                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-[#1B2A4A]">Edit</button>
                                                <button onClick={() => handleDelete(asset._id)}
                                                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50">Remove</button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showForm && canEdit && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-[#1B2A4A]">{editingId ? 'Edit Asset' : 'Add Asset'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Asset Name *</label>
                                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. HP Laptop"
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] bg-white">
                                        {ASSET_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Value (Rs.) *</label>
                                    <input type="number" required step="0.01" min="0" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Purchase Date</label>
                                <input type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
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
                                    {saving ? 'Saving...' : editingId ? 'Update' : 'Add Asset'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
