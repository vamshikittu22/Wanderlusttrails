//path: Frontend/WanderlustTrails/src/pages/Blogs.jsx
import React, { useState, useEffect } from 'react';
import BlogForm from './../components/forms/BlogForm';

const Blogs = () => {
  // State for blogs, form data, and popups
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId') || '1');
  const [formData, setFormData] = useState({
    blogId: null,
    title: '',
    content: '',
    status: 'draft',
    existing_media: [],
    files: [],
  });
  const [popup, setPopup] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Fetch blogs on component mount
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('http://localhost/Wanderlusttrails/Backend/config/blogs/getBlogs.php', {
          method: 'GET',
        });
        const result = await response.json();
        if (result.success) {
          setBlogs(result.data);
        } else {
          setError(result.message || 'Failed to fetch blogs');
        }
      } catch (err) {
        setError('Error fetching blogs: ' + err.message);
      }
    };

    fetchBlogs();
  }, []);

  // Filter blogs based on status and user
  const filteredBlogs = blogs.filter((blog) => {
    const isOwner = Number(blog.userId) === Number(currentUserId);
    if (blog.status === 'published') return true;
    if (blog.status === 'draft' && isOwner) return true;
    return false;
  });

  // Handle Quill content change
  const handleQuillChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  // Handle form submission (create or update blog)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const data = new FormData();
    if (formData.blogId) data.append('blogId', formData.blogId);
    data.append('userId', currentUserId);
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('status', formData.status);
    if (formData.existing_media.length > 0) {
      data.append('existing_media', JSON.stringify(formData.existing_media));
    }
    formData.files.forEach((file) => {
      data.append('media[]', file);
    });

    try {
      const url = formData.blogId
        ? 'http://localhost/Wanderlusttrails/Backend/config/blogs/updateBlog.php'
        : 'http://localhost/Wanderlusttrails/Backend/config/blogs/createBlog.php';
      const response = await fetch(url, {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      if (result.success) {
        const fetchResponse = await fetch('http://localhost/Wanderlusttrails/Backend/config/blogs/getBlogs.php');
        const fetchResult = await fetchResponse.json();
        if (fetchResult.success) {
          setBlogs(fetchResult.data);
        }
        setPopup(null);
        setFormData({
          blogId: null,
          title: '',
          content: '',
          status: 'draft',
          existing_media: [],
          files: [],
        });
      } else {
        setError('Error saving blog: ' + result.message);
      }
    } catch (err) {
      setError('Error saving blog: ' + err.message);
    }
  };

  // Handle delete blog
  const handleDelete = async () => {
    try {
      const response = await fetch('http://localhost/Wanderlusttrails/Backend/config/blogs/deleteBlog.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId: selectedBlog.id, userId: currentUserId }),
      });
      const result = await response.json();
      if (result.success) {
        setBlogs(blogs.filter((blog) => blog.id !== selectedBlog.id));
        setPopup(null);
        setSelectedBlog(null);
      } else {
        setError('Error deleting blog: ' + result.message);
      }
    } catch (err) {
      setError('Error deleting blog: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-300 mb-8 text-center">
          Blogs
        </h1>

        {/* Display error message if any */}
        {error && (
          <p className="text-red-400 text-center mb-8">
            {error}
          </p>
        )}

        {/* Blog tiles container */}
        <div className="bg-gray-700 rounded-xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border border-red-900"
                >
                  <h3 className="text-lg font-medium text-gray-200 mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    By: {blog.firstName} {blog.lastName}
                  </p>
                  {blog.media_urls && blog.media_urls.length > 0 && (
                    <div className="mb-3">
                      {blog.media_urls[0].match(/\.(jpeg|jpg|png|gif)$/i) ? (
                        <img
                          src={blog.media_urls[0]}
                          alt="Thumbnail"
                          className="w-full h-40 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <video
                          src={blog.media_urls[0]}
                          className="w-full h-40 rounded-lg shadow-md"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {Number(blog.userId) === Number(currentUserId) ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedBlog(blog);
                            setFormData({
                              blogId: blog.id,
                              title: blog.title,
                              content: blog.content,
                              status: blog.status,
                              existing_media: blog.media_urls || [],
                              files: [],
                            });
                            setPopup('edit');
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBlog(blog);
                            setPopup('delete');
                          }}
                          className="bg-red-600 hover:bg-red-700 text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedBlog(blog);
                          setPopup('view');
                        }}
                        className="bg-green-600 hover:bg-green-700 text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-300 text-center col-span-full">
                No blogs available.
              </p>
            )}
          </div>
        </div>

        {/* Write Your Blog button container */}
        <div className="bg-gray-700 rounded-xl p-4 shadow-lg text-center">
          <button
            onClick={() => {
              setFormData({
                blogId: null,
                title: '',
                content: '',
                status: 'draft',
                existing_media: [],
                files: [],
              });
              setPopup('create');
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Write Your Blog
          </button>
        </div>

        {/* Popups */}
        {popup === 'view' && selectedBlog && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-80" onClick={() => setPopup(null)}></div>
            <div className="relative w-full max-w-3xl bg-gray-800 rounded-xl p-6 space-y-4 z-50 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-indigo-300 mb-2">
                {selectedBlog.title}
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                By: {selectedBlog.firstName} {selectedBlog.lastName} | Posted on: {new Date(selectedBlog.createdAt).toLocaleDateString()}
              </p>
              <div
                className="text-gray-200 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
              />
              {selectedBlog.media_urls && selectedBlog.media_urls.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-4">
                  {selectedBlog.media_urls.map((url, index) => (
                    <div key={index}>
                      {url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                        <img
                          src={url}
                          alt={`Media ${index}`}
                          className="max-w-[250px] rounded-lg shadow-md"
                        />
                      ) : (
                        <video
                          src={url}
                          controls
                          className="max-w-[250px] rounded-lg shadow-md"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => setPopup(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {(popup === 'edit' || popup === 'create') && (
          <BlogForm
            formData={formData}
            setFormData={setFormData}
            error={error}
            handleSubmit={handleSubmit}
            setPopup={setPopup}
            isEdit={popup === 'edit'}
            handleQuillChange={handleQuillChange}
          />
        )}

        {popup === 'delete' && selectedBlog && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-80" onClick={() => setPopup(null)}></div>
            <div className="relative w-full max-w-md bg-gray-800 rounded-xl p-6 space-y-4 z-50">
              <h2 className="text-2xl font-bold text-indigo-300 mb-2">
                Confirm Delete
              </h2>
              <p className="text-gray-200">
                Are you sure you want to delete "{selectedBlog.title}"?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-gray-200 font-medium py-2 rounded-lg transition-colors duration-200"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setPopup(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-gray-200 font-medium py-2 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;