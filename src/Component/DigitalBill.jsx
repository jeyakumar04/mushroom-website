import React, { forwardRef } from 'react';
import logo from '../assets/logo-final.png';

const DigitalBill = forwardRef(({ saleData, customerData }, ref) => {
    if (!saleData || !customerData) return null;

    const date = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const totalAmount = saleData.quantity * saleData.pricePerPocket;
    const remainingQty = Math.max(0, 10 - customerData.loyaltyCount);

    return (
        <div
            ref={ref}
            className="w-[500px] bg-[#CBCCCB] p-10 text-gray-800 font-sans relative overflow-hidden"
            style={{
                border: '1px solid rgba(0,0,0,0.1)'
            }}
        >
            {/* Header Section */}
            <div className="flex flex-col items-center mb-8">
                <img
                    src={logo}
                    alt="TJP Logo"
                    className="w-[380px] object-contain mb-4 filter drop-shadow-md"
                />
                <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900">
                    TJP Mushroom Farming
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mt-1">
                    Quality • Freshness • Health
                </p>
            </div>

            {/* Top Info */}
            <div className="flex justify-between items-center mb-8 border-y border-gray-400/30 py-6">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-green-700 font-black">Customer</p>
                    <h3 className="text-xl font-bold">{saleData.customerName}</h3>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-green-700 font-black">Date</p>
                    <h3 className="text-xl font-bold">{date}</h3>
                </div>
            </div>

            {/* Order Details */}
            <div className="bg-white/40 rounded-3xl p-8 mb-8 border border-white/60 backdrop-blur-sm shadow-inner">
                <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-6">Order Summary</h4>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-bold">Product</span>
                        <span className="font-black">Oyster Mushroom</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-bold">Quantity</span>
                        <span className="font-black">{saleData.quantity} Pockets</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-bold">Price per Unit</span>
                        <span className="font-black">₹{saleData.pricePerPocket}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-300 mt-4 flex justify-between items-center">
                        <span className="text-lg font-black uppercase text-green-800 italic">Total Paid</span>
                        <span className="text-4xl font-black text-gray-900">₹{totalAmount}</span>
                    </div>
                </div>
            </div>

            {/* Loyalty Section */}
            <div className="bg-green-800 text-white rounded-3xl p-8 mb-10 shadow-lg border border-green-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-200">Loyalty Tracker</span>
                </div>
                <p className="text-sm font-bold leading-relaxed">
                    வணக்கம் <span className="text-yellow-400">{saleData.customerName}</span>! நீங்கள் இதுவரை <span className="text-yellow-400">{customerData.loyaltyCount}</span> பாக்கெட்டுகள் வாங்கியுள்ளீர்கள்.
                </p>
                <div className="mt-4 pt-4 border-t border-green-700">
                    <p className="text-xs font-medium text-green-100 italic">
                        இன்னும் <span className="text-yellow-400 font-black">{remainingQty}</span> பாக்கெட்டுகள் வாங்கினால், 1 பாக்கெட் முற்றிலும் இலவசம்!
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center">
                <p className="text-[11px] font-black text-gray-600 italic mb-4">
                    "இயற்கையோடு இணைந்த சுவை, நாவிற்கு விருந்து, உடலிற்கு மருந்து!"
                </p>
                <div className="border-t border-gray-400/30 pt-6">
                    <p className="text-[9px] uppercase tracking-[0.5em] font-black text-gray-500">Official Digital Bill • TJP Farms</p>
                </div>
            </div>
        </div>
    );
});

export default DigitalBill;
