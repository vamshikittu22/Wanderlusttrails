
// path to: Frontend/WanderlustTrails/src/pages/Blogs.jsx

import React, { useState, useEffect } from 'react';
import BlogForm from './../components/forms/BlogForm'; // Blog form component for create/edit
import FilterSortBar from '../components/FilterSortBar'; // Component to handle sorting/filtering UI
import Pagination from '../components/Pagination'; // Pagination UI component

const Blogs = () => {
  // State declarations for blog data, errors, current user, form, popup modals, filtered/sorted blogs, and pagination
  const [blogs, setBlogs] = useState([]); // All blogs fetched from backend
  const [error, setError] = useState(null); // To store any errors during fetch or actions
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId') || '1'); // Current logged in user ID from localStorage, default '1' if missing

  // Form state for blog creation/editing, includes content, title, status, media etc.
  const [formData, setFormData] = useState({
    blogId: null,          // Null for new blogs; populated with blog id when editing
    title: '',
    content: '',
    status: 'draft',       // draft or published
    existing_media: [],    // media already uploaded for blog (used in edit)
    files: [],             // new files to upload
  });

  const [popup, setPopup] = useState(null);       // Tracks which popup/modal is open ('create', 'edit', 'view', 'delete', or null)
  const [selectedBlog, setSelectedBlog] = useState(null); // Blog selected for viewing, editing, or deleting

  // Blogs after filtering and sorting, used for display and pagination
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);  // Current page number for pagination
  const [blogsPerPage] = useState(6);                 // Blogs per page, fixed at 6

  // Fetch blogs from backend API on component mount (runs once)
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('http://localhost/Wanderlusttrails/Backend/config/blogs/getBlogs.php', {
          method: 'GET',
        });
        const result = await response.json();
        if (result.success) {
          setBlogs(result.data); // Store fetched blogs in state
        } else {
          setError(result.message || 'Failed to fetch blogs'); // Handle backend errors
        }
      } catch (err) {
        setError('Error fetching blogs: ' + err.message); // Handle fetch/network errors
      }
    };

    fetchBlogs();
  }, []);

  // Filter blogs to show:
  // - All published blogs (any user)
  // - Draft blogs only if owned by current user
  useEffect(() => {
    const filtered = blogs.filter((blog) => {
      const isOwner = Number(blog.userId) === Number(currentUserId);
      if (blog.status === 'published') return true;
      if (blog.status === 'draft' && isOwner) return true;
      return false;
    });
    setFilteredBlogs(filtered);
  }, [blogs, currentUserId]);

  // Handle content changes from Quill editor inside BlogForm
  const handleQuillChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  // Submit handler for blog create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Prepare FormData to support file uploads
    const data = new FormData();
    if (formData.blogId) data.append('blogId', formData.blogId); // For editing existing blog
    data.append('userId', currentUserId);
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('status', formData.status);

    // Include existing media URLs if any (only for editing)
    if (formData.existing_media.length > 0) {
      data.append('existing_media', JSON.stringify(formData.existing_media));
    }

    // Append new files selected for upload
    formData.files.forEach((file) => {
      data.append('media[]', file);
    });

    try {
      // Choose API endpoint depending on create or update
      const url = formData.blogId
        ? 'http://localhost/Wanderlusttrails/Backend/config/blogs/updateBlog.php'
        : 'http://localhost/Wanderlusttrails/Backend/config/blogs/createBlog.php';

      const response = await fetch(url, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (result.success) {
        // Refresh blogs list after successful create/update
        const fetchResponse = await fetch('http://localhost/Wanderlusttrails/Backend/config/blogs/getBlogs.php');
        const fetchResult = await fetchResponse.json();
        if (fetchResult.success) {
          setBlogs(fetchResult.data);
        }
        setPopup(null); // Close modal
        // Reset form data to defaults
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

  // Handle deleting a blog post
  const handleDelete = async () => {
    try {
      const response = await fetch('http://localhost/Wanderlusttrails/Backend/config/blogs/deleteBlog.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId: selectedBlog.id, userId: currentUserId }),
      });

      const result = await response.json();
      if (result.success) {
        // Remove deleted blog from state
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

  // Sorting options with keys, labels, and sort functions
  const sortOptions = [
    { key: "none", label: "No Sorting", sortFunction: () => 0 },
    { key: "title_asc", label: "Title (A-Z)", sortFunction: (a, b) => a.title.localeCompare(b.title) },
    { key: "title_desc", label: "Title (Z-A)", sortFunction: (a, b) => b.title.localeCompare(a.title) },
    { key: "date_newest", label: "Newest First", sortFunction: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
    { key: "date_oldest", label: "Oldest First", sortFunction: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) },
  ];

  // Pagination calculations: determine which blogs to show on current page
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-300 mb-8 text-center">
          Blogs
        </h1>

        {/* Show error messages if any */}
        {error && (
          <p className="text-red-400 text-center mb-8">
            {error}
          </p>
        )}

        {/* Container for blog list with sorting controls */}
        <div className="bg-gray-700 rounded-xl p-6 shadow-lg mb-8">
          <FilterSortBar
            items={filteredBlogs}
            setFilteredItems={setFilteredBlogs}
            filterOptions={[]} // No filters, only sorting
            sortOptions={sortOptions}
          />

          {/* No blogs message */}
          {filteredBlogs.length === 0 ? (
            <p className="text-gray-300 text-center col-span-full">
              No blogs available.
            </p>
          ) : (
            <>
              {/* Grid of blog cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentBlogs.map((blog) => (
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

                    {/* Show media thumbnail if available */}
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

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      {/* If current user owns the blog, show Edit & Delete */}
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
                              setPopup('edit'); // Open edit modal
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBlog(blog);
                              setPopup('delete'); // Open delete confirmation
                            }}
                            className="bg-red-600 hover:bg-red-700 text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        // Otherwise show just View button
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
                ))}
              </div>

              {/* Pagination controls */}
              <Pagination
                totalItems={filteredBlogs.length}
                itemsPerPage={blogsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>

        {/* Button to open blog creation form */}
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
              setPopup('create'); // Open create modal
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Write Your Blog
          </button>
        </div>

        {/* Popup for viewing a blog */}
        {popup === 'view' && selectedBlog && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Overlay background */}
            <div className="absolute inset-0 bg-black bg-opacity-80" onClick={() => setPopup(null)}></div>
            <div className="relative w-full max-w-3xl bg-gray-800 rounded-xl p-6 space-y-4 z-50 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-indigo-300 mb-2">
                {selectedBlog.title}
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                By: {selectedBlog.firstName} {selectedBlog.lastName} | Posted on: {new Date(selectedBlog.createdAt).toLocaleDateString()}
              </p>
              {/* Blog content rendered as HTML */}
              <div
                className="text-gray-200 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
              />
              {/* Display all media items */}
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
              {/* Close button */}
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

        {/* Popup for creating or editing blog */}
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

        {/* Popup for confirming blog deletion */}
        {popup === 'delete' && selectedBlog && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Overlay background */}
            <div className="absolute inset-0 bg-black bg-opacity-80" onClick={() => setPopup(null)}></div>
            <div className="relative w-full max-w-md bg-gray-800 rounded-xl p-6 space-y-4 z-50">
              <h2 className="text-2xl font-bold text-indigo-300 mb-2">
                Confirm Delete
              </h2>
              <p className="text-gray-200">
                Are you sure you want to delete "{selectedBlog.title}"?
              </p>
              {/* Delete confirmation buttons */}
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
