import React from 'react';
import { HiCheckCircle, HiPhone, HiMail } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import logo from './assets/onefine-logo.png';

const BANK_DETAILS = {
    bank: 'Sampath Bank',
    accountName: 'OneFine (Pvt) Ltd',
    accountNumber: '1234 5678 9012',
    branch: 'Imbulgoda',
};

export default function OrderConfirmationPage() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId') || '';
    const method = params.get('method') || '';
    const name = params.get('name') || 'Customer';

    const shortId = orderId ? `#${orderId.slice(-6).toUpperCase()}` : '';

    const isPaid = method === 'payhere';
    const isBank = method === 'bank_transfer';
    const isCOD = method === 'cod';

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16 text-navy">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 mb-10">
                <img src={logo} alt="OneFine" className="h-10 w-auto object-contain" />
                <span className="font-display text-lg tracking-[0.18em] text-navy">ONEFINE</span>
            </a>

            {/* Card */}
            <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100 shadow-2xl p-8 text-center space-y-5">

                {/* Icon */}
                <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center">
                        <HiCheckCircle className="text-4xl text-gold" />
                    </div>
                </div>

                {/* Title */}
                {isPaid ? (
                    <>
                        <h1 className="font-display text-2xl text-navy">Payment Successful!</h1>
                        <p className="text-sm text-slate-500">
                            Thank you, <span className="font-semibold text-navy">{name}</span>! Your payment was received and your order {shortId} is confirmed.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="font-display text-2xl text-navy">Order Placed!</h1>
                        <p className="text-sm text-slate-500">
                            Thank you, <span className="font-semibold text-navy">{name}</span>! Your order {shortId} has been received.
                        </p>
                    </>
                )}

                {/* Method-specific instructions */}
                {isBank && (
                    <div className="rounded-2xl bg-navy/5 border border-navy/10 p-5 text-left space-y-3">
                        <p className="text-xs font-bold text-navy uppercase tracking-wider">Next Step: Complete Bank Transfer</p>
                        <p className="text-xs text-slate-600">
                            Please transfer Rs. <strong>exact order total</strong> to the account below and send us your payment slip via WhatsApp or email.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <span className="text-slate-500">Bank</span>
                            <span className="font-semibold text-navy">{BANK_DETAILS.bank}</span>
                            <span className="text-slate-500">Account Name</span>
                            <span className="font-semibold text-navy">{BANK_DETAILS.accountName}</span>
                            <span className="text-slate-500">Account No.</span>
                            <span className="font-semibold text-navy font-mono">{BANK_DETAILS.accountNumber}</span>
                            <span className="text-slate-500">Branch</span>
                            <span className="font-semibold text-navy">{BANK_DETAILS.branch}</span>
                        </div>
                    </div>
                )}

                {isCOD && (
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600">
                        💵 You'll pay on delivery. Our team will contact you to confirm the delivery schedule.
                    </div>
                )}

                {/* Order ID */}
                {orderId && (
                    <div className="rounded-xl bg-gold/10 px-4 py-3 text-xs">
                        <span className="text-slate-500">Order Reference: </span>
                        <span className="font-mono font-bold text-navy">{shortId}</span>
                    </div>
                )}

                {/* Contact */}
                <div className="pt-2 space-y-2">
                    <p className="text-[11px] text-slate-400">Need help? Contact us:</p>
                    <div className="flex justify-center gap-3">
                        <a
                            href="https://wa.me/94768121701"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 px-4 py-2 text-[11px] font-semibold text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                        >
                            <FaWhatsapp /> WhatsApp
                        </a>
                        <a
                            href="mailto:onefine.info@gmail.com"
                            className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-[11px] font-semibold text-slate-600 hover:border-navy hover:text-navy transition-colors"
                        >
                            <HiMail /> Email
                        </a>
                    </div>
                </div>

                {/* CTA */}
                <a
                    href="/"
                    className="block w-full rounded-xl bg-gold py-3 text-sm font-bold text-navy transition-all hover:-translate-y-0.5 hover:shadow-lg mt-2"
                >
                    Continue Shopping
                </a>
            </div>
        </div>
    );
}
