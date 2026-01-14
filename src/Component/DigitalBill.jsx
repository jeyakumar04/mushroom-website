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

            {/* Loyalty Tracker (Strict Anti-gravity Logic) */}
            {totalAmount >= 50 ? (
                <div className="bg-white/5 text-white rounded-lg p-3 mb-1.5 shadow-lg border border-white/10 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-1.5 border-b border-white/10 pb-1">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(250,204,21,0.8)]"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500">TJP Mushroom Farming</span>
                        </div>
                        <span className="text-[7px] font-bold text-gray-400 uppercase">Track ID: {customerData.totalLifetime}</span>
                    </div>

                    {customerData.reachedCycle && (
                        <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/50 rounded-lg p-2 mb-2 text-center shadow-inner">
                            <p className="text-[11px] font-black text-yellow-400 uppercase animate-pulse leading-none">
                                🎁 LOYALTY REWARD!
                            </p>
                            <p className="text-[9px] font-bold text-white mt-0.5">
                                You Earned {customerData.rewardsEarned} FREE POCKET(S)! 🍄
                            </p>
                        </div>
                    )}

                    <div className="space-y-1">

                        <div className="flex justify-between text-[10px]">
                            <span className="text-gray-300 font-bold uppercase tracking-tighter">Current Cycle</span>
                            <span className="text-yellow-400 font-black">{customerData.loyaltyCount}/10</span>
                        </div>

                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full transition-all duration-1000" style={{ width: `${(customerData.loyaltyCount / 10) * 100}%` }}></div>
                        </div>

                        <p className="text-[9px] text-green-300 font-bold italic mt-2 text-center opacity-80 uppercase tracking-tighter">
                            Next Free Pocket in: <span className="text-white font-black">{10 - customerData.loyaltyCount} Pockets</span>
                        </p>
                    </div>
                </div>
            ) : null}

            {/* Huge Bold Footer */}
            <div className="text-center mt-2">
                <p className="text-[8px] font-black text-gray-400 italic mb-1">"இயற்கையோடு இணைந்த சுவை, உடலிற்கு மருந்து!"</p>
                <div className="border-t border-white/10 pt-2">
                    <p className="text-[14px] font-black text-white uppercase tracking-tight leading-tight">
                        Pulimalaipatty,Melur ,Madurai
                    </p>
                    <p className="text-[12px] font-black text-green-400 tracking-[0.1em] mt-1">
                        PH: +91 95005 91897  PH:+91 91596 59711
                    </p>
                </div>
            </div>
        </div>
    );
});

export default DigitalBill;
