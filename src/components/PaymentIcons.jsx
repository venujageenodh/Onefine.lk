import React from 'react';

const VisaIcon = () => (
    <svg viewBox="0 0 24 24" className="h-6 w-auto" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.923 15h2.15l1.35-8.25h-2.15L12.923 15zM21.5 6.75h-2.12c-.66 0-1.15.37-1.43.95L15.12 15h2.26l.45-1.25H20.4l.21 1.25H22.9L21.5 6.75zm-3.08 5.25l.81-2.22c.03-.09.07-.21.12-.37.05-.16.08-.28.11-.38h.04c.03.09.06.2.1.33.04.13.07.26.11.39l.66 2.27h-1.85zM9.54 6.75H7.4L5.3 12.3c-.13.34-.31.62-.54.85-.23.23-.53.42-.91.56L3.13 15h4.63l.77-4.72h2l-2 4.72h2.28L12.8 6.75H9.54z" />
    </svg>
);

const MastercardIcon = () => (
    <svg viewBox="0 0 24 24" className="h-6 w-auto" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5 12c0 1.5-.7 2.8-1.8 3.7C15.1 16.5 16.5 17 18 17c2.8 0 5-2.2 5-5s-2.2-5-5-5c-1.5 0-2.9.5-4.3 1.3 1.1.9 1.8 2.2 1.8 3.7zM1 12c0 2.8 2.2 5 5 5 1.5 0 2.9-.5 4.3-1.3C9.2 14.8 8.5 13.5 8.5 12c0-1.5.7-2.8 1.8-3.7C8.9 7.5 7.5 7 6 7 3.2 7 1 9.2 1 12zM12 15.1c1-.7 1.6-1.8 1.6-3.1s-.6-2.4-1.6-3.1c-1 .7-1.6 1.8-1.6 3.1s.6 2.4 1.6 3.1z" />
    </svg>
);

const CashOnDeliveryIcon = () => (
    <svg viewBox="0 0 24 24" className="h-7 w-auto" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75m0 0v10.5m0-10.5h16.5m-16.5 0a1.5 1.5 0 011.5-1.5h13.5a1.5 1.5 0 011.5 1.5m-16.5 10.5h16.5m-16.5 0a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5m-16.5-10.5v10.5m16.5-10.5v10.5m-1.5-10.5h.75m-.75 0v.75m0 0v10.5m0-10.5h.75m-1.5 10.5h.75m-.75 0v.75m0 0v1.5m0-1.5h.75m-1.5 1.5h.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75v6.75m0 0l-3-3m3 3l3-3" />
    </svg>
);

const BankTransferIcon = () => (
    <svg viewBox="0 0 24 24" className="h-6 w-auto" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-1.5v-9H21v9m-18 0h18M12 7.5V3m0 0L9.75 5.25M12 3l2.25 2.25M3.75 9h16.5a1.5 1.5 0 011.5 1.5V21h-19.5v-10.5A1.5 1.5 0 013.75 9z" />
    </svg>
);

const PaymentIcons = () => {
    const icons = [
        { component: <VisaIcon />, label: 'Visa' },
        { component: <MastercardIcon />, label: 'Mastercard' },
        { component: <CashOnDeliveryIcon />, label: 'Cash on Delivery' },
        { component: <BankTransferIcon />, label: 'Bank Transfer' },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:items-center sm:gap-4">
            {icons.map((item, index) => (
                <div
                    key={index}
                    className="group flex h-10 items-center justify-center rounded-[20px] bg-[#F5F5F5] px-4 text-slate-400 transition-all duration-300 hover:translate-y-[-2px] hover:bg-slate-100 hover:text-navy hover:shadow-subtle"
                    title={item.label}
                >
                    {item.component}
                </div>
            ))}
        </div>
    );
};

export default PaymentIcons;
