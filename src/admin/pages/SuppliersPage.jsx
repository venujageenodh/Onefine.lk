import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

export default function SuppliersPage() {
    const { token } = useAdminAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '', paymentTerms: '', notes: '' });
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try { setSuppliers(await apiFetch('/suppliers', {}, token)); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    }, [token]);

    useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editingId) await apiFetch(`/suppliers/${editingId}`, { method: 'PUT', body: JSON.stringify(form) }, token);
            else await apiFetch('/suppliers', { method: 'POST', body: JSON.stringify(form) }, token);
            setForm({ name: '', contactPerson: '', phone: '', email: '', address: '', paymentTerms: '', notes: '' });
            setEditingId(null); fetchSuppliers();
        } catch (e) { alert(e.message); } finally { setSaving(false); }
    };

    const handleEdit = (s) => { setEditingId(s._id); setForm({ name: s.name, contactPerson: s.contactPerson || '', phone: s.phone || '', email: s.email || '', address: s.address || '', paymentTerms: s.paymentTerms || '', notes: s.notes || '' }); };
    const handleDelete = async (id) => {
        if (!window.confirm('Remove this supplier?')) return;
        await apiFetch(`/suppliers/${id}`, { method: 'DELETE' }, token);
        fetchSuppliers();
    };

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* List */}
            <div className="space-y-3">
                {loading ? <p className="text-slate-400">Loading…</p> : suppliers.map(s => (
                    <div key={s._id} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center text-[#1B2A4A] font-bold text-lg flex-shrink-0">
                            {s.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#1B2A4A]">{s.name}</p>
                            <p className="text-xs text-slate-500">{s.contactPerson} {s.phone && `· ${s.phone}`}</p>
                            {s.email && <p className="text-xs text-slate-400">{s.email}</p>}
                            {s.paymentTerms && <p className="text-xs text-[#C9A84C] font-semibold mt-1">{s.paymentTerms}</p>}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => handleEdit(s)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-[#1B2A4A]">Edit</button>
                            <button onClick={() => handleDelete(s._id)} className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50">Remove</button>
                        </div>
                    </div>
                ))}
                {!loading && !suppliers.length && <div className="py-12 text-center text-slate-400">No suppliers yet. Add one →</div>}
            </div>

            {/* Form */}
            <aside>
                <div className="sticky top-4 rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
                    <h2 className="font-bold text-[#1B2A4A] mb-4">{editingId ? 'Edit Supplier' : 'New Supplier'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {[['name', 'Supplier Name *', '', true], ['contactPerson', 'Contact Person'], ['phone', 'Phone'], ['email', 'Email'], ['address', 'Address'], ['paymentTerms', 'Payment Terms', 'e.g. Net 30'], ['notes', 'Notes']].map(([k, l, p, req]) => (
                            <div key={k}>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">{l}</label>
                                <input name={k} value={form[k]} onChange={handleChange} placeholder={p || ''} required={!!req}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                            </div>
                        ))}
                        <button type="submit" disabled={saving}
                            className="w-full rounded-full bg-[#C9A84C] py-2.5 text-sm font-bold text-[#1B2A4A] disabled:opacity-60">
                            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Supplier'}
                        </button>
                        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', contactPerson: '', phone: '', email: '', address: '', paymentTerms: '', notes: '' }); }}
                            className="w-full text-xs text-slate-400 hover:text-red-500">Cancel Edit</button>}
                    </form>
                </div>
            </aside>
        </div>
    );
}
