import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSync, FaPenNib, FaBookOpen, FaPlusCircle, FaTimes } from 'react-icons/fa';

const AdminBlog = () => {
    const [blog, setBlog] = useState({ title: '', content: '', image: '', category: 'Growing Tips' });
    const [customCategory, setCustomCategory] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/blogs');
            const data = await res.json();
            setBlogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const resetForm = () => {
        setBlog({ title: '', content: '', image: '', category: 'Growing Tips' });
        setCustomCategory('');
        setIsEditing(false);
        setEditId(null);
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        const finalCategory = blog.category === 'New Category...' ? customCategory : blog.category;
        if (!finalCategory) return alert("Please enter a category!");
        const payload = { ...blog, category: finalCategory };

        try {
            let res;
            const token = localStorage.getItem('adminToken');
            if (isEditing) {
                res = await fetch(`/api/edit/blogs/${editId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('/api/blogs/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                alert(isEditing ? "Blog Updated Successfully! ✅" : "Blog Post Success! 🍄");
                resetForm();
                fetchBlogs();
            } else {
                alert("Operation failed.");
            }
        } catch (error) {
            console.error("Error saving blog:", error);
            alert("Error saving blog.");
        }
    };

    const handleEdit = (item) => {
        setBlog({ title: item.title, content: item.content, image: item.image, category: item.category });
        const defaultCategories = ['Growing Tips', 'Health Benefits', 'TJP Updates'];
        if (!defaultCategories.includes(item.category)) {
            setBlog(prev => ({ ...prev, category: 'New Category...' }));
            setCustomCategory(item.category);
        } else {
            setBlog(prev => ({ ...prev, category: item.category }));
        }
        setIsEditing(true);
        setEditId(item._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this blog?")) return;
        try {
            const res = await fetch(`/api/delete/blogs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (res.ok) {
                alert("Blog Deleted! 🗑️");
                fetchBlogs();
                if (editId === id) resetForm();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-[#CBCCCB] py-12 px-4 md:px-8 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Header Area */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-gray-900 p-8 rounded-[30px] shadow-2xl">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Blog <span className="text-green-500">Editor</span></h1>
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-2 px-1">TJP Content Management System</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={fetchBlogs} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all">
                            <FaSync className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* FORM SECTION - GLASS */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-8 md:p-10 rounded-[40px] shadow-2xl h-fit">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-800 uppercase flex items-center gap-3">
                                {isEditing ? <FaPenNib className="text-orange-500" /> : <FaPlusCircle className="text-green-600" />}
                                {isEditing ? 'Edit Post' : 'Compose Post'}
                            </h2>
                            {isEditing && (
                                <button onClick={resetForm} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-gray-700 transition-all">
                                    <FaTimes /> Cancel
                                </button>
                            )}
                        </div>

                        <form onSubmit={handlePublish} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 block mb-2 px-1">Post Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter catching title..."
                                    value={blog.title}
                                    onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                                    required
                                    className="w-full bg-white/60 border-2 border-white/20 rounded-2xl px-6 py-4 font-black text-gray-800 focus:border-green-500 outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-2 px-1">Category</label>
                                    <select
                                        value={blog.category}
                                        onChange={(e) => setBlog({ ...blog, category: e.target.value })}
                                        className="w-full bg-white/60 border-2 border-white/20 rounded-2xl px-6 py-4 font-black text-gray-800 focus:border-green-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="Growing Tips">Growing Tips</option>
                                        <option value="Health Benefits">Health Benefits</option>
                                        <option value="TJP Updates">TJP Updates</option>
                                        <option value="New Category...">+ Add New Category</option>
                                    </select>
                                </div>
                                {blog.category === 'New Category...' && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-500 block mb-2 px-1">New Category Name</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Harvesting"
                                            value={customCategory}
                                            onChange={(e) => setCustomCategory(e.target.value)}
                                            required
                                            className="w-full bg-white/60 border-2 border-white/20 rounded-2xl px-6 py-4 font-black text-gray-800 focus:border-green-500 outline-none transition-all"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 block mb-2 px-1">Featured Image</label>
                                <div className="flex flex-col md:flex-row gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Paste Image URL"
                                        value={blog.image}
                                        onChange={(e) => setBlog({ ...blog, image: e.target.value })}
                                        className="flex-1 bg-white/60 border-2 border-white/20 rounded-2xl px-6 py-4 font-black text-gray-800 focus:border-green-500 outline-none transition-all placeholder:text-gray-300"
                                    />
                                    <label className="cursor-pointer bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
                                        <FaPlusCircle /> Upload Image
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;

                                                const formData = new FormData();
                                                formData.append('image', file);

                                                try {
                                                    const res = await fetch('/api/upload', {
                                                        method: 'POST',
                                                        body: formData
                                                    });
                                                    const data = await res.json();
                                                    if (data.url) {
                                                        setBlog({ ...blog, image: data.url });
                                                    }
                                                } catch (err) {
                                                    alert("Upload failed");
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            {blog.image && (
                                <div className="relative group rounded-[25px] overflow-hidden shadow-xl">
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs font-black uppercase">Live Preview</p>
                                    </div>
                                    <img
                                        src={blog.image}
                                        alt="Preview"
                                        className="w-full h-48 object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; alert("Invalid Image URL"); }}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 block mb-2 px-1">Blog Content</label>
                                <textarea
                                    rows="8"
                                    placeholder="Write your story here..."
                                    value={blog.content}
                                    onChange={(e) => setBlog({ ...blog, content: e.target.value })}
                                    required
                                    className="w-full bg-white/60 border-2 border-white/20 rounded-2xl px-6 py-4 font-medium text-gray-800 focus:border-green-500 outline-none transition-all placeholder:text-gray-300 leading-relaxed"
                                />
                            </div>

                            <button
                                type="submit"
                                className={`w-full py-6 rounded-[20px] font-black text-lg uppercase tracking-tighter shadow-xl hover:shadow-2xl active:scale-95 transition-all
                                    ${isEditing ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                                {isEditing ? 'Update & Sync 💾' : 'Publish to Feed 🚀'}
                            </button>
                        </form>
                    </div>

                    {/* LIST SECTION - GLASS */}
                    <div className="bg-white/20 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-[40px] shadow-xl flex flex-col h-[800px]">
                        <div className="flex items-center justify-between mb-8 border-b border-white/20 pb-6">
                            <h3 className="text-2xl font-black text-gray-800 uppercase flex items-center gap-3">
                                <FaBookOpen className="text-indigo-600" /> Catalog ({blogs.length})
                            </h3>
                        </div>

                        <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {blogs.length === 0 ? (
                                <div className="text-center py-20 bg-white/10 rounded-3xl border border-dashed border-white/30">
                                    <p className="text-gray-500 font-black uppercase text-xs">No blogs found.</p>
                                </div>
                            ) : (
                                blogs.map((item) => (
                                    <div key={item._id} className="group flex items-center gap-4 bg-white/60 p-5 rounded-[25px] border border-white/40 hover:bg-white transition-all hover:shadow-lg">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0">
                                            <img
                                                src={item.image || 'https://via.placeholder.com/150'}
                                                alt="thumb"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-gray-900 truncate mb-1 uppercase text-sm tracking-tight">{item.title}</h4>
                                            <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">
                                                {item.category}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button onClick={() => handleEdit(item)} className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(item._id)} className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBlog;