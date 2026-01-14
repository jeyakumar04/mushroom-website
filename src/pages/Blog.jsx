import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaArrowRight, FaClock, FaTags } from 'react-icons/fa';
import Footer from '../Component/Footer';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="min-h-screen bg-[#CBCCCB] font-sans">
            {/* HERO SECTION - REFINED */}
            <div className="relative h-[400px] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-[#CBCCCB]"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-2xl">
                        Nature <span className="text-green-500">Journal</span>
                    </h1>
                    <div className="h-1.5 w-32 bg-green-500 mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-300 text-lg md:text-xl font-bold uppercase tracking-widest max-w-2xl mx-auto">
                        Latest Insights & Farm Updates from TJP
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-20 pb-20">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/20 backdrop-blur-xl rounded-[40px] border border-white/30 shadow-2xl">
                        <div className="w-20 h-20 border-8 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-6"></div>
                        <h2 className="text-2xl font-black text-gray-800 uppercase animate-pulse">Growing content...</h2>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="bg-white/30 backdrop-blur-xl rounded-[40px] p-20 text-center border border-white/30 shadow-2xl">
                        <div className="text-8xl mb-6">🍄</div>
                        <h2 className="text-3xl font-black text-gray-800 uppercase mb-2">The spores are still settling</h2>
                        <p className="text-gray-600 font-bold">No articles published yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {blogs.map((post) => (
                            <div key={post._id} className="group bg-white/40 backdrop-blur-md rounded-[35px] overflow-hidden border border-white/40 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 flex flex-col h-full">
                                {/* Image Container */}
                                <div className="h-64 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all z-10"></div>
                                    <img
                                        src={post.image || 'https://images.unsplash.com/photo-1591261730799-ee4e6c2d16d7?auto=format&fit=crop&q=80&w=800'}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1591261730799-ee4e6c2d16d7?auto=format&fit=crop&q=80&w=800'; }}
                                    />
                                    <div className="absolute top-6 left-6 z-20">
                                        <span className="bg-green-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full shadow-lg">
                                            {post.category || 'Updates'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-6 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">
                                        <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg font-bold"><FaCalendarAlt className="text-green-600" /> {formatDate(post.date)}</span>
                                        <span className="flex items-center gap-2"><FaClock className="text-indigo-500" /> 5 Min Read</span>
                                    </div>

                                    <h3 className="text-2xl font-black mb-4 text-gray-900 leading-[1.2] group-hover:text-green-700 transition-colors">
                                        {post.title}
                                    </h3>

                                    <p className="text-gray-700 font-medium text-base mb-8 leading-relaxed line-clamp-3 overflow-hidden text-ellipsis flex-grow">
                                        {post.content}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-gray-200/50 flex items-center justify-between">
                                        <button className="flex items-center gap-3 text-sm font-black text-indigo-600 uppercase tracking-tighter hover:gap-5 transition-all group/btn">
                                            Full Story <FaArrowRight className="text-xs transition-transform group-hover/btn:translate-x-1" />
                                        </button>
                                        <div className="flex gap-2">
                                            <FaTags className="text-gray-300 text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Blog;
