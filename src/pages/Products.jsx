import React, { useState } from 'react';
import { FaWhatsapp, FaLeaf, FaShoppingBasket, FaArrowRight, FaBoxOpen, FaCertificate } from 'react-icons/fa';
import Footer from '../Component/Footer';

const Products = () => {
    const products = [
        {
            id: 1,
            name: "Oyster Mushroom Spawn",
            price: 150,
            unit: "per packet",
            image: "https://images.unsplash.com/photo-1590483736622-39da8af75620?q=80&w=2127&auto=format&fit=crop",
            description: "High-yield, laboratory-grade spawn for premium oyster mushroom cultivation.",
            tag: "BEST SELLER"
        },
        {
            id: 2,
            name: "Milky Mushroom Spawn",
            price: 180,
            unit: "per packet",
            image: "https://images.unsplash.com/photo-1504624244670-393bc746bc4b?q=80&w=2070&auto=format&fit=crop",
            description: "Summer-variety spawn known for thick, fleshy stems and long shelf life.",
            tag: "PREMIUM"
        },
        {
            id: 3,
            name: "Fresh Oyster Mushrooms",
            price: 250,
            unit: "per kg",
            image: "https://images.unsplash.com/photo-1534123235357-91b582bb6e32?q=80&w=2070&auto=format&fit=crop",
            description: "Farm-fresh, organic oyster mushrooms harvested daily for peak nutrition.",
            tag: "FRESH"
        }
    ];

    const [isOrdering, setIsOrdering] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [orderData, setOrderData] = useState({
        name: '',
        qty: 1,
        address: '',
        phone: ''
    });

    const handleOrderClick = (product) => {
        setSelectedProduct(product);
        setIsOrdering(true);
    };

    const handleWhatsAppOrder = async (e) => {
        e.preventDefault();

        const totalPrice = selectedProduct.price * orderData.qty;

        const dbOrder = {
            customerName: orderData.name,
            contactNumber: orderData.phone,
            address: orderData.address,
            products: [{
                name: selectedProduct.name,
                quantity: orderData.qty,
                price: selectedProduct.price
            }],
            totalPrice: totalPrice
        };

        try {
            // Save to Atlas
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbOrder)
            });

            if (response.ok) {
                // Open WhatsApp
                const message = `🚀 *New Order from TJP Mushroom Farm*%0A%0A*Customer:* ${orderData.name}%0A*Product:* ${selectedProduct.name}%0A*Quantity:* ${orderData.qty}%0A*Total Amount:* ₹${totalPrice}%0A*Delivery Address:* ${orderData.address}%0A%0A_Please confirm my order!_`;
                window.open(`https://wa.me/919500591897?text=${message}`, '_blank');
                setIsOrdering(false);
                setOrderData({ name: '', qty: 1, address: '', phone: '' });
            }
        } catch (error) {
            alert("Connection error. Please try again.");
        }
    };

    return (
        <div className="bg-[#022C22] min-h-screen text-white pt-20">
            <main className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-20">
                    <h4 className="text-[#F4D03F] font-bold tracking-[0.4em] uppercase text-[10px] mb-4">Laboratory Grade Supply</h4>
                    <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
                        Premium <br /><span className="text-[#F4D03F]">Products</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="group glass-card rounded-[3rem] border border-white/10 overflow-hidden hover:border-[#F4D03F]/30 transition-all duration-500 shadow-2xl relative">
                            <div className="absolute top-6 right-6 z-20 bg-[#F4D03F] text-[#022C22] px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                                {product.tag}
                            </div>

                            <div className="h-[300px] overflow-hidden">
                                <img
                                    src={product.image}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={product.name}
                                />
                            </div>

                            <div className="p-10 space-y-6">
                                <h3 className="text-2xl font-black italic uppercase italic">{product.name}</h3>
                                <p className="text-[#CBCCCB] text-sm leading-relaxed opacity-70 italic">{product.description}</p>

                                <div className="flex items-end justify-between border-t border-white/5 pt-6">
                                    <div>
                                        <span className="text-3xl font-black text-[#F4D03F]">₹{product.price}</span>
                                        <span className="text-[10px] uppercase font-bold text-[#CBCCCB] ml-2 tracking-widest">{product.unit}</span>
                                    </div>
                                    <button
                                        onClick={() => handleOrderClick(product)}
                                        className="h-14 w-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-[#F4D03F] hover:text-[#022C22] transition-all duration-500 group"
                                    >
                                        <FaShoppingBasket className="text-xl group-hover:scale-110" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Training Ad */}
                <div className="mt-32 glass-card rounded-[4rem] border border-white/5 p-12 md:p-24 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F4D03F]/5 blur-[120px] rounded-full"></div>

                    <div className="flex-1 space-y-8 z-10">
                        <div className="flex items-center gap-4 text-[#F4D03F]">
                            <FaCertificate className="text-3xl" />
                            <span className="font-black tracking-[0.3em] uppercase text-xs">Certified Training</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                            Learn To Grow <br /> Like A <span className="text-[#F4D03F]">Professional</span>
                        </h2>
                        <ul className="space-y-4 text-lg font-bold text-[#CBCCCB]/80 italic">
                            <li className="flex items-center gap-3"><FaLeaf className="text-[#F4D03F]" /> Substrate Preparation Secrets</li>
                            <li className="flex items-center gap-3"><FaBoxOpen className="text-[#F4D03F]" /> Low-Cost Farming Techniques</li>
                            <li className="flex items-center gap-3"><FaArrowRight className="text-[#F4D03F]" /> Direct Market Connections</li>
                        </ul>
                    </div>
                </div>
            </main>

            {/* Order Modal */}
            {isOrdering && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsOrdering(false)}></div>
                    <div className="relative w-full max-w-xl bg-[#022C22] border border-[#F4D03F]/20 rounded-[3rem] p-10 md:p-14 shadow-[0_0_100px_rgba(244,208,63,0.15)] overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F4D03F]/40 to-transparent"></div>

                        <h2 className="text-3xl font-black italic uppercase italic text-center mb-10">
                            Confirm <span className="text-[#F4D03F]">Order</span>
                        </h2>

                        <form onSubmit={handleWhatsAppOrder} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Name</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-[#F4D03F] outline-none transition-all font-bold"
                                        value={orderData.name}
                                        onChange={(e) => setOrderData({ ...orderData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Phone</label>
                                    <input
                                        type="tel" required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-[#F4D03F] outline-none transition-all font-bold"
                                        value={orderData.phone}
                                        onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Quantity</label>
                                <input
                                    type="number" min="1" required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-[#F4D03F] outline-none transition-all font-bold"
                                    value={orderData.qty}
                                    onChange={(e) => setOrderData({ ...orderData, qty: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Delivery Address</label>
                                <textarea
                                    rows="3" required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-[#F4D03F] outline-none transition-all font-bold"
                                    value={orderData.address}
                                    onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full py-6 bg-[#F4D03F] text-[#022C22] font-black text-xl rounded-2xl flex items-center justify-center gap-4 hover:shadow-[0_0_50px_rgba(244,208,63,0.3)] transition-all uppercase italic">
                                <FaWhatsapp className="text-3xl" /> ORDER ON WHATSAPP
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Products;
