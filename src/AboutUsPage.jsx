import React from 'react';
import { HiOutlineSearch, HiOutlineShoppingBag } from 'react-icons/hi';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { useCart } from './hooks/useCart';
import CartDrawer from './components/CartDrawer';
import logo from './assets/onefine-logo.png';

export default function AboutUsPage() {
    const { totalItems, setIsOpen } = useCart();

    return (
        <div className="min-h-screen bg-white text-navy">
            <CartDrawer />
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
                    <div className="flex items-center justify-between py-4">
                        <a href="/" className="flex items-center gap-3">
                            <img src={logo} alt="OneFine logo" className="h-12 w-auto object-contain" />
                            <div className="leading-tight">
                                <div className="font-display text-xl tracking-[0.18em] text-navy">ONEFINE</div>
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Corporate Gifting Sri Lanka</p>
                            </div>
                        </a>
                        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
                            <a href="/" className="hover:text-navy transition-colors">Home</a>
                            <a href="/shop" className="hover:text-navy transition-colors">Shop</a>
                            <span className="text-navy font-semibold">About Us</span>
                            <a href="/#contact" className="hover:text-navy transition-colors">Contact</a>
                        </nav>
                        <div className="flex items-center gap-3">
                            <button aria-label="Search" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-all">
                                <HiOutlineSearch className="text-lg" />
                            </button>
                            <button aria-label="Cart" onClick={() => setIsOpen(true)} className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-all">
                                <HiOutlineShoppingBag className="text-lg" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-navy shadow-subtle">{totalItems}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="pt-12 pb-20 md:pt-16">
                    <section className="text-center max-w-3xl mx-auto mb-16">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500 mb-2">Our Story</p>
                        <h1 className="font-display text-4xl text-navy sm:text-5xl mb-6">
                            Elevating Corporate Gifting in Sri Lanka
                        </h1>
                        <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                            At OneFine, we believe that a gift is more than just an item—it's a statement of appreciation, a reflection of your brand, and a bridge to stronger relationships. We specialize in providing premium, customizable corporate gifts that leave a lasting impression.
                        </p>
                    </section>

                    <section className="grid gap-12 md:grid-cols-2 lg:gap-16 items-center mb-20">
                        <div className="relative">
                            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100 shadow-xl">
                                <img
                                    src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800"
                                    alt="Team collaboration"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-gold/20 rounded-full blur-3xl z-[-1]" />
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h2 className="font-display text-2xl text-navy sm:text-3xl mb-4">Uncompromising Quality</h2>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Every product in our catalog is rigorously selected to meet our high standards. From our signature custom name bottles to fully curated executive gift boxes, we ensure that every detail speaks of luxury and durability.
                                </p>
                            </div>

                            <div>
                                <h2 className="font-display text-2xl text-navy sm:text-3xl mb-4">Personalized for Your Brand</h2>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    We understand that your brand identity is paramount. Our state-of-the-art engraving and printing facilities allow us to add your corporate logo and individual names to our products, ensuring that your gifts are distinctly yours.
                                </p>
                            </div>

                            <div>
                                <h2 className="font-display text-2xl text-navy sm:text-3xl mb-4">Dedicated Service</h2>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Our dedicated corporate account managers work closely with you from concept to delivery. We handle bulk orders, specialized packaging, and island-wide delivery seamlessly, allowing you to focus on what matters most.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-50 rounded-3xl p-8 md:p-12 mb-16 text-center shadow-inner">
                        <h2 className="font-display text-2xl text-navy sm:text-3xl mb-4">Our Values</h2>
                        <div className="grid gap-8 mt-10 sm:grid-cols-3">
                            <div className="bg-white rounded-2xl p-6 shadow-soft transition-transform hover:-translate-y-1">
                                <div className="h-12 w-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-4 text-xl">✨</div>
                                <h3 className="font-display text-lg text-navy mb-2">Excellence</h3>
                                <p className="text-xs text-slate-500">Delivering premium quality in every single product we offer.</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-soft transition-transform hover:-translate-y-1">
                                <div className="h-12 w-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-4 text-xl">🤝</div>
                                <h3 className="font-display text-lg text-navy mb-2">Partnership</h3>
                                <p className="text-xs text-slate-500">Building lasting relationships with businesses across Sri Lanka.</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-soft transition-transform hover:-translate-y-1">
                                <div className="h-12 w-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-4 text-xl">⚡</div>
                                <h3 className="font-display text-lg text-navy mb-2">Reliability</h3>
                                <p className="text-xs text-slate-500">Ensuring timely deliveries and consistent service excellence.</p>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-100 pt-8 pb-10">
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
                            <div className="flex items-center gap-3 mt-4">
                                <a href="#" aria-label="Facebook" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-colors">
                                    <FaFacebookF className="text-[13px]" />
                                </a>
                                <a href="#" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-colors">
                                    <FaInstagram className="text-[13px]" />
                                </a>
                                <a href="#" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-navy hover:text-navy transition-colors">
                                    <FaLinkedinIn className="text-[13px]" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick Links</h4>
                            <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                <li><a href="/" className="hover:text-navy">Home</a></li>
                                <li><a href="/shop" className="hover:text-navy">Shop</a></li>
                                <li><a href="/#corporate" className="hover:text-navy">Corporate Solutions</a></li>
                                <li><a href="/about" className="hover:text-navy">About Us</a></li>
                                <li><a href="/#contact" className="hover:text-navy">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contact</h4>
                            <div className="mt-3 space-y-1 text-sm text-slate-600">
                                <p>20/9, Green Terrace, Parakandeniya, Imbulgoda</p>
                                <p>+94 76 812 1701</p>
                                <p>hello@onefine.lk</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center">
                        <p>© {new Date().getFullYear()} OneFine. All rights reserved.</p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-navy">Privacy Policy</a>
                            <a href="#" className="hover:text-navy">Terms of Service</a>
                        </div>
                    </div>
                </footer>
            </div>

            <a href="https://wa.me/94768121701" target="_blank" rel="noopener noreferrer" className="fixed bottom-4 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition-transform hover:-translate-y-0.5 md:bottom-6 md:right-6" aria-label="Chat on WhatsApp">
                <FaWhatsapp className="text-2xl" />
            </a>
        </div>
    );
}
