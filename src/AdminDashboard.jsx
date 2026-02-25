import React from 'react';
import { useProducts } from './hooks/useProducts';
import { useAuth } from './hooks/useAuth';
import logo from './assets/onefine-logo.png';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Resolve image URL — handles both absolute URLs and relative /uploads/ paths
function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // relative path like /uploads/filename
  return `${API_BASE}${url}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(numericString) {
  const cleaned = numericString.replace(/[^\d]/g, '');
  if (!cleaned) return '';
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return '';
  return `Rs. ${value.toLocaleString('en-LK')}`;
}

function extractNumeric(formatted) {
  return formatted ? formatted.replace(/[^\d]/g, '') : '';
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const { login, error, loading } = onLogin;
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="OneFine logo" className="h-16 w-auto object-contain mb-3" />
          <h1 className="font-display text-2xl tracking-[0.18em] text-white">ONEFINE</h1>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 mt-0.5">
            Admin Access
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-7 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-1">Sign in to Dashboard</h2>
          <p className="text-slate-400 text-xs mb-6">
            Enter your admin password to manage products.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-full bg-gold py-2.5 text-sm font-semibold text-navy shadow-soft transition-all hover:-translate-y-0.5 hover:bg-gold-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          <a href="/" className="hover:text-slate-400 transition-colors">
            ← Back to storefront
          </a>
        </p>
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const auth = useAuth();
  const { products, loading: productsLoading, error: productsError, addProduct, updateProduct, deleteProduct, uploadImage } =
    useProducts();

  // Detect if we're showing fallback/demo data (server offline)
  const isOffline = products.length > 0 && products[0]._id?.startsWith('default-');

  const [form, setForm] = React.useState({ name: '', price: '', image: '' });
  const [editingId, setEditingId] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  // Show toast message
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Show login screen if not authenticated
  if (!auth.isAuthenticated) {
    return <LoginScreen onLogin={auth} />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      const numeric = value.replace(/[^\d]/g, '');
      setForm((prev) => ({ ...prev, price: numeric ? formatPrice(numeric) : '' }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file, auth.token);
      setForm((prev) => ({ ...prev, image: url }));
    } catch {
      showToast('Image upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim() || !form.image.trim()) return;
    setIsSaving(true);
    try {
      if (editingId) {
        await updateProduct(editingId, { name: form.name.trim(), price: form.price, image: form.image.trim() }, auth.token);
        showToast('Product updated!');
      } else {
        await addProduct({ name: form.name.trim(), price: form.price, image: form.image.trim() }, auth.token);
        showToast('Product added!');
      }
      setEditingId(null);
      setForm({ name: '', price: '', image: '' });
    } catch (err) {
      showToast(err.message || 'Something went wrong', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this product?')) return;
    try {
      await deleteProduct(id, auth.token);
      showToast('Product removed');
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: formatPrice(extractNumeric(product.price)),
      image: product.image,
    });
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-navy">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-2.5 text-sm font-medium shadow-soft transition-all ${toast.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-navy text-white'
            }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="OneFine logo" className="h-12 w-auto object-contain" />
            <div className="leading-tight">
              <h1 className="font-display text-xl tracking-[0.18em] text-navy">ONEFINE ADMIN</h1>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Corporate Gifting Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:border-navy hover:text-navy transition-colors"
            >
              View Storefront
            </a>
            <button
              onClick={auth.logout}
              className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
          {/* Form Panel */}
          <section className="rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="font-display text-lg text-navy">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {editingId
                ? 'Update the product details below.'
                : 'Fill in the details below to add a product to the OneFine homepage grid.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy bg-white"
                  placeholder="Eg: Custom Name Insulated Bottle"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Price (LKR)
                </label>
                <input
                  type="text"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy bg-white"
                  placeholder="Eg: Rs. 4,950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-navy hover:file:bg-slate-200"
                />
                {form.image && (
                  <div className="mt-3 h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img src={resolveImageUrl(form.image)} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
                {isUploading && (
                  <p className="mt-2 text-[11px] text-slate-500">Uploading image…</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isUploading || isSaving}
                  className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2 text-xs font-semibold text-navy shadow-subtle transition-transform hover:-translate-y-0.5 hover:bg-gold-soft disabled:opacity-50"
                >
                  {isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Product'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ name: '', price: '', image: '' });
                    }}
                    className="text-[11px] font-medium text-slate-500 hover:text-navy"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Products Panel */}
          <section className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-navy">Current Products</h2>
              <span className="text-xs text-slate-500">
                {products.length} item{products.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Server offline notice */}
            {isOffline && (
              <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                ⚠️ Backend server offline — showing demo products. Start the server to manage products.
              </div>
            )}

            {productsLoading ? (
              <p className="text-sm text-slate-500">Loading products…</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-slate-500">
                No products yet. Use the form on the left to add your first item.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {products.map((product) => (
                  <article
                    key={product._id}
                    className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60"
                  >
                    <div className="h-32 w-full overflow-hidden bg-slate-100">
                      {product.image && (
                        <img
                          src={resolveImageUrl(product.image)}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <h3 className="text-sm font-semibold text-navy">{product.name}</h3>
                      <p className="text-xs text-slate-600">{product.price}</p>
                      {!isOffline && (
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product._id)}
                            className="inline-flex items-center justify-center rounded-full border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
