import React from 'react';
import {
  HiOutlineSearch,
  HiOutlineShoppingBag,
  HiStar,
  HiOutlineStar,
} from 'react-icons/hi';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { useProducts } from './hooks/useProducts';
import logo from './assets/onefine-logo.png';

const API_BASE = import.meta.env.VITE_API_URL || '';
function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url}`;
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

  return (
    <div className="min-h-screen bg-white text-navy">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
          <div className="flex items-center justify-between py-4">
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
              <a href="#home" className="hover:text-navy transition-colors">
                Home
              </a>
              <a href="#shop" className="hover:text-navy transition-colors">
                Shop
              </a>
              <a href="#about" className="hover:text-navy transition-colors">
                About Us
              </a>
              <a href="#contact" className="hover:text-navy transition-colors">
                Contact
              </a>
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
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-all"
              >
                <HiOutlineSearch className="text-lg" />
              </button>
              <button
                aria-label="Cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-all"
              >
                <HiOutlineShoppingBag className="text-lg" />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-navy shadow-subtle">
                  2
                </span>
              </button>
            </div>
          </div>
        </header>

        <main id="home" className="pt-8 pb-16 md:pt-14">
          <section className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-7">
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Premium · Personalized · Professional
              </p>

              <h1 className="font-display text-3xl leading-tight text-navy sm:text-4xl lg:text-5xl">
                Premium Corporate &amp; Custom Branding Solutions
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                High-quality custom name bottles and corporate gift items
                crafted in Sri Lanka, designed to elevate your brand at
                conferences, events, and executive gifting moments.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-navy shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Shop Now
                </a>
                <button className="inline-flex items-center justify-center rounded-full border border-navy bg-transparent px-6 py-2.5 text-sm font-semibold text-navy shadow-subtle transition-all hover:-translate-y-0.5 hover:bg-navy hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                  Get Custom Quote
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 sm:max-w-md">
                <div>
                  <div className="font-display text-2xl text-navy">1200+</div>
                  <p className="text-xs text-slate-500">Happy corporate clients</p>
                </div>
                <div>
                  <div className="font-display text-2xl text-navy">4.9</div>
                  <p className="text-xs text-slate-500">Average rating on orders</p>
                </div>
                <div>
                  <div className="font-display text-2xl text-navy">48h</div>
                  <p className="text-xs text-slate-500">Fastest delivery option</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative mx-auto max-w-md rounded-2xl bg-gradient-to-b from-slate-50 via-white to-slate-50 p-6 shadow-soft">
                <div className="relative h-72 rounded-2xl bg-gradient-to-br from-navy via-slate-900 to-slate-800 px-6 pt-6 pb-10 overflow-hidden">
                  <div className="absolute inset-0 opacity-40">
                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                  </div>

                  <div className="relative flex h-full items-end justify-between">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-40 w-16 rounded-full bg-gradient-to-b from-slate-200/20 to-black shadow-2xl shadow-black/40" />
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
                        Custom Name Bottles
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-52 w-20 rounded-[1.75rem] bg-gradient-to-b from-slate-100/10 to-black shadow-2xl shadow-black/50" />
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300 text-right">
                        Gift Sets
                      </p>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-x-6 bottom-5">
                    <div className="h-6 rounded-full bg-gradient-to-r from-slate-900 via-black to-slate-900 shadow-inner shadow-black/70" />
                  </div>
                </div>

                <div className="-mt-8 flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-card">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Featured for Q4
                    </p>
                    <p className="font-medium text-sm text-navy">
                      Executive Black Bottle &amp; Gift Set
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-navy">From Rs. 4,950</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <RatingStars value={5} />
                      <span className="ml-1">4.9</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="shop" className="mt-16 md:mt-20">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl text-navy sm:text-3xl">
                Best Selling Products
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Curated favourites chosen by Sri Lanka&apos;s leading brands.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product._id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-transform hover:-translate-y-1 hover:shadow-soft"
                >
                  <div className="relative w-full overflow-hidden bg-slate-100 rounded-t-2xl">
                    <img
                      src={resolveImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm text-navy">
                        {product.name}
                      </h3>
                      <p className="text-sm font-semibold text-navy">
                        {product.price}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <RatingStars value={product.rating} />
                      <span>In stock</span>
                    </div>
                    <a
                      href="/shop"
                      className="mt-2 inline-flex items-center justify-center rounded-full bg-gold px-4 py-2 text-xs font-semibold text-navy shadow-subtle transition-all hover:bg-gold-soft hover:-translate-y-0.5"
                    >
                      Shop Now
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="corporate" className="mt-16 md:mt-20">
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
            className="mt-16 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start"
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
                    <p className="text-sm font-semibold text-navy">
                      Dilshan Perera
                    </p>
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

          <section id="contact" className="mt-16 md:mt-20">
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
                    href="mailto:hello@onefine.lk"
                    className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-navy shadow-subtle transition hover:-translate-y-0.5"
                  >
                    hello@onefine.lk
                  </a>
                  <a
                    href="tel:+94768121701"
                    className="rounded-full border border-slate-500 px-5 py-2 text-xs font-semibold text-white/90 transition hover:border-gold hover:text-gold"
                  >
                    +94 76 812 1701
                  </a>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-12 border-t border-slate-100 pt-8 pb-10">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="space-y-3 md:col-span-2">
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
                <p className="max-w-sm text-xs text-slate-500">
                  Premium corporate gifting and branded merchandise, designed and
                  delivered with precision for Sri Lankan businesses and global
                  teams based in Sri Lanka.
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-colors"
                  >
                    <FaFacebookF className="text-[13px]" />
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-colors"
                  >
                    <FaInstagram className="text-[13px]" />
                  </a>
                  <a
                    href="#"
                    aria-label="LinkedIn"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-colors"
                  >
                    <FaLinkedinIn className="text-[13px]" />
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Quick Links
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>
                    <a href="#home" className="hover:text-navy">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#shop" className="hover:text-navy">
                      Shop
                    </a>
                  </li>
                  <li>
                    <a href="#corporate" className="hover:text-navy">
                      Corporate Solutions
                    </a>
                  </li>
                  <li>
                    <a href="#about" className="hover:text-navy">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="hover:text-navy">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Contact
                </h4>
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <p>20/9, Green Terrace, Parakandeniya, Imbulgoda</p>
                  <p>+94 76 812 1701</p>
                  <p>hello@onefine.lk</p>
                </div>

                <h4 className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Payment Methods
                </h4>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600">
                  <span className="rounded-full border border-slate-200 px-3 py-1">
                    Visa
                  </span>
                  <span className="rounded-full border border-slate-200 px-3 py-1">
                    Mastercard
                  </span>
                  <span className="rounded-full border border-slate-200 px-3 py-1">
                    Cash on Delivery
                  </span>
                  <span className="rounded-full border border-slate-200 px-3 py-1">
                    Bank Transfer
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center">
              <p>© {new Date().getFullYear()} OneFine. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-navy">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-navy">
                  Terms of Service
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>

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

