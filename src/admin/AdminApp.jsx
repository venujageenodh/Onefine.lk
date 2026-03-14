import React, { useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import AdminLogin from './AdminLogin';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import InventoryPage from './pages/InventoryPage';
import QuotationsPage from './pages/QuotationsPage';
import InvoicesPage from './pages/InvoicesPage';
import SuppliersPage from './pages/SuppliersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ProductsAdminPage from './pages/ProductsAdminPage';
import ProformaInvoicesPage from './pages/ProformaInvoicesPage';
import DeliveryNotesPage from './pages/DeliveryNotesPage';
import logo from '../assets/onefine-logo.png';

const NAV = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊', perm: 'dashboard.view' },
    { key: 'orders', label: 'Orders', icon: '📦', perm: 'orders.view' },
    { key: 'quotations', label: 'Quotations', icon: '📋', perm: 'quotations.view' },
    { key: 'invoices', label: 'Invoices', icon: '🧾', perm: 'invoices.view' },
    { key: 'inventory', label: 'Inventory', icon: '🗃️', perm: 'inventory.view' },
    { key: 'proforma', label: 'Proforma Invoices', icon: '📄', perm: 'proforma.view' },
    { key: 'delivery-notes', label: 'Delivery Notes', icon: '🚚', perm: 'delivery.view' },
    { key: 'products', label: 'Products', icon: '🏷️', perm: 'products.view' },
    { key: 'suppliers', label: 'Suppliers', icon: '🚚', perm: 'suppliers.view' },
    { key: 'admins', label: 'Admin Users', icon: '👥', perm: '__owner__' },
];

const PAGES = {
    dashboard: DashboardPage,
    orders: OrdersPage,
    inventory: InventoryPage,
    quotations: QuotationsPage,
    invoices: InvoicesPage,
    suppliers: SuppliersPage,
    admins: AdminUsersPage,
    products: ProductsAdminPage,
    proforma: ProformaInvoicesPage,
    'delivery-notes': DeliveryNotesPage,
};

export default function AdminApp() {
    const { isAuthenticated, admin, logout, hasPermission } = useAdminAuth();
    const [page, setPage] = useState(() => localStorage.getItem('onefine_admin_page') || 'dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    React.useEffect(() => {
        localStorage.setItem('onefine_admin_page', page);
    }, [page]);

    if (!isAuthenticated) return <AdminLogin />;

    const allowedNav = NAV.filter(n =>
        n.perm === '__owner__' ? (admin?.role === 'OWNER' || admin?.role === 'DEVELOPER') : hasPermission(n.perm) || hasPermission('*')
    );
    const ActivePage = PAGES[page] || DashboardPage;

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#1B2A4A] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Brand */}
                <div className="px-6 py-6 border-b border-white/10">
                    <p className="text-[#C9A84C] font-bold tracking-[0.25em] text-lg uppercase">ONEFINE</p>
                    <p className="text-white/40 text-[10px] tracking-widest uppercase mt-0.5">Business Suite</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {allowedNav.map(n => (
                        <button
                            key={n.key}
                            onClick={() => { setPage(n.key); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                ${page === n.key
                                    ? 'bg-[#C9A84C] text-[#1B2A4A] font-bold'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            <span className="text-base">{n.icon}</span>
                            {n.label}
                        </button>
                    ))}
                </nav>

                {/* Admin info + logout */}
                <div className="px-4 py-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
                            <span className="text-[#C9A84C] font-bold text-sm">{admin?.name?.[0] || 'A'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">{admin?.name || 'Admin'}</p>
                            <p className="text-white/40 text-[10px] truncate">{admin?.role || 'OWNER'}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full rounded-full border border-white/20 py-1.5 text-xs text-white/60 hover:text-white hover:border-white/40 transition-colors">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="bg-white border-b border-slate-100 px-4 lg:px-8 py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100">
                            <span className="text-xl">☰</span>
                        </button>
                        <img src={logo} alt="OneFine logo" className="h-10 w-auto object-contain hidden sm:block" />
                        <div className="leading-tight hidden sm:block">
                            <h1 className="font-display text-xl tracking-[0.18em] text-[#1B2A4A] md:text-navy">ONEFINE ADMIN</h1>
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Managed by Team OneFine</p>
                        </div>
                        <div className="sm:hidden flex-1">
                            <h1 className="font-bold text-[#1B2A4A] text-lg capitalize">
                                {allowedNav.find(n => n.key === page)?.label || 'Dashboard'}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setPage('orders')} className="hidden sm:flex rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-navy hover:bg-gold/20 transition-colors">Orders</button>
                        <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:flex rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:border-navy hover:text-navy transition-colors">View Storefront</a>
                        <button onClick={logout} className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">Sign Out</button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <ActivePage />
                </main>
            </div>
        </div>
    );
}
