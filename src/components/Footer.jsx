import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { HiOutlineLocationMarker, HiOutlinePhone, HiOutlineMail } from 'react-icons/hi';
import PaymentIcons from './PaymentIcons';
import logo from '../assets/onefine-logo.png';

export default function Footer({ className }) {
    return (
        <footer className={`border-t border-slate-100 pt-12 pb-10 ${className || 'mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'}`}>
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
                        <li><a href="/contact-us" className="hover:text-gold transition-colors">Contact</a></li>
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
    );
}
