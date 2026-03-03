import React, { useState, useMemo } from 'react';
import { HiOutlineSearch, HiOutlineShoppingBag, HiStar, HiOutlineStar, HiMenu, HiX } from 'react-icons/hi';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { useProducts } from './hooks/useProducts';
import { useCart } from './hooks/useCart';
import { useCollections } from './hooks/useCollections';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import PaymentIcons from './components/PaymentIcons';
import logo from './assets/onefine-logo.png';

const API_BASE = import.meta.env.VITE_API_URL || '';
function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

function RatingStars({ value }) {
  return (
    <div className="flex items-center gap-1 text-gold text-sm">
      {Array.from({ length: 5 }).map((_, i) =>
        i < value ? <HiStar key={i} /> : <HiOutlineStar key={i} />
      )}
    </div>
  );
}

export default function ShopPage() {
  const { products } = useProducts();
  const { collections } = useCollections();
  const { addToCart, totalItems, setIsOpen } = useCart();
  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = React.useRef(null);
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  const handleSearchButtonClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => searchInputRef.current && searchInputRef.current.focus(), 400);
    }
  };

  const handleAddToCart = (product) => {
    addToCart({ id: product._id, name: product.name, price: product.price, image: product.image });
  };

  const handleBuyNow = (product) => {
    setCheckoutProduct(product);
  };

  const filteredProducts = useMemo(() => {
    // Exclude products that belong to any collection
    const slugsInUse = new Set(collections.map(c => c.slug));
    const general = products.filter(
      (p) => !p.collectionSlug && !(p.name || '').toLowerCase().includes('luxgear')
    );
    if (!query) return general;
    const q = query.trim().toLowerCase();
    return general.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [products, collections, query]);

  return (
    <div className="min-h-screen bg-white text-navy">
      <CartDrawer />
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
        />
      )}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
          <div className="flex items-center justify-between py-4">
            <a href="/" className="flex items-center gap-3">
              <img src={logo} alt="OneFine logo" className="h-12 w-auto object-contain" />
              <div className="leading-tight">
                <div className="font-display text-xl tracking-[0.18em] text-navy">
                  ONEFINE
                </div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Corporate Gifting Sri Lanka
                </p>
              </div>
            </a>

            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
              <a href="/" className="hover:text-navy transition-colors">
                Home
              </a>
              <span className="text-navy font-semibold">Shop</span>
              <a href="/about" className="hover:text-navy transition-colors">
                About Us
              </a>
              <a href="/contact-us" className="hover:text-navy transition-colors">
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                aria-label="Search"
                onClick={handleSearchButtonClick}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-all"
              >
                <HiOutlineSearch className="text-lg" />
              </button>
              <button aria-label="Cart" onClick={() => setIsOpen(true)} className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-all">
                <HiOutlineShoppingBag className="text-lg" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-navy shadow-subtle">{totalItems}</span>
                )}
              </button>
              <button
                aria-label="Toggle menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 md:hidden"
              >
                {mobileMenuOpen ? <HiX className="text-lg" /> : <HiMenu className="text-lg" />}
              </button>
            </div>
          </div>
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 z-40 bg-white border-b border-slate-100 p-6 shadow-lg animate-in slide-in-from-top duration-300 md:hidden">
              <nav className="flex flex-col gap-4 text-sm font-medium">
                <a href="/" onClick={() => setMobileMenuOpen(false)} className="text-slate-600">Home</a>
                <span className="text-navy font-semibold">Shop</span>
                <a href="/about" onClick={() => setMobileMenuOpen(false)} className="text-slate-600">About Us</a>
                <a href="/contact-us" onClick={() => setMobileMenuOpen(false)} className="text-slate-600">Contact</a>
              </nav>
            </div>
          )}
        </header>

        <main className="pt-8 pb-16 md:pt-10">
          <section className="mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Shop
            </p>
            <h1 className="mt-2 font-display text-3xl text-navy sm:text-4xl">
              All Corporate Gift Collections
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Browse all OneFine products, including custom name bottles and curated
              executive gift sets. Items added in the admin dashboard appear here.
            </p>
          </section>

          <section>
            {products.length === 0 ? (
              <p className="text-sm text-slate-500">
                No products available yet. Add items from the admin dashboard.
              </p>
            ) : (
              <>
                <div className="mb-6">
                  <label htmlFor="search" className="sr-only">Search products</label>
                  <div className="relative max-w-md">
                    <input
                      id="search"
                      ref={searchInputRef}
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search products by name..."
                      className="w-full rounded-full border border-slate-200 px-4 py-2 pl-10 text-sm placeholder:text-slate-400 focus:border-navy focus:ring-1 focus:ring-navy"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <HiOutlineSearch className="text-lg" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* ── Dynamic Collection Cards ── */}
                  {!query && collections.map((col) => {
                    // Use first product of this collection as cover
                    const coverProd = products.find(p =>
                      p.collectionSlug === col.slug ||
                      (p.name || '').toLowerCase().includes(col.slug.replace(/-/g, ' ').split(' ')[0])
                    );
                    const image = col.coverImage || coverProd?.image || '';
                    return (
                      <article key={col._id} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-transform hover:-translate-y-1 hover:shadow-soft border border-gold/20">
                        <a href={`/collection?slug=${col.slug}`} className="block relative w-full aspect-square overflow-hidden bg-gradient-to-br from-navy/5 to-gold/10 rounded-t-2xl">
                          {image ? (
                            <img
                              src={resolveImageUrl(image)}
                              alt={col.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="font-display text-4xl text-gold/30">🏷️</span>
                            </div>
                          )}
                          <span className="absolute top-3 left-3 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-navy shadow-sm">
                            Collection
                          </span>
                        </a>
                        <div className="flex flex-1 flex-col gap-3 p-4">
                          <div className="space-y-1">
                            <h2 className="font-medium text-sm text-navy">{col.name}</h2>
                            <p className="text-xs text-slate-500 line-clamp-1">{col.description || 'Multiple brands available'}</p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <RatingStars value={5} />
                            <span>Multiple brands</span>
                          </div>
                          <a
                            href={`/collection?slug=${col.slug}`}
                            className="mt-auto inline-flex items-center justify-center rounded-full bg-gold px-4 py-2 text-xs font-semibold text-navy shadow-subtle transition-all hover:bg-gold-soft hover:-translate-y-0.5"
                          >
                            View All Brands →
                          </a>
                        </div>
                      </article>
                    );
                  })}

                  {/* ── General Products ── */}
                  {filteredProducts.map((product) => (
                    <article
                      key={product._id}
                      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-transform hover:-translate-y-1 hover:shadow-soft"
                    >
                      <div className="relative w-full aspect-square overflow-hidden bg-slate-100 rounded-t-2xl">
                        {product.image && (
                          <img
                            src={resolveImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div className="space-y-1">
                          <h2 className="font-medium text-sm text-navy">{product.name}</h2>
                          <p className="text-sm font-semibold text-navy">{product.price}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <RatingStars value={product.rating ?? 5} />
                          <span>Made to order</span>
                        </div>
                        <div className="mt-auto flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 inline-flex items-center justify-center rounded-full border border-navy px-3 py-2 text-xs font-semibold text-navy transition-all hover:bg-navy hover:text-white hover:-translate-y-0.5"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleBuyNow(product)}
                            className="flex-1 inline-flex items-center justify-center rounded-full bg-gold px-3 py-2 text-xs font-semibold text-navy shadow-subtle transition-all hover:bg-gold-soft hover:-translate-y-0.5"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      <footer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-12 border-t border-slate-100 pt-8 pb-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <img src={logo} alt="OneFine logo" className="h-12 w-auto object-contain" />
              <div className="leading-tight">
                <div className="font-display text-xl tracking-[0.18em] text-navy">ONEFINE</div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Corporate Gifting Sri Lanka</p>
              </div>
            </div>
            <p className="max-w-sm text-xs text-slate-500">
              Premium corporate gifting and branded merchandise, designed and delivered with precision for Sri Lankan businesses and global teams based in Sri Lanka.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/share/14UfX7GiR5r/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-gold hover:text-gold transition-colors">
                <FaFacebookF className="text-[13px]" />
              </a>
              <a href="https://www.instagram.com/_.one_.fine_?igsh=ZHZocWd5c3Jxd24w" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-gold hover:text-gold transition-colors">
                <FaInstagram className="text-[13px]" />
              </a>
              <a href="https://www.linkedin.com/company/onefine-lk" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-gold hover:text-gold transition-colors">
                <FaLinkedinIn className="text-[13px]" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="/" className="hover:text-navy">Home</a></li>
              <li><span className="text-navy font-semibold">Shop</span></li>
              <li><a href="/luxgear-bottles" className="hover:text-navy">LUXGEAR Bottles</a></li>
              <li><a href="/about" className="hover:text-navy">About Us</a></li>
              <li><a href="/contact-us" className="hover:text-navy">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contact</h4>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>20/9, Green Terrace, Parakandeniya, Imbulgoda</p>
              <p>+94 76 812 1701</p>
              <p>onefine.info@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <PaymentIcons />
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} OneFine. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-navy">Privacy Policy</a>
            <a href="/terms" className="hover:text-navy">Terms of Service</a>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/94768121701"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition-transform hover:-translate-y-0.5 md:bottom-6 md:right-6"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="text-2xl" />
      </a>
    </div>
  );
}

