import React, { useState, useMemo } from "react";
import {
  HiOutlineSearch,
  HiOutlineShoppingBag,
  HiMenu,
  HiX,
  HiPlus,
  HiMinus,
  HiOutlineBriefcase,
  HiOutlineSparkles,
  HiOutlineTruck,
} from "react-icons/hi";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { useCart } from "./hooks/useCart";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import Footer from "./components/Footer";
import logo from "./assets/onefine-logo.png";
const heroImg =
  "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop";

// Paper Bags Product Catalog Data (derived from paperbags.lk)
const PAPER_BAG_PRODUCTS = [
  // 1. Handle BagsS
  {
    id: "pb-carrier-1",
    category: "paper",
    name: "White Paper Bags",
    dimensions: "6 X 4.5 X 2.5 inch",
    price: "Rs. 45.00",
    image:
      "https://github.com/venujageenodh/Onefine.lk/blob/main/src/assets/IMG_4403.PNG?raw=true",
    inStock: true,
  },
  {
    id: "pb-carrier-2",
    category: "paper",
    name: "White Paper Bags",
    dimensions: "8.5 X 6 X 2.75 inch",
    price: "Rs. 55.00",
    image:
      "https://github.com/venujageenodh/Onefine.lk/blob/main/src/assets/IMG_4404.PNG?raw=true",
    inStock: true,
  },
  {
    id: "pb-carrier-3",
    category: "paper",
    name: "White Paper Bags",
    dimensions: "12 X 7.5 X 3 inch",
    price: "Rs. 65.00",
    image:
      "https://github.com/venujageenodh/Onefine.lk/blob/main/src/assets/IMG_4406.PNG?raw=true",
    inStock: true,
  },
  {
    id: "pb-carrier-4",
    category: "paper",
    name: "-",
    dimensions: "-",
    price: "-",
    originalPrice: "-",
    image:
      "https://github.com/venujageenodh/Onefine.lk/blob/main/src/assets/IMG_4407.PNG?raw=true",
    inStock: false,
    onSale: false,
  },
  {
    id: "pb-carrier-1",
    category: "carrier",
    name: "Kraft Paper Bags",
    dimensions: "6 X 4.5 X 2.5 inch",
    price: "Rs. 17.00",
    image:
      "https://github.com/venujageenodh/Onefine.lk/blob/main/src/assets/IMG_4394.PNG?raw=true",
    inStock: true,
  },
  {
    id: "pb-carrier-2",
    category: "carrier",
    name: "Kraft Paper Bags",
    dimensions: "8.5 X 6 X 2.75 inch",
    price: "Rs. 19.00",
    image:
      "https://github.com/venujageenodh/Onefine.lk/blob/main/src/assets/IMG_4398.PNG?raw=true",
    inStock: true,
  },
  {
    id: "pb-carrier-3",
    category: "carrier",
    name: "Kraft Paper Bags",
    dimensions: "12 X 7.5 X 3 inch",
    price: "Rs. 25.00",
    image:
      "https://github.com/venujageenodh/Onefine.lk/blob/main/src/assets/IMG_4399.PNG?raw=true",
    inStock: true,
  },
  {
    id: "pb-carrier-4",
    category: "carrier",
    name: "Kraft Paper Bags",
    dimensions: "28 X 18 X 12 cm",
    price: "Rs. 20.00",
    originalPrice: "Rs. 25.00",
    image:
      "https://github.com/venujageenodh/Onefine.lk/blob/main/src/assets/IMG_4394.PNG?raw=true",
    inStock: false,
    onSale: true,
  },
];

const CATEGORIES = [
  { id: "all", label: "All Packaging" },
  { id: "carrier", label: "Kraft Bags" },
  { id: "paper", label: "Paper Bags" },
];

