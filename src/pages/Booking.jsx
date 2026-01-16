import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaCalendarAlt, FaUser, FaMapMarkerAlt, FaPhone, FaArrowLeft, FaMoneyBillWave, FaGooglePay, FaUpload } from 'react-icons/fa';
import Footer from '../Component/Footer';

const Booking = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        place: '',
        dateTime: '',
        contactNumber: '',
        paymentType: 'Cash',
        paymentScreenshot: ''
    });

    const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/nNmZaYwtJvmXbXBz5";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, paymentScreenshot: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Submission failed');

            // --- Case B: Cash Payment (Instant WhatsApp) ---
            if (formData.paymentType === 'Cash') {
                const message = `🚀 *TJP Mushroom Farm - Booking Confirmed*%0A%0A*Name:* ${formData.name}%0A*Date:* ${new Date(formData.dateTime).toLocaleDateString()}%0A*Payment:* CASH%0A%0A📍 *Location:* ${GOOGLE_MAPS_LINK}%0A%0A_See you at the farm!_`;
                window.open(`https://wa.me/91${formData.contactNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
            }

            setIsSubmitted(true);
            window.scrollTo(0, 0);
        } catch (err) {
            setError('Connection Error: Please ensure backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-[#022C22] min-h-screen font-sans text-white flex flex-col pt-20">
                <main className="flex-grow flex items-center justify-center px-4 py-20">
                    <div className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-[#CBCCCB]/20 rounded-[2.5rem] p-10 md:p-16 text-center shadow-[0_0_50px_-10px_rgba(244,208,63,0.15)] relative overflow-hidden animate-reveal">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#F4D03F]/10 blur-[80px] rounded-full"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 bg-[#F4D03F]/20 rounded-full flex items-center justify-center mb-8 border border-[#F4D03F]/30 shadow-[0_0_30px_rgba(244,208,63,0.2)]">
                                <FaShieldAlt className="text-[#F4D03F] text-5xl" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-[#F4D03F] mb-6 uppercase tracking-tight italic">
                                {formData.paymentType === 'Cash' ? 'Registered Successfully!' : 'Verification Pending!'}
                            </h2>
                            <p className="text-[#CBCCCB] text-lg md:text-xl leading-relaxed mb-12 font-medium">
                                {formData.paymentType === 'Cash'
                                    ? "Your seat is confirmed. We've sent the farm location to your WhatsApp!"
                                    : "Admin will verify your GPay screenshot and send the farm location to your WhatsApp shortly."}
                            </p>
                            <Link to="/" className="px-10 py-5 bg-transparent border border-[#CBCCCB]/30 text-[#CBCCCB] font-black rounded-2xl text-lg hover:bg-[#CBCCCB] hover:text-[#022C22] transition-all duration-500 uppercase italic">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-[#022C22] min-h-screen font-sans text-white flex flex-col pt-20 overflow-x-hidden">
            <main className="flex-grow py-20 px-4 relative">
                <div className="absolute top-40 left-0 w-96 h-96 bg-[#F4D03F]/5 blur-[120px] rounded-full -translate-x-1/2"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <Link to="/training" className="inline-flex items-center gap-2 text-[#CBCCCB]/60 hover:text-[#F4D03F] transition-colors mb-6 font-black tracking-[0.4em] text-[10px] uppercase group">
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Training
                        </Link>
                        <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase leading-[0.8]">
                            Join Next <br /> <span className="text-[#F4D03F]">Batch</span>
                        </h1>
                        {error && <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold text-sm">{error}</div>}
                    </div>

                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 md:p-16 shadow-[0_0_80px_-20px_rgba(0,0,0,0.5)]">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-[#CBCCCB] font-black uppercase tracking-[0.2em] text-[10px] ml-1">
                                        <FaUser className="text-[#F4D03F]" /> Full Name
                                    </label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 focus:border-[#F4D03F] transition-all text-white font-bold" placeholder="Your Name" />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-[#CBCCCB] font-black uppercase tracking-[0.2em] text-[10px] ml-1">
                                        <FaPhone className="text-[#F4D03F]" /> WhatsApp Number
                                    </label>
                                    <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 focus:border-[#F4D03F] transition-all text-white font-bold" placeholder="95005 91897" />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-[#CBCCCB] font-black uppercase tracking-[0.2em] text-[10px] ml-1">
                                        <FaMapMarkerAlt className="text-[#F4D03F]" /> Place
                                    </label>
                                    <input type="text" name="place" value={formData.place} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 focus:border-[#F4D03F] transition-all text-white font-bold" placeholder="Madurai / City" />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-[#CBCCCB] font-black uppercase tracking-[0.2em] text-[10px] ml-1">
                                        <FaCalendarAlt className="text-[#F4D03F]" /> Preferred Date
                                    </label>
                                    <input type="datetime-local" name="dateTime" value={formData.dateTime} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 focus:border-[#F4D03F] transition-all text-white [color-scheme:dark] font-bold" />
                                </div>
                            </div>

                            <div className="space-y-6 pt-10 border-t border-white/5">
                                <label className="text-[#CBCCCB] font-black uppercase tracking-[0.2em] text-[10px] ml-1 block">Payment Method</label>
                                <div className="flex flex-col sm:flex-row gap-8">
                                    <label className={`flex-1 flex items-center justify-between p-6 rounded-[1.5rem] cursor-pointer border-2 transition-all duration-500 h-24 ${formData.paymentType === 'Cash' ? 'bg-[#F4D03F]/10 border-[#F4D03F] text-white shadow-[0_0_30px_rgba(244,208,63,0.1)]' : 'bg-white/5 border-transparent text-[#CBCCCB]/40 hover:bg-white/10'}`}>
                                        <div className="flex items-center gap-5">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentType === 'Cash' ? 'border-[#F4D03F]' : 'border-white/20'}`}>
                                                {formData.paymentType === 'Cash' && <div className="w-3 h-3 bg-[#F4D03F] rounded-full"></div>}
                                            </div>
                                            <span className="font-black tracking-widest text-sm uppercase italic">Cash</span>
                                        </div>
                                        <FaMoneyBillWave className={`text-3xl ${formData.paymentType === 'Cash' ? 'text-[#F4D03F]' : 'text-white/5'}`} />
                                        <input type="radio" name="paymentType" value="Cash" checked={formData.paymentType === 'Cash'} onChange={handleChange} className="hidden" />
                                    </label>

                                    <label className={`flex-1 flex items-center justify-between p-6 rounded-[1.5rem] cursor-pointer border-2 transition-all duration-500 h-24 ${formData.paymentType === 'GPay' ? 'bg-[#F4D03F]/10 border-[#F4D03F] text-white shadow-[0_0_30px_rgba(244,208,63,0.1)]' : 'bg-white/5 border-transparent text-[#CBCCCB]/40 hover:bg-white/10'}`}>
                                        <div className="flex items-center gap-5">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentType === 'GPay' ? 'border-[#F4D03F]' : 'border-white/20'}`}>
                                                {formData.paymentType === 'GPay' && <div className="w-3 h-3 bg-[#F4D03F] rounded-full"></div>}
                                            </div>
                                            <span className="font-black tracking-widest text-sm uppercase italic">GPay</span>
                                        </div>
                                        <FaGooglePay className={`text-5xl ${formData.paymentType === 'GPay' ? 'text-[#F4D03F]' : 'text-white/5'}`} />
                                        <input type="radio" name="paymentType" value="GPay" checked={formData.paymentType === 'GPay'} onChange={handleChange} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            {formData.paymentType === 'GPay' && (
                                <div className="space-y-4 animate-reveal">
                                    <label className="flex items-center gap-3 text-[#CBCCCB] font-black uppercase tracking-[0.2em] text-[10px] ml-1">
                                        <FaUpload className="text-[#F4D03F]" /> Upload Screenshot
                                    </label>
                                    <input type="file" accept="image/*" onChange={handleFileChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-bold file:bg-[#F4D03F] file:text-[#022C22] file:border-none file:px-4 file:py-1 file:rounded-lg file:mr-4 file:font-black file:text-[10px] file:uppercase italic" />
                                </div>
                            )}

                            <button type="submit" disabled={isLoading} className="w-full py-7 bg-[#F4D03F] text-[#022C22] font-black text-2xl rounded-[1.5rem] transition-all duration-500 uppercase tracking-[0.3em] flex items-center justify-center gap-4 italic active:scale-95 shadow-[0_15px_40px_-10px_rgba(244,208,63,0.5)]">
                                {isLoading ? 'Processing...' : 'Register Now'}
                                {!isLoading && <FaArrowLeft className="rotate-180" />}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Booking;
