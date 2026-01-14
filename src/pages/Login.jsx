import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import Footer from '../Component/Footer';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Login, 2: Phone, 3: OTP
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Authorized Admin Numbers
    const ADMIN_NUMBERS = ['9500591897', '9159659711'];

    const isAuthorized = ADMIN_NUMBERS.includes(phoneNumber.trim());

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'otp') setOtp(value);
        else if (name === 'phoneNumber') setPhoneNumber(value);
        else setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                if (data.requireOtp) {
                    setStep(2); // Go to Phone Number step
                } else {
                    localStorage.setItem('adminToken', data.token);
                    localStorage.setItem('adminUser', data.username);
                    navigate('/admin');
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

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!isAuthorized) {
            setError('Unauthorized Admin Phone');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const otpRes = await fetch('/api/admin/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber })
            });

            const otpData = await otpRes.json();

            if (otpRes.ok) {
                setStep(3); // Go to OTP entry step
            } else {
                setError(otpData.message || 'Failed to send OTP. Please try again.');
            }
        } catch (err) {
            setError('System Error: ' + (err.message || 'Check Connection'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/verify-otp', {
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

    // --- WHATSAPP STATUS CHECK & QR CODE ---
    const [qrCode, setQrCode] = useState(null);
    const [waStatus, setWaStatus] = useState('checking');

    useEffect(() => {
        let interval;
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/admin/whatsapp-status');
                const data = await res.json();
                setWaStatus(data.status);
                if (data.status === 'scan_needed' && data.qrCode) {
                    setQrCode(data.qrCode);
                } else if (data.status === 'connected') {
                    setQrCode(null);
                }
            } catch (e) {
                setWaStatus('error');
            }
        };

        checkStatus(); // Initial check
        interval = setInterval(checkStatus, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#CBCCCB] min-h-screen font-sans text-gray-900 flex flex-col pt-20">
            <main className="flex-grow flex items-center justify-center px-4 py-20 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/50 blur-[150px] rounded-full z-0 opacity-30"></div>

                <div className="max-w-md w-full relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-white/50 border border-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl relative">
                            <FaShieldAlt className={`text-3xl text-gray-800 ${waStatus === 'connected' ? '' : 'animate-pulse'}`} />
                            {/* Status Indicator Dot */}
                            <div className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white ${waStatus === 'connected' ? 'bg-green-500' : waStatus === 'scan_needed' ? 'bg-red-500 animate-ping' : 'bg-yellow-500'}`} title={`WhatsApp Status: ${waStatus}`}></div>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase mb-2">
                            Admin <span className="text-green-800">Portal</span>
                        </h1>
                        <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                            {step === 1 ? 'Secure Gateway Access' : step === 2 ? 'Phone Verification' : 'Identity Verification Required'}
                        </p>
                    </div>

                    {/* WHATSAPP STATUS FEEDBACK */}
                    {waStatus !== 'connected' && waStatus !== 'scan_needed' && (
                        <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-center justify-center gap-3 animate-pulse">
                            <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-yellow-700 font-bold text-xs uppercase tracking-wider">
                                {waStatus === 'initializing' ? 'Initializing WhatsApp...' : 'Reconnecting to Server...'}
                            </span>
                        </div>
                    )}

                    {/* QR CODE MODAL / OVERLAY */}
                    {qrCode && waStatus === 'scan_needed' && (
                        <div className="mb-8 bg-white p-6 rounded-2xl shadow-xl text-center border-2 border-red-100 animate-slide-up">
                            <h3 className="text-red-600 font-black uppercase text-xs tracking-widest mb-4">⚠️ WhatsApp Disconnected</h3>
                            <div className="bg-gray-100 p-4 rounded-xl inline-block mb-4">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`} alt="Scan QR" className="w-48 h-48 mix-blend-multiply" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Scan with WhatsApp (Linked Devices) to Enable OTP</p>
                        </div>
                    )}

                    <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-600/40 to-transparent"></div>

                        {step === 1 ? (
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                                        <FaUser className="text-green-600/50" /> Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={credentials.username}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-green-600/50 transition-all font-bold text-gray-900"
                                        placeholder="Enter username"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                                        <FaLock className="text-green-600/50" /> Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={credentials.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-green-600/50 transition-all font-bold text-gray-900"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs font-bold text-center animate-shake">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-5 bg-gray-900 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-4 group italic"
                                >
                                    {isLoading ? 'Checking...' : 'Next Step'}
                                    {!isLoading && <FaArrowRight className="group-hover:translate-x-2 transition-transform" />}
                                </button>
                            </form>
                        ) : step === 2 ? (
                            <form onSubmit={handleRequestOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                                        Enter Admin Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={phoneNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-green-600/50 transition-all font-bold text-gray-900"
                                        placeholder="95005XXXXX"
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs font-bold text-center animate-shake">
                                        {error}
                                        {waStatus === 'scan_needed' && <p className="mt-1 text-[9px] uppercase">Client Disconnected. Please scan QR above.</p>}
                                    </div>
                                )}

                                {!isAuthorized && phoneNumber.length >= 10 && (
                                    <div className="text-red-500 text-[10px] font-black uppercase text-center">
                                        🚫 Unauthorized Admin Phone
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || !isAuthorized || waStatus === 'scan_needed'}
                                    className={`w-full py-5 font-black text-lg rounded-2xl transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-4 group italic ${isAuthorized && waStatus !== 'scan_needed' ? 'bg-green-700 text-white shadow-xl' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                >
                                    {isLoading ? 'Sending...' : 'Send OTP'}
                                    {!isLoading && <FaArrowRight className="group-hover:translate-x-2 transition-transform" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:text-green-700 transition-colors"
                                >
                                    Back to Login
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="text-center mb-6">
                                    <p className="text-gray-600 text-sm">OTP sent to <b>{phoneNumber}</b> via WhatsApp</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                                        <FaShieldAlt className="text-green-600/50" /> WhatsApp OTP
                                    </label>
                                    <input
                                        type="text"
                                        name="otp"
                                        value={otp}
                                        onChange={handleChange}
                                        required
                                        maxLength="6"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-green-600/50 transition-all font-bold text-center text-2xl tracking-[0.5em] text-gray-900"
                                        placeholder="000000"
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs font-bold text-center animate-shake">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-5 bg-green-700 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-green-800 active:scale-95 transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-4 group italic"
                                >
                                    {isLoading ? 'Verifying...' : 'Unlock Console'}
                                    {!isLoading && <FaArrowRight className="group-hover:translate-x-2 transition-transform" />}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:text-green-700 transition-colors"
                                >
                                    Try Different Number
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
