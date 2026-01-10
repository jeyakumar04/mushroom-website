import React, { forwardRef } from 'react';
import logo from '../assets/logo-final.png';

const DigitalBill = forwardRef(({ saleData, customerData }, ref) => {
    if (!saleData || !customerData) return null;

    const date = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const price = Number(saleData.pricePerPocket || 0);
    const qty = Number(saleData.quantity || 0);
    const totalAmount = price * qty;
    const remainingQty = Math.max(0, 10 - Number(customerData.loyaltyCount || 0));

    return (
        <div
            ref={ref}
            className="w-[450px] bg-[#022C22] p-4 text-white font-sans relative overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
            {/* Header Section */}
            <div className="flex flex-col items-center mb-1">
                <img src={logo} alt="TJP Logo" className="w-[250px] object-contain filter drop-shadow-2xl" />
                <h1 className="text-base font-black uppercase tracking-tighter text-white">TJP Mushroom Farming</h1>
                <p className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-400">Quality • Freshness • Health</p>
            </div>

            {/* Top Info */}
            <div className="flex justify-between items-center mb-1 border-y border-white/20 py-1.5">
                <div>
                    <p className="text-[7px] uppercase tracking-widest text-green-400 font-black">Customer</p>
                    <h3 className="text-xs font-bold text-white uppercase">{saleData.customerName}</h3>
                </div>
                <div className="text-right">
                    <p className="text-[7px] uppercase tracking-widest text-green-400 font-black">Date</p>
                    <h3 className="text-xs font-bold text-white">{date}</h3>
                </div>
            </div>

            {/* Order Details */}
            <div className="bg-white/10 rounded-lg p-2.5 mb-1.5 border border-white/20 backdrop-blur-md shadow-inner">
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px]">
                        <span className="text-gray-300 font-bold">Product</span>
                        <span className="font-black text-white">{saleData.productType === 'Seeds' ? 'Seeds (Vithai)' : 'Oyster Mushroom'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px]">
                        <span className="text-gray-300 font-bold">Quantity</span>
                        <span className="font-black text-white">{qty} {saleData.productType === 'Seeds' ? 'kg' : 'Pockets'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px]">
                        <span className="text-gray-300 font-bold">Price</span>
                        <span className="font-black text-white">₹{price}</span>
                    </div>
                    <div className="pt-1.5 border-t border-white/20 mt-1 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-green-400 italic">Total Paid</span>
                        <span className="text-xl font-black text-white">₹{totalAmount}</span>
                    </div>
                </div>
            </div>

            {/* Loyalty Tracker (Strict Hide if < 50) */}
            {totalAmount >= 50 ? (
                <div className="bg-white/5 text-white rounded-lg p-2.5 mb-1.5 shadow-lg border border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-yellow-500">Loyalty Tracker</span>
                    </div>
                    <p className="text-[10px] font-bold leading-tight text-gray-200">
                        வணக்கம் <span className="text-yellow-400 font-black">{saleData.customerName}</span>! நீங்கள் இதுவரை <span className="text-yellow-400">{customerData.loyaltyCount}</span> பாக்கெட்டுகள் வாங்கியுள்ளீர்கள்.
                    </p>
                    <div className="mt-1 pt-1 border-t border-white/10">
                        <p className="text-[8px] font-medium text-green-200 italic">
                            இன்னும் <span className="text-yellow-400 font-black">{remainingQty}</span> பாக்கெட்டுகள் வாங்கினால், 1 பாக்கெட் இலவசம்!
                        </p>
                    </div>
                </div>
            ) : null}

            {/* Huge Bold Footer */}
            <div className="text-center">
                <p className="text-[8px] font-black text-gray-400 italic mb-1">"இயற்கையோடு இணைந்த சுவை, உடலிற்கு மருந்து!"</p>
                <div className="border-t border-white/10 pt-2">
                    <p className="text-[14px] font-black text-white uppercase tracking-tight leading-tight">
                        116A, T.Puthupatti, North Street, Ellaipatti (PO), Sivagangai - 630562
                    </p>
                    <p className="text-[12px] font-black text-green-400 tracking-[0.1em] mt-1">
                        PH: +91 95005 91897
                    </p>
                </div>
            </div>
        </div>
    );
});

export default DigitalBill;
