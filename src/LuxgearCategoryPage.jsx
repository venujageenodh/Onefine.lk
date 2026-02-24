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

const BRANDS = ['Toyota', 'Nissan', 'BMW', 'Mercedes-Benz', 'Suzuki', 'Mitsubishi'];

export default function LuxgearCategoryPage() {
  const { products } = useProducts();

  const base = React.useMemo(
    () => products.find((p) => p.name.toLowerCase().includes('luxgear bottle')),
    [products]
  );

  const baseImage = base?.image || '';
  const basePrice = base?.price || 'Rs. 1,850';

  const luxgearVariants = BRANDS.map((brand) => ({
    id: `luxgear-${brand.toLowerCase().replace(/\s+/g, '-')}`,
    name: `LUXGEAR Bottle – ${brand}`,
    price: basePrice,
    image: baseImage,
  }));

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
              <a href="/shop" className="hover:text-navy transition-colors">
                Shop
              </a>
              <span className="text-navy font-semibold">LUXGEAR Bottles</span>
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
              Luxgear Collection
            </p>
            <h1 className="mt-2 font-display text-3xl text-navy sm:text-4xl">
              LUXGEAR Bottles – All Brands
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Explore the full LUXGEAR bottle line-up customised for leading automotive brands.
              Premium double-wall bottles with soft-touch sleeves and precision branding.
            </p>
          </section>

          <section>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {luxgearVariants.map((item) => (
                <article
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-transform hover:-translate-y-1 hover:shadow-soft"
                >
                  <div className="relative w-full overflow-hidden bg-slate-100 rounded-t-2xl flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-56 w-full bg-gradient-to-br from-slate-200 to-slate-100" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="space-y-1">
                      <h2 className="font-medium text-sm text-navy">{item.name}</h2>
                      <p className="text-sm font-semibold text-navy">{item.price}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <RatingStars value={5} />
                      <span>In stock</span>
                    </div>
                    <div className="mt-1 flex flex-col gap-2">
                      <button className="inline-flex items-center justify-center rounded-full bg-gold px-4 py-2 text-xs font-semibold text-navy shadow-subtle transition-all hover:bg-gold-soft hover:-translate-y-0.5">
                        Add to Cart
                      </button>
                      <button className="inline-flex items-center justify-center rounded-full border border-navy px-4 py-2 text-xs font-semibold text-navy shadow-subtle transition-all hover:-translate-y-0.5 hover:bg-navy hover:text-white">
                        Buy Now
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
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

