// Blogs.jsx
import React, { useState } from 'react';
import { useUser } from "../context/UserContext.jsx";


const BlogsPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const { user } = useUser();

  // console.log(user.firstname  )
  

  const handleCreateBlogPost = (event) => {
    event.preventDefault();
    const title = event.target.elements.title.value;
    const content = event.target.elements.content.value;

    const newPost = {
      id: Date.now(),
      title,
      content,
      author: user.firstname, // Get author's name from the user context
    };

    setBlogPosts([...blogPosts, newPost]);
    event.target.reset();
  };

  return (
    <div>
      <h1>Our Blog</h1>

      {user ? (
        <div>
          <p>Welcome, {user.firstname} {user.lastname}! Start creating your blog posts.</p> 

          <form onSubmit={handleCreateBlogPost}>
            <div>
              <label htmlFor="title">Title:</label>
              <input type="text" id="title" name="title" required />
            </div>
            <div>
              <label htmlFor="content">Content:</label>
              <textarea id="content" name="content" required />
            </div>
            <button type="submit">Create Blog Post</button>
          </form>

          
          <h2>Your Blog Posts</h2>
          <div className="blog-posts-container">
            {blogPosts.map((post) => (
              <div key={post.id} className="blog-post">
                <h2>{post.title}</h2>
                <p>{post.content}</p>
                <p className="author">By: {post.author}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Please log in to create a blog post.</p>
      )}
    </div>
  );
};

export default BlogsPage;