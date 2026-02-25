import React from 'react';
import { HiOutlineSearch, HiOutlineShoppingBag } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import logo from './assets/onefine-logo.png';

// Brand bottle images — all show insulated/steel bottles
const BRANDS = [
  {
    name: 'Toyota',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    color: '#EB0A1E',
  },
  {
    name: 'Nissan',
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=80',
    color: '#C3002F',
  },
  {
    name: 'BMW',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80',
    color: '#1C69D4',
  },
  {
    name: 'Mercedes',
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&auto=format&fit=crop&q=80',
    color: '#2D2D2D',
  },
  {
    name: 'Suzuki',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    color: '#0057A8',
  },
];

const PRICE = 'Rs. 1,850';

export default function LuxgearCategoryPage() {
  return (
    <div className="min-h-screen bg-white text-navy">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
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
              <span className="text-navy font-semibold border-b-2 border-gold pb-0.5">LUXGEAR Bottles</span>
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
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page Content ────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">

        {/* Page heading */}
        <section className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-gold font-medium">
            LUXGEAR Collection
          </p>
          <h1 className="mt-3 font-display text-3xl text-navy sm:text-4xl lg:text-5xl">
            Brand Insulated Bottles
          </h1>
          <p className="mt-3 max-w-lg mx-auto text-sm text-slate-500 leading-relaxed">
            Premium double-wall stainless steel bottles, custom-branded for leading automotive brands.
            Perfect corporate gifts that keep drinks cold for 24 hrs and hot for 12 hrs.
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span>✦ Double-wall insulated</span>
            <span>✦ Soft-touch finish</span>
            <span>✦ Precision branding</span>
          </div>
        </section>

        {/* Product grid */}
        <section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BRANDS.map((brand) => (
              <article
                key={brand.name}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft"
              >
                {/* Image area — fixed height for consistency */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-50">
                  <img
                    src={brand.image}
                    alt={`${brand.name} LUXGEAR Bottle`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Brand color accent strip */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ backgroundColor: brand.color }}
                  />
                  {/* In stock badge */}
                  <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600 shadow-sm">
                    In Stock
                  </span>
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    {/* Brand name */}
                    <h2 className="font-display text-lg text-navy tracking-wide">{brand.name}</h2>
                    <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-slate-400">
                      LUXGEAR Insulated Bottle
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-navy">{PRICE}</p>
                    <div
                      className="h-3 w-3 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: brand.color }}
                      title={`${brand.name} brand colour`}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="mt-auto flex flex-col gap-2">
                    <button className="inline-flex items-center justify-center rounded-full bg-gold px-4 py-2.5 text-xs font-semibold text-navy shadow-subtle transition-all hover:bg-gold-soft hover:-translate-y-0.5 active:translate-y-0">
                      Add to Cart
                    </button>
                    <button className="inline-flex items-center justify-center rounded-full border border-navy px-4 py-2.5 text-xs font-semibold text-navy transition-all hover:bg-navy hover:text-white hover:-translate-y-0.5 active:translate-y-0">
                      Buy Now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/94768121701"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition-transform hover:-translate-y-0.5 md:bottom-6 md:right-6"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="text-2xl" />
      </a>
    </div>
  );
}
