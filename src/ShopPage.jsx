import React from 'react';
import { HiOutlineSearch, HiOutlineShoppingBag, HiStar, HiOutlineStar } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { useProducts } from './hooks/useProducts';
import logo from './assets/onefine-logo.png';

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

  return (
    <div className="min-h-screen bg-white text-navy">
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
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => {
                  const isLuxgear =
                    product.name && product.name.toLowerCase().includes('luxgear bottle');

                  return (
                    <article
                      key={product._id}
                      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-transform hover:-translate-y-1 hover:shadow-soft"
                    >
                      <div className="relative w-full overflow-hidden bg-slate-100 rounded-t-2xl">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div className="space-y-1">
                          <h2 className="font-medium text-sm text-navy">
                            {isLuxgear ? (
                              <a
                                href="/shop/luxgear-bottles"
                                className="hover:text-gold transition-colors"
                              >
                                {product.name}
                              </a>
                            ) : (
                              product.name
                            )}
                          </h2>
                          <p className="text-sm font-semibold text-navy">{product.price}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <RatingStars value={product.rating ?? 5} />
                          <span>Made to order</span>
                        </div>
                        {isLuxgear ? (
                          <a
                            href="/shop/luxgear-bottles"
                            className="mt-2 inline-flex items-center justify-center rounded-full bg-gold px-4 py-2 text-xs font-semibold text-navy shadow-subtle transition-all hover:bg-gold-soft hover:-translate-y-0.5"
                          >
                            View LUXGEAR Brands
                          </a>
                        ) : (
                          <button className="mt-2 inline-flex items-center justify-center rounded-full bg-gold px-4 py-2 text-xs font-semibold text-navy shadow-subtle transition-all hover:bg-gold-soft hover:-translate-y-0.5">
                            Request Quote
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
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

