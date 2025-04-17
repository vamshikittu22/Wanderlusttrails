//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/Blogs.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext.jsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiEdit, FiTrash2, FiUpload } from 'react-icons/fi';
import $ from 'jquery';

function Blogs() {
    const { user, isAuthenticated } = useUser();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        title: '',
        content: '',
        status: 'draft',
        media: [],
        existing_media: [],
    });
    const [editBlogId, setEditBlogId] = useState(null);
    const [mediaPreview, setMediaPreview] = useState([]);

    useEffect(() => {
        fetchBlogs();
    }, []);

    // const fetchBlogs = () => {
    //     const url = isAuthenticated && user?.id
    //         ? `http://localhost/Wanderlusttrails/Backend/config/blogs/getBlogs.php?userId=${user.id}`
    //         : `http://localhost/Wanderlusttrails/Backend/config/blogs/getBlogs.php`;

    //     $.ajax({
    //         url,
    //         type: 'GET',
    //         dataType: 'json',
    //         success: (response) => {
    //             console.log('Fetched blogs:', response);
    //             if (response.success) {
    //                 setBlogs(response.data);
    //             } else {
    //                 toast.error(response.message || 'Failed to fetch blogs');
    //             }
    //             setLoading(false);
    //         },
    //         error: (xhr, status, error) => {
    //             console.error('Fetch blogs error:', { status, error, response: xhr.responseText });
    //             toast.error('Error fetching blogs: ' + (xhr.responseJSON?.message || error));
    //             setLoading(false);
    //         },
    //     });
    // };

    const fetchBlogs = async () => {
        try {
            const response = await $.ajax({
                url: 'http://localhost/Wanderlusttrails/Backend/config/blogs/getBlogs.php',
                method: 'GET',
                data: { userId: user?.id },
                dataType: 'json'
            });
            console.log("Fetched blogs:", response);
            if (response.success) {
                setBlogs(response.data);
            } else {
                toast.error(response.message || "Failed to fetch blogs");
            }
        } catch (error) {
            console.error("Fetch blogs error:", error);
            toast.error("Failed to fetch blogs");
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (value) => {
        setForm((prev) => ({ ...prev, content: value }));
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        setForm((prev) => ({ ...prev, media: files }));
        const previews = files.map((file) => ({
            url: URL.createObjectURL(file),
            type: file.type.startsWith('image') ? 'image' : 'video',
        }));
        setMediaPreview((prev) => [...prev, ...previews]);
    };

    const removeMedia = (index) => {
        setForm((prev) => ({
            ...prev,
            existing_media: prev.existing_media.filter((_, i) => i !== index),
        }));
        setMediaPreview((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isAuthenticated || !user?.id) {
            toast.error('Please log in to create a blog');
            return;
        }

        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('title', form.title);
        formData.append('content', form.content);
        formData.append('status', form.status);
        formData.append('existing_media', JSON.stringify(form.existing_media));
        form.media.forEach((file) => formData.append('media[]', file));

        if (editBlogId) {
            formData.append('blogId', editBlogId);
        }

        $.ajax({
            url: editBlogId
                ? 'http://localhost/Wanderlusttrails/Backend/config/blogs/updateBlog.php'
                : 'http://localhost/Wanderlusttrails/Backend/config/blogs/createBlog.php',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            dataType: 'json',
            success: (response) => {
                console.log('Save blog response:', response);
                if (response.success) {
                    toast.success(editBlogId ? 'Blog updated successfully!' : 'Blog created successfully!');
                    resetForm();
                    fetchBlogs();
                } else {
                    toast.error(response.message || 'Failed to save blog');
                }
            },
            error: (xhr, status, error) => {
                console.error('Save blog error:', { status, error, response: xhr.responseText });
                toast.error('Error saving blog: ' + (xhr.responseJSON?.message || error));
            },
        });
    };

    const handleEdit = (blog) => {
        setEditBlogId(blog.id);
        setForm({
            title: blog.title,
            content: blog.content,
            status: blog.status,
            media: [],
            existing_media: blog.media_urls || [],
        });
        setMediaPreview((blog.media_urls || []).map((url) => ({
            url,
            type: url.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'image',
        })));
    };

    const handleDelete = (blogId) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;

        $.ajax({
            url: 'http://localhost/Wanderlusttrails/Backend/config/blogs/deleteBlog.php',
            type: 'POST',
            data: JSON.stringify({ blogId, userId: user.id }),
            contentType: 'application/json',
            dataType: 'json',
            success: (response) => {
                console.log('Delete blog response:', response);
                if (response.success) {
                    toast.success('Blog deleted successfully!');
                    fetchBlogs();
                } else {
                    toast.error(response.message || 'Failed to delete blog');
                }
            },
            error: (xhr, status, error) => {
                console.error('Delete blog error:', { status, error, response: xhr.responseText });
                toast.error('Error deleting blog: ' + (xhr.responseJSON?.message || error));
            },
        });
    };

    const resetForm = () => {
        setForm({
            title: '',
            content: '',
            status: 'draft',
            media: [],
            existing_media: [],
        });
        setEditBlogId(null);
        setMediaPreview([]);
    };

    if (loading) return <div className="text-center p-4 text-white">Loading blogs...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-bold text-blue-800 mb-8">Travel Stories</h2>

            {isAuthenticated && (
                <div className="bg-white rounded-lg shadow-xl p-6 mb-8 max-w-2xl mx-auto">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">
                        {editBlogId ? 'Edit Your Story' : 'Share Your Travel Story'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-600 font-semibold mb-2">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 text-gray-800 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-600 font-semibold mb-2">Story</label>
                            <ReactQuill
                                value={form.content}
                                onChange={handleContentChange}
                                className="bg-gray-50 text-gray-800"
                                theme="snow"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-600 font-semibold mb-2">Media (Images/Videos)</label>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
                                    <FiUpload className="mr-2" />
                                    Upload
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        onChange={handleMediaChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {mediaPreview.map((media, index) => (
                                    <div key={index} className="relative">
                                        {media.type === 'image' ? (
                                            <img src={media.url} alt="Preview" className="w-full h-24 object-cover rounded" />
                                        ) : (
                                            <video src={media.url} controls className="w-full h-24 object-cover rounded" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeMedia(index)}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-600 font-semibold mb-2">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 text-gray-800 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                                {editBlogId ? 'Update Story' : 'Share Story'}
                            </button>
                            {(form.title || form.content || form.media.length > 0) && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-8">
                {blogs.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg">No stories to display.</p>
                ) : (
                    blogs.map((blog) => (
                        <div
                            key={blog.id}
                            className="relative bg-white text-gray-800 rounded-lg shadow-xl max-w-md mx-auto overflow-hidden border border-gray-200"
                        >
                            <div className="bg-blue-800 text-white p-4 flex items-center space-x-4 relative">
                                <img
                                    src={blog.media_urls?.[0] || 'https://source.unsplash.com/random/100x100/?travel'}
                                    alt={blog.title}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                                />
                                <div>
                                    <h3 className="text-lg font-bold">{blog.title}</h3>
                                    <p className="text-sm">
                                        By {blog.firstName} {blog.lastName}
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 relative">
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-2 bg-gray-200"
                                    style={{ background: 'radial-gradient(circle, transparent 50%, #e5e7eb 50%) 0 0 / 10px 10px' }}
                                ></div>
                                <div
                                    className="absolute right-0 top-0 bottom-0 w-2 bg-gray-200"
                                    style={{ background: 'radial-gradient(circle, transparent 50%, #e5e7eb 50%) 0 0 / 10px 10px' }}
                                ></div>
                                <div className="ml-4 mr-4 font-mono text-sm">
                                    <div
                                        className="prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: blog.content.substring(0, 200) + (blog.content.length > 200 ? '...' : '') }}
                                    />
                                    {blog.media_urls?.length > 0 && (
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            {blog.media_urls.map((url, index) => (
                                                <div key={index}>
                                                    {url.match(/\.(mp4|webm|ogg)$/) ? (
                                                        <video src={url} controls className="w-full h-32 object-cover rounded" />
                                                    ) : (
                                                        <img src={url} alt="Blog media" className="w-full h-32 object-cover rounded" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">Posted on {new Date(blog.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="bg-gray-100 p-4 border-t border-dashed border-gray-400 flex justify-between items-center">
                                {isAuthenticated && user.id === blog.userId && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(blog)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-xs font-mono uppercase flex items-center"
                                        >
                                            <FiEdit className="mr-1" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(blog.id)}
                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-xs font-mono uppercase flex items-center"
                                        >
                                            <FiTrash2 className="mr-1" /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Blogs;