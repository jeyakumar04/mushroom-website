import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSync } from 'react-icons/fa';

const AdminBlog = () => {
    const [blog, setBlog] = useState({ title: '', content: '', image: '', category: 'Growing Tips' });
    const [customCategory, setCustomCategory] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch existing blogs
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
            if (isEditing) {
                // Update existing
                res = await fetch(`/api/edit/blogs/${editId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                // Create new
                res = await fetch('/api/blogs/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                alert(isEditing ? "Blog Updated Successfully! ✅" : "Blog Post Success! 🍄");
                resetForm();
                fetchBlogs(); // Refresh list
            } else {
                alert("Operation failed.");
            }
        } catch (error) {
            console.error("Error saving blog:", error);
            alert("Error saving blog.");
        }
    };

    const handleEdit = (item) => {
        setBlog({
            title: item.title,
            content: item.content,
            image: item.image,
            category: item.category // You might need logic here if the category isn't in the default list
        });

        // If category is not in default options, set to "New Category..." and fill custom
        const defaultCategories = ['Growing Tips', 'Health Benefits', 'TJP Updates'];
        if (!defaultCategories.includes(item.category)) {
            setBlog(prev => ({ ...prev, category: 'New Category...' }));
            setCustomCategory(item.category);
        } else {
            setBlog(prev => ({ ...prev, category: item.category }));
        }

        setIsEditing(true);
        setEditId(item._id);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this blog?")) return;
        try {
            const res = await fetch(`/api/delete/blogs/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
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
        <div style={{ backgroundColor: '#CBCCCB', minHeight: '100vh', padding: '40px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* FORM SECTION */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0 }}>{isEditing ? '✏️ Edit Blog' : '✍️ Write New Blog'}</h2>
                        {isEditing && (
                            <button onClick={resetForm} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={blog.title}
                            onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                            required
                            style={inputStyle}
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <select
                                value={blog.category}
                                onChange={(e) => setBlog({ ...blog, category: e.target.value })}
                                style={{ ...inputStyle, flex: 1 }}
                            >
                                <option value="Growing Tips">Growing Tips</option>
                                <option value="Health Benefits">Health Benefits</option>
                                <option value="TJP Updates">TJP Updates</option>
                                <option value="New Category...">+ Add New Category</option>
                            </select>
                            {blog.category === 'New Category...' && (
                                <input
                                    type="text"
                                    placeholder="Enter Category Name"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    required
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                            )}
                        </div>

                        <input
                            type="text"
                            placeholder="Paste Image URL / Anti-Gravity Link"
                            value={blog.image}
                            onChange={(e) => setBlog({ ...blog, image: e.target.value })}
                            style={inputStyle}
                        />

                        {/* Persistent Preview */}
                        {blog.image && (
                            <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                <img
                                    src={blog.image}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        )}

                        <textarea
                            rows="10"
                            placeholder="Content..."
                            value={blog.content}
                            onChange={(e) => setBlog({ ...blog, content: e.target.value })}
                            required
                            style={inputStyle}
                        />

                        <button type="submit" style={{ backgroundColor: isEditing ? '#ffc107' : '#007bff', color: isEditing ? 'black' : 'white', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.3s' }}>
                            {isEditing ? 'UPDATE BLOG POST 💾' : 'PUBLISH TO WEBSITE 🚀'}
                        </button>
                    </form>
                </div>

                {/* LIST SECTION */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                        <h3 style={{ margin: 0 }}>📚 Existing Blogs ({blogs.length})</h3>
                        <button onClick={fetchBlogs} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Refresh List">
                            <FaSync className={loading ? 'fa-spin' : ''} />
                        </button>
                    </div>

                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {blogs.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#888' }}>No blogs found.</p>
                        ) : (
                            blogs.map((item) => (
                                <div key={item._id} style={{ display: 'flex', gap: '15px', padding: '15px', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                                    <img
                                        src={item.image}
                                        alt="thumb"
                                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', background: '#eee' }}
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 5px 0' }}>{item.title}</h4>
                                        <span style={{ fontSize: '12px', background: '#eef', padding: '3px 8px', borderRadius: '10px', color: '#44a' }}>
                                            {item.category}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleEdit(item)} style={{ background: '#ffc107', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', color: 'black' }} title="Edit">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} style={{ background: '#dc3545', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', color: 'white' }} title="Delete">
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
    );
};

const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px' };

export default AdminBlog;