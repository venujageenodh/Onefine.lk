// ProductsAdminPage.jsx — re-exports the existing AdminDashboard products tab
// as a standalone page within the new admin system
import React, { useState } from 'react';

// Lazy import to keep bundle light
const AdminDashboard = React.lazy(() => import('../../AdminDashboard'));

export default function ProductsAdminPage() {
    return (
        <div className="-m-4 lg:-m-8">
            <React.Suspense fallback={<div className="py-20 text-center text-slate-400">Loading products panel…</div>}>
                <AdminDashboard embeddedMode />
            </React.Suspense>
        </div>
    );
}
