import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatLKR, formatDate, StatusBadge, apiUrl } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

function InvoiceForm({ onSave, token }) {
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '', company: '' });
    const [items, setItems] = useState([{ name: '', description: '', qty: 1, unitPrice: 0, discount: 0 }]);
    const [extra, setExtra] = useState({
        discountAmount: 0,
        deliveryCharge: 0,
        tax: 0,
        notes: '',
        dueDate: ''
    });
    const [saving, setSaving] = useState(false);

    const addItem = () => setItems(i => [...i, { name: '', description: '', qty: 1, unitPrice: 0, discount: 0 }]);
    const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx));
    const updateItem = (idx, field, val) => setItems(i => i.map((item, j) => j === idx ? { ...item, [field]: val } : item));

    const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice * (1 - (i.discount || 0) / 100), 0);
    const total = subtotal - Number(extra.discountAmount) + Number(extra.deliveryCharge) + subtotal * Number(extra.tax) / 100;

    const submit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await apiFetch('/invoices', {
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
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Customer Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    {[['name', 'Customer Name *', 'e.g. John Doe'], ['phone', 'Phone', 'e.g. 077 123 4567'], ['email', 'Email Address', 'e.g. john@example.com'], ['company', 'Company', 'e.g. Acme Corp'], ['address', 'Address', 'e.g. 123 Main St']].map(([k, l, p]) => (
                        <div key={k} className="relative group">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 transition-colors group-focus-within:text-[#C9A84C]">{l}</label>
                            <input value={customer[k]} onChange={e => setCustomer(c => ({ ...c, [k]: e.target.value }))}
                                required={k === 'name'} placeholder={p}
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white placeholder:text-slate-300" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider">Line Items</h3>
                    <button type="button" onClick={addItem} className="flex items-center gap-1.5 rounded-full bg-[#1B2A4A] px-3 py-1.5 text-xs font-bold text-[#C9A84C] hover:bg-[#243a5e] transition-colors shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        Add Item
                    </button>
                </div>

                <div className="hidden sm:grid grid-cols-[1fr_100px_120px_100px_40px] gap-3 mb-2 px-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Product Description</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide text-center">Quantity</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide text-right">Price (LKR)</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide text-center">Discount %</p>
                </div>

                <div className="space-y-3">
                    {items.map((item, idx) => (
                        <div key={idx} className="group flex flex-col sm:grid sm:grid-cols-[1fr_100px_120px_100px_40px] gap-3 items-center bg-white p-3 sm:p-2 sm:bg-transparent rounded-xl shadow-sm sm:shadow-none border border-slate-100 sm:border-transparent transition-all hover:bg-white hover:shadow-sm hover:border-slate-100">
                            <div className="w-full relative">
                                <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase absolute -top-2 left-2 bg-white px-1">Product</span>
                                <input placeholder="e.g. Premium Gift Box" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} required
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-shadow" />
                            </div>
                            <div className="w-full relative">
                                <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase absolute -top-2 left-2 bg-white px-1">Qty</span>
                                <input type="number" placeholder="Qty" min="1" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} required
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-shadow sm:text-center" />
                            </div>
                            <div className="w-full relative">
                                <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase absolute -top-2 left-2 bg-white px-1">Price</span>
                                <input type="number" placeholder="Unit Price" min="0" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} required
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-shadow sm:text-right" />
                            </div>
                            <div className="w-full relative">
                                <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase absolute -top-2 left-2 bg-white px-1">Disc%</span>
                                <input type="number" placeholder="Disc%" min="0" max="100" value={item.discount} onChange={e => updateItem(idx, 'discount', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-shadow sm:text-center" />
                            </div>
                            <button type="button" onClick={() => removeItem(idx)} title="Remove Item"
                                className="w-full sm:w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 sm:hover:bg-red-50 transition-colors">
                                <svg className="w-5 h-5 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                <span className="sm:hidden text-sm font-semibold flex items-center justify-center w-full bg-red-50 py-2 rounded-lg text-red-500 mt-1">Remove Item</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 grid gap-4 sm:grid-cols-3">
                <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Overall Discount</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">LKR</span>
                        <input type="number" min="0" value={extra.discountAmount} onChange={e => setExtra(x => ({ ...x, discountAmount: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 pl-12 pr-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] bg-white" />
                    </div>
                </div>
                <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Delivery Charge</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">LKR</span>
                        <input type="number" min="0" value={extra.deliveryCharge} onChange={e => setExtra(x => ({ ...x, deliveryCharge: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 pl-12 pr-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] bg-white" />
                    </div>
                </div>
                <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tax (%)</label>
                    <input type="number" min="0" value={extra.tax} onChange={e => setExtra(x => ({ ...x, tax: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] bg-white" />
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Additional Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="relative group">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 transition-colors group-focus-within:text-[#C9A84C]">Due Date</label>
                        <input type="date" value={extra.dueDate} onChange={e => setExtra(x => ({ ...x, dueDate: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-700" />
                    </div>
                    <div className="relative group">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 transition-colors group-focus-within:text-[#C9A84C]">Notes / Terms</label>
                        <input value={extra.notes} onChange={e => setExtra(x => ({ ...x, notes: e.target.value }))} placeholder="e.g. Please pay within 7 days"
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white placeholder:text-slate-300" />
                    </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between rounded-xl bg-gradient-to-r from-[#1B2A4A] to-slate-800 px-6 py-4 shadow-md relative overflow-hidden">
                    <span className="text-white/80 text-sm font-semibold uppercase tracking-widest relative z-10 mb-2 sm:mb-0">Estimated Total</span>
                    <span className="text-[#C9A84C] font-black text-3xl tracking-tight relative z-10">{formatLKR(total)}</span>
                </div>
            </div>

            <button type="submit" disabled={saving}
                className="w-full rounded-xl bg-gradient-to-r from-[#C9A84C] to-yellow-600 py-3.5 text-sm font-bold text-white uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60">
                {saving ? 'Creating Invoice...' : 'Finalize & Create Invoice'}
            </button>
        </form>
    );
}

export default function InvoicesPage() {
    const { token } = useAdminAuth();
    const [invoices, setInvoices] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // list | new
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);
    const [payForm, setPayForm] = useState({ amount: '', method: 'BANK', reference: '', notes: '' });
    const [paying, setPaying] = useState(false);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/invoices', {}, token);
            setInvoices(data.invoices || []); setTotal(data.total || 0);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [token]);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

    const openDetail = async (inv) => {
        setSelected(inv);
        try {
            const d = await apiFetch(`/invoices/${inv._id}`, {}, token);
            setDetail(d);
        } catch (e) { console.error(e); }
    };

    const recordPayment = async (e) => {
        e.preventDefault(); setPaying(true);
        try {
            await apiFetch(`/invoices/${selected._id}/payment`, {
                method: 'POST', body: JSON.stringify({ ...payForm, amount: Number(payForm.amount) }),
            }, token);
            setPayForm({ amount: '', method: 'BANK', reference: '', notes: '' });
            openDetail(selected);
            fetchInvoices();
        } catch (e) { alert(e.message); } finally { setPaying(false); }
    };

    const downloadPdf = (id) => window.open(apiUrl(`/pdf/invoice/${id}?token=${token}`), '_blank');

    if (view === 'new') return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('list')} className="text-slate-400 hover:text-[#1B2A4A]">← Back</button>
                <h2 className="font-bold text-[#1B2A4A] text-lg">New Standalone Invoice</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <InvoiceForm token={token} onSave={() => { setView('list'); fetchInvoices(); }} />
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="font-bold text-[#1B2A4A]">Invoices ({total})</span>
                <button onClick={() => setView('new')}
                    className="rounded-full bg-[#1B2A4A] px-5 py-2 text-xs font-bold text-white hover:bg-[#243a5e]">
                    + New Invoice
                </button>
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                            <tr>
                                {['INV #', 'Customer', 'Total', 'Paid', 'Balance', 'Status', 'Due', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={8} className="py-10 text-center text-slate-400">Loading…</td></tr>
                            ) : invoices.map(inv => (
                                <tr key={inv._id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#1B2A4A]">{inv.invoiceNumber}</td>
                                    <td className="px-4 py-3 font-medium text-[#1B2A4A]">{inv.customer?.name}</td>
                                    <td className="px-4 py-3 font-semibold">{formatLKR(inv.total)}</td>
                                    <td className="px-4 py-3 text-green-600 font-semibold">{formatLKR(inv.amountPaid)}</td>
                                    <td className="px-4 py-3 text-red-500 font-semibold">{formatLKR(inv.balanceDue)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={inv.paymentStatus} /></td>
                                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(inv.dueDate)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => openDetail(inv)}
                                                className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:border-[#C9A84C]">
                                                Payment
                                            </button>
                                            <button onClick={() => downloadPdf(inv._id)}
                                                className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                                PDF
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && !invoices.length && (
                                <tr><td colSpan={8} className="py-10 text-center text-slate-400">No invoices yet. Convert a quotation to create one.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h2 className="font-bold text-[#1B2A4A]">{selected.invoiceNumber} — Payments</h2>
                            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-xs text-slate-400">Total</p>
                                    <p className="font-bold text-[#1B2A4A] text-sm">{formatLKR(selected.total)}</p>
                                </div>
                                <div className="rounded-xl bg-green-50 p-3">
                                    <p className="text-xs text-slate-400">Paid</p>
                                    <p className="font-bold text-green-600 text-sm">{formatLKR(selected.amountPaid)}</p>
                                </div>
                                <div className="rounded-xl bg-red-50 p-3">
                                    <p className="text-xs text-slate-400">Balance</p>
                                    <p className="font-bold text-red-500 text-sm">{formatLKR(selected.balanceDue)}</p>
                                </div>
                            </div>

                            {/* Payment history */}
                            {detail?.payments?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Payment History</p>
                                    {detail.payments.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 text-xs">
                                            <span className="text-slate-500">{formatDate(p.date)}</span>
                                            <span className="font-semibold text-slate-600">{p.method}</span>
                                            <span className="text-slate-400">{p.reference || '—'}</span>
                                            <span className="font-bold text-green-600">{formatLKR(p.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Record payment form */}
                            {selected.paymentStatus !== 'PAID' && (
                                <form onSubmit={recordPayment} className="space-y-3">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Record Payment</p>
                                    <input type="number" min="1" placeholder="Amount (LKR)" value={payForm.amount}
                                        onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} required
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                                    <select value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]">
                                        {['BANK', 'CASH', 'COD', 'PAYHERE'].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <input placeholder="Reference / Slip #" value={payForm.reference}
                                        onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                                    <button type="submit" disabled={paying}
                                        className="w-full rounded-full bg-[#C9A84C] py-2.5 text-sm font-bold text-[#1B2A4A] disabled:opacity-60">
                                        {paying ? 'Recording…' : 'Record Payment'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
