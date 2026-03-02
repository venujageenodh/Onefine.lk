import React from 'react';
import visaLogo from '../assets/payment-logos/visa.svg';
import mastercardLogo from '../assets/payment-logos/mastercard.svg';
import amexLogo from '../assets/payment-logos/americanexpress.svg';
import codLogo from '../assets/payment-logos/cod.svg';
import bankTransferLogo from '../assets/payment-logos/bank-transfer.svg';

const PaymentIcons = () => {
    const icons = [
        { src: visaLogo, label: 'Visa' },
        { src: mastercardLogo, label: 'Mastercard' },
        { src: amexLogo, label: 'American Express' },
        { src: codLogo, label: 'Cash on Delivery' },
        { src: bankTransferLogo, label: 'Bank Transfer' },
    ];

    return (
        <div className="flex flex-col items-center justify-center w-full px-4">
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 text-center">
                Secure Payment Options
            </h4>

            <div className="w-full flex justify-center">
                <div
                    className="flex flex-row items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
                    style={{
                        flexWrap: 'nowrap',
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}
                >
                    {icons.map((item, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 flex items-center justify-center opacity-85 transition-opacity duration-300 hover:opacity-100"
                            title={item.label}
                        >
                            <img
                                src={item.src}
                                alt={item.label}
                                className="h-[28px] w-auto object-contain pointer-events-none"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </div>
    );
};

export default PaymentIcons;
