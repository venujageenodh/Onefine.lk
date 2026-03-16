import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatLKR, formatDate, StatusBadge, apiUrl, formatDateTime } from '../utils';
import { HiCheckCircle, HiClock, HiDocumentText, HiMail, HiPrinter, HiArrowRight, HiMinusCircle } from 'react-icons/hi';
import { useAdminAuth } from '../AdminAuthContext';

import { useProducts } from '../../hooks/useProducts';

// Helper to extract a clean number from price strings (e.g. "Rs. 4,950")
function extractNumeric(formatted) {
    return formatted ? Number(formatted.replace(/[^\d]/g, '')) : 0;
}

function SectionHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-lg font-black text-[#1B2A4A] tracking-tight text-left">{title}</h2>
                {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-left">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

function QuotationForm({ onSave, token, initialData = null }) {
    const { products } = useProducts();
    const [customer, setCustomer] = useState(initialData?.customer || { name: '', phone: '', email: '', address: '', company: '' });
    const [items, setItems] = useState(initialData?.items || [{ name: '', description: '', qty: 1, unitPrice: 0, discount: 0 }]);
    const [extra, setExtra] = useState({
        discountAmount: initialData?.discountAmount || 0,
        deliveryCharge: initialData?.deliveryCharge || 0,
        tax: initialData?.tax || 0,
        notes: initialData?.notes || '',
        description: initialData?.description || '',
        validUntil: initialData?.validUntil ? new Date(initialData.validUntil).toISOString().split('T')[0] : ''
    });
    const [saving, setSaving] = useState(false);

    const addItem = () => setItems(i => [...i, { name: '', description: '', qty: 1, unitPrice: 0, discount: 0 }]);
    const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx));
    const updateItem = (idx, field, val) => {
        setItems(i => {
            const newItems = [...i];
            let value = val;

            if (field === 'discount' && val !== '') {
                const num = Number(val);
                if (num > 100) value = 100;
            }

            newItems[idx] = { ...newItems[idx], [field]: value };
            
            if (field === 'name') {
                const foundProduct = products.find(p => p.name === val);
                if (foundProduct) {
                    newItems[idx].unitPrice = extractNumeric(foundProduct.price) || 0;
                }
            }
            return newItems;
        });
    };

    const subtotal = items.reduce((s, i) => s + Number(i.qty) * Number(i.unitPrice) * (1 - (Number(i.discount) || 0) / 100), 0);
    const taxAmount = (subtotal - Number(extra.discountAmount)) * (Number(extra.tax) / 100);
    const total = subtotal - Number(extra.discountAmount) + Number(extra.deliveryCharge) + taxAmount;

    const submit = async (e) => {
        e.preventDefault();
        if (items.length === 0) return alert('At least one line item is required.');

        setSaving(true);
        try {
            const path = initialData ? `/quotations/${initialData._id}` : '/quotations';
            const method = initialData ? 'PUT' : 'POST';

            const preparedItems = items.map(i => {
                const foundProduct = products.find(p => p.name === i.name);
                return { 
                    ...i, 
                    productId: foundProduct ? foundProduct._id : null,
                    qty: Number(i.qty), 
                    unitPrice: Number(i.unitPrice), 
                    discount: Number(i.discount) 
                };
            });

            await apiFetch(path, {
                method, body: JSON.stringify({
                    customer, items: preparedItems,
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
            <datalist id="products-list">
                {products?.map(p => (
                    <option key={p._id} value={p.name} />
                ))}
            </datalist>

            {/* Customer Section */}
            <section className="space-y-6">
                <SectionHeader title="Customer Identification" subtitle="Primary Contact & Entity" />
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
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Billing / Delivery Address</label>
                            <input value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}
                                className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/50 focus:bg-white transition-all font-bold text-[#1B2A4A]" />
                        </div>
                    </div>
                </div>
                <div className="mt-8 px-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Quotation Subject / Description</label>
                    <input value={extra.description} onChange={e => setExtra({...extra, description: e.target.value})}
                        placeholder="e.g. Standard Corporate Gifts for Year-End Event"
                        className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/50 focus:bg-white transition-all font-bold text-[#1B2A4A]" />
                </div>
            </section>

            {/* Line Items Section */}
            <section className="space-y-6">
                <div className="bg-slate-50/50 rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-[#1B2A4A] uppercase tracking-widest">Line Items</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Product Specification & Pricing</p>
                        </div>
                        <button type="button" onClick={addItem} className="flex items-center gap-2 rounded-full bg-[#1B2A4A] px-5 py-2 text-[10px] font-black text-[#C9A84C] hover:scale-105 transition-all shadow-md uppercase tracking-widest">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            Add Entry
                        </button>
                    </div>

                    <div className="hidden md:grid grid-cols-[1fr_80px_120px_100px_120px_40px] gap-4 mb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <div>Product Description</div>
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
                                    <div className="w-full relative flex flex-col gap-2">
                                        <input placeholder="e.g. Premium Gift Box" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} required list="products-list"
                                            className="w-full rounded-xl border border-slate-100 px-4 py-2.5 text-xs outline-none focus:border-[#C9A84C] bg-slate-50 transition-all font-bold text-[#1B2A4A]" />
                                        <textarea placeholder="Notes or Custom Description" value={item.description}
                                            onChange={e => {
                                                updateItem(idx, 'description', e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }}
                                            ref={el => { if(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }} rows={1}
                                            className="w-full rounded-lg border border-transparent bg-slate-50/30 px-4 py-1.5 text-[10px] outline-none focus:bg-white focus:border-slate-100 transition-all resize-none overflow-hidden" />
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
                                        <HiMinusCircle className="text-xl" />
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
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Overall Discount</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">LKR</span>
                            <input type="number" min="0" value={extra.discountAmount} onChange={e => setExtra({...extra, discountAmount: e.target.value})}
                                className="w-full rounded-2xl border border-slate-200 pl-14 pr-6 py-4 text-sm outline-none focus:border-[#C9A84C] bg-white transition-all font-bold text-[#1B2A4A] shadow-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Delivery Charge</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">LKR</span>
                            <input type="number" min="0" value={extra.deliveryCharge} onChange={e => setExtra({...extra, deliveryCharge: e.target.value})}
                                className="w-full rounded-2xl border border-slate-200 pl-14 pr-6 py-4 text-sm outline-none focus:border-[#C9A84C] bg-white transition-all font-bold text-[#1B2A4A] shadow-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Tax Rate (%)</label>
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
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Quotation Valid Until</label>
                                <input type="date" value={extra.validUntil} onChange={e => setExtra({...extra, validUntil: e.target.value})}
                                    className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/50 focus:bg-white transition-all font-bold text-slate-600" />
                            </div>
                            <div className="relative group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Notes / Terms</label>
                                <input value={extra.notes} onChange={e => setExtra({...extra, notes: e.target.value})} placeholder="e.g. 50% advance required"
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
                            <span className="block text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.4em] mb-2">Estimated Total Pipeline</span>
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
                {saving ? 'Processing Document...' : initialData ? 'Submit modifications & Update' : 'Finalize & Enqueue Quotation'}
            </button>
        </form>
    );
}


function QuotationView({ data, onBack }) {
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="text-xs font-bold text-slate-400 hover:text-[#1B2A4A] flex items-center gap-2 uppercase tracking-widest transition-colors">
                    <HiArrowRight className="rotate-180" /> Back to Pipeline
                </button>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                        <HiPrinter className="text-sm" /> Print PDF
                    </button>
                    <StatusBadge status={data.status} />
                </div>
            </div>

            {/* Workflow Stepper */}
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm mb-8">
                <div className="relative flex items-center justify-between">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                    {['DRAFT', 'SENT', 'ACCEPTED', 'CONVERTED'].map((s, i) => {
                        const stages = ['DRAFT', 'SENT', 'ACCEPTED', 'CONVERTED'];
                        const currentIdx = stages.indexOf(data.status);
                        const thisIdx = stages.indexOf(s);
                        const isActive = thisIdx <= currentIdx;
                        const isCurrent = thisIdx === currentIdx;

                        return (
                            <div key={s} className="relative z-10 flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                                    isActive ? 'bg-[#1B2A4A] border-[#C9A84C] text-white' : 'bg-white border-slate-100 text-slate-300'
                                } ${isCurrent ? 'ring-4 ring-[#C9A84C]/20 scale-110' : ''}`}>
                                    {isActive && thisIdx < currentIdx ? <HiCheckCircle className="text-xl" /> : <span className="text-xs font-black">{i + 1}</span>}
                                </div>
                                <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-[#1B2A4A]' : 'text-slate-300'}`}>{s}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr_350px]">
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                        <SectionHeader title="Customer Information" subtitle="Client Contact Details" />
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Full Name</p>
                                <p className="font-bold text-[#1B2A4A] text-lg">{data.customer?.name}</p>
                                {data.customer?.company && <p className="text-xs font-bold text-[#C9A84C] mt-0.5">{data.customer.company}</p>}
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Phone</p>
                                    <p className="text-sm font-bold text-[#1B2A4A]">{data.customer?.phone || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Email</p>
                                    <p className="text-sm font-bold text-[#1B2A4A]">{data.customer?.email || '—'}</p>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Billing Address</p>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">{data.customer?.address || 'No address provided'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30">
                            <h3 className="text-xs font-black text-[#1B2A4A] uppercase tracking-widest">Quotation Items</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="text-left text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] border-b border-slate-50">
                                <tr>
                                    <th className="px-8 py-4">Item Description</th>
                                    <th className="px-8 py-4 text-center">Qty</th>
                                    <th className="px-8 py-4 text-right">Unit Price</th>
                                    <th className="px-8 py-4 text-right">Row Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.items?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-[#1B2A4A]">{item.name}</p>
                                            <p className="text-[11px] text-slate-400 font-medium mt-1">{item.description}</p>
                                        </td>
                                        <td className="px-8 py-5 text-center font-black text-slate-400">{item.qty}</td>
                                        <td className="px-8 py-5 text-right font-bold text-slate-600">{formatLKR(item.unitPrice)}</td>
                                        <td className="px-8 py-5 text-right font-black text-[#1B2A4A]">{formatLKR(item.qty * item.unitPrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/5 rounded-bl-full -mr-10 -mt-10"></div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 relative z-10">Financial Overview</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400 uppercase text-[10px]">Subtotal</span>
                                <span className="font-bold text-slate-600">{formatLKR(data.subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400 uppercase text-[10px]">Discount</span>
                                <span className="font-bold text-red-500">-{formatLKR(data.discountAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400 uppercase text-[10px]">Delivery</span>
                                <span className="font-bold text-slate-600">+{formatLKR(data.deliveryCharge)}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
                                <p className="text-3xl font-black text-[#1B2A4A] tracking-tight">{formatLKR(data.total)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1B2A4A] rounded-3xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <h3 className="text-xs font-black text-[#C9A84C] uppercase tracking-widest mb-6 relative z-10">Activity History</h3>
                        <div className="space-y-6 relative z-10">
                            {data.timeline?.map((t, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-[#C9A84C] group-last:bg-[#C9A84C] ring-4 ring-[#C9A84C]/20" />
                                        <div className="w-0.5 h-full bg-slate-700/50 group-last:bg-transparent my-1" />
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-[10px] font-black text-[#C9A84C] leading-none uppercase tracking-widest">{t.status}</p>
                                        <p className="text-xs text-white/80 font-medium mt-1.5">{t.note}</p>
                                        <p className="text-[9px] text-white/40 font-bold uppercase mt-2">{formatDateTime(t.at)}</p>
                                    </div>
                                </div>
                            ))}
                            {!data.timeline?.length && (
                                <div className="text-center py-4">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">No activity recorded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {data.notes && (
                <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-6">
                    <h3 className="text-xs font-bold text-yellow-800 uppercase tracking-widest mb-2">Notes & Terms</h3>
                    <p className="text-sm text-yellow-900 leading-relaxed whitespace-pre-wrap">{data.notes}</p>
                </div>
            )}
        </div>
    );
}

export default function QuotationsPage() {
    const { token } = useAdminAuth();
    const [quotations, setQuotations] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // list | new | edit | view
    const [editingQuotation, setEditingQuotation] = useState(null);

    const fetchQuotations = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/quotations', {}, token);
            setQuotations(data.quotations || []);
            setTotal(data.total || 0);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [token]);

    useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

    const toggleViewMode = () => {
        const next = viewMode === 'table' ? 'cards' : 'table';
        setViewMode(next);
        localStorage.setItem('quotation_view_mode', next);
    };

    const convertToOrder = async (id) => {
        if (!window.confirm('Convert this quotation to an active Order and Invoice?')) return;
        try {
            const resp = await apiFetch(`/quotations/${id}/convert`, { method: 'POST', body: JSON.stringify({}) }, token);
            alert(`Quotation converted! Order #${resp.order.orderNumber} created.`);
            fetchQuotations();
            setView('list');
        } catch (e) { alert(e.message); }
    };

    const downloadPdf = (id) => {
        window.open(apiUrl(`/pdf/quotation/${id}?token=${token}`), '_blank');
    };

    if (view === 'view') return (
        <div className="max-w-5xl mx-auto">
            <QuotationView
                data={editingQuotation}
                onBack={() => { setView('list'); setEditingQuotation(null); }}
            />
        </div>
    );

    if (view === 'new' || view === 'edit') return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => { setView('list'); setEditingQuotation(null); }} className="text-slate-400 hover:text-[#1B2A4A]">← Back</button>
                <h2 className="font-bold text-[#1B2A4A] text-lg">{view === 'edit' ? 'Edit Quotation' : 'New Quotation'}</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <QuotationForm
                    token={token}
                    initialData={editingQuotation}
                    onSave={() => { setView('list'); setEditingQuotation(null); fetchQuotations(); }}
                />
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
                                            <button onClick={() => { setEditingQuotation(q); setView('view'); }}
                                                className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-[#1B2A4A] hover:bg-slate-100">
                                                View
                                            </button>
                                            <button onClick={() => { setEditingQuotation(q); setView('edit'); }}
                                                className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-blue-500 hover:bg-blue-50">
                                                Edit
                                            </button>
                                            {q.status !== 'CONVERTED' && q.status !== 'REJECTED' && (
                                                <button onClick={() => convertToOrder(q._id)}
                                                    className="rounded-full border border-[#C9A84C]/30 px-2.5 py-1 text-[10px] font-bold text-[#C9A84C] hover:bg-[#C9A84C]/10">
                                                    → Convert to Order
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
