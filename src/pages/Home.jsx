import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaHeartbeat, FaSeedling, FaArrowRight, FaTemperatureHigh, FaWater, FaSun, FaStar, FaLayerGroup } from 'react-icons/fa';
import heroImage from '../assets/home-hero.png';
import Footer from '../Component/Footer';

const Home = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffset(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#022C22] min-h-screen font-sans text-white overflow-x-hidden">

      {/* 1. Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Parallax Background */}
        <div
          className="absolute inset-0 z-0"
          style={{ transform: `translateY(${offset * 0.5}px)` }}
        >
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <img src={heroImage} alt="Mushroom Farm Hero" className="w-full h-full object-cover" />
        </div>

        <div className="z-20 relative px-4 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="mb-8 w-40 h-40 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-tjp-gold p-4 shadow-[0_0_50px_rgba(255,215,0,0.3)] animate-float">
            <img src="/logo.png" alt="TJP Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-white mb-6 tracking-tighter filter drop-shadow-2xl">
            TJP <span className="text-tjp-gold uppercase italic">Mushrooms</span>
          </h1>
          <div className="inline-block bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-12 max-w-2xl animate-float-medium">
            <p className="text-xl md:text-3xl text-[#CBCCCB] font-['Kavivanar'] leading-loose tracking-wide">
              "இயற்கையோடு இணைந்த சுவை, நாவிற்கு விருந்து, உடலிற்கு மருந்து!"
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/products" className="px-12 py-5 bg-tjp-gold text-[#01221a] font-black rounded-full text-xl shadow-[0_0_30px_rgba(255,215,0,0.4)] hover:scale-105 transition-all duration-300 uppercase tracking-widest">
              Order Fresh
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-tjp-gold rounded-full animate-ping"></div>
          </div>
        </div>
      </section>

      {/* 2. Nutritional Powerhouse (Moved Up) */}
      {/* 2. Nutritional Powerhouse (Moved Up) */}
      <section className="relative z-30 pt-10 pb-20 px-4 bg-[#022C22]">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-white/40 text-center text-xs uppercase tracking-[0.3em] mb-10 font-black">Nutritional Powerhouse</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">

            {/* Benefit Card 1 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-all duration-500 shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)] group cursor-pointer hover:-translate-y-1">
              <div className="w-14 h-14 bg-tjp-gold/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-tjp-gold group-hover:text-black transition-all duration-500 scale-110 shadow-lg">
                <span className="text-2xl font-black">3g</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1 group-hover:text-tjp-gold transition-colors">Protein</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Per 100g serving</p>
            </div>

            {/* Benefit Card 2 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-all duration-500 shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)] group cursor-pointer hover:-translate-y-1">
              <div className="w-14 h-14 bg-tjp-gold/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-tjp-gold group-hover:text-black transition-all duration-500 scale-110 shadow-lg">
                <FaHeartbeat className="text-2xl" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1 group-hover:text-tjp-gold transition-colors">Low Calorie</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Only 33 Calories</p>
            </div>

            {/* Benefit Card 3 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-all duration-500 shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)] group cursor-pointer hover:-translate-y-1">
              <div className="w-14 h-14 bg-tjp-gold/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-tjp-gold group-hover:text-black transition-all duration-500 scale-110 shadow-lg">
                <span className="text-2xl font-black">B</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1 group-hover:text-tjp-gold transition-colors">Vitamins</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Rich in B3 & B5</p>
            </div>

            {/* Benefit Card 4 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-all duration-500 shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)] group cursor-pointer hover:-translate-y-1">
              <div className="w-14 h-14 bg-tjp-gold/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-tjp-gold group-hover:text-black transition-all duration-500 scale-110 shadow-lg">
                <FaLeaf className="text-2xl" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1 group-hover:text-tjp-gold transition-colors">Fiber</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">High Dietary Fiber</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Fresh From Our Farm (Product Preview) - Cinematic Upgrade */}
      <section className="py-24 relative overflow-hidden bg-[#022C22]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tjp-gold/5 blur-[120px] rounded-full z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-tjp-gold/5 blur-[120px] rounded-full z-0 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10 px-4">
          <h2 className="text-tjp-gold text-sm tracking-[0.4em] uppercase font-black mb-4">The Daily Harvest</h2>
          <h3 className="text-4xl md:text-5xl font-black text-white mb-12 tracking-tighter uppercase italic">Fresh From <span className="text-tjp-gold">Our Farm</span></h3>

          <div className="flex flex-wrap justify-center gap-8 mb-16">
            {/* Product 1 */}
            <div className="group relative glass-card rounded-[2.5rem] border border-white/10 w-full md:w-80 shadow-2xl p-6 transition-all duration-700 hover:border-tjp-gold/40 hover:-translate-y-2 text-left overflow-hidden">
              <div className="h-56 bg-white/5 rounded-3xl mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1a4a3e] to-transparent flex items-center justify-center">
                  <FaSeedling className="text-7xl text-white/10 group-hover:scale-125 group-hover:text-tjp-gold/20 transition-all duration-700" />
                </div>
                <div className="absolute top-4 right-4 bg-tjp-gold text-[#022C22] text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">HOT ITEM</div>
              </div>
              <h4 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-tjp-gold transition-colors">OYSTER MUSHROOM</h4>
              <p className="text-gray-400 text-sm mb-6 font-medium leading-relaxed">200g Pack - Organic & Chemical-free Daily harvest.</p>
              <div className="flex items-center justify-between border-t border-white/5 pt-6">
                <span className="text-3xl font-black text-white tracking-tighter">₹50<span className="text-sm font-bold text-gray-500 ml-1">/PKT</span></span>
                <Link to="/products" className="bg-tjp-gold/10 hover:bg-tjp-gold hover:text-black text-tjp-gold p-4 rounded-2xl transition-all duration-500 shadow-xl group-hover:rotate-12">
                  <FaArrowRight className="text-xl" />
                </Link>
              </div>
            </div>

            {/* Product 2 */}
            <div className="group relative glass-card rounded-[2.5rem] border border-white/10 w-full md:w-80 shadow-2xl p-6 transition-all duration-700 hover:border-tjp-gold/40 hover:-translate-y-2 text-left overflow-hidden">
              <div className="h-56 bg-white/5 rounded-3xl mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1a4a3e] to-transparent flex items-center justify-center">
                  <FaSun className="text-7xl text-white/10 group-hover:scale-125 group-hover:text-tjp-gold/20 transition-all duration-700" />
                </div>
              </div>
              <h4 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-tjp-gold transition-colors">BULK PACK</h4>
              <p className="text-gray-400 text-sm mb-6 font-medium leading-relaxed">1kg Wholesale Pack - Ideal for restaurants & chefs.</p>
              <div className="flex items-center justify-between border-t border-white/5 pt-6">
                <span className="text-3xl font-black text-white tracking-tighter">₹250<span className="text-sm font-bold text-gray-500 ml-1">/KG</span></span>
                <Link to="/products" className="bg-tjp-gold/10 hover:bg-tjp-gold hover:text-black text-tjp-gold p-4 rounded-2xl transition-all duration-500 shadow-xl group-hover:rotate-12">
                  <FaArrowRight className="text-xl" />
                </Link>
              </div>
            </div>
          </div>

          <Link to="/products" className="gold-button px-14 py-5 text-xl tracking-widest inline-block">
            EXPLORE OUR SHOP
          </Link>
        </div>
      </section>

      {/* 4. About TJP Farms - Keep Middle */}
      <section className="py-24 px-4 md:px-12 bg-[#022C22] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <h2 className="text-tjp-gold text-lg tracking-widest uppercase font-bold mb-3">About TJP Mushroom Farming –</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              Fresh Oyster Mushrooms <br />  Pulimalaipatty, Melur
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              TJP Mushroom Farming is a trusted producer of fresh oyster mushrooms in Pulimalaipatty, Melur, Madurai, dedicated to growing high-quality, chemical-free mushrooms using sustainable farming practices.
              <br /><br />
              Founded by two brothers, <span className="text-white font-bold">Jeyakumar</span> (M.Sc. CS) and <span className="text-white font-bold">Parthasarathy</span> (B.Sc. CS), we combine technical precision with a passion for organic excellence to deliver the freshest harvest directly to your doorstep.
            </p>

            <div className="flex gap-8">
              <div className="text-center">
                <h4 className="text-3xl font-bold text-tjp-gold mb-1">100%</h4>
                <p className="text-sm text-gray-400 uppercase tracking-wider">Organic</p>
              </div>
              <div className="text-center">
                <h4 className="text-3xl font-bold text-tjp-gold mb-1">Daily</h4>
                <p className="text-sm text-gray-400 uppercase tracking-wider">Harvest</p>
              </div>
              <div className="text-center">
                <h4 className="text-3xl font-bold text-tjp-gold mb-1">5★</h4>
                <p className="text-sm text-gray-400 uppercase tracking-wider">Quality</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute inset-0 bg-tjp-gold blur-[80px] opacity-10 rounded-full"></div>
            <div className="relative bg-white/5 border border-white/10 p-2 rounded-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
              {/* Placeholder for About Image - Using gradient for now if no image */}
              <div className="h-[300px] md:h-[400px] w-full bg-gradient-to-br from-[#1a4a3e] to-[#022C22] rounded-xl flex items-center justify-center overflow-hidden">
                <FaSeedling className="text-9xl text-white/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Our Farming Process - Premium Re-imagining */}
      <section className="py-24 bg-[#022C22] relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-tjp-gold/5 via-transparent to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-12 text-center relative z-10">
          <h2 className="text-tjp-gold text-sm tracking-[0.4em] uppercase font-black mb-4">The Purity Path</h2>
          <h3 className="text-4xl md:text-6xl font-black text-white mb-20 tracking-tighter uppercase italic">Our Farming <span className="text-tjp-gold">Process</span></h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* Step 1 */}
            <div className="relative p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-tjp-gold/50 transition-all duration-700 group flex flex-col items-center overflow-hidden">
              <div className="absolute -top-10 -right-10 text-[10rem] font-black text-white/[0.03] pointer-events-none group-hover:text-tjp-gold/[0.05] transition-colors duration-700">01</div>
              <div className="w-24 h-24 mb-8 bg-gradient-to-br from-tjp-gold/20 to-transparent rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                <FaWater className="text-4xl text-tjp-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
              </div>
              <h4 className="text-2xl font-black text-white mb-6 tracking-tight group-hover:text-tjp-gold transition-colors">STERILIZATION</h4>
              <p className="text-gray-400 text-base leading-relaxed font-medium">
                We use a specialized pH-balancing process to naturally purify our substrate, creating an environment where only premium mycelium thrives without chemical interference.
              </p>
              {/* Decorative Glow */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tjp-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </div>

            {/* Step 2 */}
            <div className="relative p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-tjp-gold/50 transition-all duration-700 group flex flex-col items-center overflow-hidden">
              <div className="absolute -top-10 -right-10 text-[10rem] font-black text-white/[0.03] pointer-events-none group-hover:text-tjp-gold/[0.05] transition-colors duration-700">02</div>
              <div className="w-24 h-24 mb-8 bg-gradient-to-br from-tjp-gold/20 to-transparent rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                <FaTemperatureHigh className="text-4xl text-tjp-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
              </div>
              <h4 className="text-2xl font-black text-white mb-6 tracking-tight group-hover:text-tjp-gold transition-colors">DRYING</h4>
              <p className="text-gray-400 text-base leading-relaxed font-medium">
                Our substrate undergoes a precision hydration cycle to reach the 'Goldilocks zone' of 65% humidity—ideally damp for robust root development.
              </p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tjp-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </div>

            {/* Step 3 */}
            <div className="relative p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-tjp-gold/50 transition-all duration-700 group flex flex-col items-center overflow-hidden">
              <div className="absolute -top-10 -right-10 text-[10rem] font-black text-white/[0.03] pointer-events-none group-hover:text-tjp-gold/[0.05] transition-colors duration-700">03</div>
              <div className="w-24 h-24 mb-8 bg-gradient-to-br from-tjp-gold/20 to-transparent rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                <FaLayerGroup className="text-4xl text-tjp-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
              </div>
              <h4 className="text-2xl font-black text-white mb-6 tracking-tight group-hover:text-tjp-gold transition-colors">PREPARATION</h4>
              <p className="text-gray-400 text-base leading-relaxed font-medium">
                Substrate is hand-layered into specialized beds and inoculated with premium spawn, ensuring total colonization for a denser, more flavorful harvest.
              </p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tjp-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Master the Art (Training) - Keep Near End */}
      <section className="py-24 px-4 relative flex justify-center bg-[#022C22]">
        {/* Background Glow for this section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-tjp-gold/10 blur-[120px] rounded-full z-0"></div>

        <div className="relative z-10 max-w-5xl w-full">
          <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/20 p-8 md:p-14 text-center shadow-[0_0_50px_-10px_rgba(255,215,0,0.15)] group hover:shadow-[0_0_80px_-5px_rgba(255,215,0,0.3)] transition-shadow duration-500">

            {/* Animated Border Gradient */}
            <div className="absolute inset-0 p-[2px] rounded-3xl bg-gradient-to-r from-transparent via-tjp-gold/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 mask-linear-gradient"></div>

            <div className="relative z-20 flex flex-col items-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-tjp-gold to-yellow-600 p-[2px] shadow-2xl animate-pulse-slow">
                <div className="w-full h-full bg-[#022C22] rounded-full flex items-center justify-center">
                  <FaSeedling className="text-4xl text-tjp-gold" />
                </div>
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Master the Art of <span className="text-tjp-gold">Mushroom Farming</span>
              </h2>

              <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
                Join our exclusive hands-on training program. Learn sustainable cultivation techniques, climate control secrets, and business strategies from the experts at TJP Farms.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center w-full">
                <Link to="/booking" className="px-10 py-4 bg-gradient-to-r from-tjp-gold to-yellow-500 text-[#022C22] font-bold rounded-full text-lg shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                  ENROLL IN TRAINING <FaArrowRight className="text-sm" />
                </Link>
                <Link to="/contact" className="px-10 py-4 bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold rounded-full text-lg hover:bg-white hover:text-[#022C22] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                  CONTACT US
                </Link>
              </div>
            </div>

            {/* Decorative Shimmer */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
          </div>
        </div>
      </section>

      {/* 7. What Our Customers Say - Keep Near End */}
      <section className="py-24 bg-[#022C22] relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-tjp-gold/5 blur-[80px] rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-tjp-gold/5 blur-[80px] rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">What Our Customers Say</h2>
            <div className="w-24 h-1 bg-tjp-gold mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Review 1 - Professional Chef (Float Medium) */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300 animate-float-medium shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <div className="flex gap-1 text-[#F4D03F] mb-4 text-lg">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="text-[#CBCCCB] text-lg leading-relaxed mb-6 italic">
                "Freshness is top-notch! The oyster mushrooms stayed firm and flavorful for days. Best in the city!"
              </p>
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-white font-bold text-lg">Arun</h4>
                <p className="text-tjp-gold text-sm">Professional Chef</p>
              </div>
            </div>

            {/* Review 2 - Agri-Entrepreneur (Float Slow) */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300 animate-float-slow shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <div className="flex gap-1 text-[#F4D03F] mb-4 text-lg">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="text-[#CBCCCB] text-lg leading-relaxed mb-6 italic">
                "The training at TJP Farm gave me the confidence to start my own home setup. Exceptional guidance!"
              </p>
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-white font-bold text-lg">Priya</h4>
                <p className="text-tjp-gold text-sm">Agri-Entrepreneur</p>
              </div>
            </div>

            {/* Review 3 - Health Enthusiast (Float Fast) */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300 animate-float-fast shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <div className="flex gap-1 text-[#F4D03F] mb-4 text-lg">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="text-[#CBCCCB] text-lg leading-relaxed mb-6 italic">
                "Super fast delivery and very hygienic packaging. TJP has become my go-to for organic mushrooms."
              </p>
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-white font-bold text-lg">Vikram</h4>
                <p className="text-tjp-gold text-sm">Health Enthusiast</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Visit Our Shop / Footer - Final Call to Action */}
      <Footer />
    </div >
  );
};

export default Home;