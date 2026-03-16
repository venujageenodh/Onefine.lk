import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch, formatLKR, formatDate, StatusBadge, apiUrl, formatDateTime } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';
import { 
    HiDotsVertical, HiDownload, HiPrinter, HiPlus, 
    HiChevronLeft, HiCurrencyDollar, HiClock, HiCheckCircle,
    HiShieldCheck, HiOutlineDocumentText, HiSearch
} from 'react-icons/hi';

function SectionHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-2xl font-black text-[#1B2A4A] tracking-tight">{title}</h2>
                {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

const PAYMENT_STAGES = ['UNPAID', 'PARTIALLY_PAID', 'PAID'];

function InvoiceForm({ onSave, token, initialData = null }) {
    const [customer, setCustomer] = useState(initialData?.customer || { name: '', phone: '', email: '', address: '', company: '' });
    const [items, setItems] = useState(initialData?.items || [{ name: '', description: '', qty: 1, unitPrice: 0, discount: 0 }]);
    const [extra, setExtra] = useState({
        discountAmount: initialData?.discountAmount || 0,
        deliveryCharge: initialData?.deliveryCharge || 0,
        tax: initialData?.tax || 0,
        notes: initialData?.notes || '',
        description: initialData?.description || '',
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : ''
    });
    const [saving, setSaving] = useState(false);

    const addItem = () => setItems(i => [...i, { name: '', description: '', qty: 1, unitPrice: 0, discount: 0 }]);
    const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx));
    const updateItem = (idx, field, val) => setItems(i => i.map((item, j) => j === idx ? { ...item, [field]: val } : item));

    const subtotal = items.reduce((s, i) => s + Number(i.qty) * Number(i.unitPrice) * (1 - (Number(i.discount) || 0) / 100), 0);
    const taxAmount = (subtotal - Number(extra.discountAmount)) * (Number(extra.tax) / 100);
    const total = subtotal - Number(extra.discountAmount) + Number(extra.deliveryCharge) + taxAmount;

    const submit = async (e) => {
        e.preventDefault();
        if (items.length === 0) return alert('At least one line item is required.');

        setSaving(true);
        try {
            await apiFetch('/invoices', {
                method: 'POST', body: JSON.stringify({
                    customer, 
                    items: items.map(i => ({ 
                        ...i, 
                        qty: Number(i.qty), 
                        unitPrice: Number(i.unitPrice), 
                        discount: Number(i.discount) 
                    })),
                    ...extra, 
                    discountAmount: Number(extra.discountAmount), 
                    deliveryCharge: Number(extra.deliveryCharge), 
                    tax: Number(extra.tax),
                    description: extra.description,
                })
            }, token);
            onSave();
        } catch (e) { alert(e.message); } finally { setSaving(false); }
    };

    return (
        <form onSubmit={submit} className="space-y-12">
            {/* Customer Section */}
            <section className="space-y-6">
                <SectionHeader title="Entity Credentials" subtitle="Bill-To Legal & Contact" />
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Customer Full Name *</label>
                            <input required value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}
                                className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/50 focus:bg-white transition-all font-bold text-[#1B2A4A]" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Phone Number</label>
                                <input value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}
                                    className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/50 focus:bg-white transition-all font-bold text-[#1B2A4A]" />
                            </div>
                            <div className="relative group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                                <input type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})}
                                    className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/50 focus:bg-white transition-all font-bold text-[#1B2A4A]" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Company / Entity Name</label>
                            <input value={customer.company} onChange={e => setCustomer({...customer, company: e.target.value})}
                                className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/50 focus:bg-white transition-all font-bold text-[#1B2A4A]" />
                        </div>
                        <div className="relative group">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Billing Address</label>
                            <input value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}
                                className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/50 focus:bg-white transition-all font-bold text-[#1B2A4A]" />
                        </div>
                    </div>
                </div>
                <div className="mt-8 px-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Invoice Subject / Project Reference</label>
                    <input value={extra.description} onChange={e => setExtra({...extra, description: e.target.value})}
                        placeholder="e.g. Final Settlement for Q3 Corporate Gifting Project"
                        className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/50 focus:bg-white transition-all font-bold text-[#1B2A4A]" />
                </div>
            </section>

            {/* Line Items Section */}
            <section className="space-y-6">
                <div className="bg-slate-50/50 rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-[#1B2A4A] uppercase tracking-widest">Invoiced Manifest</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Settlement Details Per Unit</p>
                        </div>
                        <button type="button" onClick={addItem} className="flex items-center gap-2 rounded-full bg-[#1B2A4A] px-5 py-2 text-[10px] font-black text-[#C9A84C] hover:scale-105 transition-all shadow-md uppercase tracking-widest">
                            <HiPlus /> Add Entry
                        </button>
                    </div>

                    <div className="hidden md:grid grid-cols-[1fr_80px_120px_100px_120px_40px] gap-4 mb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <div>Item Designation</div>
                        <div className="text-center">Quantity</div>
                        <div className="text-right">Price (LKR)</div>
                        <div className="text-center">Discount %</div>
                        <div className="text-right">Total (LKR)</div>
                        <div></div>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, idx) => {
                            const rowTotal = item.qty * item.unitPrice * (1 - (item.discount || 0) / 100);
                            return (
                                <div key={idx} className="flex flex-col md:grid md:grid-cols-[1fr_80px_120px_100px_120px_40px] gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-50 group hover:border-[#C9A84C]/30 transition-all">
                                    <div className="w-full space-y-2">
                                        <input placeholder="e.g. Standard Service Unit" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} required
                                            className="w-full rounded-xl border border-slate-100 px-4 py-2.5 text-xs outline-none focus:border-[#C9A84C] bg-slate-50 transition-all font-bold text-[#1B2A4A]" />
                                        <input placeholder="Item Description / Specifics" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)}
                                            className="w-full rounded-lg border border-transparent bg-slate-50/30 px-4 py-1.5 text-[10px] outline-none focus:bg-white focus:border-slate-100 transition-all" />
                                    </div>
                                    <input type="number" min="1" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)}
                                        className="w-full rounded-xl border border-slate-100 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] bg-white transition-all font-bold text-center text-[#1B2A4A]" />
                                    <input type="number" min="0" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                                        className="w-full rounded-xl border border-slate-100 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] bg-white transition-all font-bold text-right text-[#1B2A4A]" />
                                    <input type="number" min="0" max="100" value={item.discount} onChange={e => updateItem(idx, 'discount', e.target.value)}
                                        className="w-full rounded-xl border border-slate-100 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] bg-white transition-all font-bold text-center text-[#1B2A4A]" />
                                    <div className="w-full text-right px-2 font-black text-[#1B2A4A] text-sm truncate">
                                        {rowTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <button type="button" onClick={() => removeItem(idx)} className="p-2.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                                        <HiDotsVertical className="text-xl rotate-90" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Summary Section */}
            <section className="space-y-6">
                <div className="bg-slate-50/50 rounded-[40px] p-8 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Overall Reduction</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">LKR</span>
                            <input type="number" min="0" value={extra.discountAmount} onChange={e => setExtra({...extra, discountAmount: e.target.value})}
                                className="w-full rounded-2xl border border-slate-200 pl-14 pr-6 py-4 text-sm outline-none focus:border-[#C9A84C] bg-white transition-all font-bold text-[#1B2A4A] shadow-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Logistics / Delivery</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">LKR</span>
                            <input type="number" min="0" value={extra.deliveryCharge} onChange={e => setExtra({...extra, deliveryCharge: e.target.value})}
                                className="w-full rounded-2xl border border-slate-200 pl-14 pr-6 py-4 text-sm outline-none focus:border-[#C9A84C] bg-white transition-all font-bold text-[#1B2A4A] shadow-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Tax Matrix (%)</label>
                        <div className="relative">
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">%</span>
                            <input type="number" min="0" value={extra.tax} onChange={e => setExtra({...extra, tax: e.target.value})}
                                className="w-full rounded-2xl border border-slate-200 pl-6 pr-12 py-4 text-sm outline-none focus:border-[#C9A84C] bg-white transition-all font-bold text-right text-[#1B2A4A] shadow-sm" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Settlement Deadline</label>
                                <input type="date" value={extra.dueDate} onChange={e => setExtra({...extra, dueDate: e.target.value})}
                                    className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/50 focus:bg-white transition-all font-bold text-[#1B2A4A]" />
                            </div>
                            <div className="relative group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Internal Reference / Notes</label>
                                <input value={extra.notes} onChange={e => setExtra({...extra, notes: e.target.value})} placeholder="e.g. Terms & Conditions"
                                    className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/50 focus:bg-white transition-all font-medium text-[#1B2A4A]" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-[#1B2A4A] rounded-[40px] p-10 flex flex-col justify-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C] blur-[60px] opacity-10"></div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Gross Subtotal</span>
                            <span className="text-white font-bold">{formatLKR(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-6 text-[#C9A84C]">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Calculated Tax</span>
                            <span className="font-bold">+{formatLKR(taxAmount)}</span>
                        </div>
                        <div className="pt-8 border-t border-white/10">
                            <span className="block text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.4em] mb-2">Total Receivable Matched</span>
                            <div className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">{formatLKR(total)}</div>
                        </div>
                    </div>
                </div>
            </section>

            <button type="submit" disabled={saving}
                className="w-full rounded-[25px] bg-[#1B2A4A] py-6 text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.01] transition-all disabled:opacity-60 flex items-center justify-center gap-3">
                {saving ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[#C9A84C] border-t-transparent animate-spin" />
                ) : null}
                {saving ? 'Synchronizing Pipeline...' : 'Authorize & Generate Invoice'}
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
            <SectionHeader 
                title="Financial Ledger" 
                subtitle="Invoices & Settlement Tracking"
                action={
                    <button onClick={() => setView('new')}
                        className="rounded-2xl bg-[#1B2A4A] px-6 py-3.5 text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all">
                        + Generate Standalone Invoice
                    </button>
                }
            />

            {/* Quick Summary Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Receivables', value: total, icon: HiOutlineDocumentText, color: 'navy' },
                    { label: 'Pending Settlement', value: invoices.filter(i => i.paymentStatus !== 'PAID').length, icon: HiClock, color: 'gold' },
                    { label: 'Fully Paid', value: invoices.filter(i => i.paymentStatus === 'PAID').length, icon: HiCheckCircle, color: 'gold' },
                    { label: 'Live Revenue', value: formatLKR(invoices.reduce((s, i) => s + i.amountPaid, 0)), icon: HiCurrencyDollar, color: 'navy' },
                ].map((s, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-[#C9A84C]/30 transition-all">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${s.color === 'gold' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'bg-[#1B2A4A]/10 text-[#1B2A4A]'}`}>
                            <s.icon />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <p className="text-base font-black text-[#1B2A4A] mt-0.5">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block rounded-[40px] bg-white border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] border-b border-slate-50">
                            <tr>
                                <th className="px-8 py-6 text-left">Internal Ref</th>
                                <th className="px-8 py-6 text-left">Client Entity</th>
                                <th className="px-8 py-6 text-right">Total (LKR)</th>
                                <th className="px-8 py-6 text-right">Settled</th>
                                <th className="px-8 py-6 text-center">Status</th>
                                <th className="px-8 py-6 text-center">Operation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="py-24 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full border-4 border-[#C9A84C] border-t-transparent animate-spin mb-4" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Querying Settlement Database...</p>
                                    </div>
                                </td></tr>
                            ) : (invoices || []).map(inv => (
                                <tr key={inv._id} className="hover:bg-slate-50/30 group transition-all">
                                    <td className="px-8 py-6">
                                        <span className="font-mono text-xs font-black text-[#1B2A4A] bg-slate-50 px-3 py-1.5 rounded-lg group-hover:bg-[#1B2A4A] group-hover:text-[#C9A84C] transition-all">
                                            {inv.invoiceNumber}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-[#1B2A4A]">{inv.customer?.name}</td>
                                    <td className="px-8 py-6 text-right font-black text-[#1B2A4A]">{formatLKR(inv.total)}</td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="font-black text-green-600">{formatLKR(inv.amountPaid)}</p>
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Bal: {formatLKR(inv.balanceDue)}</p>
                                    </td>
                                    <td className="px-8 py-6 text-center"><StatusBadge status={inv.paymentStatus} /></td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <button onClick={() => openDetail(inv)}
                                                className="px-4 py-2 rounded-xl bg-slate-50 text-[10px] font-black text-[#1B2A4A] uppercase tracking-widest hover:bg-[#1B2A4A] hover:text-[#C9A84C] transition-all">
                                                Manage
                                            </button>
                                            <button onClick={() => downloadPdf(inv._id)}
                                                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#1B2A4A] transition-all">
                                                <HiDownload />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
                {loading ? (
                    <div className="py-20 text-center animate-pulse">
                        <div className="w-10 h-10 rounded-full border-4 border-[#C9A84C] border-t-transparent animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Compiling Records...</p>
                    </div>
                ) : (invoices || []).map(inv => (
                    <div key={inv._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-black text-[#1B2A4A] bg-slate-50 px-2 py-1 rounded">{inv.invoiceNumber}</span>
                            <StatusBadge status={inv.paymentStatus} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-[#1B2A4A]">{inv.customer?.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{formatDate(inv.createdAt)}</p>
                        </div>
                        <div className="flex items-end justify-between pt-2 border-t border-slate-50">
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Balance Due</p>
                                <p className="text-sm font-black text-red-500">{formatLKR(inv.balanceDue)}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openDetail(inv)}
                                    className="px-4 py-2 rounded-xl bg-[#1B2A4A] text-[9px] font-black text-[#C9A84C] uppercase tracking-widest">
                                    Manage
                                </button>
                                <button onClick={() => downloadPdf(inv._id)}
                                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                    <HiDownload />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {!loading && !invoices.length && (
                    <div className="py-20 text-center opacity-40 italic text-xs font-bold uppercase tracking-widest text-slate-400">Stable Segment: No Revenue Pipeline</div>
                )}
            </div>

            {/* Premium detail & payment overlay */}
            {selected && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end bg-[#1B2A4A]/40 backdrop-blur-sm transition-all">
                    <div className="h-full w-full max-w-2xl bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
                            <div>
                                <h2 className="text-xl font-black text-[#1B2A4A] tracking-tight">{selected.invoiceNumber}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Settlement Status Detail</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#1B2A4A] transition-all text-2xl">×</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            {/* Settlement Stepper */}
                            <div className="bg-slate-50 rounded-[35px] p-8 border border-slate-100">
                                <SectionHeader title="Settlement Life-Cycle" subtitle="Payment Progression" />
                                <div className="relative flex items-center justify-between px-4 pt-6">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
                                    {PAYMENT_STAGES.map((s, i) => {
                                        const currentIdx = PAYMENT_STAGES.indexOf(selected.paymentStatus);
                                        const thisIdx = PAYMENT_STAGES.indexOf(s);
                                        const isCompleted = thisIdx <= currentIdx;
                                        const isStrictlyCompleted = thisIdx < currentIdx;
                                        const isCurrent = thisIdx === currentIdx;

                                        return (
                                            <div key={s} className="relative z-10 flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                                    isCompleted ? 'bg-[#1B2A4A] border-[#C9A84C] text-white' : 'bg-white border-slate-200 text-slate-300'
                                                } ${isCurrent ? 'ring-8 ring-[#C9A84C]/10 scale-110 shadow-lg' : ''}`}>
                                                    {isStrictlyCompleted ? <HiCheckCircle className="text-lg" /> : <span className="text-[10px] font-black">{i + 1}</span>}
                                                </div>
                                                <span className={`mt-3 text-[9px] font-black uppercase tracking-[0.15em] ${isCompleted ? 'text-[#1B2A4A]' : 'text-slate-300'}`}>{s.replace('_', ' ')}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center text-center shadow-sm">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Bill</p>
                                    <p className="text-lg font-black text-[#1B2A4A]">{formatLKR(selected.total)}</p>
                                </div>
                                <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center text-center shadow-sm">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Amount Paid</p>
                                    <p className="text-lg font-black text-green-600">{formatLKR(selected.amountPaid)}</p>
                                </div>
                                <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center text-center shadow-sm">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Remaining</p>
                                    <p className="text-lg font-black text-red-500">{formatLKR(selected.balanceDue)}</p>
                                </div>
                            </div>

                            {/* Payment Register */}
                            {selected.paymentStatus !== 'PAID' && (
                                <div className="bg-[#1B2A4A] rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C] blur-[60px] opacity-10"></div>
                                    <SectionHeader 
                                        title={<span className="text-white">Register Settlement</span>} 
                                        subtitle={<span className="text-[#C9A84C]/60">Physical or Digital Payment</span>} 
                                    />
                                    <form onSubmit={recordPayment} className="space-y-5 relative z-10">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Payment Amount (LKR)</label>
                                                <input type="number" min="1" placeholder="e.g. 5000" value={payForm.amount}
                                                    onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} required
                                                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-3.5 text-sm text-white outline-none focus:border-[#C9A84C]/50 transition-all font-bold" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Payment Channel</label>
                                                <select value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}
                                                    className="w-full appearance-none rounded-2xl bg-white/5 border border-white/10 px-5 py-3.5 text-sm text-white outline-none focus:border-[#C9A84C]/50 transition-all font-bold cursor-pointer">
                                                    {['BANK', 'CASH', 'COD', 'PAYHERE'].map(m => <option key={m} value={m} className="bg-[#1B2A4A]">{m}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Transaction Ref / Note</label>
                                            <input placeholder="e.g. Bank Slip #12345" value={payForm.reference}
                                                onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))}
                                                className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-3.5 text-sm text-white outline-none focus:border-[#C9A84C]/50 transition-all font-medium" />
                                        </div>
                                        <button type="submit" disabled={paying}
                                            className="w-full rounded-2xl bg-[#C9A84C] py-4 text-[10px] font-black text-[#1B2A4A] uppercase tracking-[0.2em] shadow-lg hover:bg-[#e0bb55] transition-all disabled:opacity-50">
                                            {paying ? 'Verifying Transaction...' : 'Confirm Receipt & Update Ledger'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Transaction History */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                    <HiShieldCheck className="text-[#C9A84C] text-lg" /> Audit Trail: Settlement History
                                </h3>
                                <div className="space-y-4">
                                    {(detail?.payments || []).map((p, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-[#C9A84C]/30 transition-all group">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1B2A4A] group-hover:bg-[#1B2A4A] group-hover:text-white transition-all">
                                                    <HiCurrencyDollar className="text-xl" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-black text-[#1B2A4A]">{formatLKR(p.amount)}</p>
                                                        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[8px] font-black rounded uppercase">{p.method}</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                                        {formatDateTime(p.date)} {p.reference && `• REF: ${p.reference}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <button onClick={() => window.open(apiUrl(`/pdf/receipt/${p._id}?token=${token}`), '_blank')}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-[#1B2A4A] hover:text-[#C9A84C] transition-all">
                                                <HiDownload className="text-lg" /> Receipt
                                            </button>
                                        </div>
                                    ))}
                                    {(!detail?.payments || detail.payments.length === 0) && (
                                        <div className="py-12 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                                            <HiClock className="mx-auto text-3xl text-slate-200 mb-3" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Awaiting first settlement entry</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-8 border-t border-slate-50 flex gap-4">
                            <button onClick={() => downloadPdf(selected._id)} className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-100 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-200 transition-all">
                                <HiPrinter className="text-lg" /> Print Full Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
