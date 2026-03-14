import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../utils';
import { useAdminAuth } from '../AdminAuthContext';

const CATEGORIES = ['Office', 'Raw Materials', 'Marketing', 'Utilities', 'Salary', 'Logistics', 'Other'];

export default function ExpensesPage() {
    const { token } = useAdminAuth();
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState({ total: 0, byCategory: {} });
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [form, setForm] = useState({ title: '', description: '', amount: '', category: 'Other', date: new Date().toISOString().split('T')[0] });
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [expData, sumData] = await Promise.all([
                apiFetch('/expenses', {}, token),
                apiFetch('/expenses/summary', {}, token)
            ]);
            setExpenses(expData || []);
            setSummary(sumData || { total: 0, byCategory: {} });
        } catch (e) {
            console.error('Error fetching expenses:', e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, amount: Number(form.amount) };
            if (editingId) {
                await apiFetch(`/expenses/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) }, token);
            } else {
                await apiFetch('/expenses', { method: 'POST', body: JSON.stringify(payload) }, token);
            }
            setForm({ title: '', description: '', amount: '', category: 'Other', date: new Date().toISOString().split('T')[0] });
            setEditingId(null);
            fetchData();
        } catch (e) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (exp) => {
        setEditingId(exp._id);
        setForm({
            title: exp.title,
            description: exp.description || '',
            amount: exp.amount || '',
            category: exp.category || 'Other',
            date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            await apiFetch(`/expenses/${id}`, { method: 'DELETE' }, token);
            fetchData();
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1B2A4A] text-white rounded-2xl p-6 shadow-sm">
                    <p className="text-white/60 text-sm font-semibold mb-1 uppercase tracking-wider">Total Expenses</p>
                    <p className="text-3xl font-bold font-display text-[#C9A84C]">Rs. {summary.total.toLocaleString()}</p>
                </div>
                
                {Object.entries(summary.byCategory || {}).sort((a,b) => b[1] - a[1]).slice(0, 3).map(([cat, amt]) => (
                    <div key={cat} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
                        <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">{cat}</p>
                        <p className="text-2xl font-bold text-[#1B2A4A]">Rs. {Number(amt).toLocaleString()}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                {/* List View */}
                <div className="space-y-3">
                    <h2 className="font-bold text-[#1B2A4A] text-lg mb-4">Expense Records</h2>
                    {loading ? (
                        <p className="text-slate-400">Loading expenses...</p>
                    ) : expenses.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                            No expenses recorded yet.
                        </div>
                    ) : (
                        expenses.map(exp => (
                            <div key={exp._id} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                            {exp.expenseNumber}
                                        </span>
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#1B2A4A]/10 text-[#1B2A4A]">
                                            {exp.category}
                                        </span>
                                    </div>
                                    <p className="font-bold text-[#1B2A4A] text-base">{exp.title}</p>
                                    {exp.description && <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{exp.description}</p>}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
                                        <span>📆 {new Date(exp.date).toLocaleDateString()}</span>
                                        {exp.addedBy?.adminName && <span>👤 {exp.addedBy.adminName}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                                    <div className="text-xl font-bold text-red-600 font-display">Rs. {exp.amount?.toLocaleString()}</div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(exp)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-[#1B2A4A] transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(exp._id)} className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Form Sidebar */}
                <aside>
                    <div className="sticky top-4 rounded-2xl bg-white border border-slate-100 shadow-sm p-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
                        <h2 className="font-bold text-[#1B2A4A] text-lg mb-6 pb-4 border-b border-slate-100">
                            {editingId ? 'Edit Expense' : 'Record New Expense'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Title *</label>
                                <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Office Stationery"
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Amount (Rs) *</label>
                                    <input type="number" name="amount" value={form.amount} onChange={handleChange} required min="0" step="0.01" placeholder="0.00"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Date *</label>
                                    <input type="date" name="date" value={form.date} onChange={handleChange} required
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Category *</label>
                                <select name="category" value={form.category} onChange={handleChange} required
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] bg-white">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Description / Notes</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Optional details..."
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A84C] resize-none" />
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={saving}
                                    className="w-full rounded-full bg-[#C9A84C] hover:bg-[#b0903b] transition-colors py-3 text-sm font-bold text-[#1B2A4A] disabled:opacity-60 shadow-md">
                                    {saving ? 'Saving...' : editingId ? 'Update Expense' : 'Save Expense Record'}
                                </button>
                                
                                {editingId && (
                                    <button type="button" onClick={() => { 
                                            setEditingId(null); 
                                            setForm({ title: '', description: '', amount: '', category: 'Other', date: new Date().toISOString().split('T')[0] }); 
                                        }}
                                        className="w-full mt-3 text-xs font-semibold text-slate-500 hover:text-red-500 py-2">
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </aside>
            </div>
        </div>
    );
}
