import React, { useState, useEffect } from 'react';
import { HiOutlineShoppingBag, HiMenu, HiX } from 'react-icons/hi';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { useCart } from './hooks/useCart';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import PaymentIcons from './components/PaymentIcons';
import logo from './assets/onefine-logo.png';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function resolveImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
    return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

export default function CollectionDetailPage() {
    const { addToCart, totalItems, setIsOpen } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [checkoutProduct, setCheckoutProduct] = useState(null);
    const [collection, setCollection] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Read slug from URL
    const slug = new URLSearchParams(window.location.search).get('slug') || '';

    useEffect(() => {
        if (!slug) {
            setError('No collection specified.');
            setLoading(false);
            return;
        }

        async function load() {
            setLoading(true);
            try {
                // Fetch all collections to find this one
                const [colRes, prodRes] = await Promise.all([
                    fetch(`${API_BASE}/collections`),
                    fetch(`${API_BASE}/collections/${slug}/products`),
                ]);
                const cols = await colRes.json();
                const prods = await prodRes.json();

                const found = cols.find((c) => c.slug === slug);
                setCollection(found || { name: slug, description: '' });
                setProducts(Array.isArray(prods) ? prods : []);
            } catch (err) {
                setError('Failed to load collection.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);

    const handleAddToCart = (product) => {
        addToCart({ id: product._id, name: product.name, price: product.price, image: product.image });
    };

    const handleBuyNow = (product) => {
        setCheckoutProduct(product);
    };

    return (
        <div className="min-h-screen bg-white text-navy">
            <CartDrawer />
            {checkoutProduct && (
                <CheckoutModal product={checkoutProduct} onClose={() => setCheckoutProduct(null)} />
            )}

            {/* ── Header ────────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <a href="/" className="flex items-center gap-3">
                            <img src={logo} alt="OneFine logo" className="h-12 w-auto object-contain" />
                            <div className="leading-tight">
                                <div className="font-display text-xl tracking-[0.18em] text-navy">ONEFINE</div>
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                    Corporate Gifting Sri Lanka
                                </p>
                            </div>
                        </a>

                        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
                            <a href="/" className="hover:text-navy transition-colors">Home</a>
                            <a href="/shop" className="hover:text-navy transition-colors">Shop</a>
                            <a href="/about" className="hover:text-navy transition-colors">About Us</a>
                            <a href="/contact-us" className="hover:text-navy transition-colors">Contact</a>
                        </nav>

                        <div className="flex items-center gap-3">
                            <button
                                aria-label="Cart"
                                onClick={() => setIsOpen(true)}
                                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-all"
                            >
                                <HiOutlineShoppingBag className="text-lg" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-navy shadow-subtle">
                                        {totalItems}
                                    </span>
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
                    {mobileMenuOpen && (
                        <div className="absolute top-full left-0 right-0 z-40 bg-white border-b border-slate-100 p-6 shadow-lg animate-in slide-in-from-top duration-300 md:hidden">
                            <nav className="flex flex-col gap-4 text-sm font-medium">
                                <a href="/" onClick={() => setMobileMenuOpen(false)} className="text-slate-600">Home</a>
                                <a href="/shop" onClick={() => setMobileMenuOpen(false)} className="text-slate-600">Shop</a>
                                <a href="/about" onClick={() => setMobileMenuOpen(false)} className="text-slate-600">About Us</a>
                                <a href="/contact-us" onClick={() => setMobileMenuOpen(false)} className="text-slate-600">Contact</a>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* ── Page Content ──────────────────────────────────────────────── */}
            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">

                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-xs text-slate-400">
                    <a href="/shop" className="hover:text-navy transition-colors">Shop</a>
                    <span>›</span>
                    <span className="text-navy font-medium">{collection?.name || slug}</span>
                </nav>

                {loading ? (
                    <div className="py-24 text-center text-slate-400">Loading collection…</div>
                ) : error ? (
                    <div className="py-24 text-center text-red-500">{error}</div>
                ) : (
                    <>
                        {/* Page heading */}
                        <section className="mb-10 text-center">
                            <p className="text-xs uppercase tracking-[0.28em] text-gold font-medium">Collection</p>
                            <h1 className="mt-3 font-display text-3xl text-navy sm:text-4xl lg:text-5xl">
                                {collection?.name}
                            </h1>
                            {collection?.description && (
                                <p className="mt-3 max-w-lg mx-auto text-sm text-slate-500 leading-relaxed">
                                    {collection.description}
                                </p>
                            )}
                            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
                                <span>✦ Premium quality</span>
                                <span>✦ Custom branding</span>
                                <span>✦ Island-wide delivery</span>
                            </div>
                        </section>

                        {/* Product grid */}
                        {products.length === 0 ? (
                            <div className="py-16 text-center text-slate-500 space-y-3">
                                <p className="text-2xl">🏷️</p>
                                <p className="font-medium text-navy">No products in this collection yet</p>
                                <p className="text-sm">Admin can add products and assign them to <strong>{collection?.name}</strong> from the dashboard.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {products.map((product) => (
                                    <article
                                        key={product._id}
                                        className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft"
                                    >
                                        <div className="relative aspect-square w-full overflow-hidden bg-slate-50 flex items-center justify-center">
                                            {product.image ? (
                                                <img
                                                    src={resolveImageUrl(product.image)}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                    <span className="text-4xl">🏷️</span>
                                                </div>
                                            )}
                                            <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600 shadow-sm border border-slate-100">
                                                In Stock
                                            </span>
                                        </div>

                                        <div className="flex flex-1 flex-col gap-4 p-5">
                                            <div>
                                                <h2 className="font-display text-lg text-navy tracking-wide">{product.name}</h2>
                                                <p className="text-base font-semibold text-navy mt-1">{product.price}</p>
                                            </div>

                                            <div className="mt-auto flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="inline-flex items-center justify-center rounded-full border border-navy px-4 py-2.5 text-xs font-semibold text-navy transition-all hover:bg-navy hover:text-white hover:-translate-y-0.5"
                                                >
                                                    Add to Cart
                                                </button>
                                                <button
                                                    onClick={() => handleBuyNow(product)}
                                                    className="inline-flex items-center justify-center rounded-full bg-gold px-4 py-2.5 text-xs font-semibold text-navy shadow-subtle transition-all hover:bg-gold-soft hover:-translate-y-0.5"
                                                >
                                                    Buy Now
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* ── Footer ────────────────────────────────────────────────────── */}
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
                            Premium corporate gifting and branded merchandise for Sri Lankan businesses.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="https://www.facebook.com/share/14UfX7GiR5r/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-gold hover:text-gold transition-colors">
                                <FaFacebookF className="text-[13px]" />
                            </a>
                            <a href="https://www.instagram.com/_.one_.fine_?igsh=ZHZocWd5c3Jxd24w" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-gold hover:text-gold transition-colors">
                                <FaInstagram className="text-[13px]" />
                            </a>
                            <a href="#" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-gold hover:text-gold transition-colors">
                                <FaLinkedinIn className="text-[13px]" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick Links</h4>
                        <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            <li><a href="/" className="hover:text-navy">Home</a></li>
                            <li><a href="/shop" className="hover:text-navy">Shop</a></li>
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
                        <a href="#" className="hover:text-navy">Privacy Policy</a>
                        <a href="#" className="hover:text-navy">Terms of Service</a>
                    </div>
                </div>
            </footer>

            {/* WhatsApp FAB */}
            <a
                href="https://wa.me/94768121701"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition-transform hover:-translate-y-0.5"
                aria-label="Chat on WhatsApp"
            >
                <FaWhatsapp className="text-2xl" />
            </a>
        </div>
    );
}
