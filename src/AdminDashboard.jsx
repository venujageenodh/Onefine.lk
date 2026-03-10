import React from 'react';
import { useProducts } from './hooks/useProducts';
import { useCollections } from './hooks/useCollections';
import { useAuth } from './hooks/useAuth';
import logo from './assets/onefine-logo.png';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Build full API URL — same logic as useProducts/useAuth hooks
function apiUrl(path) {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
  return `${base}/api${path.startsWith('/') ? path : `/${path}`}`;
}

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
export default function AdminDashboard({ embeddedMode = false }) {
  const auth = useAuth();
  const tokenToUse = auth?.token || sessionStorage.getItem('onefine_admin_token') || sessionStorage.getItem('onefine_biz_token');
  const { products, setProducts, loading: productsLoading, error: productsError, addProduct, updateProduct, deleteProduct, updateProductOrder, uploadImage } =
    useProducts(tokenToUse);
  const { collections, loading: colLoading } = useCollections();

  const isOffline = Boolean(productsError);

  const [activeTab, setActiveTab] = React.useState(() => localStorage.getItem('onefine_admin_products_tab') || 'products'); // 'products' | 'collections'
  const [form, setForm] = React.useState({ name: '', price: '', image: '', collectionSlug: '', isBestSeller: false, isPublic: true, sortOrder: 0 });

  React.useEffect(() => {
    localStorage.setItem('onefine_admin_products_tab', activeTab);
  }, [activeTab]);

  const [editingId, setEditingId] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  // Collections form state
  const [colForm, setColForm] = React.useState({ name: '', slug: '', description: '', coverImage: '' });
  const [editingColId, setEditingColId] = React.useState(null);
  const [colSaving, setColSaving] = React.useState(false);
  const [colImageUploading, setColImageUploading] = React.useState(false);
  const [localCollections, setLocalCollections] = React.useState([]);

  React.useEffect(() => {
    setLocalCollections(collections);
  }, [collections]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (!embeddedMode && !auth.isAuthenticated) {
    return <LoginScreen onLogin={auth} />;
  }

  const [draggedItemId, setDraggedItemId] = React.useState(null);

  const handleDragStart = (e, id) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDraggedItemId(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetId, currentList) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    setDraggedItemId(null);
    if (!sourceId || sourceId === targetId) return;

    const sourceIdx = currentList.findIndex(p => p._id === sourceId);
    const targetIdx = currentList.findIndex(p => p._id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const newList = [...currentList];
    const [moved] = newList.splice(sourceIdx, 1);
    newList.splice(targetIdx, 0, moved);

    const updates = newList.map((p, index) => ({ id: p._id, sortOrder: index }));

    try {
      if (reorderProducts) {
        await reorderProducts(updates, tokenToUse);
        showToast('Sort order saved!');
      }
    } catch (err) {
      showToast('Failed to save order', 'error');
    }
  };

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
      const url = await uploadImage(file, tokenToUse);
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
      const payload = {
        name: form.name.trim(),
        price: form.price,
        image: form.image.trim(),
        isBestSeller: form.isBestSeller,
        isPublic: form.isPublic,
        collectionSlug: form.collectionSlug || '',
        sortOrder: form.sortOrder,
      };
      if (editingId) {
        await updateProduct(editingId, payload, tokenToUse);
        showToast('Product updated!');
      } else {
        await addProduct(payload, tokenToUse);
        showToast('Product added!');
      }
      setEditingId(null);
      setForm({ name: '', price: '', image: '', collectionSlug: '', isBestSeller: false, isPublic: true, sortOrder: 0 });
    } catch (err) {
      showToast(err.message || 'Something went wrong', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this product?')) return;
    try {
      await deleteProduct(id, tokenToUse);
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
      collectionSlug: product.collectionSlug || '',
      isBestSeller: product.isBestSeller || false,
      isPublic: product.isPublic !== false,
      sortOrder: product.sortOrder !== undefined ? product.sortOrder : 0,
    });
    setEditingId(product._id);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event, currentList) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    // Move within the local state immediately
    const oldIndex = products.findIndex((p) => p._id === active.id);
    const newIndex = products.findIndex((p) => p._id === over.id);
    const newProducts = arrayMove(products, oldIndex, newIndex);
    setProducts(newProducts);

    try {
      await updateProductOrder(newProducts, tokenToUse);
    } catch(err) {
      showToast('Error saving order', 'error');
      // Revert on error could be implemented here
    }
  };

  // ── Collection helpers ──────────────────────────────────────────────────────
  const handleColChange = (e) => {
    const { name, value } = e.target;
    setColForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'name' && !editingColId) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      return next;
    });
  };

  // Upload cover image for collection
  const handleColImageChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setColImageUploading(true);
    try {
      const url = await uploadImage(file, tokenToUse);
      setColForm((prev) => ({ ...prev, coverImage: url }));
    } catch {
      showToast('Cover image upload failed', 'error');
    } finally {
      setColImageUploading(false);
    }
  };

  // Quick-add brand: switch to Products tab with collection pre-selected
  const handleQuickAddBrand = (colSlug) => {
    setForm({ name: '', price: '', image: '', collectionSlug: colSlug, isBestSeller: false, isPublic: true, sortOrder: 0 });
    setEditingId(null);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleColSubmit = async (e) => {
    e.preventDefault();
    if (!colForm.name.trim() || !colForm.slug.trim()) return;
    setColSaving(true);
    try {
      const method = editingColId ? 'PUT' : 'POST';
      const url = editingColId
        ? apiUrl(`/collections/${editingColId}`)
        : apiUrl('/collections');
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenToUse}` },
        body: JSON.stringify(colForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      if (editingColId) {
        setLocalCollections((prev) => prev.map((c) => (c._id === editingColId ? data : c)));
        showToast('Collection updated!');
      } else {
        setLocalCollections((prev) => [...prev, data]);
        showToast('Collection created!');
      }
      setEditingColId(null);
      setColForm({ name: '', slug: '', description: '', coverImage: '' });
    } catch (err) {
      showToast(err.message || 'Error saving collection', 'error');
    } finally {
      setColSaving(false);
    }
  };

  const handleColEdit = (col) => {
    setColForm({ name: col.name, slug: col.slug, description: col.description || '', coverImage: col.coverImage || '' });
    setEditingColId(col._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleColDelete = async (id) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      const res = await fetch(apiUrl(`/collections/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setLocalCollections((prev) => prev.filter((c) => c._id !== id));
      showToast('Collection deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
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
        {!embeddedMode && (
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
                href="/biz-admin/orders"
                className="rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-navy hover:bg-gold/20 transition-colors"
              >
                Orders
              </a>
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
        )}

        {/* Tab buttons */}
        <div className="flex gap-2 mb-6">
          {['products', 'collections'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-1.5 text-xs font-semibold transition-all capitalize ${activeTab === tab ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-navy'
                }`}
            >
              {tab === 'products' ? '📦 Products' : '🗂️ Collections'}
            </button>
          ))}
        </div>

        {activeTab === 'products' && (
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
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Product Name</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold bg-slate-50/50"
                      placeholder="Eg: Toyota Edition Bottle" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Price (LKR)</label>
                    <input type="text" name="price" value={form.price} onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold bg-slate-50/50"
                      placeholder="Eg: 4,950" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sort Order</label>
                    <input type="number" name="sortOrder" value={form.sortOrder} onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold bg-slate-50/50"
                      placeholder="0" />
                    <p className="mt-1 text-[10px] text-slate-400">Lower numbers appear first.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Collection (optional)</label>
                    <select name="collectionSlug" value={form.collectionSlug} onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold bg-slate-50/50">
                      <option value="">— General Product (no collection) —</option>
                      {localCollections.map((col) => (
                        <option key={col._id} value={col.slug}>{col.name}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-[10px] text-slate-400">Products in a collection appear on the collection brand page.</p>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-1 items-center gap-3 rounded-xl border border-gold/10 bg-gold/5 p-3">
                      <input type="checkbox" id="isBestSeller" name="isBestSeller" checked={form.isBestSeller} onChange={handleChange}
                        className="h-4 w-4 rounded border-slate-300 text-gold focus:ring-gold" />
                      <label htmlFor="isBestSeller" className="text-xs font-bold text-navy cursor-pointer">✨ Featured Best Seller</label>
                    </div>

                    <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <input type="checkbox" id="isPublic" name="isPublic" checked={form.isPublic} onChange={handleChange}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                      <label htmlFor="isPublic" className="text-xs font-bold text-slate-700 cursor-pointer">👁️ Show on Website</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Product Image</label>
                    <div className="flex flex-col gap-3">
                      {form.image && (
                        <div className="relative group h-32 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <img src={resolveImageUrl(form.image)} alt="Preview" className="h-full w-full object-contain p-2" />
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageChange}
                        className="block w-full text-[11px] text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-1.5 file:text-[11px] file:font-semibold file:text-white hover:file:bg-slate-800" />
                    </div>
                    {isUploading && (
                      <p className="mt-2 text-[10px] text-blue-600 font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" /> Uploading…
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button type="submit" disabled={isSaving || isUploading || !form.image}
                      className="rounded-full bg-gold py-2.5 text-sm font-semibold text-navy disabled:opacity-50">
                      {isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Product'}
                    </button>
                    {editingId && (
                      <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', price: '', image: '', collectionSlug: '', isBestSeller: false, isPublic: true, sortOrder: 0 }); }}
                        className="rounded-full border border-slate-200 py-2 text-xs font-medium text-slate-500 hover:text-navy">
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </section>
            </aside>

            {/* Products List */}
            <main>
              {productsLoading ? (
                <div className="py-24 text-center text-slate-400">Loading products…</div>
              ) : (
                <div className="space-y-8">
                  {/* Group by collection */}
                  {localCollections.map((col) => {
                    const colProducts = products.filter(p => p.collectionSlug === col.slug || (p.name || '').toLowerCase().includes(col.slug.split('-')[0]));
                    if (!colProducts.length) return null;
                    return (
                      <div key={col._id}>
                        <h3 className="font-display text-base text-navy mb-3 pb-2 border-b border-slate-100">
                          🗂️ {col.name}
                          <a href={`/collection?slug=${col.slug}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-[10px] font-normal text-gold hover:underline">View page ↗</a>
                        </h3>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, colProducts)}>
                          <SortableContext items={colProducts.map(p => p._id)} strategy={verticalListSortingStrategy}>
                            <div className="grid gap-4 sm:grid-cols-2">
                              {colProducts.map(product => (
                                <SortableProductCard key={product._id} product={product} onEdit={handleEdit} onDelete={handleDelete} resolveImageUrl={resolveImageUrl} />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    );
                  })}
                  {/* General products */}
                  {(() => {
                    const colSlugs = new Set(localCollections.map(c => c.slug));
                    const general = products.filter(p => !p.collectionSlug && !localCollections.some(c => (p.name || '').toLowerCase().includes(c.slug.split('-')[0])));
                    if (!general.length) return null;
                    return (
                      <div>
                        <h3 className="font-display text-base text-navy mb-3 pb-2 border-b border-slate-100">📦 General Products</h3>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, general)}>
                          <SortableContext items={general.map(p => p._id)} strategy={verticalListSortingStrategy}>
                            <div className="grid gap-4 sm:grid-cols-2">
                              {general.map(product => (
                                <SortableProductCard key={product._id} product={product} onEdit={handleEdit} onDelete={handleDelete} resolveImageUrl={resolveImageUrl} />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    );
                  })()}
                </div>
              )}
            </main>
          </div>
        )}

        {/* Collections Tab */}
        {activeTab === 'collections' && (
          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            <aside>
              <section className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                <h2 className="font-display text-lg text-navy">{editingColId ? 'Edit Collection' : 'New Collection'}</h2>
                <p className="mt-1 text-xs text-slate-500">Create a product group like "Tissue Boxes" or "LUXGEAR Bottles".</p>
                <form onSubmit={handleColSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Collection Name *</label>
                    <input type="text" name="name" value={colForm.name} onChange={handleColChange} required
                      placeholder="Eg: Tissue Boxes"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold bg-slate-50/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Slug * (URL key)</label>
                    <input type="text" name="slug" value={colForm.slug} onChange={handleColChange} required
                      placeholder="tissue-boxes"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-gold focus:ring-1 focus:ring-gold bg-slate-50/50" />
                    <p className="mt-1 text-[10px] text-slate-400">Auto-generated. URL will be /collection?slug={colForm.slug || '...'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                    <textarea name="description" value={colForm.description} onChange={handleColChange} rows={2}
                      placeholder="Short description shown on collection page"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold bg-slate-50/50 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cover Image</label>
                    <div className="flex flex-col gap-3">
                      {colForm.coverImage && (
                        <div className="h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <img src={resolveImageUrl(colForm.coverImage)} alt="Cover preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleColImageChange}
                        className="block w-full text-[11px] text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-1.5 file:text-[11px] file:font-semibold file:text-white hover:file:bg-slate-800" />
                      {colImageUploading && (
                        <p className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" /> Uploading cover image…
                        </p>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">Upload a cover photo for this collection.</p>
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <button type="submit" disabled={colSaving}
                      className="rounded-full bg-gold py-2.5 text-sm font-semibold text-navy disabled:opacity-50">
                      {colSaving ? 'Saving…' : editingColId ? 'Save Changes' : 'Create Collection'}
                    </button>
                    {editingColId && (
                      <button type="button" onClick={() => { setEditingColId(null); setColForm({ name: '', slug: '', description: '', coverImage: '' }); }}
                        className="rounded-full border border-slate-200 py-2 text-xs font-medium text-slate-500 hover:text-navy">Cancel</button>
                    )}
                  </div>
                </form>
              </section>
            </aside>

            <main>
              {localCollections.length === 0 ? (
                <div className="py-24 text-center text-slate-400">No collections yet. Create your first one!</div>
              ) : (
                <div className="space-y-3">
                  {localCollections.map((col) => (
                    <div key={col._id} className="rounded-2xl bg-white border border-slate-100 p-5 flex items-start gap-4 shadow-sm">
                      {col.coverImage && (
                        <img src={resolveImageUrl(col.coverImage)} alt={col.name} className="h-16 w-16 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-navy">{col.name}</p>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">/collection?slug={col.slug}</p>
                        {col.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{col.description}</p>}
                        <div className="mt-2 flex gap-3 items-center">
                          <button
                            onClick={() => handleQuickAddBrand(col.slug)}
                            className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-navy hover:bg-gold-soft transition-colors"
                          >
                            + Add Brand
                          </button>
                          <a href={`/collection?slug=${col.slug}`} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] font-semibold text-gold hover:underline">View ↗</a>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleColEdit(col)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-navy hover:text-navy">Edit</button>
                        <button onClick={() => handleColDelete(col._id)} className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

// Sortable wrapper
function SortableProductCard({ product, onEdit, onDelete, resolveImageUrl }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 2 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ProductCard product={product} onEdit={onEdit} onDelete={onDelete} resolveImageUrl={resolveImageUrl} dragListeners={listeners} dragAttributes={attributes} />
    </div>
  );
}

// Product card sub-component
function ProductCard({ product, onEdit, onDelete, resolveImageUrl, dragListeners, dragAttributes }) {
  return (
    <div className="flex gap-3 items-center rounded-xl bg-white border border-slate-100 p-3 shadow-sm hover:shadow-soft transition-shadow">
      <div 
        className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-navy p-1 transition-colors"
        {...dragAttributes}
        {...dragListeners}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
      </div>
      {product.image && (
        <img src={resolveImageUrl(product.image)} alt={product.name} className="h-12 w-12 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-xs text-navy truncate">{product.name}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{product.price}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {product.collectionSlug && (
            <span className="inline-block rounded-full bg-gold/10 px-2 py-0.5 text-[9px] font-semibold text-navy">{product.collectionSlug}</span>
          )}
          {product.isPublic === false && (
            <span className="inline-block rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-[9px] font-semibold border border-slate-200">👁️ Hidden from Website</span>
          )}
          <span className="inline-block rounded-full bg-slate-50 text-slate-400 px-2 py-0.5 text-[10px] font-semibold border border-slate-200">Sort: {product.sortOrder || 0}</span>
        </div>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button onClick={(e) => { e.stopPropagation(); onEdit(product); }} className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600 hover:border-navy hover:text-navy">Edit</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(product._id); }} className="rounded-full border border-red-200 px-3 py-1 text-[11px] font-medium text-red-500 hover:bg-red-50">Del</button>
      </div>
    </div>
  );
}