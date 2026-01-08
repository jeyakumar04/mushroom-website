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
            className="w-[500px] bg-[#022C22] p-10 text-white font-sans relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #022C22 0%, #059669 100%)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            {/* Background Decorative Elements */}
            <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-[#F4D03F]/5 rounded-full blur-3xl"></div>

            {/* Header Logo */}
            <div className="flex justify-center mb-8">
                <img src={logo} alt="TJP Logo" className="h-20 object-contain brightness-110" />
            </div>

            {/* Top Info */}
            <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#F4D03F] font-bold">Customer</p>
                    <h3 className="text-xl font-black italic">{saleData.customerName}</h3>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-[#F4D03F] font-bold">Date</p>
                    <h3 className="text-xl font-black italic">{date}</h3>
                </div>
            </div>

            {/* Order Details */}
            <div className="bg-white/5 rounded-3xl p-8 mb-8 border border-white/10 backdrop-blur-sm">
                <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-6">Order Details</h4>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">Product</span>
                        <span className="font-bold">Mushroom Pocket</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">Quantity</span>
                        <span className="font-bold">{saleData.quantity} Pockets</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">Price</span>
                        <span className="font-bold">₹{saleData.pricePerPocket} / pocket</span>
                    </div>
                    <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-center">
                        <span className="text-lg font-black uppercase italic text-[#F4D03F]">Total Amount</span>
                        <span className="text-3xl font-black text-white">₹{totalAmount}</span>
                    </div>
                </div>
            </div>

            {/* Loyalty Section */}
            <div className="bg-[#F4D03F]/10 rounded-3xl p-8 mb-10 border border-[#F4D03F]/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-[#F4D03F] rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#F4D03F]">Loyalty Track</span>
                </div>
                <p className="text-sm font-bold leading-relaxed text-gray-100">
                    நீங்கள் இப்போது <span className="text-[#F4D03F]">{customerData.loyaltyCount}</span> பாக்கெட்டுகள் வாங்கியுள்ளீர்கள்.
                    இன்னும் <span className="text-[#F4D03F]">{remainingQty}</span> பாக்கெட்டுகள் வாங்கினால், 1 பாக்கெட் இலவசமாக பெறுவீர்கள்!
                </p>
            </div>

            {/* Footer */}
            <div className="text-center">
                <div className="bg-white/5 py-4 px-6 rounded-2xl inline-block mb-4 border border-white/5">
                    <p className="text-[10px] font-bold italic text-gray-300">
                        TJP மஷ்ரூம் பார்மிங் உடன் இணைந்ததற்கு நன்றி!<br />
                        <span className="text-[#F4D03F]">உங்கள் வளர்ச்சி எங்கள் மகிழ்ச்சி!</span>
                    </p>
                </div>
                <p className="text-[8px] uppercase tracking-[0.3em] font-black text-gray-500">Digital Bill • TJP Mushroom Farming</p>
            </div>
        </div>
    );
});

export default DigitalBill;
