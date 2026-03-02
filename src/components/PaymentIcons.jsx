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
        <div className="flex flex-col items-center justify-center w-full">
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 text-center">
                Secure Payment Options
            </h4>
            <div className="grid grid-cols-2 gap-6 place-items-center sm:flex sm:flex-row sm:flex-wrap sm:justify-center sm:gap-8">
                {icons.map((item, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-center opacity-80 transition-opacity duration-300 hover:opacity-100 ${index === icons.length - 1 && icons.length % 2 !== 0 ? 'col-span-2' : ''
                            }`}
                        title={item.label}
                    >
                        <img
                            src={item.src}
                            alt={item.label}
                            className="h-[30px] w-auto object-contain"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentIcons;
