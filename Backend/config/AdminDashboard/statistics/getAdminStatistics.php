<?php
/**
 * WANDERLUST TRAILS - ADMIN BUSINESS STATISTICS API
 * Path: Backend/config/statistics/admin/getAdminStatistics.php
 * 
 * Purpose: Provides comprehensive business intelligence for administrators
 * Security Level: ADMIN ONLY - Contains sensitive business metrics
 * 
 * Features:
 * - User growth and engagement metrics
 * - Booking volume and conversion analytics  
 * - Revenue performance and payment insights
 * - Blog and review engagement statistics
 * - Todo completion rates and productivity metrics
 * - Geographic distribution and travel patterns
 * 
 * @author Your Name
 * @business_impact CRITICAL - Executive decision making data
 * @security_level HIGH - Business intelligence information
 */

// CORS headers for admin dashboard frontend access
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 86400");

// Include required dependencies
require_once __DIR__ . "/../../inc_logger.php";
require_once __DIR__ . "/inc_AdminStatisticsModel.php";

Logger::log("ADMIN-STATS-API: Business intelligence request started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle CORS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("ADMIN-STATS-API: CORS preflight for admin statistics endpoint");
    http_response_code(200);
    echo json_encode(["message" => "CORS preflight approved for admin statistics"]);
    exit;
}

// Enforce GET method for statistics retrieval (read-only operation)
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("ADMIN-STATS-SECURITY: Invalid method attempted: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed - Admin statistics require GET method",
        "allowed_method" => "GET"
    ]);
    exit;
}

// Get request parameters for customizing statistics scope
$timeRange = $_GET['time_range'] ?? '30';           // Default: last 30 days
$category = $_GET['category'] ?? 'overview';        // Default: overview statistics
$adminId = $_GET['admin_id'] ?? null;               // Admin making request (for audit)

// Validate time range parameter (prevent SQL injection and invalid ranges)
$validTimeRanges = ['7', '30', '90', '365'];
if (!in_array($timeRange, $validTimeRanges)) {
    Logger::log("ADMIN-STATS-VALIDATION: Invalid time range: $timeRange");
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid time range. Allowed values: " . implode(', ', $validTimeRanges),
        "provided_range" => $timeRange
    ]);
    exit;
}

// Validate statistics category parameter  
$validCategories = ['overview', 'users', 'bookings', 'revenue', 'content', 'productivity'];
if (!in_array($category, $validCategories)) {
    Logger::log("ADMIN-STATS-VALIDATION: Invalid category: $category");
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid category. Allowed values: " . implode(', ', $validCategories),
        "provided_category" => $category
    ]);
    exit;
}

Logger::log("ADMIN-STATS-REQUEST: Generating $category statistics for admin (Range: $timeRange days, Admin ID: $adminId)");

try {
    // Initialize admin statistics model
    $adminStatsModel = new AdminStatisticsModel();
    
    // Route to appropriate statistics method based on category
    switch ($category) {
        case 'overview':
            $result = $adminStatsModel->getBusinessOverview($timeRange);
            break;
            
        default:
            $result = $adminStatsModel->getBusinessOverview($timeRange);
    }
    
    // Return statistics data or error response
    if ($result['success']) {
        Logger::log("ADMIN-STATS-SUCCESS: Generated $category statistics successfully for $timeRange days");
        http_response_code(200);
        echo json_encode($result);
    } else {
        Logger::log("ADMIN-STATS-ERROR: Failed to generate $category statistics - " . $result['message']);
        http_response_code(500);
        echo json_encode($result);
    }
    
} catch (Exception $e) {
    Logger::log("ADMIN-STATS-EXCEPTION: Critical error - " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Critical error generating admin statistics: " . $e->getMessage(),
        "category" => $category,
        "time_range" => $timeRange,
        "timestamp" => date('Y-m-d H:i:s')
    ]);
}

exit;
?>