import React, { useState } from 'react';
import { Link } from 'react-router-dom';
const logo = '/assets/logo-final.png';
import { FaInstagram, FaFacebookF, FaWhatsapp, FaPhoneAlt, FaLock, FaBars, FaTimes, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 0. Top Bar (Desktop Only) */}
      <div className="hidden md:block bg-[#011F18] text-[#CBCCCB] py-2 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-12 flex justify-between items-center text-[13px] font-bold tracking-[0.15em] uppercase">
          <div className="flex gap-8">
            <div className="flex items-center gap-2 hover:text-[#F4D03F] transition-colors cursor-default">
              <FaMapMarkerAlt className="text-[#F4D03F]" />
              <span>Pulimalaipatty,Melur, Madurai</span>
            </div>
            <a href="tel:9500591897" className="flex items-center gap-2 hover:text-[#F4D03F] transition-colors">
              <FaPhoneAlt className="text-[#F4D03F]" />
              <span>+91 9500591897</span>|
              <span>+91 9159659711</span>
            </a>
            <a href="mailto:jpfarming10@gmail.com" className="hidden lg:flex items-center gap-2 hover:text-[#F4D03F] transition-colors">
              <FaEnvelope className="text-[#F4D03F]" />
              <span>jpfarming10@gmail.com</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/30">|</span>
            <div className="flex gap-4">
              <a href="https://wa.me/919500591897" target="_blank" rel="noopener noreferrer" className="hover:text-[#F4D03F] transition-all">
                <FaWhatsapp className="text-lg" />
              </a>
              <a href="https://www.instagram.com/_tjp_mushroom_farming?igsh=MXBxdDNvc2g3eWU5dw==" target="_blank" rel="noopener noreferrer" className="hover:text-[#F4D03F] transition-all">
                <FaInstagram className="text-lg" />
              </a>
              <a href="https://www.facebook.com/share/1GQFU5GzGi/" target="_blank" rel="noopener noreferrer" className="hover:text-[#F4D03F] transition-all">
                <FaFacebookF className="text-base" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-gradient-to-r from-[#022C22] via-[#064E3B] to-[#022C22] border-b-2 border-[#CBCCCB] sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center px-4 md:px-12 h-[80px] md:h-[110px] relative max-w-[1400px] mx-auto">

          {/* 1. Logo */}
          <div className="flex items-center z-[60]">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <img
                src={logo}
                className="h-[100px] md:h-[160px] w-auto object-contain antialiased filter brightness-110 contrast-125 mix-blend-screen drop-shadow-2xl -ml-2 md:-ml-4 transition-transform hover:scale-105"
                alt="TJP Mushroom Farm Logo"
              />
            </Link>
          </div>

          {/* 2. Desktop Links */}
          <div className="hidden md:flex flex-grow justify-center gap-6 lg:gap-8 text-white font-bold tracking-widest text-[14px]">
            <Link to="/" className="hover:text-[#CBCCCB] transition-colors">HOME</Link>
            <Link to="/about" className="hover:text-[#CBCCCB] transition-colors">ABOUT</Link>
            <Link to="/gallery" className="hover:text-[#CBCCCB] transition-colors">GALLERY</Link>
            <Link to="/training" className="hover:text-[#CBCCCB] transition-colors">TRAINING</Link>
            <Link to="/products" className="hover:text-[#CBCCCB] transition-colors">SHOP</Link>
            <Link to="/blog" className="hover:text-[#CBCCCB] transition-colors">BLOG</Link>
            <Link to="/contact" className="hover:text-[#CBCCCB] transition-colors">CONTACT</Link>
          </div>

          {/* 3. Right Side: Social & Admin */}
          <div className="flex items-center gap-4 ml-auto">
            <Link to="/login" className="flex items-center gap-2 bg-[#F4D03F]/10 border border-[#F4D03F]/30 px-4 py-2 rounded-xl text-[#F4D03F] hover:bg-[#F4D03F] hover:text-[#022C22] transition-all duration-500 group">
              <FaLock className="text-sm group-hover:rotate-12 transition-transform" />
              <span className="text-[12px] font-black uppercase tracking-[0.2em] hidden sm:block">Admin</span>
            </Link>

            <button
              className="md:hidden text-white text-3xl focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FaTimes className="text-[#F4D03F]" /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#022C22] z-[65] flex flex-col items-center justify-start pt-24 pb-12 gap-8 transition-all duration-500 ease-in-out md:hidden overflow-y-auto ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex flex-col items-center gap-6 text-white font-bold tracking-[0.2em] text-xl">
          <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-[#F4D03F] transition-colors">HOME</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="hover:text-[#F4D03F] transition-colors">ABOUT</Link>
          <Link to="/gallery" onClick={() => setIsOpen(false)} className="hover:text-[#F4D03F] transition-colors">GALLERY</Link>
          <Link to="/training" onClick={() => setIsOpen(false)} className="hover:text-[#F4D03F] transition-colors">TRAINING</Link>
          <Link to="/products" onClick={() => setIsOpen(false)} className="hover:text-[#F4D03F] transition-colors">SHOP</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="hover:text-[#F4D03F] transition-colors">CONTACT</Link>
        </div>

        <div className="w-24 h-0.5 bg-[#F4D03F] mt-4 shadow-[0_0_10px_rgba(244,208,63,0.5)]"></div>

        <div className="flex flex-col items-center gap-6 mt-4 px-6 text-center">
          <div className="flex gap-8 text-4xl text-[#CBCCCB]">
            <a href="https://www.instagram.com/_tjp_mushroom_farming?igsh=MXBxdDNvc2g3eWU5dw==" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all"><FaInstagram /></a>
            <a href="https://wa.me/919500591897" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all"><FaWhatsapp /></a>
            <a href="https://www.facebook.com/share/1GQFU5GzGi/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all"><FaFacebookF /></a>
          </div>

          <div className="space-y-4">
            <a href="tel:9500591897" className="flex items-center justify-center gap-3 text-white font-black tracking-widest text-lg">
              <FaPhoneAlt className="text-[#F4D03F] text-sm" />
              +91 95005 91897
            </a>
            <div className="flex items-center justify-center gap-3 text-[#CBCCCB] font-bold tracking-wider text-sm">
              <FaMapMarkerAlt className="text-[#F4D03F]" />
              Pulimalaipatty, Madurai
            </div>
            <a href="mailto:jpfarming10@gmail.com" className="flex items-center justify-center gap-3 text-[#CBCCCB] font-bold tracking-wider text-sm">
              <FaEnvelope className="text-[#F4D03F]" />
              jpfarming10@gmail.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;