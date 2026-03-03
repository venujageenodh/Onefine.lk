import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatLKR, formatDate, StatusBadge, apiUrl } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

function QuotationForm({ onSave, token }) {
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '', city: '', company: '' });
    const [items, setItems] = useState([{ name: '', description: '', qty: 1, unitPrice: 0, discount: 0 }]);
    const [extra, setExtra] = useState({ discountAmount: 0, deliveryCharge: 0, tax: 0, notes: '', validUntil: '' });
    const [saving, setSaving] = useState(false);

    const addItem = () => setItems(i => [...i, { name: '', description: '', qty: 1, unitPrice: 0, discount: 0 }]);
    const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx));
    const updateItem = (idx, field, val) => setItems(i => i.map((item, j) => j === idx ? { ...item, [field]: val } : item));

    const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice * (1 - (i.discount || 0) / 100), 0);
    const total = subtotal - Number(extra.discountAmount) + Number(extra.deliveryCharge) + subtotal * Number(extra.tax) / 100;

    const submit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await apiFetch('/quotations', {
                method: 'POST', body: JSON.stringify({
                    customer, items: items.map(i => ({ ...i, qty: Number(i.qty), unitPrice: Number(i.unitPrice), discount: Number(i.discount) })),
                    ...extra, discountAmount: Number(extra.discountAmount), deliveryCharge: Number(extra.deliveryCharge), tax: Number(extra.tax),
                })
            }, token);
            onSave();
        } catch (e) { alert(e.message); } finally { setSaving(false); }
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
                {[['name', 'Customer Name *'], ['phone', 'Phone'], ['email', 'Email'], ['company', 'Company'], ['address', 'Address'], ['city', 'City']].map(([k, l]) => (
                    <div key={k}>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">{l}</label>
                        <input value={customer[k]} onChange={e => setCustomer(c => ({ ...c, [k]: e.target.value }))}
                            required={k === 'name'}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                    </div>
                ))}
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-600 uppercase">Line Items</p>
                    <button type="button" onClick={addItem} className="text-xs font-bold text-[#C9A84C]">+ Add Item</button>
                </div>
                {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_60px_90px_60px_30px] gap-2 mb-2 items-end">
                        <input placeholder="Product name" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} required
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                        <input type="number" placeholder="Qty" min="1" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                        <input type="number" placeholder="Unit Price" min="0" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                        <input type="number" placeholder="Disc%" min="0" max="100" value={item.discount} onChange={e => updateItem(idx, 'discount', e.target.value)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-sm font-bold">×</button>
                    </div>
                ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Overall Discount (LKR)</label>
                    <input type="number" min="0" value={extra.discountAmount} onChange={e => setExtra(x => ({ ...x, discountAmount: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Delivery (LKR)</label>
                    <input type="number" min="0" value={extra.deliveryCharge} onChange={e => setExtra(x => ({ ...x, deliveryCharge: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Tax (%)</label>
                    <input type="number" min="0" value={extra.tax} onChange={e => setExtra(x => ({ ...x, tax: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" /></div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Valid Until</label>
                    <input type="date" value={extra.validUntil} onChange={e => setExtra(x => ({ ...x, validUntil: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" /></div>
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Notes</label>
                    <input value={extra.notes} onChange={e => setExtra(x => ({ ...x, notes: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" /></div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#1B2A4A] px-5 py-3">
                <span className="text-white/70 text-sm">Total</span>
                <span className="text-[#C9A84C] font-bold text-lg">{formatLKR(total)}</span>
            </div>

            <button type="submit" disabled={saving}
                className="w-full rounded-full bg-[#C9A84C] py-3 text-sm font-bold text-[#1B2A4A] disabled:opacity-60">
                {saving ? 'Creating…' : 'Create Quotation'}
            </button>
        </form>
    );
}

export default function QuotationsPage() {
    const { token } = useAdminAuth();
    const [quotations, setQuotations] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // list | new

    const fetchQuotations = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/quotations', {}, token);
            setQuotations(data.quotations || []);
            setTotal(data.total || 0);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [token]);

    useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

    const convertToInvoice = async (id) => {
        if (!window.confirm('Convert this quotation to an invoice?')) return;
        try {
            await apiFetch(`/quotations/${id}/convert`, { method: 'POST', body: JSON.stringify({}) }, token);
            fetchQuotations();
        } catch (e) { alert(e.message); }
    };

    const downloadPdf = (id) => {
        window.open(apiUrl(`/pdf/quotation/${id}?token=${token}`), '_blank');
    };

    if (view === 'new') return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('list')} className="text-slate-400 hover:text-[#1B2A4A]">← Back</button>
                <h2 className="font-bold text-[#1B2A4A] text-lg">New Quotation</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <QuotationForm token={token} onSave={() => { setView('list'); fetchQuotations(); }} />
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="font-bold text-[#1B2A4A]">Quotations ({total})</span>
                <button onClick={() => setView('new')}
                    className="rounded-full bg-[#1B2A4A] px-5 py-2 text-xs font-bold text-white hover:bg-[#243a5e]">
                    + New Quotation
                </button>
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                            <tr>
                                {['QT #', 'Customer', 'Total', 'Valid Until', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading…</td></tr>
                            ) : quotations.map(q => (
                                <tr key={q._id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#1B2A4A]">{q.qNumber}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-[#1B2A4A]">{q.customer?.name}</p>
                                        <p className="text-xs text-slate-400">{q.customer?.company}</p>
                                    </td>
                                    <td className="px-4 py-3 font-semibold">{formatLKR(q.total)}</td>
                                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(q.validUntil)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 flex-wrap">
                                            <button onClick={() => downloadPdf(q._id)}
                                                className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:border-[#C9A84C]">
                                                PDF
                                            </button>
                                            {q.status !== 'CONVERTED' && q.status !== 'REJECTED' && (
                                                <button onClick={() => convertToInvoice(q._id)}
                                                    className="rounded-full border border-[#C9A84C]/30 px-2.5 py-1 text-[10px] font-bold text-[#C9A84C] hover:bg-[#C9A84C]/10">
                                                    → Invoice
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && !quotations.length && (
                                <tr><td colSpan={6} className="py-10 text-center text-slate-400">No quotations yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
