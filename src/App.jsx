import React from 'react';
import {
  HiOutlineSearch,
  HiOutlineShoppingBag,
  HiStar,
  HiOutlineStar,
  HiMenu,
  HiX,
} from 'react-icons/hi';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { useProducts } from './hooks/useProducts';
import { useCart } from './hooks/useCart';
import CartDrawer from './components/CartDrawer';
import PaymentIcons from './components/PaymentIcons';
import logo from './assets/onefine-logo.png';
import heroProducts from './assets/hero-products.png';

function resolveImageUrl(url) {
  if (!url) return '';
  // If it's already a full URL (viva Cloudinary or Unsplash), return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // For legacy local uploads or relative paths
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

const companies = ['OnePay', 'BluePeak', 'CeylonTech', 'LankaBank', 'GlobalWave'];

function RatingStars({ value }) {
  return (
    <div className="flex items-center gap-1 text-gold text-sm">
      {Array.from({ length: 5 }).map((_, i) =>
        i < value ? <HiStar key={i} /> : <HiOutlineStar key={i} />
      )}
    </div>
  );
}

export default function App() {
  const { products } = useProducts();
  const { addToCart, totalItems, setIsOpen, buildWhatsAppMessage } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const searchRef = React.useRef(null);

  React.useEffect(() => {
    if (window.location.hash === '#contact') {
      window.location.replace('/contact-us');
    }
  }, []);

  React.useEffect(() => {
    if (searchOpen && searchRef.current) {
      setTimeout(() => searchRef.current && searchRef.current.focus(), 100);
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const handleBuyNow = (product) => {
    const msg = `🛍️ *Buy Now – OneFine.lk*\n\n• ${product.name}\n• ${product.price}\n\nPlease confirm my order. Thank you!`;
    window.open(`https://wa.me/94768121701?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-navy">
      <CartDrawer />
      <div>
        <header className="absolute top-0 left-0 right-0 z-30 bg-transparent">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="OneFine logo" className="h-12 w-auto object-contain" />
              <div className="leading-tight">
                <div className="font-display text-xl tracking-[0.18em] text-navy">
                  ONEFINE
                </div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Corporate Gifting Sri Lanka
                </p>
              </div>
            </div>

            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
              <a href="#home" className="hover:text-navy transition-colors">Home</a>
              <a href="#shop" className="hover:text-navy transition-colors">Shop</a>
              <a href="/about" className="hover:text-navy transition-colors">About Us</a>
              <a href="/contact-us" className="hover:text-navy transition-colors">Contact</a>
              <a
                href="#corporate"
                className="rounded-full border border-slate-200 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-navy hover:border-gold hover:text-gold transition-colors"
              >
                Corporate Solutions
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                aria-label="Search"
                onClick={() => setSearchOpen(!searchOpen)}
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${searchOpen
                    ? 'border-navy text-navy bg-navy/5'
                    : 'border-slate-200 text-slate-500 hover:border-navy hover:text-navy'
                  }`}
              >
                {searchOpen ? <HiX className="text-lg" /> : <HiOutlineSearch className="text-lg" />}
              </button>
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
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 md:hidden"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <HiX className="text-lg" /> : <HiMenu className="text-lg" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 z-40 bg-white border-b border-slate-100 p-6 shadow-lg animate-in slide-in-from-top duration-300 md:hidden">
              <nav className="flex flex-col gap-4 text-sm font-medium">
                <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-navy">Home</a>
                <a href="#shop" onClick={() => setMobileMenuOpen(false)} className="text-slate-600">Shop</a>
                <a href="/about" onClick={() => setMobileMenuOpen(false)} className="text-slate-600">About Us</a>
                <a href="/contact-us" onClick={() => setMobileMenuOpen(false)} className="text-slate-600">Contact</a>
                <a
                  href="#corporate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 rounded-full border border-slate-200 px-4 py-2 text-center text-xs uppercase tracking-[0.18em] text-navy"
                >
                  Corporate Solutions
                </a>
              </nav>
            </div>
          )}
          {/* Search Overlay */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 z-40 bg-white border-b border-slate-100 shadow-lg animate-in slide-in-from-top duration-200">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
                <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
                  <input
                    ref={searchRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products (e.g. LuxGear, bottle...)"
                    className="w-full rounded-full border border-slate-200 px-5 py-3 pl-12 text-sm text-navy placeholder:text-slate-400 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none transition-all"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <HiOutlineSearch className="text-lg" />
                  </div>
                  <button
                    type="submit"
                    className="absolute inset-y-1.5 right-1.5 rounded-full bg-navy px-5 text-xs font-semibold text-white hover:bg-navy/90 transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
          )}
        </header>

        <main id="home" className="pb-16">
          <section className="relative w-full overflow-hidden bg-white">
            {/* Background for Desktop - Hidden on Mobile to prevent overlap */}
            <div className="absolute inset-0 z-0 hidden bg-[url('/bg%20123.psd%20%281%29.png')] bg-cover bg-center bg-no-repeat md:block"></div>

            {/* Marble Texture Background for Mobile - Separate from the bottle image */}
            <div className="absolute inset-0 z-0 block bg-slate-50/50 md:hidden"></div>

            <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 pt-32 pb-20 md:py-20 lg:py-32 xl:py-40">
              <div className="flex flex-col md:grid md:grid-cols-2 md:items-center gap-8 md:gap-12">
                <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                  <div className="space-y-6">
                    <h1 className="font-display text-[32px] sm:text-[36px] leading-[1.2] text-navy md:text-5xl lg:text-6xl max-w-xl md:max-w-none">
                      Premium Corporate &amp; Custom Branding Solutions
                    </h1>

                    <div className="space-y-4">
                      <p className="max-w-md text-xs sm:text-sm leading-relaxed text-slate-500 md:text-base">
                        High-quality custom name bottles and corporate gift items in Sri Lanka.
                      </p>

                      {/* Decorative Line with Dots */}
                      <div className="flex items-center gap-3 py-1">
                        <div className="h-[1px] w-12 bg-gold/30"></div>
                        <div className="flex gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-gold/40"></div>
                          <div className="h-1 w-1 rounded-full bg-gold/40"></div>
                          <div className="h-1 w-1 rounded-full bg-gold/40"></div>
                        </div>
                        <div className="h-[1px] w-24 bg-gold/30"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-wrap items-center gap-4 w-full">
                    <a
                      href="/luxgear-bottles"
                      className="inline-flex w-full sm:w-auto h-[52px] md:h-auto items-center justify-center rounded-lg bg-gold px-8 py-3 text-sm font-bold text-navy shadow-soft transition-all hover:translate-y-[-2px] hover:shadow-lg hover:bg-gold-soft active:translate-y-0"
                    >
                      Shop Now
                    </a>
                    <button
                      onClick={() => {
                        const msg = "Hello OneFine! I'd like to get a custom corporate gifting quote.";
                        window.open(`https://wa.me/94768121701?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="inline-flex w-full sm:w-auto h-[52px] md:h-auto items-center justify-center rounded-lg border border-navy px-8 py-3 text-sm font-bold text-navy transition-all hover:bg-navy hover:text-white"
                    >
                      Get Custom Quote
                    </button>
                  </div>
                </div>

                {/* Mobile Hero Image - Positioned tighter below buttons */}
                <div className="block md:hidden mt-6 pb-8 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                  <div className="relative mx-auto max-w-full flex justify-center h-[240px] px-2 sm:px-4">
                    <img
                      src="/bg%20123.psd%20%281%29.png"
                      alt="Corporate Gifting Collection"
                      className="w-full h-full object-contain drop-shadow-xl"
                    />
                  </div>
                </div>

                <div className="hidden md:block"></div>
              </div>
            </div>
          </section>

          <section id="shop" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-16 md:mt-20">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl text-navy sm:text-3xl">
                Best Selling Products
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Curated favourites chosen by Sri Lanka&apos;s leading brands.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(products.filter(p => p.isBestSeller).length > 0
                ? products.filter(p => p.isBestSeller)
                : products.slice(0, 3)
              ).map((product) => {
                const isLuxgear = (product.name || '').toLowerCase().includes('luxgear');
                return (
                  <article
                    key={product._id}
                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-transform hover:-translate-y-1 hover:shadow-soft"
                  >
                    <div className="relative w-full aspect-square overflow-hidden bg-slate-100 rounded-t-2xl">
                      <img
                        src={resolveImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm text-navy">{product.name}</h3>
                        <p className="text-sm font-semibold text-navy">{product.price}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <RatingStars value={product.rating} />
                        <span>In stock</span>
                      </div>
                      {isLuxgear ? (
                        <div className="mt-auto flex gap-2">
                          <a
                            href="/luxgear-bottles"
                            className="flex-1 inline-flex items-center justify-center rounded-full bg-gold px-4 py-2 text-xs font-semibold text-navy shadow-subtle transition-all hover:bg-gold-soft hover:-translate-y-0.5"
                          >
                            Shop Now
                          </a>
                        </div>
                      ) : (
                        <div className="mt-auto flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 inline-flex items-center justify-center rounded-full border border-navy px-4 py-2 text-xs font-semibold text-navy transition-all hover:bg-navy hover:text-white hover:-translate-y-0.5"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleBuyNow(product)}
                            className="flex-1 inline-flex items-center justify-center rounded-full bg-gold px-4 py-2 text-xs font-semibold text-navy shadow-subtle transition-all hover:bg-gold-soft hover:-translate-y-0.5"
                          >
                            Buy Now
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section id="corporate" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-16 md:mt-20">
            <div className="rounded-2xl bg-slate-50 px-6 py-8 md:px-8 md:py-10">
              <div className="text-center mb-6">
                <h2 className="font-display text-xl text-navy md:text-2xl">
                  Trusted by Leading Companies
                </h2>
                <p className="mt-2 text-xs text-slate-500 md:text-sm">
                  Corporate gifting solutions for top brands across Sri Lanka.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 grayscale">
                {companies.map((name) => (
                  <div
                    key={name}
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            id="about"
            className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-16 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start"
          >
            <div className="space-y-4">
              <h2 className="font-display text-2xl text-navy sm:text-3xl">
                Tailored Corporate Gifting for Every Occasion
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                At OneFine, we specialise in premium, fully customisable
                corporate gift solutions. From engraved name bottles to curated
                executive sets, each piece is crafted to reflect your brand with
                precision and elegance.
              </p>
              <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
                  <span>Dedicated corporate account management.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
                  <span>Bulk order pricing and fast lead times.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
                  <span>Brand-consistent packaging and inserts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
                  <span>Island-wide delivery with tracking.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-soft">
              <h3 className="font-display text-lg text-navy">
                Thousands of Happy Customers
              </h3>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-navy">4.9</span>
                  <RatingStars value={5} />
                </div>
                <p className="text-xs text-slate-500">1200+ verified reviews</p>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <img
                  src="https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt="Customer"
                  className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy">Dilshan Perera</p>
                    <RatingStars value={5} />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    &quot;OneFine handled our year-end corporate gifting from
                    concept to delivery. The custom bottles with our team names
                    were a standout. Exceptional quality and service.&quot;
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-16 md:mt-20">
            <div className="rounded-2xl bg-navy px-6 py-8 text-white md:px-8 md:py-10">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl">
                    Plan your next premium corporate gifting campaign.
                  </h2>
                  <p className="mt-2 text-xs text-slate-300 sm:text-sm">
                    Share your requirements with us for a tailored quotation
                    within 24 hours.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="/contact-us"
                    className="rounded-full bg-white px-8 py-3 text-sm font-bold text-navy shadow-subtle transition hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </section>

          <footer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-12 border-t border-slate-100 pt-8 pb-10">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="OneFine logo" className="h-12 w-auto object-contain" />
                  <div className="leading-tight">
                    <div className="font-display text-xl tracking-[0.18em] text-navy">ONEFINE</div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                      Corporate Gifting Sri Lanka
                    </p>
                  </div>
                </div>
                <p className="max-w-sm text-xs text-slate-500">
                  Premium corporate gifting and branded merchandise, designed and
                  delivered with precision for Sri Lankan businesses and global
                  teams based in Sri Lanka.
                </p>
                <div className="flex items-center gap-3">
                  <a href="https://www.facebook.com/share/14UfX7GiR5r/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-colors">
                    <FaFacebookF className="text-[13px]" />
                  </a>
                  <a href="https://www.instagram.com/_.one_.fine_?igsh=ZHZocWd5c3Jxd24w" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-colors">
                    <FaInstagram className="text-[13px]" />
                  </a>
                  <a href="https://www.linkedin.com/company/onefine-lk" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-colors">
                    <FaLinkedinIn className="text-[13px]" />
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick Links</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li><a href="#home" className="hover:text-navy">Home</a></li>
                  <li><a href="#shop" className="hover:text-navy">Shop</a></li>
                  <li><a href="#corporate" className="hover:text-navy">Corporate Solutions</a></li>
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
        </main >
      </div >

      <a
        href="https://wa.me/94768121701"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition-transform hover:-translate-y-0.5"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="text-2xl" />
      </a>
    </div >
  );
}
