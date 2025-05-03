//path: Frontend/WanderlustTrails/src/components/forms/BlogForm.jsx
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles for React Quill  

const BlogForm = ({ formData, setFormData, error, handleSubmit, setPopup, isEdit, handleQuillChange }) => {
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };  

  // Handle file input changes
  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, files: Array.from(e.target.files) }));
  }; 

  // React Quill modules and formats
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }; // Define the toolbar options

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ]; // Define the formats you want to use

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-80" onClick={() => setPopup(null)}></div>

      {/* Popup Container */}
      <div className={`relative w-full max-w-2xl ${isEdit ? 'bg-gray-500' : 'bg-gray-800'} rounded-xl shadow-lg flex flex-col max-h-[90vh] z-50`}>
        {/* Form Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <h2 className="text-2xl font-bold text-indigo-300 mb-4">
            {isEdit ? 'Edit Blog' : 'Write a New Blog'}
          </h2>
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="space-y-4">
            {/* Title */}
            <div className="relative">
              <label className="block text-gray-200 font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full p-3 bg-orange-50 text-gray-800 border border-red-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter blog title"
              />
            </div>

            {/* Content (React Quill) */}
            <div>
              <label className="block text-gray-200 font-medium mb-1">Content</label>
              <ReactQuill
                value={formData.content}
                onChange={handleQuillChange}
                modules={quillModules}
                formats={quillFormats}
                theme="snow"
                className="bg-orange-50 text-gray-800 rounded-lg"
              />
              <style>{`
                .ql-toolbar.ql-snow {
                  background: #fff7ed !important; /* bg-orange-50 */
                  border: 1px solid #7f1d1d !important; /* border-red-900 */
                  border-top-left-radius: 8px;
                  border-top-right-radius: 8px;
                }
                .ql-container.ql-snow {
                  background: #fff7ed !important; /* bg-orange-50 */
                  color: #1f2937 !important; /* text-gray-800 */
                  border: 1px solid #7f1d1d !important; /* border-red-900 */
                  border-bottom-left-radius: 8px;
                  border-bottom-right-radius: 8px;
                }
                .ql-editor {
                  min-height: 150px;
                }
                .ql-snow .ql-picker {
                  color: #1f2937 !important; /* text-gray-800 */
                }
                .ql-snow .ql-stroke {
                  stroke: #1f2937 !important;
                }
                .ql-snow .ql-fill {
                  fill: #1f2937 !important;
                }
                .ql-toolbar.ql-snow .ql-picker-options {
                  background: #fff7ed !important; /* bg-orange-50 */
                  border: 1px solid #7f1d1d !important; /* border-red-900 */
                }
                .ql-toolbar.ql-snow .ql-picker-item {
                  color: #1f2937 !important;
                }
                .ql-toolbar.ql-snow .ql-picker-item:hover {
                  color: #4f46e5 !important; /* indigo-600 */
                }
                .ql-toolbar.ql-snow .ql-formats svg {
                  width: 20px !important;
                  height: 20px !important;
                }
                .ql-toolbar.ql-snow .ql-picker-label svg {
                  width: 20px !important;
                  height: 20px !important;
                }
                .ql-toolbar.ql-snow .ql-formats button {
                  padding: 4px !important;
                }
                .ql-toolbar.ql-snow .ql-picker-label {
                  padding: 4px !important;
                }
              `}</style>
            </div>

            {/* Status */}
            <div>
              <label className="block text-gray-200 font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-3 bg-orange-50 text-gray-800 border border-red-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Media */}
            <div>
              <label className="block text-gray-200 font-medium mb-1">Media</label>
              <input
                type="file"
                name="media"
                multiple
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="w-full p-3 bg-orange-50 text-gray-800 border border-red-900 rounded-lg"
              />
              {formData.existing_media.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-200 font-medium">Existing Media:</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {formData.existing_media.map((url, index) => (
                      <div key={index}>
                        {url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                          <img
                            src={url}
                            alt={`Existing Media ${index}`}
                            className="max-w-[120px] rounded-lg shadow-md"
                          />
                        ) : (
                          <video
                            src={url}
                            controls
                            className="max-w-[120px] rounded-lg shadow-md"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons (Sticky Footer) */}
        <div className="sticky bottom-0 bg-gray-800 p-4 border-t border-red-900">
          <div className="flex space-x-4">
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-gray-200 font-medium py-3 rounded-lg transition-colors duration-200"
            >
              {isEdit ? 'Update Blog' : 'Create Blog'}
            </button>
            <button
              type="button"
              onClick={() => setPopup(null)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-gray-200 font-medium py-3 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogForm;