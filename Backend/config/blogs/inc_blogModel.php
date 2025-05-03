<?php
// path: Backend/config/blogs/inc_blogModel.php
// Handles database operations for blogs (create, update, delete, get all blogs).

require_once __DIR__ . "/../inc_databaseClass.php"; // Include database class for database operations
require_once __DIR__ . "/../inc_logger.php"; // Include logger for logging

// BlogModel class 
class BlogModel {
    private $db; // Database connection
    private $uploadDir = __DIR__ . "/../../uploads/"; // Directory for media uploads
    private $baseUrl = "http://localhost/Wanderlusttrails/Backend/uploads/"; // Base URL for media files

    public function __construct() {  // Constructor to initialize database connection and upload directory
        Logger::log("BlogModel instantiated");
        $this->db = new DatabaseClass();
        // Ensure upload directory exists
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
            Logger::log("Created upload directory: " . $this->uploadDir);
        }
    }

    // Get all blogs with user details
    public function getAllBlogs() {
        Logger::log("getAllBlogs called");
//prepare the query
        $query = "SELECT b.id, b.userId, u.firstName, u.lastName, b.title, b.content, b.status, b.createdAt, b.media_urls
                        FROM blogs b JOIN users u ON b.userId = u.id 
                            ORDER BY b.createdAt DESC"; // Query to fetch all blogs with user details
        $blogs = $this->db->query($query); // Execute the query

        if (isset($blogs['success']) && !$blogs['success']) {
            Logger::log("getAllBlogs failed: " . $blogs['message']);
            return ["success" => false, "message" => $blogs['message']];
        }

        // Decode media URLs from JSON to array
        foreach ($blogs as &$blog) {
            $blog['media_urls'] = json_decode($blog['media_urls'], true) ?: [];
        }

        Logger::log("getAllBlogs query result: " . json_encode([
            'blog_count' => count($blogs),
            'sample' => $blogs ? array_slice($blogs, 0, 1) : []
        ]));

        return ["success" => true, "data" => $blogs]; // Return blogs data
    }

    // Create a new blog
    public function createBlog($userId, $title, $content, $status, $mediaFiles, $existingMedia) {
        Logger::log("createBlog called - userId: $userId, title: " . substr($title, 0, 50));

        if (empty($userId) || empty($title) || empty($content) || !in_array($status, ['draft', 'published'])) {
            Logger::log("Validation failed: Missing or invalid required fields");
            return ["success" => false, "message" => "All fields are required and status must be 'draft' or 'published'"];
        }

        if (!is_numeric($userId)) {
            Logger::log("Validation failed: userId not numeric");
            return ["success" => false, "message" => "User ID must be numeric"];
        }

        // Check if user exists and get their role
        //prepare the query
        $query = "SELECT id, role FROM users WHERE id = ?"; // Query to check if user exists
        $user = $this->db->fetchQuery($query, "i", $userId); // Execute the query
        Logger::log("User check result: " . json_encode($user));
        if (empty($user)) {
            Logger::log("User not found for userId: $userId");
            return ["success" => false, "message" => "User not found"];
        }

        // Check if the user is an admin
        $userRole = $user[0]['role']; // Get user role
        Logger::log("User role for userId $userId: $userRole");
        if ($userRole === 'admin') {
            Logger::log("Admin user (userId: $userId) attempted to create a blog");
            return ["success" => false, "message" => "Admins are not allowed to create blogs"];
        }

        // Handle media uploads
        $mediaUrls = $this->handleMediaUploads($mediaFiles, $existingMedia); 

        $mediaUrlsJson = json_encode($mediaUrls); // Convert media URLs to JSON
        //prepare the insert query
        $query = "INSERT INTO blogs (userId, title, content, status, media_urls) VALUES (?, ?, ?, ?, ?)"; // Query to insert new blog   
        $types = "issss"; // Define parameter types for prepared statement
        $result = $this->db->executeQuery($query, $types, $userId, $title, $content, $status, $mediaUrlsJson); // Execute the query

        Logger::log("createBlog query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'insert_id' => $result['insert_id'],
            'message' => $result['message']
        ]));

        if ($result['success'] && $result['affected_rows'] > 0) {
            $blogId = $result['insert_id']; // Get the ID of the newly created blog 
            return ["success" => true, "message" => "Blog created successfully", "blogId" => $blogId]; // Return success message with blog ID
        } else {
            return ["success" => false, "message" => $result['message'] ?? "Failed to create blog"]; // Return error message
        }
    }

    // Update an existing blog
    public function updateBlog($blogId, $userId, $title, $content, $status, $mediaFiles, $existingMedia) {
        Logger::log("updateBlog called - blogId: $blogId, userId: $userId, title: " . substr($title, 0, 50));

        if (empty($blogId) || empty($userId) || empty($title) || empty($content) || !in_array($status, ['draft', 'published'])) {
            Logger::log("Validation failed: Missing or invalid required fields");
            return ["success" => false, "message" => "All fields are required and status must be 'draft' or 'published'"];
        }

        if (!is_numeric($blogId) || !is_numeric($userId)) {
            Logger::log("Validation failed: blogId or userId not numeric");
            return ["success" => false, "message" => "Blog ID and User ID must be numeric"];
        }

        // Check if blog exists and belongs to user
        $query = "SELECT id, media_urls FROM blogs WHERE id = ? AND userId = ?"; // Query to check if blog exists and belongs to user
        $blog = $this->db->fetchQuery($query, "ii", $blogId, $userId); // Execute the query
        Logger::log("Blog check result: " . json_encode($blog)); 
        if (empty($blog)) {
            Logger::log("Blog not found or not owned by user - blogId: $blogId, userId: $userId");
            return ["success" => false, "message" => "Blog not found or unauthorized"];
        }

        // Handle media uploads
        $mediaUrls = $this->handleMediaUploads($mediaFiles, $existingMedia);

        $mediaUrlsJson = json_encode($mediaUrls); // Convert media URLs to JSON
        //prepare the update query
        $query = "UPDATE blogs SET title = ?, content = ?, status = ?, media_urls = ? WHERE id = ? AND userId = ?"; // Query to update blog
        $types = "ssssii"; // Define parameter types for prepared statement
        $result = $this->db->executeQuery($query, $types, $title, $content, $status, $mediaUrlsJson, $blogId, $userId); // Execute the query

        Logger::log("updateBlog query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'message' => $result['message']
        ]));

        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Blog updated successfully"]
            : ["success" => false, "message" => $result['message'] ?? "Failed to update blog"]; // Return success or error message
    }

    // Delete a blog
    public function deleteBlog($blogId, $userId) {
        Logger::log("deleteBlog called - blogId: $blogId, userId: $userId");

        if (empty($blogId) || empty($userId)) {
            Logger::log("Validation failed: Missing blogId or userId");
            return ["success" => false, "message" => "Blog ID and User ID are required"];
        }

        if (!is_numeric($blogId) || !is_numeric($userId)) {
            Logger::log("Validation failed: blogId or userId not numeric");
            return ["success" => false, "message" => "Blog ID and User ID must be numeric"];
        }

        // Check if blog exists and belongs to user
        $query = "SELECT media_urls FROM blogs WHERE id = ? AND userId = ?"; // Query to check if blog exists and belongs to user
        $blog = $this->db->fetchQuery($query, "ii", $blogId, $userId);  // Execute the query
        Logger::log("Blog check result: " . json_encode($blog));
        if (empty($blog)) {
            Logger::log("Blog not found or not owned by user - blogId: $blogId, userId: $userId");
            return ["success" => false, "message" => "Blog not found or unauthorized"];
        }

        // Delete associated media files
        $mediaUrls = json_decode($blog[0]['media_urls'], true) ?: []; // Decode media URLs from JSON
        foreach ($mediaUrls as $url) {
            $filePath = str_replace($this->baseUrl, $this->uploadDir, $url);
            if (file_exists($filePath)) {
                unlink($filePath);
                Logger::log("Deleted media file: $filePath");
            }
        }
//prepare the delete query
        $query = "DELETE FROM blogs WHERE id = ? AND userId = ?"; // Query to delete blog
        $types = "ii"; // Define parameter types for prepared statement
        $result = $this->db->executeQuery($query, $types, $blogId, $userId); // Execute the query

        Logger::log("deleteBlog query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'message' => $result['message']
        ]));

        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Blog deleted successfully"] // Return success message
            : ["success" => false, "message" => $result['message'] ?? "Failed to delete blog"]; // Return error message
    }

    // Helper method to handle media uploads
    private function handleMediaUploads($mediaFiles, $existingMedia) {
        Logger::log("Handling media uploads");
        $mediaUrls = is_array($existingMedia) ? $existingMedia : [];

        // Check if media files are provided
        if (!empty($mediaFiles) && isset($mediaFiles['name'])) {
            $fileCount = count($mediaFiles['name']);
            for ($i = 0; $i < $fileCount; $i++) {
                if ($mediaFiles['error'][$i] !== UPLOAD_ERR_OK) {
                    Logger::log("Upload error for file: " . $mediaFiles['name'][$i]);
                    continue;
                }

                $fileName = uniqid() . '_' . basename($mediaFiles['name'][$i]); // Generate unique file name
                $filePath = $this->uploadDir . $fileName; // Set file path for upload

                if (move_uploaded_file($mediaFiles['tmp_name'][$i], $filePath)) {
                    $mediaUrls[] = $this->baseUrl . $fileName; // Store the URL of the uploaded file
                    Logger::log("Uploaded file: $fileName");
                } else {
                    Logger::log("Failed to upload file: " . $mediaFiles['name'][$i]); 
                }
            }
        }

        return $mediaUrls; // Return array of media URLs
    } 
}
?>