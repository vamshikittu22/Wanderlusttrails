<?php
// path: Backend/config/blogs/inc_blogModel.php
// Handles database operations for blogs (create, update, delete, get all blogs).

require_once __DIR__ . "/../inc_databaseClass.php";
require_once __DIR__ . "/../inc_logger.php";

class BlogModel {
    private $db;
    private $uploadDir = __DIR__ . "/../../uploads/";
    private $baseUrl = "http://localhost/Wanderlusttrails/Backend/uploads/";

    public function __construct() {
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

        $query = "SELECT b.id, b.userId, u.firstName, u.lastName, b.title, b.content, b.status, b.createdAt, b.media_urls 
                  FROM blogs b 
                  JOIN users u ON b.userId = u.id 
                  ORDER BY b.createdAt DESC";
        $blogs = $this->db->query($query);

        if (isset($blogs['success']) && !$blogs['success']) {
            Logger::log("getAllBlogs failed: " . $blogs['message']);
            return ["success" => false, "message" => $blogs['message']];
        }

        foreach ($blogs as &$blog) {
            $blog['media_urls'] = json_decode($blog['media_urls'], true) ?: [];
        }

        Logger::log("getAllBlogs query result: " . json_encode([
            'blog_count' => count($blogs),
            'sample' => $blogs ? array_slice($blogs, 0, 1) : []
        ]));

        return ["success" => true, "data" => $blogs];
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
        $query = "SELECT id, role FROM users WHERE id = ?";
        $user = $this->db->fetchQuery($query, "i", $userId);
        Logger::log("User check result: " . json_encode($user));
        if (empty($user)) {
            Logger::log("User not found for userId: $userId");
            return ["success" => false, "message" => "User not found"];
        }

        // Check if the user is an admin
        $userRole = $user[0]['role'];
        Logger::log("User role for userId $userId: $userRole");
        if ($userRole === 'admin') {
            Logger::log("Admin user (userId: $userId) attempted to create a blog");
            return ["success" => false, "message" => "Admins are not allowed to create blogs"];
        }

        // Handle media uploads
        $mediaUrls = $this->handleMediaUploads($mediaFiles, $existingMedia);

        $mediaUrlsJson = json_encode($mediaUrls);
        $query = "INSERT INTO blogs (userId, title, content, status, media_urls) VALUES (?, ?, ?, ?, ?)";
        $types = "issss";
        $result = $this->db->executeQuery($query, $types, $userId, $title, $content, $status, $mediaUrlsJson);

        Logger::log("createBlog query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'insert_id' => $result['insert_id'],
            'message' => $result['message']
        ]));

        if ($result['success'] && $result['affected_rows'] > 0) {
            $blogId = $result['insert_id'];
            return ["success" => true, "message" => "Blog created successfully", "blogId" => $blogId];
        } else {
            return ["success" => false, "message" => $result['message'] ?? "Failed to create blog"];
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
        $query = "SELECT id, media_urls FROM blogs WHERE id = ? AND userId = ?";
        $blog = $this->db->fetchQuery($query, "ii", $blogId, $userId);
        Logger::log("Blog check result: " . json_encode($blog));
        if (empty($blog)) {
            Logger::log("Blog not found or not owned by user - blogId: $blogId, userId: $userId");
            return ["success" => false, "message" => "Blog not found or unauthorized"];
        }

        // Handle media uploads
        $mediaUrls = $this->handleMediaUploads($mediaFiles, $existingMedia);

        $mediaUrlsJson = json_encode($mediaUrls);
        $query = "UPDATE blogs SET title = ?, content = ?, status = ?, media_urls = ? WHERE id = ? AND userId = ?";
        $types = "ssssii";
        $result = $this->db->executeQuery($query, $types, $title, $content, $status, $mediaUrlsJson, $blogId, $userId);

        Logger::log("updateBlog query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'message' => $result['message']
        ]));

        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Blog updated successfully"]
            : ["success" => false, "message" => $result['message'] ?? "Failed to update blog"];
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
        $query = "SELECT media_urls FROM blogs WHERE id = ? AND userId = ?";
        $blog = $this->db->fetchQuery($query, "ii", $blogId, $userId);
        Logger::log("Blog check result: " . json_encode($blog));
        if (empty($blog)) {
            Logger::log("Blog not found or not owned by user - blogId: $blogId, userId: $userId");
            return ["success" => false, "message" => "Blog not found or unauthorized"];
        }

        // Delete associated media files
        $mediaUrls = json_decode($blog[0]['media_urls'], true) ?: [];
        foreach ($mediaUrls as $url) {
            $filePath = str_replace($this->baseUrl, $this->uploadDir, $url);
            if (file_exists($filePath)) {
                unlink($filePath);
                Logger::log("Deleted media file: $filePath");
            }
        }

        $query = "DELETE FROM blogs WHERE id = ? AND userId = ?";
        $types = "ii";
        $result = $this->db->executeQuery($query, $types, $blogId, $userId);

        Logger::log("deleteBlog query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'message' => $result['message']
        ]));

        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Blog deleted successfully"]
            : ["success" => false, "message" => $result['message'] ?? "Failed to delete blog"];
    }

    // Helper method to handle media uploads
    private function handleMediaUploads($mediaFiles, $existingMedia) {
        Logger::log("Handling media uploads");
        $mediaUrls = is_array($existingMedia) ? $existingMedia : [];

        if (!empty($mediaFiles) && isset($mediaFiles['name'])) {
            $fileCount = count($mediaFiles['name']);
            for ($i = 0; $i < $fileCount; $i++) {
                if ($mediaFiles['error'][$i] !== UPLOAD_ERR_OK) {
                    Logger::log("Upload error for file: " . $mediaFiles['name'][$i]);
                    continue;
                }

                $fileName = uniqid() . '_' . basename($mediaFiles['name'][$i]);
                $filePath = $this->uploadDir . $fileName;

                if (move_uploaded_file($mediaFiles['tmp_name'][$i], $filePath)) {
                    $mediaUrls[] = $this->baseUrl . $fileName;
                    Logger::log("Uploaded file: $fileName");
                } else {
                    Logger::log("Failed to upload file: " . $mediaFiles['name'][$i]);
                }
            }
        }

        return $mediaUrls;
    }
}
?>