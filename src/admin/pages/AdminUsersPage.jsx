import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

const ROLES = ['OWNER', 'SALES_ADMIN', 'INVENTORY_ADMIN', 'ACCOUNT_ADMIN'];

export default function AdminUsersPage() {
    const { token, admin: me } = useAdminAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SALES_ADMIN', isActive: true });
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try { setAdmins(await apiFetch('/auth/admins', {}, token)); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    }, [token]);

    useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

    const handleChange = e => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm(f => ({ ...f, [e.target.name]: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            if (editingId) await apiFetch(`/auth/admins/${editingId}`, { method: 'PUT', body: JSON.stringify(form) }, token);
            else await apiFetch('/auth/admins', { method: 'POST', body: JSON.stringify(form) }, token);
            setForm({ name: '', email: '', password: '', role: 'SALES_ADMIN', isActive: true });
            setEditingId(null); fetchAdmins();
        } catch (e) { setError(e.message); } finally { setSaving(false); }
    };

    const handleEdit = (a) => {
        setEditingId(a._id);
        setForm({ name: a.name, email: a.email, password: '', role: a.role, isActive: a.isActive });
    };

    const handleDelete = async (id) => {
        if (id === me?._id) return alert('Cannot delete your own account');
        if (!window.confirm('Delete this admin?')) return;
        await apiFetch(`/auth/admins/${id}`, { method: 'DELETE' }, token);
        fetchAdmins();
    };

    const ROLE_COLOR = { OWNER: 'bg-[#C9A84C]/20 text-[#8B6914]', SALES_ADMIN: 'bg-blue-100 text-blue-700', INVENTORY_ADMIN: 'bg-purple-100 text-purple-700', ACCOUNT_ADMIN: 'bg-green-100 text-green-700' };

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* List */}
            <div className="space-y-3">
                <h2 className="font-bold text-[#1B2A4A]">Team Members ({admins.length})</h2>
                {loading ? <p className="text-slate-400">Loading…</p> : admins.map(a => (
                    <div key={a._id} className={`rounded-2xl bg-white border shadow-sm p-5 flex items-center gap-4 ${!a.isActive ? 'opacity-50' : 'border-slate-100'}`}>
                        <div className="h-11 w-11 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {a.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#1B2A4A]">{a.name} {a._id === me?._id && <span className="text-xs text-slate-400">(you)</span>}</p>
                            <p className="text-xs text-slate-400">{a.email}</p>
                            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ROLE_COLOR[a.role] || 'bg-slate-100 text-slate-500'}`}>{a.role}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`h-2 w-2 rounded-full ${a.isActive ? 'bg-green-400' : 'bg-slate-300'}`} title={a.isActive ? 'Active' : 'Inactive'} />
                            <button onClick={() => handleEdit(a)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-[#1B2A4A]">Edit</button>
                            {a._id !== me?._id && (
                                <button onClick={() => handleDelete(a._id)} className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50">Remove</button>
                            )}
                        </div>
                    </div>
                ))}
                {!loading && !admins.length && <div className="py-12 text-center text-slate-400 rounded-2xl bg-white border border-slate-100">No admin users found. Add the first one →</div>}
            </div>

            {/* Form */}
            <aside>
                <div className="sticky top-4 rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
                    <h2 className="font-bold text-[#1B2A4A] mb-4">{editingId ? 'Edit Admin' : 'Add Admin User'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name *</label>
                            <input name="name" value={form.name} onChange={handleChange} required
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Email *</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} required
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">{editingId ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                            <input name="password" type="password" value={form.password} onChange={handleChange} required={!editingId}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Role *</label>
                            <select name="role" value={form.role} onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]">
                                {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        {editingId && (
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} className="h-4 w-4" />
                                <label htmlFor="isActive" className="text-sm text-slate-600">Active (can login)</label>
                            </div>
                        )}
                        {error && <p className="text-xs text-red-500">{error}</p>}
                        <button type="submit" disabled={saving}
                            className="w-full rounded-full bg-[#C9A84C] py-2.5 text-sm font-bold text-[#1B2A4A] disabled:opacity-60">
                            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Admin'}
                        </button>
                        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', email: '', password: '', role: 'SALES_ADMIN', isActive: true }); }}
                            className="w-full text-xs text-slate-400 hover:text-red-500">Cancel</button>}
                    </form>
                </div>
            </aside>
        </div>
    );
}
