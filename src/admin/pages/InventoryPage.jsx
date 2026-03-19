import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatLKR } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

export default function InventoryPage() {
    const { token } = useAdminAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [stockInForm, setStockInForm] = useState({ productId: '', qty: '', supplierId: '', reason: '', unitCost: '', recordExpense: false });
    const [suppliers, setSuppliers] = useState([]);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('all'); // all | low
    const [historyModal, setHistoryModal] = useState({ open: false, productId: null, movements: [], loading: false, productName: '' });

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const [inv, sup] = await Promise.all([
                apiFetch('/inventory', {}, token),
                apiFetch('/suppliers', {}, token).catch(() => []),
            ]);
            setItems(inv);
            setSuppliers(sup);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [token]);

    useEffect(() => { fetch(); }, [fetch]);

    const saveMinStock = async (productId, minStockQty) => {
        setSaving(true);
        try {
            await apiFetch(`/inventory/${productId}`, { method: 'PUT', body: JSON.stringify({ minStockQty }) }, token);
            setEditing(null); fetch();
        } catch (e) { alert(e.message); } finally { setSaving(false); }
    };

    const submitStockIn = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await apiFetch('/inventory/stock-in', {
                method: 'POST', body: JSON.stringify({
                    ...stockInForm, qty: Number(stockInForm.qty), unitCost: stockInForm.unitCost ? Number(stockInForm.unitCost) : undefined
                })
            }, token);
            setStockInForm({ productId: '', qty: '', supplierId: '', reason: '', unitCost: '', recordExpense: false });
            fetch();
        } catch (e) { alert(e.message); } finally { setSaving(false); }
    };

    const openHistory = async (product) => {
        setHistoryModal({ open: true, productId: product._id, productName: product.name, movements: [], loading: true });
        try {
            const data = await apiFetch(`/inventory/movements?productId=${product._id}`, {}, token);
            setHistoryModal(prev => ({ ...prev, movements: data || [], loading: false }));
        } catch (e) {
            alert(e.message);
            setHistoryModal(prev => ({ ...prev, loading: false }));
        }
    };

    const filtered = tab === 'low'
        ? items.filter(i => (i.inventory?.stockQty ?? 0) <= (i.inventory?.minStockQty ?? 5))
        : items;

    return (
        <>
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                {/* Main table */}
                <div className="space-y-4">
                    <div className="flex gap-2">
                        {['all', 'low'].map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all capitalize ${tab === t ? 'bg-[#1B2A4A] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                                {t === 'low' ? '⚠️ Low Stock' : 'All Products'}
                            </button>
                        ))}
                    </div>

                    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        {['Product', 'SKU', 'Stock', 'Reserved', 'Min Stock', 'Unit Cost', 'Status', 'Action'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan={7} className="py-10 text-center text-slate-400">Loading…</td></tr>
                                    ) : filtered.map(item => {
                                        const inv = item.inventory || {};
                                        const isLow = (inv.stockQty ?? 0) <= (inv.minStockQty ?? 5);
                                        return (
                                            <tr key={item._id} className={`hover:bg-slate-50/50 ${isLow ? 'bg-red-50/30' : ''}`}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {item.image && <img src={item.image} alt="" className="h-8 w-8 rounded-lg object-cover" />}
                                                        <span className="font-medium text-[#1B2A4A] text-xs">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.sku || '—'}</td>
                                                <td className="px-4 py-3 font-bold text-[#1B2A4A]">{inv.stockQty ?? 0}</td>
                                                <td className="px-4 py-3 text-slate-400">{inv.reservedQty ?? 0}</td>
                                                <td className="px-4 py-3">
                                                    {editing === item._id ? (
                                                        <input type="number" defaultValue={inv.minStockQty ?? 5} id={`min-${item._id}`}
                                                            className="w-16 rounded border border-slate-200 px-2 py-1 text-xs" />
                                                    ) : (
                                                        <span>{inv.minStockQty ?? 5}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-slate-700">{(item.costPrice != null && item.costPrice !== '') ? formatLKR(item.costPrice) : '—'}</td>
                                                <td className="px-4 py-3">
                                                    {isLow ? (
                                                        <span className="rounded-full bg-red-100 text-red-600 px-2 py-0.5 text-[10px] font-bold uppercase">Low</span>
                                                    ) : (
                                                        <span className="rounded-full bg-green-100 text-green-600 px-2 py-0.5 text-[10px] font-bold uppercase">OK</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => openHistory(item)} className="text-xs font-semibold text-blue-600 hover:underline">History</button>
                                                        {editing === item._id ? (
                                                            <button onClick={() => {
                                                                const val = document.getElementById(`min-${item._id}`)?.value;
                                                                if (val) saveMinStock(item._id, Number(val));
                                                            }} disabled={saving} className="text-xs font-bold text-green-600 hover:underline">Save</button>
                                                        ) : (
                                                            <button onClick={() => setEditing(item._id)} className="text-xs font-semibold text-slate-500 hover:text-[#1B2A4A]">Edit Min</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Stock In panel */}
                <aside>
                    <div className="sticky top-4 rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
                        <h2 className="font-bold text-[#1B2A4A] mb-4">Receive Stock</h2>
                        <form onSubmit={submitStockIn} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Product</label>
                                <select value={stockInForm.productId} onChange={e => setStockInForm(f => ({ ...f, productId: e.target.value }))} required
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]">
                                    <option value="">Select product…</option>
                                    {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Quantity</label>
                                <input type="number" min="1" value={stockInForm.qty} onChange={e => setStockInForm(f => ({ ...f, qty: e.target.value }))} required
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" placeholder="e.g. 50" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Buying Price (Unit Cost Rs.)</label>
                                <input type="number" min="0" value={stockInForm.unitCost} onChange={e => setStockInForm(f => ({ ...f, unitCost: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" placeholder="e.g. 1500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Supplier (optional)</label>
                                <select value={stockInForm.supplierId} onChange={e => setStockInForm(f => ({ ...f, supplierId: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]">
                                    <option value="">None</option>
                                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Reason / Note</label>
                                <input value={stockInForm.reason} onChange={e => setStockInForm(f => ({ ...f, reason: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" placeholder="e.g. Restock from supplier" />
                            </div>
                            <div className="flex items-center gap-2 pt-2 px-1">
                                <input type="checkbox" id="recordExpense" checked={stockInForm.recordExpense} onChange={e => setStockInForm(f => ({ ...f, recordExpense: e.target.checked }))}
                                    className="h-4 w-4 rounded border-slate-300 text-[#C9A84C] focus:ring-[#C9A84C]" />
                                <label htmlFor="recordExpense" className="text-xs font-bold text-slate-600 cursor-pointer">Record as Business Expense</label>
                            </div>
                            <button type="submit" disabled={saving}
                                className="w-full rounded-full bg-[#C9A84C] py-2.5 text-sm font-bold text-[#1B2A4A] disabled:opacity-60">
                                {saving ? 'Saving…' : '+ Add Stock'}
                            </button>
                        </form>
                    </div>
                </aside>
            </div>

            {/* History Modal */}
            {
                historyModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50">
                                <h3 className="font-bold text-[#1B2A4A]">Purchase History: {historyModal.productName}</h3>
                                <button onClick={() => setHistoryModal({ open: false, movements: [], loading: false, productId: null, productName: '' })} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-full shadow-sm">✕</button>
                            </div>
                            <div className="p-5 overflow-y-auto">
                                {historyModal.loading ? (
                                    <p className="text-center text-slate-400 py-10">Loading history…</p>
                                ) : historyModal.movements.length === 0 ? (
                                    <p className="text-center text-slate-400 py-10">No stock movements found.</p>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Date</th>
                                                <th className="px-4 py-2 text-left">Type</th>
                                                <th className="px-4 py-2 text-left">Qty</th>
                                                <th className="px-4 py-2 text-left">Unit Cost</th>
                                                <th className="px-4 py-2 text-left">Total Cost</th>
                                                <th className="px-4 py-2 text-left">Note</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {historyModal.movements.map(m => (
                                                <tr key={m._id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3 text-xs font-bold text-slate-700">{m.type}</td>
                                                    <td className="px-4 py-3 font-semibold text-green-600">+{m.qty}</td>
                                                    <td className="px-4 py-3 text-slate-600">{(m.unitCost != null && m.unitCost !== '') ? formatLKR(m.unitCost) : '—'}</td>
                                                    <td className="px-4 py-3 font-medium text-slate-800">{(m.totalCost != null && m.totalCost !== '') ? formatLKR(m.totalCost) : '—'}</td>
                                                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">{m.reason || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
