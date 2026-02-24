import React from 'react';
import { useProducts } from './hooks/useProducts';
import logo from './assets/onefine-logo.png';

function formatPriceFromNumericString(numericString) {
  const cleaned = numericString.replace(/[^\d]/g, '');
  if (!cleaned) return '';
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return '';
  return `Rs. ${value.toLocaleString('en-LK')}`;
}

function extractNumericStringFromPrice(formattedPrice) {
  if (!formattedPrice) return '';
  const cleaned = formattedPrice.replace(/[^\d]/g, '');
  return cleaned;
}

export default function AdminDashboard() {
  const { products, setProducts } = useProducts();
  const [form, setForm] = React.useState({
    name: '',
    price: '',
    image: '',
  });
  const [editingId, setEditingId] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'price') {
      const numericOnly = value.replace(/[^\d]/g, '');
      const formatted = formatPriceFromNumericString(numericOnly);
      setForm((prev) => ({ ...prev, price: formatted ? formatted : '' }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Upload failed');
        }
        return res.json();
      })
      .then((data) => {
        if (data?.url) {
          setForm((prev) => ({ ...prev, image: data.url }));
        }
      })
      .catch(() => {
        // swallow errors for now
      })
      .finally(() => setIsUploading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim() || !form.image.trim()) {
      return;
    }

    const displayPrice = form.price;

    if (editingId) {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: form.name.trim(),
                price: displayPrice,
                image: form.image.trim(),
              }
            : p
        )
      );
    } else {
      // Add new product
      const newProduct = {
        id: Date.now(),
        name: form.name.trim(),
        price: displayPrice,
        rating: 5,
        image: form.image.trim(),
      };
      setProducts((prev) => [newProduct, ...prev]);
    }

    setEditingId(null);
    setForm({ name: '', price: '', image: '' });
  };

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: formatPriceFromNumericString(
        extractNumericStringFromPrice(product.price)
      ),
      image: product.image,
    });
    setEditingId(product.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-navy">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="OneFine logo" className="h-12 w-auto object-contain" />
            <div className="leading-tight">
              <h1 className="font-display text-xl tracking-[0.18em] text-navy">
                ONEFINE ADMIN
              </h1>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Corporate Gifting Dashboard
              </p>
            </div>
          </div>
          <a
            href="/"
            className="rounded-full border border-navy px-4 py-1.5 text-xs font-semibold text-navy hover:bg-navy hover:text-white transition-colors"
          >
            View Storefront
          </a>
        </header>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
          <section className="rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="font-display text-lg text-navy">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Fill in the details below to add a product to the OneFine homepage
              grid.
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
                    <img
                      src={form.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                {isUploading && (
                  <p className="mt-2 text-[11px] text-slate-500">Uploading image…</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2 text-xs font-semibold text-navy shadow-subtle transition-transform hover:-translate-y-0.5 hover:bg-gold-soft"
                >
                  {editingId ? 'Save Changes' : 'Add Product'}
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

          <section className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-navy">Current Products</h2>
              <span className="text-xs text-slate-500">
                {products.length} item{products.length !== 1 ? 's' : ''}
              </span>
            </div>

            {products.length === 0 ? (
              <p className="text-sm text-slate-500">
                No products yet. Use the form on the left to add your first item.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60"
                  >
                    <div className="h-32 w-full overflow-hidden bg-slate-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <h3 className="text-sm font-semibold text-navy">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-600">{product.price}</p>
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
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex items-center justify-center rounded-full border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
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