export default function PaperBagsPage() {
  const { addToCart, totalItems, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [quantities, setQuantities] = useState({});
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Since we are filtering in-page, we can just close the search overlay
    setSearchOpen(false);
  };

  const handleQtyChange = (productId, change) => {
    setQuantities((prev) => {
      const current = prev[productId] || 10;
      const updated = current + change;
      return { ...prev, [productId]: updated < 10 ? 10 : updated };
    });
  };

  const getQty = (productId) => quantities[productId] || 10;

  const handleAddToCart = (product) => {
    const qty = getQty(product.id);
    // Add to cart with quantity
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
    // Reset local qty input
    setQuantities((prev) => ({ ...prev, [product.id]: 10 }));
  };

  const handleBuyNow = (product) => {
    const qty = getQty(product.id);
    const msg =
      `🛍️ BUY NOW REQUEST - ONEFINE PAPER BAGS 🛍️\n\n` +
      `Hello! I would like to buy:\n` +
      `📦 Product: ${product.name}\n` +
      `🔢 Quantity: ${qty}\n` +
      `💰 Price: ${product.price} each\n\n` +
      `Please confirm availability and share payment/delivery details! ✨`;
    window.open(
      `https://wa.me/94768121701?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const filteredProducts = useMemo(() => {
    return PAPER_BAG_PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.dimensions &&
          product.dimensions.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white text-navy font-body selection:bg-gold/30">
      {/* Marble Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0 bg-[url('https://www.transparenttextures.com/patterns/marble.png')]"></div>

      <CartDrawer />
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
        />
      )}

      <div className="relative z-10">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
            <a href="/" className="flex items-center gap-3 group">
              <img
                src={logo}
                alt="OneFine logo"
                className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="hidden sm:block leading-tight">
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
              <span className="text-navy font-bold border-b-2 border-gold pb-0.5">
                Paper Bags
              </span>
              <a href="/about" className="hover:text-navy transition-colors">
                About Us
              </a>
              <a
                href="/contact-us"
                className="hover:text-navy transition-colors"
              >
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                aria-label="Search"
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-all"
              >
                <HiOutlineSearch className="text-lg" />
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
                aria-label="Toggle menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 md:hidden"
              >
                {mobileMenuOpen ? (
                  <HiX className="text-lg" />
                ) : (
                  <HiMenu className="text-lg" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 z-40 bg-white border-b border-slate-100 p-6 shadow-lg animate-in slide-in-from-top duration-300 md:hidden">
              <nav className="flex flex-col gap-4 text-sm font-medium">
                <a href="/" className="text-slate-600">
                  Home
                </a>
                <a href="/shop" className="text-slate-600">
                  Shop
                </a>
                <span className="text-navy font-semibold">Paper Bags</span>
                <a href="/about" className="text-slate-600">
                  About Us
                </a>
                <a href="/contact-us" className="text-slate-600">
                  Contact
                </a>
              </nav>
            </div>
          )}
        </header>

        {/* Inline Search Bar */}
        {searchOpen && (
          <div className="bg-slate-50 border-b border-slate-100 py-4 px-4 shadow-inner transition-all duration-300">
            <div className="mx-auto max-w-xl">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search paper bags, sizes or materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-white px-5 py-2.5 pr-12 text-sm text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy"
                >
                  <HiOutlineSearch className="text-xl" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Hero Banner ────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-900 py-24 text-white lg:py-32">
          <div className="absolute inset-0 z-0">
            <img
              src={heroImg}
              alt="Paper bags background"
              className="h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent"></div>
          </div>
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-gold/25 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
                <HiOutlineSparkles /> Eco-Friendly Packaging
              </span>
              <h1 className="font-display text-4xl font-normal leading-tight text-white sm:text-5xl lg:text-6xl mb-6">
                Premium Paper Bags & Packaging Supplies
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                High-quality biodegradable kraft paper bags, cake boxes, food
                wraps, and ziplock pouches. Perfect for retail shop branding,
                food carryouts, pastry shops, and corporate events across Sri
                Lanka.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#products"
                  className="rounded-full bg-gold px-8 py-3 text-sm font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg"
                >
                  Browse Catalog
                </a>
                <a
                  href="https://wa.me/94768121701"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white hover:text-navy"
                >
                  <FaWhatsapp className="text-lg text-emerald-400" /> Custom
                  Printed Bulk Order
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Catalog Section ────────────────────────────────────────────── */}
        <section id="products" className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400 mb-2">
                  Sustainable Solutions
                </p>
                <h2 className="font-display text-3xl text-navy sm:text-4xl">
                  Browse Packaging Catalog
                </h2>
              </div>
              {searchQuery && (
                <p className="text-sm text-slate-500 mt-2 md:mt-0">
                  Showing search results for "
                  <span className="font-semibold">{searchQuery}</span>"
                </p>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex overflow-x-auto pb-4 scrollbar-thin border-b border-slate-100 mb-10 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] sm:text-sm font-semibold uppercase tracking-wider transition-all ${
                    selectedCategory === cat.id
                      ? "bg-navy text-white shadow-md"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid gap-2.5 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-2.5 sm:p-4 shadow-soft transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 mb-2 sm:mb-4 border border-slate-50">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {!product.inStock && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                            Out of Stock
                          </span>
                        )}
                        {product.onSale && (
                          <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                            Offer
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <p className="text-[15px] sm:text-xs text-black mb-2 font-semibold uppercase">
                        {product.name}
                      </p>
                      <p className="text-[13px] sm:text-xs text-slate-400 mb-2 font-mono uppercase">
                        {product.dimensions}
                      </p>
                    </div>

                    <div>
                      {/* Price block */}
                      <div className="flex items-baseline gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        <span className="text-[17px] sm:text-lg font-bold text-navy">
                          {product.price}
                        </span>
                        {product.onSale && product.originalPrice && (
                          <span className="text-[12px] sm:text-xs text-slate-400 line-through">
                            {product.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* Action bar */}
                      {product.inStock ? (
                        <div className="space-y-1.5 sm:space-y-2">
                          {/* Qty and Add to cart */}

                          <button
                            onClick={() => handleBuyNow(product)}
                            className="w-full bg-slate-50 border border-slate-200 text-navy hover:border-gold hover:bg-gold/5 text-[13px] sm:text-sm font-semibold rounded-full h-8 sm:h-9 flex items-center justify-center transition-all"
                          >
                            Buy Now
                          </button>
                        </div>
                      ) : (
                        <a
                          href={`https://wa.me/94768121701?text=Hi%2C%20I%20am%20interested%20in%20pre-ordering%20or%20checking%20availability%20for%20the%20out-of-stock%20item%3A%20${encodeURIComponent(product.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full border border-slate-200 bg-slate-100 text-slate-400 text-[13px] sm:text-sm font-semibold rounded-full h-8 sm:h-9 flex items-center justify-center hover:bg-slate-200 hover:text-slate-600 transition-all"
                        >
                          Inquire Availability
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <span className="text-4xl">🔍</span>
                <h3 className="font-display text-navy text-lg mt-4 mb-2">
                  No matching packaging found
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  We couldn't find any products matching your search terms or
                  filter. Please clear search queries or select another
                  category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-6 text-xs uppercase tracking-wider font-bold text-gold border-b-2 border-gold hover:text-navy hover:border-navy transition-colors pb-1"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Custom Printing Pricing ───────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-3 inline-block">
                🖨️ Logo Printing
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-navy mb-3">
                Custom Brand Printing Pricing
              </h2>
              <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
                Add your brand logo and colors to any paper bag. Prices are per
                batch of 1–100 bags. Contact us for larger quantities.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
              {/* 1-Color Print */}
              <div className="relative flex flex-col bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                {/* Accent strip */}
                <div className="h-1.5 bg-slate-300 group-hover:bg-gold transition-colors duration-300" />
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
                      🖤
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-navy font-medium leading-tight">
                        1-Color Print
                      </h3>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
                        Single color
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-3xl sm:text-4xl font-display font-semibold text-navy">
                        Rs. 3,500
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      per batch of 1–100 bags
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-sm text-slate-600 mb-8 flex-1">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold text-base">
                        ✓
                      </span>
                      Single color logo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold text-base">
                        ✓
                      </span>
                      Any bag size available
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold text-base">
                        ✓
                      </span>
                      One-sided printing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold text-base">
                        ✓
                      </span>
                      Min. order: 1 bag
                    </li>
                  </ul>

                  <a
                    href={`https://wa.me/94768121701?text=${encodeURIComponent("Hello! I'm interested in 1-Color custom printing for paper bags.\n\n🎨 Printing: 1 Color\n📦 Quantity: 1-100 bags\n💰 Budget: Rs. 3,500\n\nCould you please share the next steps?")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-navy hover:text-white text-navy text-sm font-semibold rounded-full py-3 transition-all duration-300"
                  >
                    <FaWhatsapp className="text-lg text-emerald-500 group-hover:text-white" />
                    Get Quote on WhatsApp
                  </a>
                </div>
              </div>

              {/* 2-Color Print — Featured */}
              <div className="relative flex flex-col bg-navy rounded-3xl border border-navy shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group sm:-mt-4 sm:mb-[-1rem]">
                {/* Popular badge */}
                <div className="bg-gold text-navy text-[11px] font-bold uppercase tracking-widest text-center py-2 px-4">
                  ⭐ Most Popular
                </div>
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                      🎨
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-white font-medium leading-tight">
                        2-Color Print
                      </h3>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
                        Two colors
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-3xl sm:text-4xl font-display font-semibold text-white">
                        Rs. 7,000
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      per batch of 1–100 bags
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-sm text-slate-300 mb-8 flex-1">
                    <li className="flex items-center gap-2">
                      <span className="text-gold font-bold text-base">✓</span>
                      Two distinct ink colors
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold font-bold text-base">✓</span>
                      Any bag size available
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold font-bold text-base">✓</span>
                      One or both sides
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold font-bold text-base">✓</span>
                      Min. order: 1 bag
                    </li>
                  </ul>

                  <a
                    href={`https://wa.me/94768121701?text=${encodeURIComponent("Hello! I'm interested in 2-Color custom printing for paper bags.\n\n🎨 Printing: 2 Colors\n📦 Quantity: 1-100 bags\n💰 Budget: Rs. 7,000\n\nCould you please share the next steps?")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-yellow-400 text-navy text-sm font-semibold rounded-full py-3 transition-all duration-300"
                  >
                    <FaWhatsapp className="text-lg" />
                    Get Quote on WhatsApp
                  </a>
                </div>
              </div>

              {/* 3-Color Print */}
              <div className="relative flex flex-col bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                {/* Accent strip */}
                <div className="h-1.5 bg-slate-300 group-hover:bg-gold transition-colors duration-300" />
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
                      🖼️
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-navy font-medium leading-tight">
                        3-Color Print
                      </h3>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
                        Full brand palette
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-3xl sm:text-4xl font-display font-semibold text-navy">
                        Rs. 10,000
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      per batch of 1–100 bags
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-sm text-slate-600 mb-8 flex-1">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold text-base">
                        ✓
                      </span>
                      Up to three rich ink colors
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold text-base">
                        ✓
                      </span>
                      Any bag size available
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold text-base">
                        ✓
                      </span>
                      Both sides printing option
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold text-base">
                        ✓
                      </span>
                      Min. order: 1 bag
                    </li>
                  </ul>

                  <a
                    href={`https://wa.me/94768121701?text=${encodeURIComponent("Hello! I'm interested in 3-Color custom printing for paper bags.\n\n🎨 Printing: 3 Colors\n📦 Quantity: 1-100 bags\n💰 Budget: Rs. 10,000\n\nCould you please share the next steps?")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-navy hover:text-white text-navy text-sm font-semibold rounded-full py-3 transition-all duration-300"
                  >
                    <FaWhatsapp className="text-lg text-emerald-500 group-hover:text-white" />
                    Get Quote on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Fine print note */}
            <p className="text-center text-xs text-slate-400 mt-8">
              All printing prices are for 1–100 bags per batch. For orders over
              100 bags, contact us for a custom bulk quote.
            </p>
          </div>
        </section>

        {/* ── Wholesale & Branding CTA ─────────────────────────────────────── */}

        <section className="bg-navy relative py-16 overflow-hidden rounded-t-[3rem] text-white">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/marble.png')]"></div>
          <div className="mx-auto max-w-4xl px-4 text-center relative z-10">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-3 inline-block">
              Wholesale & Logo Printing
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-white mb-6">
              Need Custom Printed Bags or Bulk Quantities?
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
              We specialize in customizing paper packaging for local brands,
              bakery shops, events, and corporate client gifting. Stand out with
              your own branded shopping Handle Bagss, greaseproof sandwich
              wraps, and foil-lined coffee bags.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/94768121701?text=Hello%20OneFine!%20I%20am%20interested%20in%20ordering%20custom%20printed%20paper%20bags%20or%20purchasing%20wholesale%20bulk%20packaging."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-full shadow-lg transition-all w-full sm:w-auto justify-center"
              >
                <FaWhatsapp className="text-lg" /> WhatsApp Inquiry (+94 76 812
                1701)
              </a>
              <a
                href="tel:+94768121701"
                className="flex items-center gap-2 border border-white/20 hover:border-gold hover:text-gold text-white font-semibold px-8 py-3.5 rounded-full transition-all w-full sm:w-auto justify-center"
              >
                <FaPhoneAlt className="text-sm" /> Call Corporate Hotline
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
