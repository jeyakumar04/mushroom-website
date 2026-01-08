import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../Component/Footer';
import { FaGraduationCap, FaCertificate, FaHandshake, FaArrowRight, FaMicroscope, FaChartLine, FaCloudSun } from 'react-icons/fa';

const Training = () => {
    // Professional High-Quality Hero Image (Agricultural Education)
    const trainingHero = "https://images.unsplash.com/photo-1592150621344-c792317530b1?auto=format&fit=crop&q=80&w=2070";

    return (
        <div className="bg-[#022C22] min-h-screen font-sans text-white overflow-x-hidden">

            {/* 1. Hero Section - Cinematic Upgrade */}
            <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={trainingHero}
                        alt="Mushroom Training"
                        className="w-full h-full object-cover scale-110 animate-pulse-slow opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-tjp-dark/40 to-[#022C22]"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    <div className="inline-block px-6 py-2 bg-tjp-gold/10 backdrop-blur-md border border-tjp-gold/30 rounded-full text-tjp-gold font-black text-xs tracking-[0.4em] mb-8 animate-reveal uppercase">
                        Educational Excellence
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.9] animate-reveal">
                        Empowering <br />
                        <span className="text-tjp-gold drop-shadow-[0_0_30px_rgba(255,215,0,0.4)]">Agri-preneurs</span>
                    </h1>
                    <div className="w-24 h-2 bg-tjp-gold mx-auto rounded-full shadow-[0_0_20px_rgba(255,215,0,0.6)] mb-10"></div>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium mb-12 animate-reveal-delayed">
                        Professional training programs certified by industry experts for sustainable, high-yield mushroom farming.
                    </p>
                    <button className="gold-button px-12 py-5 text-xl tracking-widest animate-reveal-delayed transform hover:scale-110 transition-transform">
                        DOWNLOAD CURRICULUM
                    </button>
                </div>
            </section>

            {/* 2. Core Pillars - Glassmorphism cards */}
            <section className="py-24 px-4 relative z-10 -mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {/* Pillar 1 */}
                        <div className="group bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl hover:border-tjp-gold/50 transition-all duration-700 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tjp-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-20 h-20 bg-tjp-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-tjp-gold text-4xl group-hover:bg-tjp-gold group-hover:text-black transition-all duration-500 scale-110">
                                <FaGraduationCap />
                            </div>
                            <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">Hands-on Learning</h3>
                            <p className="text-gray-400 leading-relaxed font-medium">Practical experience in our state-of-the-art, climate-controlled farm environment.</p>
                        </div>

                        {/* Pillar 2 */}
                        <div className="group bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl hover:border-tjp-gold/50 transition-all duration-700 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tjp-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-20 h-20 bg-tjp-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-tjp-gold text-4xl group-hover:bg-tjp-gold group-hover:text-black transition-all duration-500 scale-110">
                                <FaCertificate />
                            </div>
                            <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">Certification</h3>
                            <p className="text-gray-400 leading-relaxed font-medium">Receive formal industry-recognized certification upon completion of your program.</p>
                        </div>

                        {/* Pillar 3 */}
                        <div className="group bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl hover:border-tjp-gold/50 transition-all duration-700 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tjp-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-20 h-20 bg-tjp-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-tjp-gold text-4xl group-hover:bg-tjp-gold group-hover:text-black transition-all duration-500 scale-110">
                                <FaHandshake />
                            </div>
                            <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">Mentorship</h3>
                            <p className="text-gray-400 leading-relaxed font-medium">Direct one-on-one guidance from established farm owners and specialists.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Program Highlights */}
            <section className="py-24 px-4 bg-tjp-dark/30">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2">
                            <h2 className="text-tjp-gold text-sm tracking-[0.4em] uppercase font-black mb-4">Complete Curriculum</h2>
                            <h3 className="text-4xl md:text-6xl font-black text-white mb-10 tracking-tighter uppercase italic">Master the <span className="text-tjp-gold">Basics & Beyond</span></h3>

                            <div className="space-y-8">
                                {[
                                    { icon: <FaMicroscope />, title: "Substrate Science", desc: "Learn the chemistry of organic substrate preparation and sterilization." },
                                    { icon: <FaCloudSun />, title: "Climate Management", desc: "Master the technology behind humidity, CO2, and temperature control." },
                                    { icon: <FaChartLine />, title: "Business Strategy", desc: "Develop marketing and distribution plans for your local mushroom brand." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-6 group cursor-default">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-tjp-gold text-2xl group-hover:bg-tjp-gold group-hover:text-black transition-all duration-500 shrink-0">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-2 group-hover:text-tjp-gold transition-colors">{item.title}</h4>
                                            <p className="text-gray-400 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <div className="absolute inset-0 bg-tjp-gold blur-[100px] opacity-10 rounded-full animate-pulse-slow"></div>
                            <div className="relative glass-card p-4 rounded-[3rem] border border-white/10 transform -rotate-2 hover:rotate-0 transition-transform duration-700 shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1594165560069-90134aed366b?auto=format&fit=crop&q=80&w=2069"
                                    alt="Training Session"
                                    className="rounded-[2.5rem] w-full h-[500px] object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Enrollment CTA */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#064E3B] to-[#022C22] p-12 md:p-20 text-center border border-white/10 shadow-2xl group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-tjp-gold/10 blur-[100px] rounded-full -mr-48 -mt-48 transition-all group-hover:scale-125 duration-700"></div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter uppercase relative z-10 italic">Ready to start your <span className="text-tjp-gold underline decoration-tjp-gold/30">Journey?</span></h2>
                        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-medium relative z-10">Limited seats available for our next session. Book your spot today and become a certified mushroom farming expert.</p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                            <Link to="/booking" className="gold-button px-12 py-5 text-xl tracking-widest flex items-center justify-center gap-4">
                                JOIN NEXT BATCH <FaArrowRight />
                            </Link>
                            <a href="https://wa.me/919500591897" target="_blank" rel="noopener noreferrer" className="glass-button px-12 py-5 text-xl tracking-widest flex items-center justify-center">
                                CHAT WITH US
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Training;
