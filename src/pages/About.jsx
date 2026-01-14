import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaHeart, FaUsers, FaSeedling, FaAward, FaHandshake, FaCheckCircle } from 'react-icons/fa';
import Footer from '../Component/Footer';
import fssaiCert from '../assets/fssai.png';
import udyamCert from '../assets/udyam-cert.png';
import tnauCert from '../assets/tnau-cert.jpg';
import aboutHero from '../assets/mushroom2.png';
import mushroom2 from '../assets/mushroom2.png';
import agri1 from '../assets/agri_1.jpg'; // Placeholder - User needs to add this file
import agri2 from '../assets/agri_2.jpg'; // Placeholder - User needs to add this file
import agri3 from '../assets/agri_3.jpg'; // Placeholder - User needs to add this file

const About = () => {

    return (
        <div className="bg-[#022C22] min-h-screen font-sans text-white">

            {/* Hero Section with Professional Oyster Farming Image */}
            <section className="relative h-[85vh] min-h-[500px] overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src={aboutHero}
                        alt="TJP Oyster Mushroom Farm"
                        className="w-full h-full object-cover"
                    />
                    {/* Cinematic Overlay */}
                    <div className="absolute inset-0 bg-[#022C22]/70"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#022C22]"></div>
                </div>

                <div className="relative z-10 h-full flex items-center justify-start px-4 md:px-20 text-left">
                    <div className="max-w-6xl">
                        <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-black text-white mb-6 leading-tight tracking-tighter uppercase">
                            OUR <span className="text-tjp-gold drop-shadow-[0_0_30px_rgba(255,215,0,0.4)]">LEGACY</span> <br />
                            OF <span className="text-tjp-gold drop-shadow-[0_0_30px_rgba(255,215,0,0.4)]">PURITY</span>
                        </h1>
                        <div className="w-32 h-2 bg-tjp-gold rounded-full shadow-[0_0_20px_rgba(255,215,0,0.6)] mb-12"></div>
                        <p className="text-xl md:text-3xl lg:text-4xl text-[#CBCCCB] max-w-4xl leading-loose tracking-wide font-['Arima_Madurai'] drop-shadow-md">
                            "இயற்கையோடு இணைந்த சுவை, நாவிற்கு விருந்து, உடலிற்கு மருந்து!"
                        </p>

                        {/* Interactive Scroll Indicator */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                            <span className="text-tjp-gold text-[10px] uppercase tracking-[0.4em] mb-4 font-bold opacity-60">ESTABLISHED QUALITY</span>
                            <div className="w-0.5 h-12 bg-gradient-to-b from-tjp-gold to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-16 px-4 relative z-10 -mt-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">

                        {/* Left - Image/Visual */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-tjp-gold/20 blur-[100px] rounded-full"></div>
                            <div className="relative group overflow-hidden rounded-3xl border border-white/10">
                                <img
                                    src={mushroom2}
                                    alt="Fresh Oyster Mushrooms"
                                    className="w-full h-auto transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#022C22] via-transparent to-transparent opacity-60"></div>
                                <div className="absolute bottom-6 left-6">
                                    <div className="flex items-center gap-2 text-tjp-gold font-bold">
                                        <FaSeedling />
                                        <span>Grown with Love</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right - Content */}
                        <div>
                            <h2 className="text-tjp-gold text-sm tracking-widest uppercase font-bold mb-4">About Us</h2>
                            <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                                <span className="text-tjp-gold">Fresh & Healthy</span> Oyster Mushrooms
                            </h3>
                            <p className="text-[#CBCCCB] text-lg leading-relaxed mb-8 shadow-sm">
                                TJP Mushroom Farming is a trusted producer of fresh oyster mushrooms, grown using hygienic, eco-friendly, and sustainable farming practices. Our mushrooms are carefully cultivated to deliver great taste, high nutritional value, and consistent quality. Oyster mushrooms are naturally rich in protein, vitamins, minerals, and antioxidants, making them a healthy and affordable food choice for all age groups.
                            </p>

                            <div className="mb-8 p-6 bg-white/5 rounded-2xl border-l-4 border-tjp-gold">
                                <h4 className="text-tjp-gold text-xl font-bold mb-3 uppercase tracking-wider">Sustainable Oyster Mushroom Farming</h4>
                                <p className="text-[#CBCCCB] text-lg leading-relaxed">
                                    At TJP Mushroom Farming, we follow clean and sustainable mushroom cultivation methods to ensure food safety and environmental responsibility. Our farm-fresh oyster mushrooms support healthy eating habits and are ideal for households, hotels, restaurants, and local markets.
                                </p>
                            </div>

                            <div className="p-6 bg-white/5 rounded-2xl border-l-4 border-[#CBCCCB]">
                                <h4 className="text-white text-xl font-bold mb-3 uppercase tracking-wider">Our <span className="text-tjp-gold">Story</span></h4>
                                <p className="text-[#CBCCCB] text-lg leading-relaxed">
                                    TJP Mushroom Farming was founded by two brothers, <span className="text-white font-bold">Jeyakumar</span> (M.Sc. Computer Science) and <span className="text-white font-bold">Parthasarathy</span> (B.Sc. Computer Science). Though we come from a technical background, our passion for agriculture, organic food, and healthy living led us to build a reliable mushroom farming business focused on quality and sustainability.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24 px-4 bg-white/5 backdrop-blur-sm border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">

                        {/* Mission */}
                        <div className="bg-[#022C22] border border-[#CBCCCB]/20 rounded-3xl p-6 md:p-10 hover:border-tjp-gold/50 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-tjp-gold/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-tjp-gold/20 transition-colors">
                                <FaHeart className="text-3xl text-tjp-gold" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 uppercase tracking-tight">Our <span className="text-tjp-gold">Mission</span></h3>
                            <p className="text-[#CBCCCB] text-base md:text-lg leading-relaxed">
                                To provide 100% pure, chemical-free, and nutrient-rich mushrooms directly from our farm to your table by combining traditional farming with modern technology.</p>
                        </div>

                        {/* Vision */}
                        <div className="bg-[#022C22] border border-[#CBCCCB]/20 rounded-3xl p-6 md:p-10 hover:border-tjp-gold/50 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-tjp-gold/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-tjp-gold/20 transition-colors">
                                <FaSeedling className="text-3xl text-tjp-gold" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 uppercase tracking-tight">Our <span className="text-tjp-gold">Vision</span></h3>
                            <p className="text-[#CBCCCB] text-base md:text-lg leading-relaxed">
                                To become Tamil Nadu’s leading mushroom farm while empowering the next generation of agri-entrepreneurs through professional training and sustainable practices.                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">What We <span className="text-tjp-gold">Stand For</span></h2>
                        <div className="w-24 h-1 bg-tjp-gold mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

                        {/* Value 1 */}
                        <div className="bg-white/5 backdrop-blur-lg border border-[#CBCCCB]/20 rounded-2xl p-6 md:p-8 text-center hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-tjp-gold/10 rounded-full flex items-center justify-center mb-6">
                                <FaCheckCircle className="text-3xl md:text-4xl text-tjp-gold" />
                            </div>
                            <h4 className="text-xl md:text-2xl font-bold text-white mb-3">Quality First</h4>
                            <p className="text-[#CBCCCB] text-sm md:text-base leading-relaxed">
                                We maintain strict quality standards to ensure every mushroom is fresh, 100% organic, and packed with essential nutrients for your health.  </p>
                        </div>

                        {/* Value 2 */}
                        <div className="bg-white/5 backdrop-blur-lg border border-[#CBCCCB]/20 rounded-2xl p-6 md:p-8 text-center hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-tjp-gold/10 rounded-full flex items-center justify-center mb-6">
                                <FaLeaf className="text-3xl md:text-4xl text-tjp-gold" />
                            </div>
                            <h4 className="text-xl md:text-2xl font-bold text-white mb-3">Sustainability</h4>
                            <p className="text-[#CBCCCB] text-sm md:text-base leading-relaxed">
                                Our farming uses eco-friendly methods that minimize waste and maximize natural resources to protect our environment for future generations.        </p>
                        </div>

                        {/* Value 3 */}
                        <div className="bg-white/5 backdrop-blur-lg border border-[#CBCCCB]/20 rounded-2xl p-6 md:p-8 text-center hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-tjp-gold/10 rounded-full flex items-center justify-center mb-6">
                                <FaHandshake className="text-3xl md:text-4xl text-tjp-gold" />
                            </div>
                            <h4 className="text-xl md:text-2xl font-bold text-white mb-3">Community Focus</h4>
                            <p className="text-[#CBCCCB] text-sm md:text-base leading-relaxed">
                                We are dedicated to empowering local farmers and youth through professional training, helping our community grow together toward a healthier future..
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Certifications Section */}
            <section className="py-24 px-4 bg-[#022C22] relative border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tight">Certified & <span className="text-tjp-gold">Recognized</span></h2>
                        <div className="w-24 h-1 bg-tjp-gold mx-auto rounded-full mb-8"></div>
                        <p className="text-xl text-[#CBCCCB] max-w-2xl mx-auto font-medium">
                            Our commitment to quality and safety is validated by global standards and elite agricultural institutions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-stretch">

                        {/* TNAU */}
                        <div className="group relative bg-white/5 backdrop-blur-xl border border-[#CBCCCB]/30 rounded-3xl p-6 md:p-8 hover:border-tjp-gold/50 transition-all duration-500 shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-tjp-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative mb-6 md:mb-8 overflow-hidden rounded-xl border border-white/10">
                                <img src={tnauCert} alt="TNAU Training Certificate" className="w-full h-auto transform group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="relative">
                                <h4 className="text-xl md:text-2xl font-bold text-tjp-gold mb-2">TNAU Mastery</h4>
                                <p className="text-[#CBCCCB] text-xs md:text-sm leading-relaxed mb-4">
                                    Professionally certified in Mushroom Cultivation by Tamil Nadu Agricultural University.
                                </p>
                                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Issued to:</span>
                                    <span className="text-xs md:text-sm font-bold text-white">Mr. T. Parthasarathy</span>
                                </div>
                            </div>
                        </div>

                        {/* FSSAI */}
                        <div className="group relative bg-white/5 backdrop-blur-xl border border-[#CBCCCB]/30 rounded-3xl p-6 md:p-8 hover:border-tjp-gold/50 transition-all duration-500 shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-tjp-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative mb-6 md:mb-8 overflow-hidden rounded-xl border border-white/10">
                                <img src={fssaiCert} alt="FSSAI Registration" className="w-full h-auto transform group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="relative">
                                <h4 className="text-xl md:text-2xl font-bold text-tjp-gold mb-2">FSSAI Certified</h4>
                                <p className="text-[#CBCCCB] text-xs md:text-sm leading-relaxed mb-4">
                                    Strictly adhering to food safety and hygiene protocols for premium organic consumption.
                                </p>
                                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Reg No:</span>
                                    <span className="text-xs md:text-sm font-bold text-white">22425433000076</span>
                                </div>
                            </div>
                        </div>

                        {/* Udyam */}
                        <div className="group relative bg-white/5 backdrop-blur-xl border border-[#CBCCCB]/30 rounded-3xl p-6 md:p-8 hover:border-tjp-gold/50 transition-all duration-500 shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-tjp-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative mb-6 md:mb-8 overflow-hidden rounded-xl border border-white/10">
                                <img src={udyamCert} alt="Udyam Registration" className="w-full h-auto transform group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="relative">
                                <h4 className="text-xl md:text-2xl font-bold text-tjp-gold mb-2">MSME Verified</h4>
                                <p className="text-[#CBCCCB] text-xs md:text-sm leading-relaxed mb-4">
                                    Official Udyam registration, recognizing TJP Farms as a trusted small-scale industry leader.
                                </p>
                                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Category:</span>
                                    <span className="text-xs md:text-sm font-bold text-white">Small Industry</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* MEDIA RECOGNITION - AGRI DOCTOR */}
                    <div className="mt-24">
                        <div className="text-center mb-12">
                            <span className="text-tjp-gold text-sm tracking-[0.3em] uppercase font-bold bg-white/5 py-2 px-6 rounded-full border border-tjp-gold/20">Media Spotlight</span>
                            <h3 className="text-3xl md:text-4xl font-bold text-white mt-6 mb-4">Featured in <span className="text-green-400">Agri-Doctor</span></h3>
                            <p className="text-[#CBCCCB] max-w-2xl mx-auto">
                                Recognized for our innovative approach and success story in the August 2025 edition of Agri-Doctor magazine.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Article Page 1 */}
                            <div className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-tjp-gold/50 transition-all duration-500 shadow-2xl">
                                <img src={agri1} alt="Agri-Doctor Feature Page 1" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                                    <p className="text-white font-bold text-sm uppercase tracking-wider">Our Journey</p>
                                </div>
                            </div>

                            {/* Article Page 2 */}
                            <div className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-tjp-gold/50 transition-all duration-500 shadow-2xl">
                                <img src={agri2} alt="Agri-Doctor Feature Page 2" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                                    <p className="text-white font-bold text-sm uppercase tracking-wider">Cultivation Process</p>
                                </div>
                            </div>

                            {/* Article Page 3 */}
                            <div className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-tjp-gold/50 transition-all duration-500 shadow-2xl">
                                <img src={agri3} alt="Agri-Doctor Feature Page 3" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                                    <p className="text-white font-bold text-sm uppercase tracking-wider">Future Goals</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose TJP?</h2>
                        <div className="w-24 h-1 bg-tjp-gold mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

                        <div className="bg-[#022C22] border border-white/10 rounded-2xl p-6 hover:border-tjp-gold/50 transition-all">
                            <div className="text-tjp-gold text-4xl font-bold mb-2">100%</div>
                            <h4 className="text-white font-bold mb-2">Organic Purity</h4>
                            <p className="text-gray-400 text-sm">Grown using natural techniques with zero chemical pesticides or enhancers.</p>
                        </div>

                        <div className="bg-[#022C22] border border-white/10 rounded-2xl p-6 hover:border-tjp-gold/50 transition-all">
                            <div className="text-tjp-gold text-4xl font-bold mb-2">Fresh</div>
                            <h4 className="text-white font-bold mb-2">Daily Harvest</h4>
                            <p className="text-gray-400 text-sm">Picked and delivered within 24 hours</p>
                        </div>

                        <div className="bg-[#022C22] border border-white/10 rounded-2xl p-6 hover:border-tjp-gold/50 transition-all">
                            <div className="text-tjp-gold text-4xl font-bold mb-2">5★</div>
                            <h4 className="text-white font-bold mb-2">Premium Quality</h4>
                            <p className="text-gray-400 text-sm">Carefully inspected before packaging</p>
                        </div>

                        <div className="bg-[#022C22] border border-white/10 rounded-2xl p-6 hover:border-tjp-gold/50 transition-all">
                            <div className="text-tjp-gold text-4xl font-bold mb-2">24/7</div>
                            <h4 className="text-white font-bold mb-2">Support</h4>
                            <p className="text-gray-400 text-sm">We're here to help anytime you need</p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 px-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-tjp-gold/10 blur-[120px] rounded-full"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-6 md:p-12 text-center shadow-[0_0_50px_-10px_rgba(255,215,0,0.15)]">
                        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-tjp-gold/20 rounded-full flex items-center justify-center mb-6">
                            <FaUsers className="text-3xl md:text-4xl text-tjp-gold" />
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 uppercase tracking-tight">
                            Join the <span className="text-tjp-gold">TJP Family</span>
                        </h2>
                        <p className="text-lg md:text-xl text-[#CBCCCB] mb-8 max-w-2xl mx-auto leading-relaxed">
                            "Whether you want to order fresh mushrooms or learn the art of cultivation, we're here to support your journey." we're here to support your journey.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/products" className="px-10 py-4 bg-tjp-gold text-[#022C22] font-bold rounded-full text-lg shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] hover:scale-105 transition-all duration-300 w-full sm:w-auto flex items-center justify-center">
                                Order Now
                            </Link>
                            <Link to="/contact" className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold rounded-full text-lg hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 w-full sm:w-auto flex items-center justify-center">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
