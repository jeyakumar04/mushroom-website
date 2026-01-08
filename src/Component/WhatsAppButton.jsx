import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
    return (
        <a
            href="https://wa.me/919500591897"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.5)] hover:bg-[#128C7E] hover:scale-110 transition-all duration-300 flex items-center justify-center group animate-float-medium"
            aria-label="Chat on WhatsApp"
        >
            <FaWhatsapp className="text-3xl" />
            <span className="absolute right-full mr-3 bg-white text-black text-sm font-bold px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-max pointer-events-none shadow-lg">
                Order on WhatsApp
            </span>
        </a>
    );
};

export default WhatsAppButton;
