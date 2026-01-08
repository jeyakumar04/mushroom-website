import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaWhatsapp, FaInstagram, FaFacebookF } from 'react-icons/fa';
import Footer from '../Component/Footer';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Form submitted:', formData);
        alert('Thank you for your message! We will get back to you soon.');
    };

    return (
        <div className="bg-[#022C22] min-h-screen font-sans text-white overflow-x-hidden">

            {/* 1. Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1594165560069-90134aed366b?auto=format&fit=crop&q=80&w=2069"
                        alt="Contact Us"
                        className="w-full h-full object-cover opacity-40 scale-110 animate-pulse-slow"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-tjp-dark/60 via-tjp-dark/80 to-tjp-dark"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-reveal">
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-black mb-6 tracking-tighter uppercase">
                        GET IN <span className="text-tjp-gold">TOUCH</span>
                    </h1>
                    <div className="w-24 h-2 bg-tjp-gold mx-auto rounded-full mb-8 shadow-[0_0_20px_rgba(255,215,0,0.5)]"></div>
                    <p className="text-xl md:text-2xl text-gray-300 font-medium leading-relaxed">
                        Have questions about our mushrooms or training? <br className="hidden md:block" />
                        We're here to help you grow.
                    </p>
                </div>
            </section>

            {/* 2. Contact Content Section */}
            <section className="py-24 px-4 relative z-10 -mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Left: Contact Info */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="glass-card p-6 md:p-10 rounded-3xl space-y-10">
                                <div>
                                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                        <div className="w-1 h-8 bg-tjp-gold rounded-full"></div>
                                        Contact Information
                                    </h2>
                                    <div className="space-y-8">
                                        <div className="flex items-start gap-6 group">
                                            <div className="w-14 h-14 bg-tjp-gold/10 rounded-2xl flex items-center justify-center text-tjp-gold text-2xl group-hover:bg-tjp-gold group-hover:text-tjp-dark transition-all duration-300 shrink-0 shadow-lg">
                                                <FaMapMarkerAlt />
                                            </div>
                                            <div>
                                                <h4 className="text-tjp-gold font-bold mb-1 uppercase tracking-widest text-xs">Our Farm</h4>
                                                <p className="text-gray-300 text-lg leading-relaxed">
                                                    Pulimalaipatty, Melur,<br />
                                                    Madurai, Tamil Nadu 625106
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-6 group">
                                            <div className="w-14 h-14 bg-tjp-gold/10 rounded-2xl flex items-center justify-center text-tjp-gold text-2xl group-hover:bg-tjp-gold group-hover:text-tjp-dark transition-all duration-300 shrink-0 shadow-lg">
                                                <FaPhoneAlt />
                                            </div>
                                            <div>
                                                <h4 className="text-tjp-gold font-bold mb-1 uppercase tracking-widest text-xs">Call Us</h4>
                                                <p className="text-gray-300 text-lg">+91 95005 91897</p>
                                                <p className="text-gray-300 text-lg">+91 91596 59711</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-6 group">
                                            <div className="w-14 h-14 bg-tjp-gold/10 rounded-2xl flex items-center justify-center text-tjp-gold text-2xl group-hover:bg-tjp-gold group-hover:text-tjp-dark transition-all duration-300 shrink-0 shadow-lg">
                                                <FaEnvelope />
                                            </div>
                                            <div>
                                                <h4 className="text-tjp-gold font-bold mb-1 uppercase tracking-widest text-xs">Email Us</h4>
                                                <p className="text-gray-300 text-lg">jpfarming10@gmail.com</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-6 group">
                                            <div className="w-14 h-14 bg-tjp-gold/10 rounded-2xl flex items-center justify-center text-tjp-gold text-2xl group-hover:bg-tjp-gold group-hover:text-tjp-dark transition-all duration-300 shrink-0 shadow-lg">
                                                <FaClock />
                                            </div>
                                            <div>
                                                <h4 className="text-tjp-gold font-bold mb-1 uppercase tracking-widest text-xs">Farm Hours</h4>
                                                <p className="text-gray-300 text-lg">Mon - Sat: 9 AM - 6 PM</p>
                                                <p className="text-gray-300 text-lg">Sunday: Closed</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/10">
                                    <h4 className="text-white font-bold mb-6 text-xl">Follow Our Growth</h4>
                                    <div className="flex gap-4">
                                        {[
                                            { icon: <FaWhatsapp />, link: 'https://wa.me/919500591897' },
                                            { icon: <FaInstagram />, link: 'https://www.instagram.com/_tjp_mushroom_farming?igsh=MXBxdDNvc2g3eWU5dw==' },
                                            { icon: <FaFacebookF />, link: 'https://www.facebook.com/share/1GQFU5GzGi/' }
                                        ].map((social, idx) => (
                                            <a key={idx} href={social.link} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl text-white hover:bg-tjp-gold hover:text-tjp-dark hover:-translate-y-1 transition-all duration-300">
                                                {social.icon}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Contact Form */}
                        <div className="lg:col-span-7">
                            <div className="glass-card p-6 md:p-10 rounded-3xl h-full shadow-2xl relative overflow-hidden">
                                {/* Decorative Glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-tjp-gold/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

                                <h2 className="text-3xl font-bold mb-8 relative z-10 uppercase tracking-tight">Send us a <span className="text-tjp-gold">Message</span></h2>

                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="John Doe"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-tjp-gold focus:bg-white/10 transition-all text-white placeholder:text-gray-600"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="john@example.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-tjp-gold focus:bg-white/10 transition-all text-white placeholder:text-gray-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            placeholder="Inquiry about Training"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-tjp-gold focus:bg-white/10 transition-all text-white placeholder:text-gray-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="6"
                                            placeholder="Tell us how we can help you..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-tjp-gold focus:bg-white/10 transition-all text-white placeholder:text-gray-600 resize-none"
                                        ></textarea>
                                    </div>

                                    <button type="submit" className="w-full gold-button py-5 text-xl flex items-center justify-center gap-3 group">
                                        SEND MESSAGE <FaPaperPlane className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Map Section */}
            <section className="pb-24 px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="rounded-3xl md:rounded-[40px] overflow-hidden border border-white/10 shadow-2xl h-[400px] md:h-[500px] relative group">
                        {/* Placeholder for real Google Map iframe */}
                        <div className="absolute inset-0 bg-[#064E3B] flex flex-col items-center justify-center p-8 md:p-12 text-center group-hover:scale-105 transition-transform duration-700">
                            <div className="w-16 h-16 md:w-24 md:h-24 bg-tjp-gold/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <FaMapMarkerAlt className="text-3xl md:text-5xl text-tjp-gold" />
                            </div>
                            <h3 className="text-2xl md:text-4xl font-black mb-4 uppercase tracking-tighter">Visit Our <span className="text-tjp-gold">Farm</span></h3>
                            <p className="text-gray-300 text-xl max-w-lg mx-auto">
                                Pulimalaipatti, Melur, Madurai.<br />
                                Direct farm access for fresh purchases and inquiries.
                            </p>
                            <a
                                href="https://maps.app.goo.gl/nNmZaYwtJvmXbXBz5"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-10 glass-button px-12 py-4 text-lg inline-block"
                            >
                                OPEN IN GOOGLE MAPS
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;
