import React from 'react';
import { useProducts } from './hooks/useProducts';
import { useAuth } from './hooks/useAuth';
import logo from './assets/onefine-logo.png';

// Resolve image URL — handles both absolute URLs and relative /uploads/ paths
function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
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
  const isOffline = Boolean(productsError);

  const [form, setForm] = React.useState({ name: '', price: '', image: '', isLuxgear: false });
  const [editingId, setEditingId] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  // Split products into Luxgear and General
  const luxgearItems = React.useMemo(() =>
    products.filter(p => (p.name || '').toLowerCase().includes('luxgear')),
    [products]);

  const generalItems = React.useMemo(() =>
    products.filter(p => !(p.name || '').toLowerCase().includes('luxgear')),
    [products]);

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
    const { name, value, type, checked } = e.target;
    if (name === 'price') {
      const numeric = value.replace(/[^\d]/g, '');
      setForm((prev) => ({ ...prev, price: numeric ? formatPrice(numeric) : '' }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

    // Auto-prefix name with Luxgear if checkbox is checked
    let finalName = form.name.trim();
    if (form.isLuxgear && !finalName.toLowerCase().includes('luxgear')) {
      finalName = `Luxgear ${finalName}`;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await updateProduct(editingId, { name: finalName, price: form.price, image: form.image.trim() }, auth.token);
        showToast('Product updated!');
      } else {
        await addProduct({ name: finalName, price: form.price, image: form.image.trim() }, auth.token);
        showToast('Product added!');
      }
      setEditingId(null);
      setForm({ name: '', price: '', image: '', isLuxgear: false });
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
    const isLuxgear = (product.name || '').toLowerCase().includes('luxgear');
    setForm({
      name: product.name,
      price: formatPrice(extractNumeric(product.price)),
      image: product.image,
      isLuxgear: isLuxgear
    });
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-navy font-sans">
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
            <img src={logo} alt="OneFine logo" className="h-10 w-auto object-contain" />
            <div className="leading-tight">
              <h1 className="font-display text-xl tracking-[0.18em] text-navy">ONEFINE ADMIN</h1>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Managed by Team OneFine
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

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Form Panel */}
          <aside>
            <section className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h2 className="font-display text-lg text-navy">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Update or create products across your collections.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold bg-slate-50/50"
                    placeholder="Eg: Toyota Edition Bottle"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Price (LKR)
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold bg-slate-50/50"
                    placeholder="Eg: 4,950"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <input
                    type="checkbox"
                    id="isLuxgear"
                    name="isLuxgear"
                    checked={form.isLuxgear}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-gold focus:ring-gold"
                  />
                  <label htmlFor="isLuxgear" className="text-xs font-medium text-navy cursor-pointer">
                    Identify as LUXGEAR Bottle
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Product Image
                  </label>
                  <div className="flex flex-col gap-3">
                    {form.image && (
                      <div className="relative group h-32 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <img src={resolveImageUrl(form.image)} alt="Preview" className="h-full w-full object-contain p-2" />
                        <div className="absolute inset-0 bg-navy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-[10px] text-white font-medium bg-navy/60 px-2 py-1 rounded">Replacing Current</p>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-[11px] text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-1.5 file:text-[11px] file:font-semibold file:text-white hover:file:bg-slate-800"
                    />
                  </div>
                  {isUploading && (
                    <p className="mt-2 text-[10px] text-blue-600 font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" /> Uploading to server…
                    </p>
                  )}
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isUploading || isSaving}
                    className="w-full inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-xs font-bold text-navy shadow-subtle transition-all hover:-translate-y-0.5 hover:bg-gold-soft disabled:opacity-50"
                  >
                    {isSaving ? 'Processing…' : editingId ? 'Update Product' : 'Add to Catalog'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setForm({ name: '', price: '', image: '', isLuxgear: false });
                      }}
                      className="w-full text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors py-1"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>
              </form>
            </section>
          </aside>

          {/* Lists Panel */}
          <main className="space-y-8">
            {/* Luxgear Section */}
            <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 border-l-4 border-l-gold">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl text-navy">LUXGEAR Collection</h2>
                  <p className="text-xs text-slate-500">Automotive brand bottles appearing on /luxgear-bottles</p>
                </div>
                <span className="rounded-full bg-gold/10 px-3 py-1 text-[10px] font-bold text-navy uppercase tracking-wider">
                  {luxgearItems.length} Brands
                </span>
              </div>

              {luxgearItems.length === 0 ? (
                <div className="py-12 text-center rounded-xl bg-slate-50/50 border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500 italic">No Luxgear products found. Mark items as "Luxgear" to see them here.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {luxgearItems.map((product) => (
                    <ProductCard key={product._id} product={product} onEdit={handleEdit} onDelete={handleDelete} isOffline={isOffline} />
                  ))}
                </div>
              )}
            </section>

            {/* General Products Section */}
            <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl text-navy">General Catalog</h2>
                  <p className="text-xs text-slate-500">Standard gift items and general corporate solutions</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {generalItems.length} Products
                </span>
              </div>

              {generalItems.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-4">Current catalog is empty.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {generalItems.map((product) => (
                    <ProductCard key={product._id} product={product} onEdit={handleEdit} onDelete={handleDelete} isOffline={isOffline} />
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function ProductCard({ product, onEdit, onDelete, isOffline }) {
  return (
    <article className="flex flex-col group overflow-hidden rounded-xl border border-slate-100 bg-white hover:shadow-soft transition-all">
      <div className="relative h-40 w-full overflow-hidden bg-slate-50">
        {product.image && (
          <img
            src={resolveImageUrl(product.image)}
            alt={product.name}
            className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute top-2 right-2">
          <span className="rounded-full bg-white/90 backdrop-blur px-2 py-0.5 text-[9px] font-bold text-navy shadow-sm border border-slate-100 uppercase tracking-tighter">
            {product.price}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-1 text-xs font-bold text-navy mb-3 uppercase tracking-tight">{product.name}</h3>

        <div className="mt-auto flex gap-1.5">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-navy hover:text-white hover:border-navy transition-all"
          >
            Edit
          </button>
          {!isOffline && (
            <button
              onClick={() => onDelete(product._id)}
              className="px-2 py-1.5 rounded-lg border border-red-50 px-2 text-[10px] font-bold text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
