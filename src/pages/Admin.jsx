import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaPhone, FaCalendarAlt, FaMoneyBillWave, FaShieldAlt, FaClock, FaCheckCircle, FaExclamationCircle, FaBox, FaChartBar, FaWarehouse, FaTrash, FaDownload, FaWhatsapp, FaArrowRight, FaImage, FaMapMarkerAlt, FaSearchPlus, FaGift, FaPlusCircle, FaHistory, FaEraser, FaShareAlt, FaTachometerAlt } from 'react-icons/fa';
import { toPng } from 'html-to-image';
import Footer from '../Component/Footer';
import DigitalBill from '../Component/DigitalBill';

const Admin = () => {
    const billRef = React.useRef(null);
    const [billData, setBillData] = React.useState(null);
    const [isGeneratingBill, setIsGeneratingBill] = React.useState(false);
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const [error, setError] = useState('');

    // Manual Sale State
    const [manualSale, setManualSale] = useState({
        customerName: '',
        contactNumber: '',
        pricePerPocket: 50,
        quantity: 1
    });

    const token = localStorage.getItem('adminToken');
    const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/nNmZaYwtJvmXbXBz5";

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [bookRes, orderRes, invRes, statRes, custRes] = await Promise.all([
                fetch('http://localhost:5000/api/bookings', { headers }),
                fetch('http://localhost:5000/api/orders', { headers }),
                fetch('http://localhost:5000/api/inventory', { headers }),
                fetch('http://localhost:5000/api/admin/stats', { headers }),
                fetch('http://localhost:5000/api/customers', { headers })
            ]);

            const [bData, oData, iData, sData, cData] = await Promise.all([
                bookRes.json(), orderRes.json(), invRes.json(), statRes.json(), custRes.json()
            ]);

            setBookings(Array.isArray(bData) ? bData : []);
            setOrders(Array.isArray(oData) ? oData : []);
            setInventory(Array.isArray(iData) ? iData : []);
            setCustomers(Array.isArray(cData) ? cData : []);
            setStats(sData);
        } catch (err) { setError('Backend Connection Error'); } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleManualSale = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/sales/manual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(manualSale)
            });
            const data = await res.json();
            if (res.ok) {
                // Set data for the bill component to render
                const saleSnapshot = { ...manualSale, pricePerPocket: manualSale.pricePerPocket };
                const loyaltyData = data.loyaltyUpdate || {};

                setBillData({
                    sale: saleSnapshot,
                    customer: {
                        loyaltyCount: loyaltyData.currentCycle || 0
                    }
                });

                fetchData();
                setManualSale({ customerName: '', contactNumber: '', pricePerPocket: 50, quantity: 1 });

                // Small delay to ensure Bill component renders before capture
                setTimeout(async () => {
                    await generateAndSendBill(saleSnapshot, {
                        loyaltyCount: loyaltyData.currentCycle || 0
                    });
                }, 500);
            }
        } catch (err) {
            console.error(err);
            alert('Sale recording failed');
        }
    };

    const generateAndSendBill = async (sale, customer) => {
        if (!billRef.current) return;
        setIsGeneratingBill(true);
        try {
            const dataUrl = await toPng(billRef.current, { cacheBust: true });

            // 1. Download for records (Safety fallback for Admin)
            const link = document.createElement('a');
            link.download = `TJP-Bill-${sale.customerName}.png`;
            link.href = dataUrl;
            link.click();

            // 2. Upload to server to get a URL
            const uploadRes = await fetch('http://localhost:5000/api/upload-bill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: dataUrl,
                    customerName: sale.customerName
                })
            });
            const { imageUrl } = await uploadRes.json();

            // 3. Prepare Premium Message
            const message = `✅ *TJP MUSHROOM FARM - DIGITAL BILL*\n\nவணக்கம் *${sale.customerName}*! 👋\nTJP மஷ்ரூம் பார்மிங் லிருந்து உங்கள் டிஜிட்டல் பில் இதோ.\n\n📄 *Bill Link:* ${imageUrl}\n\nநன்றி! மீண்டும் வருக! 🙏✨`;

            alert("Digital Bill Generated! (A copy has been downloaded for your records)");
            window.open(`https://wa.me/91${sale.contactNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');

        } catch (err) {
            console.error('Bill generation failed', err);
            alert("Bill generation failed. Please check console.");
        } finally {
            setIsGeneratingBill(false);
            setBillData(null);
        }
    };

    const resetLoyalty = async (id) => {
        if (!window.confirm("Reset loyalty count?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/loyalty/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ customerId: id })
            });
            if (res.ok) {
                alert('✅ Loyalty Reset Successful!');
                fetchData();
            }
        } catch (err) { alert('Reset failed'); }
    };

    const toggleBookingStatus = async (booking) => {
        const newStatus = booking.status === 'Pending' ? 'Confirmed' : 'Pending';
        try {
            const res = await fetch(`http://localhost:5000/api/bookings/${booking._id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchData();
                if (newStatus === 'Confirmed') {
                    const message = `✅ *Payment Verified - TJP Mushroom Farm*%0A%0AHi *${booking.name}*, your booking is now *CONFIRMED*.%0A%0A📍 *Farm Location:* ${GOOGLE_MAPS_LINK}%0A%0ASee you at the training!`;
                    window.open(`https://wa.me/91${booking.contactNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
                }
            }
        } catch (err) { alert('Update failed'); }
    };

    const renderTab = () => {
        switch (activeTab) {
            case 'loyalty':
                return (
                    <div className="space-y-12 animate-reveal">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Manual Sale Form */}
                            <div className="lg:col-span-1 glass-card p-10 rounded-[3rem] border border-white/10">
                                <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3">
                                    <FaPlusCircle className="text-[#F4D03F]" /> Manual <span className="text-[#F4D03F]">Sale</span>
                                </h2>
                                <form onSubmit={handleManualSale} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Customer Name</label>
                                        <input type="text" required value={manualSale.customerName} onChange={e => setManualSale({ ...manualSale, customerName: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-[#F4D03F] font-bold text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Phone Number</label>
                                        <input type="tel" required value={manualSale.contactNumber} onChange={e => setManualSale({ ...manualSale, contactNumber: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-[#F4D03F] font-bold text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Price / Pocket</label>
                                            <input type="number" required value={manualSale.pricePerPocket} onChange={e => setManualSale({ ...manualSale, pricePerPocket: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-[#F4D03F] font-bold text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Quantity</label>
                                            <input type="number" required value={manualSale.quantity} onChange={e => setManualSale({ ...manualSale, quantity: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-[#F4D03F] font-bold text-sm" />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full py-4 bg-[#F4D03F] text-[#022C22] font-black rounded-xl uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(244,208,63,0.3)] transition-all italic">Record Sale & Update Loyalty</button>
                                </form>
                            </div>

                            {/* Customer Loyalty List */}
                            <div className="lg:col-span-2 space-y-6">
                                <h2 className="text-xl font-black uppercase italic flex items-center gap-3">
                                    <FaHistory className="text-[#F4D03F]" /> ANTI-GRAVITY <span className="text-[#F4D03F]">LOYALTY TRACK</span>
                                </h2>
                                <div className="space-y-4">
                                    {customers.map(customer => (
                                        <div key={customer._id} className={`glass-card p-6 rounded-3xl border transition-all ${customer.cycleCount >= 10 ? 'border-[#F4D03F] bg-[#F4D03F]/5' : 'border-white/5'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${customer.cycleCount >= 10 ? 'bg-[#F4D03F] border-[#F4D03F]' : 'bg-white/5 border-white/10'}`}>
                                                        <FaUser className={customer.cycleCount >= 10 ? 'text-[#022C22]' : 'text-[#F4D03F]'} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black uppercase italic text-sm">{customer.name}</h3>
                                                        <p className="text-[10px] text-gray-500 flex items-center gap-2">{customer.contactNumber} <FaWhatsapp className="text-green-500" /></p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-8">
                                                    <div className="text-center">
                                                        <span className="text-[8px] font-black text-gray-500 uppercase block mb-1">Current Cycle</span>
                                                        <span className="text-2xl font-black text-[#F4D03F]">{(Number(customer.cycleCount) || 0)}</span>
                                                        <span className="text-[10px] text-gray-600 font-bold ml-1">/10</span>
                                                    </div>

                                                    {customer.cycleCount >= 10 ? (
                                                        <div className="bg-[#F4D03F] text-[#022C22] px-4 py-2 rounded-xl text-[8px] font-black uppercase animate-pulse flex items-center gap-2">
                                                            <FaGift /> FREE POCKET READY
                                                        </div>
                                                    ) : (
                                                        <div className="text-[9px] font-bold text-gray-500">
                                                            {10 - (customer.cycleCount || 0)} more
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => resetLoyalty(customer._id)}
                                                        className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                                        title="Claim Reward & Reset Cycle"
                                                    >
                                                        <FaEraser size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Progress Bar Mini */}
                                            <div className="mt-4 bg-white/5 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-[#F4D03F] to-yellow-600 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(((Number(customer.cycleCount) || 0) / 10) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'bookings':
                return (
                    <div className="space-y-6 animate-reveal">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase italic">Training <span className="text-[#F4D03F]">Registrations</span></h2>
                            <span className="text-[10px] font-bold text-gray-500 italic">Verify GPay to auto-send location</span>
                        </div>
                        {bookings.map(booking => (
                            <div key={booking._id} className="glass-card rounded-[2.5rem] border border-white/10 p-8 flex flex-col lg:flex-row items-center justify-between gap-8 group hover:border-[#F4D03F]/30 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-[#F4D03F]/10 transition-all">
                                            <FaUser className="text-xl text-[#F4D03F]" />
                                        </div>
                                        {booking.paymentScreenshot && (
                                            <button
                                                onClick={() => setPreviewImage(booking.paymentScreenshot)}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-[#F4D03F] text-[#022C22] rounded-full flex items-center justify-center animate-bounce shadow-lg"
                                            >
                                                <FaImage size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic">{booking.name}</h3>
                                        <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{booking.place}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1 px-10">
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-gray-600 font-black uppercase">Payment</span>
                                        <p className="text-xs font-black flex items-center gap-2">
                                            {booking.paymentType}
                                            {booking.paymentType === 'Cash' ? <FaMoneyBillWave className="text-green-500" /> : <FaCheckCircle className="text-blue-500" />}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-gray-600 font-black uppercase">Mobile</span>
                                        <p className="text-xs font-bold flex items-center gap-2">
                                            {booking.contactNumber}
                                            <a href={`https://wa.me/91${booking.contactNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-500">
                                                <FaWhatsapp />
                                            </a>
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-gray-600 font-black uppercase">Status</span>
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${booking.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-gray-600 font-black uppercase">Date</span>
                                        <p className="text-xs font-bold">{new Date(booking.dateTime).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleBookingStatus(booking)}
                                    className={`px-8 py-4 rounded-2xl font-black uppercase italic text-xs transition-all ${booking.status === 'Confirmed' ? 'bg-transparent border border-white/20 text-white/40' : 'bg-[#F4D03F] text-[#022C22] shadow-[0_10px_30px_-5px_rgba(244,208,63,0.3)]'}`}
                                >
                                    {booking.status === 'Confirmed' ? 'Verified ✓' : (booking.paymentType === 'Cash' ? 'Confirm Seat' : 'Verify GPay')}
                                </button>
                            </div>
                        ))}
                    </div>
                );
            case 'inventory':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-reveal">
                        {inventory.map(item => (
                            <div key={item._id} className="glass-card p-12 rounded-[3rem] border border-white/10 text-center group relative overflow-hidden">
                                <FaWarehouse className="text-4xl text-[#F4D03F] mx-auto mb-8" />
                                <h3 className="text-2xl font-black uppercase italic mb-8">{item.itemName}</h3>
                                <div className="flex items-center justify-center gap-8 mb-4">
                                    <span className="text-5xl font-black text-[#F4D03F]">{item.stock}</span>
                                </div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.unit}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'stats':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-reveal">
                        <div className="glass-card p-10 rounded-[2.5rem] border border-[#F4D03F]/20 text-center">
                            <span className="text-[10px] font-black uppercase text-[#F4D03F] block mb-4">Total Revenue</span>
                            <p className="text-5xl font-black italic text-white">₹{stats?.totalRevenue || 0}</p>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="bg-[#022C22] min-h-screen text-white pt-20">
            <main className="max-w-[1600px] mx-auto px-6 py-20 relative">
                <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-20 animate-reveal">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[#F4D03F]">
                            <FaShieldAlt className="text-2xl" />
                            <span className="font-black uppercase tracking-[0.4em] text-[10px]">TJP Master Console v4.0</span>
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8]">
                            Business <span className="text-[#F4D03F]">Hub</span>
                        </h1>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-3 mt-4 px-8 py-4 bg-gradient-to-r from-[#F4D03F] to-[#DAA520] text-[#022C22] rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-[0_0_40px_rgba(244,208,63,0.4)] transition-all group"
                        >
                            <FaTachometerAlt className="group-hover:rotate-12 transition-transform" />
                            Open New Dashboard
                            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/admin-blog"
                            className="inline-flex items-center gap-3 mt-4 px-8 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white hover:text-[#022C22] transition-all group"
                        >
                            <FaPlusCircle className="group-hover:rotate-90 transition-transform" />
                            Post New Blog
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {[
                            { id: 'bookings', label: 'Bookings' },
                            { id: 'loyalty', label: 'Loyalty & Sales' },
                            { id: 'inventory', label: 'Inventory' },
                            { id: 'stats', label: 'Analytics' }
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === tab.id ? 'bg-[#F4D03F] text-[#022C22]' : 'bg-white/5 border border-white/10'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-64 flex items-center justify-center animate-pulse text-[#F4D03F] font-black uppercase tracking-widest">Encrypting Datastream...</div>
                ) : renderTab()}

                {previewImage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-reveal" onClick={() => setPreviewImage(null)}>
                        <div className="relative max-w-lg w-full">
                            <img src={previewImage} className="w-full rounded-[3rem] border border-[#F4D03F]/30 shadow-2xl" alt="Payment Proof" />
                            <p className="text-center mt-6 font-black uppercase italic tracking-widest text-[#F4D03F]">GPay Verification Proof</p>
                        </div>
                    </div>
                )}
                {/* Hidden Bill for Generation */}
                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                    {billData && (
                        <DigitalBill
                            ref={billRef}
                            saleData={billData.sale}
                            customerData={billData.customer}
                        />
                    )}
                </div>

                {isGeneratingBill && (
                    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
                        <div className="w-20 h-20 border-4 border-[#F4D03F] border-t-transparent rounded-full animate-spin mb-6"></div>
                        <p className="font-black uppercase tracking-widest text-[#F4D03F] animate-pulse">Forging Digital Bill...</p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Admin;
