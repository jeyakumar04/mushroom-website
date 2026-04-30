import React, { useState } from 'react';
import { FaInstagram, FaLeaf, FaMicroscope, FaHandHoldingHeart, FaGraduationCap } from 'react-icons/fa';
import Footer from '../Component/Footer';

const Gallery = () => {
    const categories = ['All', 'Farming', 'Training', 'Harvest', 'Research'];
    const [activeCategory, setActiveCategory] = useState('All');

    const images = [
        {
            id: 1,
            url: '/assets/gallery/uploaded_image_0_1768417494350.jpg',
            title: 'TJP Mushroom Benefits Info',
            category: 'Research',
            icon: <FaHandHoldingHeart />
        },
        {
            id: 2,
            url: '/assets/gallery/uploaded_image_1_1768417494350.jpg',
            title: 'Fresh Mushroom Clusters',
            category: 'Harvest',
            icon: <FaLeaf />
        },
        {
            id: 3,
            url: '/assets/gallery/uploaded_image_2_1768417494350.jpg',
            title: 'Cultivation Bag Setup',
            category: 'Farming',
            icon: <FaMicroscope />
        },
        {
            id: 4,
            url: '/assets/gallery/uploaded_image_3_1768417494350.jpg',
            title: 'Vertical Farming Rows',
            category: 'Farming',
            icon: <FaLeaf />
        },
        {
            id: 5,
            url: '/assets/gallery/uploaded_image_4_1768417494350.png',
            title: 'Premium Oyster Harvest',
            category: 'Harvest',
            icon: <FaHandHoldingHeart />
        },
        // --- NEW TRAINING IMAGES ---
        {
            id: 6,
            url: '/assets/gallery/uploaded_image_0_1768417621406.jpg',
            title: 'Hands-on Substrate Prep',
            category: 'Training',
            icon: <FaGraduationCap />
        },
        {
            id: 7,
            url: '/assets/gallery/uploaded_image_1_1768417621406.png',
            title: 'TNAU Certification',
            category: 'Training',
            icon: <FaLeaf />
        },
        {
            id: 8,
            url: '/assets/gallery/uploaded_image_2_1768417621406.jpg',
            title: 'Student Demonstration',
            category: 'Training',
            icon: <FaMicroscope />
        },
        {
            id: 9,
            url: '/assets/gallery/uploaded_image_3_1768417621406.jpg',
            title: 'Training Group Photo',
            category: 'Training',
            icon: <FaHandHoldingHeart />
        },
        {
            id: 10,
            url: '/assets/gallery/uploaded_image_4_1768417621406.jpg',
            title: 'Classroom Explanation',
            category: 'Training',
            icon: <FaGraduationCap />
        },
        {
            id: 11,
            url: '/assets/gallery/uploaded_image_0_1768417790816.jpg',
            title: 'Rural Training Workshop',
            category: 'Training',
            icon: <FaGraduationCap />
        },
        {
            id: 12,
            url: '/assets/gallery/uploaded_image_1_1768417790816.jpg',
            title: 'Prepared Cultivation Bags',
            category: 'Farming',
            icon: <FaMicroscope />
        }
    ];

    const [selectedImg, setSelectedImg] = useState(null);

    const filteredImages = activeCategory === 'All'
        ? images
        : images.filter(img => img.category === activeCategory);

    return (
        <div className="bg-[#022C22] min-h-screen font-sans text-white pt-20">
            <main className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h4 className="text-[#F4D03F] font-bold tracking-[0.4em] uppercase text-xs mb-4">Glimpse of Excellence</h4>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
                        Our <span className="text-[#F4D03F]">Gallery</span>
                    </h1>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-300 border ${activeCategory === cat
                                ? 'bg-[#F4D03F] text-[#022C22] border-[#F4D03F]'
                                : 'text-[#CBCCCB] border-[#CBCCCB]/20 hover:border-[#F4D03F]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {filteredImages.map((img) => (
                        <div
                            key={img.id}
                            onClick={() => setSelectedImg(img)}
                            className="group relative h-[400px] rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 cursor-pointer"
                        >
                            {/* Image with overlay */}
                            <img
                                src={img.url}
                                alt={img.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                            />

                            {/* Glass Content Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#022C22] via-transparent to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-70"></div>

                            <div className="absolute bottom-0 left-0 right-0 p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex items-center gap-3 text-[#F4D03F] mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                                    <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/20 flex items-center justify-center border border-[#F4D03F]/30 backdrop-blur-md">
                                        {img.icon}
                                    </div>
                                    <span className="font-bold uppercase tracking-widest text-[10px]">{img.category}</span>
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                                    {img.title}
                                </h3>
                            </div>

                            {/* Corner Accent */}
                            <div className="absolute top-8 right-8 w-12 h-12 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-[#F4D03F] hover:text-[#022C22]">
                                <FaInstagram />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#F4D03F]/10 blur-[100px] rounded-full"></div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-black mb-8 uppercase italic tracking-tighter">
                            Witness Our <span className="text-[#F4D03F]">Growth Journey</span>
                        </h2>
                        <a
                            href="https://www.instagram.com/_tjp_mushroom_farming?igsh=MXBxdDNvc2g3eWU5dw=="
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-4 bg-[#F4D03F] text-[#022C22] px-12 py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_15px_40px_-5px_rgba(244,208,63,0.3)] group"
                        >
                            Visit Instagram <FaInstagram className="text-2xl group-hover:rotate-12 transition-transform" />
                        </a>
                    </div>
                </div>
            </main>

            {/* FULL IMAGE MODAL */}
            {selectedImg && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10 animate-fade-in"
                    onClick={() => setSelectedImg(null)}
                >
                    <button
                        className="absolute top-10 right-10 text-white/50 hover:text-tjp-gold text-4xl font-light transition-colors z-[110]"
                        onClick={() => setSelectedImg(null)}
                    >
                        &times;
                    </button>

                    <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6" onClick={e => e.stopPropagation()}>
                        <img
                            src={selectedImg.url}
                            alt={selectedImg.title}
                            className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-scale-up"
                        />
                        <div className="text-center">
                            <h2 className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
                                {selectedImg.title}
                            </h2>
                            <p className="text-[#F4D03F] uppercase tracking-[0.4em] text-xs font-bold mt-2">
                                {selectedImg.category}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Gallery;
