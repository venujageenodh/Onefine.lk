import React, { useState } from 'react';
import {
    HiOutlineSearch,
    HiOutlineShoppingBag,
    HiMenu,
    HiX,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker
} from 'react-icons/hi';
import {
    FaWhatsapp,
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn
} from 'react-icons/fa';
import { useCart } from './hooks/useCart';
import CartDrawer from './components/CartDrawer';
import PaymentIcons from './components/PaymentIcons';
import logo from './assets/onefine-logo.png';

// Payment logos
import visa from './assets/payment-logos/visa.svg';
import mastercard from './assets/payment-logos/mastercard.svg';
import amex from './assets/payment-logos/americanexpress.svg';
import cod from './assets/payment-logos/cod.svg';
import bankTransfer from './assets/payment-logos/bank-transfer.svg';

export default function ContactPage() {
    const { totalItems, setIsOpen } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log('Form submitted:', formData);
        setIsSubmitted(true);

        // Reset form
        setFormData({
            name: '',
            email: '',
            phone: '',
            message: ''
        });

        setTimeout(() => setIsSubmitted(false), 5000);
    };

    const companies = ['Toyota', 'netspeak', 'netskope', 'Sanfer'];
    const payments = [
        { name: 'Visa', src: visa },
        { name: 'Mastercard', src: mastercard },
        { name: 'American Express', src: amex },
        { name: 'COD', src: cod },
        { name: 'Bank Transfer', src: bankTransfer },
    ];

    return (
        <div className="min-h-screen bg-white text-navy font-body selection:bg-gold/30">
            {/* Marble Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/marble.png')]"></div>

            <CartDrawer />

            <div className="relative z-10">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
                        <a href="/" className="flex items-center gap-3 group">
                            <img src={logo} alt="OneFine logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                            <div className="leading-tight">
                                <div className="font-display text-xl tracking-[0.18em] text-navy">ONEFINE</div>
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Corporate Gifting Sri Lanka</p>
                            </div>
                        </a>

                        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
                            <a href="/" className="hover:text-navy transition-colors">Home</a>
                            <a href="/shop" className="hover:text-navy transition-colors">Shop</a>
                            <a href="/about" className="hover:text-navy transition-colors">About Us</a>
                            <span className="text-navy font-bold border-b-2 border-gold pb-0.5">Contact</span>
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
                                <a href="/shop" onClick={() => setMobileMenuOpen(false)} className="text-slate-600">Shop</a>
                                <a href="/about" onClick={() => setMobileMenuOpen(false)} className="text-slate-600">About Us</a>
                                <span className="text-navy font-semibold">Contact</span>
                                <a
                                    href="/#corporate"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="mt-2 rounded-full border border-slate-200 px-4 py-2 text-center text-xs uppercase tracking-[0.18em] text-navy"
                                >
                                    Corporate Solutions
                                </a>
                            </nav>
                        </div>
                    )}
                </header>

                <main className="pt-12 pb-20 md:pt-16">
                    {/* 1) Breadcrumb + Page Title */}
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-12 text-center">
                        <nav className="flex justify-center items-center gap-2 text-[10px] uppercase tracking-widest text-slate-400 mb-4">
                            <a href="/" className="hover:text-gold transition-colors">Home</a>
                            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                            <span className="text-slate-600">Contact Us</span>
                        </nav>
                        <h1 className="font-display text-4xl text-navy sm:text-5xl lg:text-6xl mb-4">Contact Us</h1>
                        <p className="max-w-2xl mx-auto text-slate-500 text-sm sm:text-base leading-relaxed">
                            Get in touch with us for premium corporate gifting solutions and personalized service.
                        </p>
                    </div>

                    {/* 2) Main Content Section (2 Columns) */}
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-20">
                        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
                            {/* Left Column: Get In Touch */}
                            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
                                <div>
                                    <h2 className="font-display text-2xl text-navy mb-3">Get In Touch</h2>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        We&apos;re here to assist you. Reach out to us through any of the methods below.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Card A: Our Address */}
                                    <div className="bg-white rounded-2xl p-6 shadow-subtle border border-slate-50 transition-all hover:shadow-soft hover:border-gold/20">
                                        <div className="h-10 w-10 bg-navy/5 text-navy rounded-full flex items-center justify-center mb-4">
                                            <HiOutlineLocationMarker className="text-xl" />
                                        </div>
                                        <h3 className="font-display text-lg text-navy mb-2">Our Address</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                            20/9, Green Terrace,{"\n"}
                                            Parakandeniya,{"\n"}
                                            Imbulgoda
                                        </p>
                                    </div>

                                    {/* Card B: Phone */}
                                    <div className="bg-white rounded-2xl p-6 shadow-subtle border border-slate-50 transition-all hover:shadow-soft hover:border-gold/20">
                                        <div className="h-10 w-10 bg-navy/5 text-navy rounded-full flex items-center justify-center mb-4">
                                            <HiOutlinePhone className="text-xl" />
                                        </div>
                                        <h3 className="font-display text-lg text-navy mb-2">Phone</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            <a href="tel:+94768121701" className="hover:text-gold transition-colors font-medium">+94 76 812 1701</a>
                                            <br />
                                            <span className="text-[10px] text-slate-400 mt-1 block">(Mon - Fri: 9:00 AM - 6:00 PM)</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Email Card */}
                                <div className="bg-white rounded-2xl p-8 shadow-subtle border border-slate-50 flex flex-col items-center text-center transition-all hover:shadow-soft hover:border-gold/20">
                                    <div className="h-12 w-12 bg-navy/5 text-navy rounded-full flex items-center justify-center mb-4">
                                        <HiOutlineMail className="text-2xl" />
                                    </div>
                                    <h3 className="font-display text-lg text-navy mb-2">Email</h3>
                                    <a href="mailto:onefine.info@gmail.com" className="text-sm text-slate-600 hover:text-gold transition-colors font-medium mb-6">onefine.info@gmail.com</a>

                                    <div className="flex items-center gap-3">
                                        <a href="https://www.facebook.com/share/14UfX7GiR5r/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-navy hover:text-white transition-all shadow-sm">
                                            <FaFacebookF className="text-xs" />
                                        </a>
                                        <a href="https://www.instagram.com/_.one_.fine_?igsh=ZHZocWd5c3Jxd24w" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-navy hover:text-white transition-all shadow-sm">
                                            <FaInstagram className="text-xs" />
                                        </a>
                                        <a href="https://www.linkedin.com/company/onefine-lk" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-navy hover:text-white transition-all shadow-sm">
                                            <FaLinkedinIn className="text-xs" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Send Us a Message */}
                            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-soft border border-slate-50 animate-in fade-in slide-in-from-right duration-700">
                                <h2 className="font-display text-2xl text-navy mb-3">Send Us a Message</h2>
                                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                    Have questions or a custom gift request? Fill out the form below, and our team will get back to you promptly.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label htmlFor="name" className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 ml-1">Your Name *</label>
                                            <input
                                                type="text"
                                                id="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your full name"
                                                className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-gold focus:ring-0 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="email" className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 ml-1">Your Email *</label>
                                            <input
                                                type="email"
                                                id="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Enter your email address"
                                                className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-gold focus:ring-0 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="phone" className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 ml-1">Your Phone *</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter your phone number"
                                            className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-gold focus:ring-0 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="message" className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 ml-1">Your Message *</label>
                                        <textarea
                                            id="message"
                                            required
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder="What can we help you with?"
                                            className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-gold focus:ring-0 transition-all outline-none resize-none"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto px-10 py-4 bg-gold text-navy font-bold rounded-xl shadow-soft hover:bg-gold-soft hover:translate-y-[-2px] active:translate-y-0 transition-all duration-300"
                                    >
                                        Send Message
                                    </button>

                                    {isSubmitted && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg flex items-center justify-center animate-in fade-in zoom-in duration-300">
                                            <span className="mr-2">✓</span> Message sent successfully!
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* 3) Map Section */}
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-20">
                        <div className="rounded-3xl overflow-hidden shadow-soft border border-slate-100 bg-white p-2">
                            <div className="relative h-[400px] w-full bg-slate-50 rounded-2xl overflow-hidden">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.0!2d79.9806!3d7.0358!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMDInMDkuMCJOIDc5wrA1OCc1MC4wIkU!5e0!3m2!1sen!2slk!4v1709450000000!5m2!1sen!2slk"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="OneFine Location"
                                    className="grayscale hover:grayscale-0 transition-all duration-1000"
                                ></iframe>
                                <div className="absolute bottom-6 left-6 right-6 md:left-auto md:w-80 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/50">
                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 bg-gold/10 text-gold rounded-full flex items-center justify-center flex-shrink-0">
                                            <HiOutlineLocationMarker className="text-lg" />
                                        </div>
                                        <div>
                                            <h4 className="font-display text-navy font-bold mb-1">Our Location</h4>
                                            <p className="text-xs text-slate-600 leading-relaxed mb-3">
                                                20/9, Green Terrace, Parakandeniya, Imbulgoda
                                            </p>
                                            <a
                                                href="https://www.google.com/maps/dir/?api=1&destination=7.0358,79.9806"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold text-gold hover:text-navy transition-colors"
                                            >
                                                Get Directions →
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4) Trusted By */}
                    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-20 text-center">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-8 font-semibold">Trusted By Leading Brands</p>
                        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 grayscale opacity-60">
                            {companies.map((name) => (
                                <div
                                    key={name}
                                    className="text-lg md:text-xl font-display font-bold tracking-tight text-slate-600 hover:text-navy transition-colors cursor-default"
                                >
                                    {name}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 5) Secure Payment Options */}
                    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-12 py-12 border-y border-slate-50 bg-slate-50/30">
                        <div className="text-center mb-8">
                            <h2 className="font-display text-xl text-navy tracking-wide">Secure Payment Options</h2>
                        </div>

                        <div className="overflow-x-auto no-scrollbar py-2">
                            <div className="flex items-center justify-center gap-8 md:gap-12 min-w-max px-4">
                                {payments.map((payment) => (
                                    <div key={payment.name} className="flex-shrink-0 group">
                                        <img
                                            src={payment.src}
                                            alt={payment.name}
                                            className="h-7 md:h-8 w-auto grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                {/* 6) Footer */}
                <footer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-12 pb-10">
                    <div className="grid gap-12 md:grid-cols-4">
                        <div className="space-y-4 md:col-span-2">
                            <div className="flex items-center gap-3">
                                <img src={logo} alt="OneFine logo" className="h-12 w-auto object-contain" />
                                <div className="leading-tight">
                                    <div className="font-display text-xl tracking-[0.18em] text-navy">ONEFINE</div>
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Corporate Gifting Sri Lanka</p>
                                </div>
                            </div>
                            <p className="max-w-sm text-xs text-slate-500 leading-relaxed">
                                Premium corporate gifting and branded merchandise, designed and delivered with precision for Sri Lankan businesses and global teams based in Sri Lanka.
                            </p>
                            <div className="flex items-center gap-3 pt-2">
                                <a href="https://www.facebook.com/share/14UfX7GiR5r/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-navy hover:text-navy hover:bg-slate-50 transition-all">
                                    <FaFacebookF className="text-sm" />
                                </a>
                                <a href="https://www.instagram.com/_.one_.fine_?igsh=ZHZocWd5c3Jxd24w" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-navy hover:text-navy hover:bg-slate-50 transition-all">
                                    <FaInstagram className="text-sm" />
                                </a>
                                <a href="https://www.linkedin.com/company/onefine-lk" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-navy hover:text-navy hover:bg-slate-50 transition-all">
                                    <FaLinkedinIn className="text-sm" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-6 font-display">Quick Links</h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li><a href="/" className="hover:text-gold transition-colors">Home</a></li>
                                <li><a href="/shop" className="hover:text-gold transition-colors">Shop</a></li>
                                <li><a href="/#corporate" className="hover:text-gold transition-colors">Corporate Solutions</a></li>
                                <li><a href="/about" className="hover:text-gold transition-colors">About Us</a></li>
                                <li><span className="text-navy font-semibold">Contact</span></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-6 font-display">Get In Touch</h4>
                            <div className="space-y-4 text-sm text-slate-600">
                                <div className="flex gap-3">
                                    <HiOutlineLocationMarker className="text-gold text-lg flex-shrink-0" />
                                    <p className="text-xs leading-relaxed">20/9, Green Terrace, Parakandeniya, Imbulgoda</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <HiOutlinePhone className="text-gold text-lg flex-shrink-0" />
                                    <p className="text-xs">+94 76 812 1701</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <HiOutlineMail className="text-gold text-lg flex-shrink-0" />
                                    <p className="text-xs">onefine.info@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-center">
                        <PaymentIcons />
                    </div>

                    <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center">
                        <p>© {new Date().getFullYear()} OneFine. All rights reserved.</p>
                        <div className="flex gap-4">
                            <a href="/privacy" className="hover:text-navy transition-colors">Privacy Policy</a>
                            <a href="/terms" className="hover:text-navy transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </footer>
            </div>

            <a
                href="https://wa.me/94768121701"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95"
                aria-label="Chat on WhatsApp"
            >
                <FaWhatsapp className="text-2xl" />
            </a>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            ` }} />
        </div>
    );
}
