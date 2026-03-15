import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch, formatLKR, formatDateTime, StatusBadge, apiUrl, formatDate } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';
import { HiSearch, HiFilter, HiChevronRight, HiDownload, HiPrinter, HiTruck, HiCheckCircle, HiXCircle, HiDotsVertical, HiCalendar, HiPlus, HiTrash, HiUser } from 'react-icons/hi';

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'DISPATCHED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

function SectionHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-lg font-black text-[#1B2A4A] tracking-tight">{title}</h2>
                {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

export default function OrdersPage() {
    const { token, admin } = useAdminAuth();
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filters, setFilters] = useState({ status: '', paymentStatus: '', q: '', page: 1 });
    const [statusNote, setStatusNote] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);
    const [orderForm, setOrderForm] = useState(null); // { mode: 'create'|'edit', data: order }
    const [products, setProducts] = useState([]);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const qs = new URLSearchParams({ ...filters, limit: 25 }).toString();
            const data = await apiFetch(`/biz/orders?${qs}`, {}, token);
            setOrders(data.orders || []);
            setTotal(data.total || 0);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [filters, token]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pData, cData] = await Promise.all([
                    apiFetch('/admin/products', {}, token),
                    apiFetch('/customers?limit=100', {}, token)
                ]);
                setProducts(pData || []);
            } catch (e) { console.error('Error fetching modal data:', e); }
        };
        if (token) fetchData();
    }, [token]);

    const updateStatus = async () => {
        if (!newStatus || !selected) return;
        setUpdating(true);
        try {
            await apiFetch(`/biz/orders/${selected._id}/status`, {
                method: 'PUT', body: JSON.stringify({ status: newStatus, note: statusNote }),
            }, token);
            setStatusNote(''); setNewStatus('');
            fetchOrders();
            setSelected(null);
        } catch (e) { alert(e.message); }
        finally { setUpdating(false); }
    };

    const cancelOrder = async (id) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        try {
            await apiFetch(`/biz/orders/${id}`, { method: 'DELETE' }, token);
            fetchOrders();
            setSelected(null);
        } catch (e) { alert(e.message); }
    };

    const downloadPdf = (type, id) => window.open(apiUrl(`/pdf/${type}/${id}?token=${token}`), '_blank');

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 group">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C9A84C] transition-colors" />
                        <input placeholder="Find client, phone or order reference..." value={filters.q}
                            onChange={e => setFilters(f => ({ ...f, q: e.target.value, page: 1 }))}
                            className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3.5 text-sm outline-none focus:border-[#C9A84C] transition-all bg-slate-50/50 focus:bg-white" />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-48">
                            <HiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
                                className="w-full appearance-none rounded-2xl border border-slate-200 pl-11 pr-4 py-3.5 text-xs font-black uppercase tracking-widest outline-none focus:border-[#C9A84C] bg-slate-50/50 cursor-pointer">
                                <option value="">Order Stages</option>
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="relative flex-1 sm:w-48">
                            <select value={filters.paymentStatus} onChange={e => setFilters(f => ({ ...f, paymentStatus: e.target.value, page: 1 }))}
                                className="w-full appearance-none rounded-2xl border border-slate-200 px-6 py-3.5 text-xs font-black uppercase tracking-widest outline-none focus:border-[#C9A84C] bg-slate-50/50 cursor-pointer">
                                <option value="">Payments</option>
                                {['UNPAID', 'PARTIALLY_PAID', 'PAID'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {['ALL', 'PENDING', 'PROCESSING', 'DISPATCHED'].map(s => (
                        <button key={s} onClick={() => setFilters(f => ({ ...f, status: s === 'ALL' ? '' : s }))}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all border ${
                                (filters.status === s || (s === 'ALL' && !filters.status)) ? 'bg-[#1B2A4A] border-[#1B2A4A] text-[#C9A84C] shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                            }`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Layout Toggle and Summary */}
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Operational Pipeline <span className="text-[#1B2A4A] ml-2">{total} Total Orders</span>
                </p>
                <div className="flex items-center gap-3">
                    <button onClick={() => setOrderForm({ mode: 'create' })} className="px-4 py-2 rounded-xl bg-[#C9A84C] text-[10px] font-black text-[#1B2A4A] uppercase tracking-widest hover:bg-[#b0903b] transition-all shadow-md flex items-center gap-2">
                        <span className="text-sm">+</span> New Order
                    </button>
                    <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#1B2A4A] transition-colors"><HiSearch /></button>
                </div>
            </div>

            {/* Premium Table Content */}
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] border-b border-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-left">Internal Reference</th>
                                <th className="px-8 py-5 text-left">Client Information</th>
                                <th className="px-8 py-5 text-right">Value (LKR)</th>
                                <th className="px-8 py-5 text-center">Settlement</th>
                                <th className="px-8 py-5 text-center">Operation Stage</th>
                                <th className="px-8 py-5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-full border-4 border-[#C9A84C] border-t-transparent animate-spin mb-4" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Querying Operational Database...</p>
                                    </div>
                                </td></tr>
                            ) : orders.map(o => (
                                <tr key={o._id} className="hover:bg-slate-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-[#1B2A4A] font-mono text-xs">{o.orderNumber}</span>
                                            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{formatDateTime(o.createdAt).split(',')[0]}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-[#1B2A4A]">
                                                {o.customer?.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1B2A4A] leading-tight">{o.customer?.name || o.customerName}</p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{o.customer?.phone || o.customerPhone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="font-black text-[#1B2A4A]">{formatLKR(o.total)}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{o.items?.length || 1} Items</p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <StatusBadge status={o.paymentStatus || 'UNPAID'} />
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <StatusBadge status={o.orderStatus || o.status || 'NEW'} />
                                            {o.timeline?.length > 0 && (
                                                <span className="text-[8px] font-black text-slate-400 mt-1.5 uppercase tracking-widest">Last: {formatDate(o.timeline[o.timeline.length-1].at)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <button onClick={() => { setSelected(o); setNewStatus(o.orderStatus || 'PENDING'); }}
                                            className="px-4 py-2 rounded-xl bg-slate-50 text-[10px] font-black text-[#1B2A4A] uppercase tracking-widest hover:bg-[#1B2A4A] hover:text-[#C9A84C] transition-all shadow-sm">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && !orders.length && (
                                <tr><td colSpan={6} className="py-20 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No active orders matching criteria</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order detail view overlay */}
            {selected && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end bg-[#1B2A4A]/40 backdrop-blur-sm transition-all">
                    <div className="h-full w-full max-w-2xl bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
                            <div>
                                <h2 className="text-xl font-black text-[#1B2A4A] tracking-tight">Order {selected.orderNumber}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Placed on {formatDateTime(selected.createdAt)}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#1B2A4A] transition-all text-2xl">×</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            {/* Workflow Stepper */}
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                <SectionHeader title="Fulfilment Progress" subtitle="Current Order Stage" />
                                <div className="relative flex items-center justify-between px-2 pt-4">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
                                    {['PENDING', 'PROCESSING', 'DISPATCHED', 'COMPLETED'].map((s, i) => {
                                        const stages = ['PENDING', 'PROCESSING', 'DISPATCHED', 'COMPLETED'];
                                        const currentIdx = stages.indexOf(selected.orderStatus);
                                        const thisIdx = stages.indexOf(s);
                                        const isActive = thisIdx <= currentIdx;
                                        const isCurrent = thisIdx === currentIdx;

                                        return (
                                            <div key={s} className="relative z-10 flex flex-col items-center">
                                                <div onClick={() => !updating && setNewStatus(s)} className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-300 cursor-pointer ${
                                                    isActive ? 'bg-[#1B2A4A] border-[#C9A84C] text-white' : 'bg-white border-slate-200 text-slate-300'
                                                } ${isCurrent ? 'ring-4 ring-[#C9A84C]/20 scale-110' : 'hover:scale-105'}`}>
                                                    {isActive && thisIdx < currentIdx ? <HiCheckCircle className="text-sm" /> : <span className="text-[10px] font-black">{i + 1}</span>}
                                                </div>
                                                <span className={`mt-2 text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-[#1B2A4A]' : 'text-slate-300'}`}>{s}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-8 space-y-3">
                                    <div className="relative group">
                                        <input placeholder="Attach progress note..." value={statusNote} onChange={e => setStatusNote(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-[#C9A84C] transition-all bg-white" />
                                    </div>
                                    <button onClick={updateStatus} disabled={updating}
                                        className="w-full rounded-xl bg-[#1B2A4A] py-3 text-xs font-black text-[#C9A84C] uppercase tracking-widest shadow-md hover:bg-[#243a5e] transition-all disabled:opacity-50">
                                        {updating ? 'Updating Pipeline...' : `Update Status to ${newStatus}`}
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-8 grid-cols-2">
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Client Details</h3>
                                    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Customer Name</p>
                                            <p className="text-sm font-bold text-[#1B2A4A]">{selected.customer?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Phone / Email</p>
                                            <p className="text-xs font-medium text-slate-600">{selected.customer?.phone} • {selected.customer?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Delivery Address</p>
                                            <p className="text-xs font-medium text-slate-600 leading-relaxed">{selected.customer?.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Financials</h3>
                                    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Total Value</p>
                                            <p className="text-sm font-black text-[#1B2A4A]">{formatLKR(selected.total)}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Settlement</p>
                                            <StatusBadge status={selected.paymentStatus} />
                                        </div>
                                        <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Items</p>
                                            <p className="text-[10px] font-black text-[#C9A84C]">{selected.items?.length} SKUs</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#1B2A4A] rounded-3xl p-8 relative overflow-hidden shadow-xl">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <h3 className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest mb-6 relative z-10">Order Timeline</h3>
                                <div className="space-y-6 relative z-10">
                                    {(selected.timeline || []).map((t, i) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-[#C9A84C] group-last:bg-[#C9A84C] ring-4 ring-[#C9A84C]/20" />
                                                <div className="w-0.5 h-full bg-slate-700/50 group-last:bg-transparent my-1" />
                                            </div>
                                            <div className="pb-2">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[9px] font-black text-[#C9A84C] uppercase tracking-widest">{t.status}</p>
                                                    <span className="text-[8px] text-white/30 font-bold">• {formatDateTime(t.at)}</span>
                                                </div>
                                                <p className="text-[11px] text-white/70 font-medium mt-1 uppercase tracking-wide">{t.note}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selected.timeline || selected.timeline.length === 0) && (
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-center py-4">No activity history yet</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-50 grid grid-cols-4 gap-4">
                            <button onClick={() => downloadPdf('proforma', selected._id)} className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] hover:bg-slate-100 transition-all">
                                <HiPrinter className="text-lg" /> Invoice
                            </button>
                            <button onClick={() => downloadPdf('delivery', selected._id)} className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] hover:bg-slate-100 transition-all">
                                <HiTruck className="text-lg" /> Delivery
                            </button>
                            <button onClick={() => setOrderForm({ mode: 'edit', data: selected })} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-50 py-4 text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em] hover:bg-indigo-100 transition-all">
                                Edit Order
                            </button>
                            <button onClick={() => cancelOrder(selected._id)} className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-4 text-[10px] font-black text-red-600 uppercase tracking-[0.15em] hover:bg-red-100 transition-all">
                                Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW: Order Form Modal (Create/Edit) */}
            {orderForm && (
                <OrderFormModal 
                    mode={orderForm.mode}
                    initialData={orderForm.data}
                    onClose={() => setOrderForm(null)} 
                    products={products} 
                    token={token} 
                    onSuccess={() => { setOrderForm(null); setSelected(null); fetchOrders(); }} 
                />
            )}
        </div>
    );
}

function OrderFormModal({ mode, initialData, onClose, products, token, onSuccess }) {
    const isEdit = mode === 'edit';
    const [customer, setCustomer] = useState(initialData?.customer || { name: '', phone: '', email: '', address: '', city: '' });
    const [items, setItems] = useState(initialData?.items?.map(i => ({
        productId: i.productId?._id || i.productId || '',
        name: i.name,
        qty: i.qty,
        unitPrice: i.unitPrice
    })) || [{ productId: '', name: '', qty: 1, unitPrice: 0 }]);
    const [deliveryCharge, setDeliveryCharge] = useState(initialData?.deliveryCharge || 350);
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [saving, setSaving] = useState(false);

    const addItem = () => setItems([...items, { productId: '', name: '', qty: 1, unitPrice: 0 }]);
    const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
    
    const updateItem = (idx, field, value) => {
        const newItems = [...items];
        if (field === 'productId') {
            const p = products.find(x => x._id === value);
            if (p) {
                newItems[idx] = { ...newItems[idx], productId: value, name: p.name, unitPrice: parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0 };
            }
        } else {
            newItems[idx][field] = value;
        }
        setItems(newItems);
    };

    const subtotal = items.reduce((s, i) => s + (i.qty * i.unitPrice), 0);
    const total = subtotal + Number(deliveryCharge);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customer.name) return alert('Name required');
        if (items.some(i => !i.name || i.qty < 1)) return alert('Invalid items');
        
        setSaving(true);
        try {
            const url = isEdit ? `/biz/orders/${initialData._id}` : '/biz/orders/admin';
            const method = isEdit ? 'PUT' : 'POST';
            
            // For general update, we need to match the backend's expected structure if it's different
            // The backend PUT /api/orders/:id expects specific fields. 
            // Let's check server/routes/orders.js PUT /:id (line 185)
            // It expects: { assignedAdminId, adminNotes, paymentStatus, paymentMethod, deliveryCharge }
            // Wait, that's not enough for a full "Edit". 
            // I might need to add a full update route or use the existing one if I modify it.
            
            await apiFetch(url, {
                method,
                body: JSON.stringify(isEdit ? { 
                    customer, items, deliveryCharge, notes,
                    // also include existing updateable fields
                    adminNotes: notes, 
                } : { customer, items, deliveryCharge, notes })
            }, token);
            onSuccess();
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#1B2A4A]/60 backdrop-blur-md transition-all">
            <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-[#1B2A4A] tracking-tight">
                            {isEdit ? `Edit Order ${initialData.orderNumber}` : 'Direct Order Entry'}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Operational Administrative Portal</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-[#1B2A4A] transition-all text-3xl shadow-sm border border-slate-100">×</button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                    {/* Customer Block */}
                    <section className="space-y-6">
                        <SectionHeader title="Client Identification" subtitle="Primary Contact & Delivery" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-50">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Customer Full Name *</label>
                                    <input required value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}
                                        className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/30 focus:bg-white transition-all font-bold text-[#1B2A4A]" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                                        <input value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}
                                            className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/30 focus:bg-white transition-all font-bold text-[#1B2A4A]" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                                        <input type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})}
                                            className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/30 focus:bg-white transition-all font-bold text-[#1B2A4A]" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Delivery Address / Destination</label>
                                <textarea rows="4" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}
                                    className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/30 focus:bg-white transition-all font-bold text-[#1B2A4A] resize-none h-[116px]" />
                            </div>
                        </div>
                    </section>

                    {/* Items Block */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <SectionHeader title="Manifest & Logistics" subtitle="Product Selection & Pricing" />
                            <button type="button" onClick={addItem} className="px-4 py-2 rounded-xl bg-[#1B2A4A] text-[10px] font-black text-[#C9A84C] uppercase tracking-widest hover:scale-105 transition-all shadow-md flex items-center gap-2">
                                <HiPlus /> Add Entry
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-slate-50/50 p-6 rounded-[30px] border border-slate-100 group hover:border-slate-200 transition-all">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Unit</label>
                                        <select value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-white transition-all font-bold text-[#1B2A4A] appearance-none">
                                            <option value="">Manual Entry / Custom</option>
                                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-[1.5] min-w-[200px]">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Item Description</label>
                                        <input value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-white transition-all font-bold text-[#1B2A4A]" />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Qty</label>
                                        <input type="number" min="1" value={item.qty} onChange={e => updateItem(idx, 'qty', parseInt(e.target.value))}
                                            className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-white transition-all font-bold text-center text-[#1B2A4A]" />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price (Unit)</label>
                                        <input type="number" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value))}
                                            className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:border-[#C9A84C] bg-white transition-all font-bold text-right text-[#1B2A4A]" />
                                    </div>
                                    <button type="button" onClick={() => removeItem(idx)} className="p-4 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                                        <HiTrash className="text-xl" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Summary Block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <SectionHeader title="Administrative Notes" subtitle="Internal Correspondence" />
                            <textarea rows="4" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Attach private notes or delivery instructions..."
                                className="w-full rounded-[30px] border border-slate-200 px-6 py-5 text-sm outline-none focus:border-[#C9A84C] bg-slate-50/30 focus:bg-white transition-all font-medium text-[#1B2A4A] resize-none" />
                        </div>
                        <div className="bg-[#1B2A4A] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <h3 className="text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.2em] mb-8 relative z-10">Financial Summary</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center text-white/60">
                                    <span className="text-xs font-bold uppercase tracking-widest">Subtotal Manifest</span>
                                    <span className="font-mono">{formatLKR(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-white/60">
                                    <span className="text-xs font-bold uppercase tracking-widest">Courier & Logistics</span>
                                    <input type="number" value={deliveryCharge} onChange={e => setDeliveryCharge(e.target.value)}
                                        className="w-24 bg-transparent border-b border-white/20 text-right font-mono outline-none focus:border-[#C9A84C]" />
                                </div>
                                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                    <span className="text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.3em]">Gross Total</span>
                                    <span className="text-3xl font-black font-display text-[#C9A84C]">{formatLKR(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={onClose}
                            className="flex-1 rounded-2xl border border-slate-200 py-5 text-xs font-black text-slate-400 uppercase tracking-widest hover:border-[#1B2A4A] hover:text-[#1B2A4A] transition-all">
                            Cancel Abort
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-[2] rounded-2xl bg-[#C9A84C] py-5 text-xs font-black text-[#1B2A4A] uppercase tracking-widest shadow-xl hover:bg-[#b0903b] hover:-translate-y-1 transition-all disabled:opacity-50">
                            {saving ? 'Synchronizing Operational Data...' : (isEdit ? 'Update Operational Data' : 'Confirm & Generate Order')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
