import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import Footer from '../Component/Footer';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Login, 2: OTP
    const [phoneNumber, setPhoneNumber] = useState('9500591897'); // Primary Admin
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'otp') setOtp(value);
        else setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                // Request OTP after successful initial login
                const otpRes = await fetch('http://localhost:5000/api/admin/request-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber })
                });
                const otpData = await otpRes.json();

                if (otpRes.ok) {
                    setStep(2);
                } else {
                    setError(otpData.message || 'Failed to send OTP. Check WhatsApp Status.');
                }
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Backend Connection Error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/admin/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, otp })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUser', data.username);
                localStorage.setItem('otpVerified', 'true');
                navigate('/admin');
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('OTP Verification Error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#022C22] min-h-screen font-sans text-white flex flex-col pt-20">
            <main className="flex-grow flex items-center justify-center px-4 py-20 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-tjp-gold/5 blur-[150px] rounded-full z-0 opacity-30"></div>

                <div className="max-w-md w-full relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-tjp-gold/10 border border-tjp-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(244,208,63,0.1)]">
                            <FaShieldAlt className="text-3xl text-tjp-gold animate-pulse-slow" />
                        </div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
                            Admin <span className="text-tjp-gold">Portal</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                            {step === 1 ? 'Secure Gateway Access' : 'Identity Verification Required'}
                        </p>
                    </div>

                    <div className="glass-card p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tjp-gold/40 to-transparent"></div>

                        {step === 1 ? (
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                                        <FaUser className="text-tjp-gold/50" /> Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={credentials.username}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-tjp-gold/50 transition-all font-bold"
                                        placeholder="Enter username"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                                        <FaLock className="text-tjp-gold/50" /> Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={credentials.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-tjp-gold/50 transition-all font-bold"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center animate-shake">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-5 bg-tjp-gold text-[#022C22] font-black text-lg rounded-2xl shadow-[0_10px_30px_-5px_rgba(244,208,63,0.3)] hover:shadow-[0_15px_40px_-5px_rgba(244,208,63,0.5)] active:scale-95 transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-4 group italic"
                                >
                                    {isLoading ? 'Checking...' : 'Next Step'}
                                    {!isLoading && <FaArrowRight className="group-hover:translate-x-2 transition-transform" />}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="text-center mb-6">
                                    <p className="text-gray-400 text-sm">We've sent a 6-digit OTP to your WhatsApp ending in <b>{phoneNumber.slice(-4)}</b></p>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                                        <FaShieldAlt className="text-tjp-gold/50" /> WhatsApp OTP
                                    </label>
                                    <input
                                        type="text"
                                        name="otp"
                                        value={otp}
                                        onChange={handleChange}
                                        required
                                        maxLength="6"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-tjp-gold/50 transition-all font-bold text-center text-2xl tracking-[0.5em]"
                                        placeholder="000000"
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center animate-shake">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-5 bg-tjp-gold text-[#022C22] font-black text-lg rounded-2xl shadow-[0_10px_30px_-5px_rgba(244,208,63,0.3)] hover:shadow-[0_15px_40px_-5px_rgba(244,208,63,0.5)] active:scale-95 transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-4 group italic"
                                >
                                    {isLoading ? 'Verifying...' : 'Unlock Console'}
                                    {!isLoading && <FaArrowRight className="group-hover:translate-x-2 transition-transform" />}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:text-tjp-gold transition-colors"
                                >
                                    Back to Login
                                </button>
                            </form>
                        )}
                    </div>

                    <p className="text-center mt-8 text-gray-500 text-[10px] font-bold uppercase tracking-widest opacity-40">
                        &copy; 2026 TJP Mushroom Farming &bull; Restricted Access
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Login;
