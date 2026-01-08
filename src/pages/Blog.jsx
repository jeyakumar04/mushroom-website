import React from 'react';
import { FaCalendarAlt, FaUser, FaArrowRight, FaSearch, FaTag } from 'react-icons/fa';
import Footer from '../Component/Footer';

const Blog = () => {
    const blogPosts = [
        {
            id: 1,
            title: "The Ultimate Guide to Growing Oyster Mushrooms at Home",
            excerpt: "Learn the step-by-step process of cultivating fresh, organic oyster mushrooms in your own space using simple materials.",
            image: "https://images.unsplash.com/photo-1594165560069-90134aed366b?auto=format&fit=crop&q=80&w=2069",
            date: "Oct 24, 2025",
            author: "Jeyakumar T.",
            category: "Cultivation Tips"
        },
        {
            id: 2,
            title: "5 Incredible Health Benefits of Including Mushrooms in Your Diet",
            excerpt: "From boosting immunity to being a rich source of Vitamin D, discover why mushrooms are considered a superfood.",
            image: "https://images.unsplash.com/photo-1512429234300-12eeb19a6d8d?auto=format&fit=crop&q=80&w=2072",
            date: "Nov 12, 2025",
            author: "Parthasarathy T.",
            category: "Nutrition"
        },
        {
            id: 3,
            title: "How Climate Control Revolutionizes Mushroom Farming",
            excerpt: "Explore the technology behind maintaining the perfect 'goldilocks zone' for mushroom growth throughout the year.",
            image: "https://images.unsplash.com/photo-1620121473177-3315904fc728?auto=format&fit=crop&q=80&w=2070",
            date: "Dec 05, 2025",
            author: "Jeyakumar T.",
            category: "Technology"
        },
        {
            id: 4,
            title: "Sustainable Agriculture: The TJP Farm Way",
            excerpt: "Our journey towards zero-waste farming and how we utilize agricultural waste to grow premium mushrooms.",
            image: "https://images.unsplash.com/photo-1592150621344-c792317530b1?auto=format&fit=crop&q=80&w=2070",
            date: "Jan 03, 2026",
            author: "Team TJP",
            category: "Sustainability"
        }
    ];

    const featuredPost = blogPosts[0];
    const recentPosts = blogPosts.slice(1);

    return (
        <div className="bg-[#022C22] min-h-screen font-sans text-white overflow-x-hidden">

            {/* 1. Hero Section */}
            <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1464454709131-ffd692591ee5?auto=format&fit=crop&q=80&w=2076"
                        alt="Mushroom Blog"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-tjp-dark/40 via-tjp-dark/80 to-tjp-dark border-b border-white/5"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-black mb-6 tracking-tighter uppercase">
                        Nature's <span className="text-tjp-gold">Journal</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto">
                        Insights, tips, and stories from the heart of our mushroom farm.
                    </p>
                </div>
            </section>

            {/* 2. Featured Post Section */}
            <section className="py-24 px-4 relative z-10 -mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="group relative overflow-hidden rounded-3xl lg:rounded-[40px] border border-white/10 shadow-2xl glass-card flex flex-col lg:flex-row">
                        <div className="lg:w-1/2 h-[300px] sm:h-[400px] lg:h-auto overflow-hidden">
                            <img
                                src={featuredPost.image}
                                alt={featuredPost.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="lg:w-1/2 p-8 md:p-14 flex flex-col justify-center">
                            <div className="flex items-center gap-4 text-tjp-gold font-bold text-xs uppercase tracking-[3px] mb-6">
                                <span className="px-3 py-1 bg-tjp-gold/10 rounded-full">{featuredPost.category}</span>
                                <span className="flex items-center gap-2"><FaCalendarAlt /> {featuredPost.date}</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight group-hover:text-tjp-gold transition-colors">
                                {featuredPost.title}
                            </h2>
                            <p className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed">
                                {featuredPost.excerpt}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-tjp-gold/20 flex items-center justify-center text-tjp-gold font-bold">
                                        {featuredPost.author[0]}
                                    </div>
                                    <span className="text-gray-300 font-medium">{featuredPost.author}</span>
                                </div>
                                <button className="flex items-center gap-3 text-tjp-gold font-bold hover:gap-5 transition-all">
                                    READ MORE <FaArrowRight />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Article Grid & Sidebar */}
            <section className="py-24 px-4 bg-tjp-dark/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                        {/* Main Feed */}
                        <div className="lg:col-span-8 space-y-12">
                            <h3 className="text-3xl font-black mb-12 flex items-center gap-4">
                                <div className="w-2 h-10 bg-tjp-gold rounded-full"></div>
                                RECENT ARTICLES
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {recentPosts.map((post) => (
                                    <div key={post.id} className="group glass-card rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300 flex flex-col">
                                        <div className="h-56 overflow-hidden relative">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-tjp-dark/80 backdrop-blur-md text-tjp-gold text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-tjp-gold/30">
                                                    {post.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-grow">
                                            <div className="flex items-center gap-4 text-gray-500 text-[11px] font-bold uppercase tracking-widest mb-4">
                                                <span className="flex items-center gap-1.5"><FaCalendarAlt /> {post.date}</span>
                                            </div>
                                            <h4 className="text-2xl font-bold mb-4 leading-snug group-hover:text-tjp-gold transition-colors">
                                                {post.title}
                                            </h4>
                                            <p className="text-gray-400 text-sm mb-8 leading-relaxed line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                                <span className="text-xs text-gray-500">By {post.author}</span>
                                                <button className="text-tjp-gold hover:text-white transition-colors">
                                                    <FaArrowRight />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-12 flex justify-center">
                                <button className="glass-button px-12 py-4">LOAD MORE POSTS</button>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-12">

                            {/* Search */}
                            <div className="glass-card p-8 rounded-3xl">
                                <h4 className="text-xl font-bold mb-6">Search Articles</h4>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Type something..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-tjp-gold transition-all"
                                    />
                                    <FaSearch className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="glass-card p-8 rounded-3xl">
                                <h4 className="text-xl font-bold mb-6">Categories</h4>
                                <div className="space-y-4">
                                    {['Cultivation Tips', 'Nutrition', 'Sustainability', 'Technology', 'Farm Life'].map((cat) => (
                                        <a key={cat} href="#" className="flex items-center justify-between group hover:text-tjp-gold transition-colors">
                                            <span className="flex items-center gap-3"><FaTag className="text-xs opacity-30" /> {cat}</span>
                                            <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs group-hover:bg-tjp-gold group-hover:text-tjp-dark font-bold">12</span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Newsletter */}
                            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-tjp-gold to-yellow-600 p-8 md:p-10 text-tjp-dark shadow-2xl">
                                <div className="relative z-10">
                                    <h4 className="text-2xl md:text-3xl font-black mb-4 tracking-tighter uppercase leading-none">Fresh updates to your inbox</h4>
                                    <p className="font-bold opacity-80 mb-8 text-sm md:text-base">Join 2,000+ mushroom lovers and get our weekly growing secrets.</p>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full bg-white/20 border border-white/30 rounded-2xl px-6 py-4 placeholder:text-tjp-dark/50 focus:outline-none focus:bg-white transition-all mb-4"
                                    />
                                    <button className="w-full bg-tjp-dark text-white font-black py-4 rounded-2xl hover:bg-black transition-colors">SUBSCRIBE</button>
                                </div>
                                {/* Decorative Glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full"></div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Blog;
