import React, { useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminLogin() {
    const { login, error, loading } = useAdminAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login({ email, password });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#0f1a2e] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-10">
                    <p className="text-[#C9A84C] font-bold tracking-[0.3em] text-xl uppercase">ONEFINE</p>
                    <p className="text-white/50 text-xs tracking-widest mt-1 uppercase">Business Management</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-2xl">
                    <h1 className="text-lg font-bold text-[#1B2A4A] mb-6">Admin Sign In</h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="admin@onefine.lk" required
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
                            <input
                                type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••" required
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit" disabled={loading}
                        className="mt-6 w-full rounded-full bg-[#C9A84C] py-3 text-sm font-bold text-[#1B2A4A] transition hover:brightness-110 disabled:opacity-60"
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>

                    <p className="mt-4 text-center text-xs text-slate-400">
                        Access restricted to authorized OneFine staff only.
                    </p>
                </form>
            </div>
        </div>
    );
}
