<?php
// path: Backend/config/blogs/inc_blogModel.php
// Handles database operations for blogs (create, update, delete, get all blogs).

// Include the database connection class to interact with the database
require_once __DIR__ . "/../inc_databaseClass.php"; 

// Include the logger class for logging actions and errors
require_once __DIR__ . "/../inc_logger.php"; 

// BlogModel class encapsulates all blog-related database operations
class BlogModel {
    private $db; // Holds the database connection instance
    private $uploadDir = __DIR__ . "/../../uploads/"; // Filesystem path for storing uploaded media
    private $baseUrl = "http://localhost/Wanderlusttrails/Backend/uploads/"; // Base URL to access uploaded media files

    // Constructor initializes the database connection and ensures upload directory exists
    public function __construct() {
        Logger::log("BlogModel instantiated"); // Log the instantiation event
        $this->db = new DatabaseClass(); // Create a new DatabaseClass instance for DB operations

        // Check if the upload directory exists; create it if not
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true); // Create directory with permissions
            Logger::log("Created upload directory: " . $this->uploadDir);
        }
    }

    // Fetch all blogs along with their associated user details (author info)
    public function getAllBlogs() {
        Logger::log("getAllBlogs called");

        // SQL query to select blog fields and join with users table for author names
        $query = "SELECT b.id, b.userId, u.firstName, u.lastName, b.title, b.content, b.status, b.createdAt, b.media_urls
                  FROM blogs b JOIN users u ON b.userId = u.id 
                  ORDER BY b.createdAt DESC";

        $blogs = $this->db->query($query); // Execute the query

        // Handle query failure
        if (isset($blogs['success']) && !$blogs['success']) {
            Logger::log("getAllBlogs failed: " . $blogs['message']);
            return ["success" => false, "message" => $blogs['message']];
        }

        // Decode media_urls JSON string into an array for each blog
        foreach ($blogs as &$blog) {
            $blog['media_urls'] = json_decode($blog['media_urls'], true) ?: [];
        }

        // Log the count of blogs retrieved and a sample for debugging
        Logger::log("getAllBlogs query result: " . json_encode([
            'blog_count' => count($blogs),
            'sample' => $blogs ? array_slice($blogs, 0, 1) : []
        ]));

        // Return success response with blog data
        return ["success" => true, "data" => $blogs];
    }

    // Create a new blog post with optional media files
    public function createBlog($userId, $title, $content, $status, $mediaFiles, $existingMedia) {
        Logger::log("createBlog called - userId: $userId, title: " . substr($title, 0, 50));

        // Validate required inputs
        if (empty($userId) || empty($title) || empty($content) || !in_array($status, ['draft', 'published'])) {
            Logger::log("Validation failed: Missing or invalid required fields");
            return ["success" => false, "message" => "All fields are required and status must be 'draft' or 'published'"];
        }

        // Validate userId is numeric
        if (!is_numeric($userId)) {
            Logger::log("Validation failed: userId not numeric");
            return ["success" => false, "message" => "User ID must be numeric"];
        }

        // Check if user exists and retrieve their role
        $query = "SELECT id, role FROM users WHERE id = ?";
        $user = $this->db->fetchQuery($query, "i", $userId);
        Logger::log("User check result: " . json_encode($user));

        if (empty($user)) {
            Logger::log("User not found for userId: $userId");
            return ["success" => false, "message" => "User not found"];
        }

        // Prevent admin users from creating blogs
        $userRole = $user[0]['role'];
        Logger::log("User role for userId $userId: $userRole");
        if ($userRole === 'admin') {
            Logger::log("Admin user (userId: $userId) attempted to create a blog");
            return ["success" => false, "message" => "Admins are not allowed to create blogs"];
        }

        // Process and store media files, combining with existing media URLs
        $mediaUrls = $this->handleMediaUploads($mediaFiles, $existingMedia);

        $mediaUrlsJson = json_encode($mediaUrls); // Convert media URLs array to JSON for DB storage

        // Insert new blog into database
        $query = "INSERT INTO blogs (userId, title, content, status, media_urls) VALUES (?, ?, ?, ?, ?)";
        $types = "issss";
        $result = $this->db->executeQuery($query, $types, $userId, $title, $content, $status, $mediaUrlsJson);

        Logger::log("createBlog query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'insert_id' => $result['insert_id'],
            'message' => $result['message']
        ]));

        // Return success with new blog ID or failure message
        if ($result['success'] && $result['affected_rows'] > 0) {
            $blogId = $result['insert_id'];
            return ["success" => true, "message" => "Blog created successfully", "blogId" => $blogId];
        } else {
            return ["success" => false, "message" => $result['message'] ?? "Failed to create blog"];
        }
    }

    // Update an existing blog post and its media
    public function updateBlog($blogId, $userId, $title, $content, $status, $mediaFiles, $existingMedia) {
        Logger::log("updateBlog called - blogId: $blogId, userId: $userId, title: " . substr($title, 0, 50));

        // Validate inputs
        if (empty($blogId) || empty($userId) || empty($title) || empty($content) || !in_array($status, ['draft', 'published'])) {
            Logger::log("Validation failed: Missing or invalid required fields");
            return ["success" => false, "message" => "All fields are required and status must be 'draft' or 'published'"];
        }

        if (!is_numeric($blogId) || !is_numeric($userId)) {
            Logger::log("Validation failed: blogId or userId not numeric");
            return ["success" => false, "message" => "Blog ID and User ID must be numeric"];
        }

        // Verify the blog exists and is owned by the user
        $query = "SELECT id, media_urls FROM blogs WHERE id = ? AND userId = ?";
        $blog = $this->db->fetchQuery($query, "ii", $blogId, $userId);
        Logger::log("Blog check result: " . json_encode($blog));

        if (empty($blog)) {
            Logger::log("Blog not found or not owned by user - blogId: $blogId, userId: $userId");
            return ["success" => false, "message" => "Blog not found or unauthorized"];
        }

        // Process new and existing media files
        $mediaUrls = $this->handleMediaUploads($mediaFiles, $existingMedia);
        $mediaUrlsJson = json_encode($mediaUrls);

        // Update blog record in database
        $query = "UPDATE blogs SET title = ?, content = ?, status = ?, media_urls = ? WHERE id = ? AND userId = ?";
        $types = "ssssii";
        $result = $this->db->executeQuery($query, $types, $title, $content, $status, $mediaUrlsJson, $blogId, $userId);

        Logger::log("updateBlog query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'message' => $result['message']
        ]));

        // Return success or failure message
        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Blog updated successfully"]
            : ["success" => false, "message" => $result['message'] ?? "Failed to update blog"];
    }

    // Delete a blog and its associated media files
    public function deleteBlog($blogId, $userId) {
        Logger::log("deleteBlog called - blogId: $blogId, userId: $userId");

        // Validate inputs
        if (empty($blogId) || empty($userId)) {
            Logger::log("Validation failed: Missing blogId or userId");
            return ["success" => false, "message" => "Blog ID and User ID are required"];
        }

        if (!is_numeric($blogId) || !is_numeric($userId)) {
            Logger::log("Validation failed: blogId or userId not numeric");
            return ["success" => false, "message" => "Blog ID and User ID must be numeric"];
        }

        // Verify blog ownership
        $query = "SELECT media_urls FROM blogs WHERE id = ? AND userId = ?";
        $blog = $this->db->fetchQuery($query, "ii", $blogId, $userId);
        Logger::log("Blog check result: " . json_encode($blog));

        if (empty($blog)) {
            Logger::log("Blog not found or not owned by user - blogId: $blogId, userId: $userId");
            return ["success" => false, "message" => "Blog not found or unauthorized"];
        }

        // Delete associated media files from the filesystem
        $mediaUrls = json_decode($blog[0]['media_urls'], true) ?: [];
        foreach ($mediaUrls as $url) {
            $filePath = str_replace($this->baseUrl, $this->uploadDir, $url); // Convert URL to file path
            if (file_exists($filePath)) {
                unlink($filePath); // Delete the file
                Logger::log("Deleted media file: $filePath");
            }
        }

        // Delete blog record from database
        $query = "DELETE FROM blogs WHERE id = ? AND userId = ?";
        $types = "ii";
        $result = $this->db->executeQuery($query, $types, $blogId, $userId);

        Logger::log("deleteBlog query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'message' => $result['message']
        ]));

        // Return success or failure response
        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Blog deleted successfully"]
            : ["success" => false, "message" => $result['message'] ?? "Failed to delete blog"];
    }

    // Helper method to process uploaded media files and combine with existing media URLs
    private function handleMediaUploads($mediaFiles, $existingMedia) {
        Logger::log("Handling media uploads");

        // Start with existing media URLs if provided, else empty array
        $mediaUrls = is_array($existingMedia) ? $existingMedia : [];

        // Process each uploaded file if mediaFiles provided and valid
        if (!empty($mediaFiles) && isset($mediaFiles['name'])) {
            $fileCount = count($mediaFiles['name']);

            for ($i = 0; $i < $fileCount; $i++) {
                // Skip files with upload errors
                if ($mediaFiles['error'][$i] !== UPLOAD_ERR_OK) {
                    Logger::log("Upload error for file: " . $mediaFiles['name'][$i]);
                    continue;
                }

                // Generate a unique file name to prevent collisions
                $fileName = uniqid() . '_' . basename($mediaFiles['name'][$i]);
                $filePath = $this->uploadDir . $fileName;

                // Move the uploaded file to the uploads directory
                if (move_uploaded_file($mediaFiles['tmp_name'][$i], $filePath)) {
                    // Add the public URL of the uploaded file to the media URLs list
                    $mediaUrls[] = $this->baseUrl . $fileName;
                    Logger::log("Uploaded file: $fileName");
                } else {
                    Logger::log("Failed to upload file: " . $mediaFiles['name'][$i]);
                }
            }
        }

        // Return array of media URLs (new and existing)
        return $mediaUrls;
    }
}
?>
