import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaUser, FaArrowRight, FaSearch, FaTag } from 'react-icons/fa';
import Footer from '../Component/Footer';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 2. GET: Fetch all blogs for the Website
        // Use relative path for proxy support
        fetch('/api/blogs')
            .then(res => res.json())
            .then(data => {
                setBlogs(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load blogs", err);
                setLoading(false);
            });
    }, []);

    // Helper to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div style={{ backgroundColor: '#CBCCCB', minHeight: '100vh', paddingBottom: '40px' }} className="font-sans text-gray-800">

            {/* 1. Hero Section - Styled for #CBCCCB theme */}
            <div className="bg-[#333] text-white py-20 px-4 text-center mb-10">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-[#CBCCCB]">
                    Nature's <span className="text-tjp-gold">Journal</span>
                </h1>
                <p className="text-[#aaa] text-lg max-w-2xl mx-auto">
                    Fresh insights from TJP Mushroom Farm.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6">

                {/* 3. Article Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-gray-500 animate-pulse">Loading fresh content... 🍄</h2>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-gray-600">No blog posts found yet.</h2>
                        <p className="text-gray-500 mt-2">Check back later for fresh updates from the farm!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((post) => (
                            <div key={post._id} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full border border-gray-200">
                                <div className="h-56 overflow-hidden relative bg-gray-200">
                                    <img
                                        src={post.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200?text=TJP+Mushrooms'; }}
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-md text-indigo-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                                            {post.category || 'Updates'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-4 text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-3">
                                        <span className="flex items-center gap-1.5"><FaCalendarAlt /> {formatDate(post.date)}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-gray-800 leading-snug">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-3 flex-grow">
                                        {post.content.substring(0, 150)}...
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        <button className="text-indigo-600 font-bold text-sm uppercase flex items-center gap-2 hover:gap-3 transition-all">
                                            READ MORE <FaArrowRight />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-20">
                <Footer />
            </div>
        </div>
    );
};

export default Blog;
