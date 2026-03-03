import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatLKR, formatDate, StatusBadge, apiUrl } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

export default function InvoicesPage() {
    const { token } = useAdminAuth();
    const [invoices, setInvoices] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="font-bold text-[#1B2A4A]">Invoices ({total})</span>
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
