import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const logo = '/assets/logo-final.png';

const Footer = () => {
    return (
        <footer className="bg-[#022C22] text-white pt-16 pb-8 border-t border-tjp-gold/50">
            <div className="max-w-7xl mx-auto px-4 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12 items-start text-left">

                    {/* Brand Column */}
                    <div className="md:col-span-4 space-y-6">
                        <img
                            src={logo}
                            alt="TJP Mushrooms Logo"
                            className="h-20 md:h-32 w-auto object-contain filter brightness-110 contrast-125 transition-transform hover:scale-105"
                        />
                        <p className="text-gray-300 text-base leading-relaxed max-w-xs">
                            Cultivating the finest organic oyster mushrooms with passion and sustainable practices.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="https://wa.me/919500591897" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-tjp-gold hover:text-black transition-colors text-xl">
                                <FaWhatsapp />
                            </a>
                            <a href="https://www.instagram.com/_tjp_mushroom_farming?igsh=MXBxdDNvc2g3eWU5dw==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-tjp-gold hover:text-black transition-colors text-xl">
                                <FaInstagram />
                            </a>
                            <a href="https://www.facebook.com/share/1GQFU5GzGi/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-tjp-gold hover:text-black transition-colors text-xl">
                                <FaFacebookF />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-2">
                        <h4 className="text-lg md:text-xl font-bold text-white mb-6 uppercase tracking-wider">Links</h4>
                        <ul className="space-y-4 text-gray-400 text-base">
                            <li><Link to="/" className="hover:text-tjp-gold transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-tjp-gold transition-colors">About</Link></li>
                            <li><Link to="/products" className="hover:text-tjp-gold transition-colors">Shop</Link></li>
                            <li><Link to="/gallery" className="hover:text-tjp-gold transition-colors">Gallery</Link></li>
                            <li><Link to="/training" className="hover:text-tjp-gold transition-colors">Training</Link></li>
                            <li><Link to="/blog" className="hover:text-tjp-gold transition-colors">Blog</Link></li>
                            <li><Link to="/contact" className="hover:text-tjp-gold transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="md:col-span-3">
                        <h4 className="text-lg md:text-xl font-bold text-white mb-6 uppercase tracking-wider">Contact</h4>
                        <ul className="space-y-5 text-gray-400 text-base">
                            <li className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <FaPhone className="text-tjp-gold shrink-0" />
                                    <span>+91 95005 91897</span>
                                </div>
                                <div className="flex items-center gap-3 ml-7">
                                    <span>+91 91596 59711</span>
                                </div>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaEnvelope className="text-tjp-gold shrink-0" />
                                <span>jpfarming10@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Location Area */}
                    <div className="md:col-span-3 md:pl-8 border-l border-white/5">
                        <h4 className="text-lg md:text-xl font-bold text-white mb-6 uppercase tracking-wider">Our Location</h4>
                        <div className="rounded-2xl overflow-hidden border border-white/10 h-32 md:h-36 mb-4 group cursor-pointer relative shadow-2xl">
                            <iframe
                                title="Farm Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15715.179361734493!2d78.3378377!3d10.0302758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c3c6f86008b1%3A0xc07ce6234b3e3474!2sTJP%20MUSHROOM%20FARMING!5e0!3m2!1sen!2sin!4v1704606821234!5m2!1sen!2sin"
                                className="w-full h-full border-0 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                loading="lazy"
                            ></iframe>
                        </div>
                        <p className="text-gray-400 text-sm flex items-start gap-2">
                            <FaMapMarkerAlt className="text-tjp-gold mt-1 shrink-0" />
                            <span>Pulimalaipatty, Melur,<br />Madurai, Tamil Nadu</span>
                        </p>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} TJP Mushroom Farming. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
