<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

require_once __DIR__ . "/../inc_databaseClass.php";

class BlogsModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
        $this->log("BlogsModel::construct: Initialized at " . date('Y-m-d H:i:s') . "\n");
    }

    // Helper for logging
    private function log($message) {
        $logDir = __DIR__ . "/../logs";
        $logFile = $logDir . "/debug.log";
        if (is_dir($logDir) && is_writable($logDir)) {
            file_put_contents($logFile, $message, FILE_APPEND);
        }
    }

    public function createBlog($userId, $title, $content, $mediaUrls = [], $status = 'draft') {
        $this->log("BlogsModel::createBlog: userId=$userId, title=$title, status=$status\n");

        if (empty($userId) || empty($title) || empty($content)) {
            $this->log("BlogsModel::createBlog: Missing required fields\n");
            return ["success" => false, "message" => "All fields are required"];
        }

        if (!is_numeric($userId)) {
            $this->log("BlogsModel::createBlog: Invalid userId\n");
            return ["success" => false, "message" => "User ID must be numeric"];
        }

        if (!in_array($status, ['draft', 'published'])) {
            $this->log("BlogsModel::createBlog: Invalid status, defaulting to draft\n");
            $status = 'draft';
        }

        $query = "INSERT INTO blogs (userId, title, content, media_urls, status) VALUES (?, ?, ?, ?, ?)";
        $types = "issss";
        $mediaJson = json_encode($mediaUrls);
        $result = $this->db->executeQuery($query, $types, $userId, $title, $content, $mediaJson, $status);

        $this->log("BlogsModel::createBlog Result: " . print_r($result, true) . "\n");
        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Blog created successfully"]
            : ["success" => false, "message" => "Failed to create blog"];
    }

    public function getBlogs($userId = null) {
        $this->log("BlogsModel::getBlogs: userId=" . ($userId ?? 'null') . "\n");

        if ($userId && !is_numeric($userId)) {
            $this->log("BlogsModel::getBlogs: Invalid userId\n");
            return ["success" => false, "message" => "User ID must be numeric"];
        }

        if ($userId) {
            $query = "SELECT b.id, b.userId, b.title, b.content, b.media_urls, b.status, b.createdAt, b.updatedAt, 
                             u.firstName, u.lastName 
                      FROM blogs b 
                      JOIN users u ON b.userId = u.id 
                      WHERE b.userId = ?";
            $types = "i";
            $result = $this->db->fetchQuery($query, $types, $userId);
        } else {
            $query = "SELECT b.id, b.userId, b.title, b.content, b.media_urls, b.status, b.createdAt, b.updatedAt, 
                             u.firstName, u.lastName 
                      FROM blogs b 
                      JOIN users u ON b.userId = u.id 
                      WHERE b.status = 'published'";
            $result = $this->db->fetchQuery($query);
        }

        $this->log("BlogsModel::getBlogs Result: " . json_encode($result) . "\n");

        if (!is_array($result) || !isset($result['success'])) {
            $this->log("BlogsModel::getBlogs: Invalid result format\n");
            return ["success" => false, "message" => "Failed to fetch blogs: Invalid database response"];
        }

        if ($result['success']) {
            foreach ($result['data'] as &$blog) {
                $blog['media_urls'] = $blog['media_urls'] ? json_decode($blog['media_urls'], true) : [];
            }
            $this->log("BlogsModel::getBlogs: Processed " . count($result['data']) . " blogs\n");
            return ["success" => true, "data" => $result['data']];
        }

        $this->log("BlogsModel::getBlogs: Failed to fetch blogs: " . ($result['message'] ?? 'Unknown error') . "\n");
        return ["success" => false, "message" => "Failed to fetch blogs"];
    }

    public function updateBlog($blogId, $userId, $title, $content, $mediaUrls = [], $status = 'draft') {
        $this->log("BlogsModel::updateBlog: blogId=$blogId, userId=$userId, title=$title, status=$status\n");

        if (empty($blogId) || empty($userId) || empty($title) || empty($content)) {
            $this->log("BlogsModel::updateBlog: Missing required fields\n");
            return ["success" => false, "message" => "All fields are required"];
        }

        if (!is_numeric($blogId) || !is_numeric($userId)) {
            $this->log("BlogsModel::updateBlog: Invalid blogId or userId\n");
            return ["success" => false, "message" => "Blog ID and User ID must be numeric"];
        }

        if (!in_array($status, ['draft', 'published'])) {
            $this->log("BlogsModel::updateBlog: Invalid status, defaulting to draft\n");
            $status = 'draft';
        }

        $query = "SELECT id FROM blogs WHERE id = ? AND userId = ?";
        $existing = $this->db->fetchQuery($query, "ii", $blogId, $userId);
        if (!is_array($existing) || !isset($existing['success']) || empty($existing['data'])) {
            $this->log("BlogsModel::updateBlog: Blog not found or unauthorized\n");
            return ["success" => false, "message" => "Blog not found or unauthorized"];
        }

        $query = "UPDATE blogs SET title = ?, content = ?, media_urls = ?, status = ? WHERE id = ? AND userId = ?";
        $types = "ssssii";
        $mediaJson = json_encode($mediaUrls);
        $result = $this->db->executeQuery($query, $types, $title, $content, $mediaJson, $status, $blogId, $userId);

        $this->log("BlogsModel::updateBlog Result: " . print_r($result, true) . "\n");
        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Blog updated successfully"]
            : ["success" => false, "message" => "Failed to update blog"];
    }

    public function deleteBlog($blogId, $userId) {
        $this->log("BlogsModel::deleteBlog: blogId=$blogId, userId=$userId\n");

        if (empty($blogId) || empty($userId)) {
            $this->log("BlogsModel::deleteBlog: Missing required fields\n");
            return ["success" => false, "message" => "Blog ID and User ID are required"];
        }

        if (!is_numeric($blogId) || !is_numeric($userId)) {
            $this->log("BlogsModel::deleteBlog: Invalid blogId or userId\n");
            return ["success" => false, "message" => "Blog ID and User ID must be numeric"];
        }

        $query = "SELECT id FROM blogs WHERE id = ? AND userId = ?";
        $existing = $this->db->fetchQuery($query, "ii", $blogId, $userId);
        if (!is_array($existing) || !isset($existing['success']) || empty($existing['data'])) {
            $this->log("BlogsModel::deleteBlog: Blog not found or unauthorized\n");
            return ["success" => false, "message" => "Blog not found or unauthorized"];
        }

        $query = "DELETE FROM blogs WHERE id = ? AND userId = ?";
        $types = "ii";
        $result = $this->db->executeQuery($query, $types, $blogId, $userId);

        $this->log("BlogsModel::deleteBlog Result: " . print_r($result, true) . "\n");
        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Blog deleted successfully"]
            : ["success" => false, "message" => "Failed to delete blog"];
    }

    public function uploadMedia($files) {
        $this->log("BlogsModel::uploadMedia: Processing files\n");

        $mediaUrls = [];
        $uploadDir = __DIR__ . "/../../Uploads/blogs/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
            $this->log("BlogsModel::uploadMedia: Created upload directory\n");
        }

        if (!empty($files['name'][0])) {
            foreach ($files['name'] as $key => $name) {
                if ($files['error'][$key] === UPLOAD_ERR_OK) {
                    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'mp4', 'webm', 'ogg'])) {
                        $this->log("BlogsModel::uploadMedia: Unsupported file type: $ext\n");
                        continue;
                    }
                    $filename = uniqid() . '.' . $ext;
                    $destination = $uploadDir . $filename;
                    if (move_uploaded_file($files['tmp_name'][$key], $destination)) {
                        $mediaUrls[] = '/Uploads/blogs/' . $filename;
                        $this->log("BlogsModel::uploadMedia: Uploaded $filename\n");
                    } else {
                        $this->log("BlogsModel::uploadMedia: Failed to upload $filename\n");
                    }
                } else {
                    $this->log("BlogsModel::uploadMedia: Upload error for file $key: " . $files['error'][$key] . "\n");
                }
            }
        }

        $this->log("BlogsModel::uploadMedia: Returning media URLs: " . json_encode($mediaUrls) . "\n");
        return $mediaUrls;
    }
}
?>