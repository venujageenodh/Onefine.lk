// Central API utility for the new admin system
const BASE = (() => {
    const raw = import.meta.env.VITE_API_URL || '';
    return raw.replace(/\/api\/?$/, '').replace(/\/$/, '');
})();

export function apiUrl(path) {
    return `${BASE}/api${path.startsWith('/') ? path : '/' + path}`;
}

export async function apiFetch(path, options = {}, token) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(apiUrl(path), { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
}

export function formatLKR(amount) {
    return `Rs. ${Number(amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
}

export function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_COLORS = {
    NEW: 'bg-blue-100 text-blue-700',
    CONFIRMED: 'bg-indigo-100 text-indigo-700',
    IN_PRODUCTION: 'bg-purple-100 text-purple-700',
    PACKED: 'bg-orange-100 text-orange-700',
    SHIPPED: 'bg-yellow-100 text-yellow-700',
    DELIVERED: 'bg-teal-100 text-teal-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-600',
    UNPAID: 'bg-red-100 text-red-600',
    PART_PAID: 'bg-amber-100 text-amber-700',
    PAID: 'bg-green-100 text-green-700',
    DRAFT: 'bg-slate-100 text-slate-600',
    SENT: 'bg-blue-100 text-blue-600',
    ACCEPTED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-600',
    CONVERTED: 'bg-purple-100 text-purple-700',
};

export function StatusBadge({ status }) {
    const cls = STATUS_COLORS[status] || 'bg-slate-100 text-slate-500';
    return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}>
            {status?.replace(/_/g, ' ')}
        </span>
    );
}
