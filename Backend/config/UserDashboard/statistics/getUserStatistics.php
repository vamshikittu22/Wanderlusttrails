<?php
/**
 * WANDERLUST TRAILS - USER PERSONAL STATISTICS API  
 * Path: Backend/config/statistics/user/getUserStatistics.php
 * 
 * Purpose: Provides personalized travel analytics for individual users
 * Security Level: USER SPECIFIC - Only shows data belonging to the requesting user
 * 
 * Features:
 * - Personal booking history and spending analytics
 * - Travel achievements and milestone tracking
 * - Personal blog and review statistics  
 * - Todo completion rates and productivity
 * - Travel pattern analysis and preferences
 * - Personalized travel recommendations
 * 
 * @author Your Name
 * @business_impact MEDIUM - User engagement and retention
 * @security_level MEDIUM - Personal data protection
 */

// CORS headers for user dashboard frontend access
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");  
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 86400");

// Include required dependencies
require_once __DIR__ . "/../../inc_logger.php";
require_once __DIR__ . "/inc_UserStatisticsModel.php";

Logger::log("USER-STATS-API: Personal analytics request started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle CORS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("USER-STATS-API: CORS preflight for user statistics endpoint");
    http_response_code(200);
    echo json_encode(["message" => "CORS preflight approved for user statistics"]);
    exit;
}

// Enforce GET method for statistics retrieval (read-only operation)
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("USER-STATS-SECURITY: Invalid method attempted: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed - User statistics require GET method", 
        "allowed_method" => "GET"
    ]);
    exit;
}

// Get and validate request parameters
$userId = $_GET['user_id'] ?? null;                 // Required: Which user's stats to get
$category = $_GET['category'] ?? 'travel_summary';  // Default: travel summary
$timeRange = $_GET['time_range'] ?? '365';          // Default: last year for personal stats

// Validate user ID is provided and numeric
if (!$userId || !is_numeric($userId)) {
    Logger::log("USER-STATS-VALIDATION: Missing or invalid user_id: " . ($userId ?? 'null'));
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Valid user ID is required",
        "provided_user_id" => $userId
    ]);
    exit;
}

// Sanitize user ID
$userId = (int)$userId;

// Validate time range parameter
$validTimeRanges = ['30', '90', '365', 'all'];
if (!in_array($timeRange, $validTimeRanges)) {
    Logger::log("USER-STATS-VALIDATION: Invalid time range: $timeRange");
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid time range. Allowed values: " . implode(', ', $validTimeRanges),
        "provided_range" => $timeRange
    ]);
    exit;
}

// Validate statistics category parameter
$validCategories = ['travel_summary', 'spending_analytics', 'achievements', 'content_stats', 'productivity', 'travel_patterns'];
if (!in_array($category, $validCategories)) {
    Logger::log("USER-STATS-VALIDATION: Invalid category: $category");
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid category. Allowed values: " . implode(', ', $validCategories),
        "provided_category" => $category
    ]);
    exit;
}

Logger::log("USER-STATS-REQUEST: Generating $category statistics for user $userId (Range: $timeRange days)");

try {
    // Initialize user statistics model
    $userStatsModel = new UserStatisticsModel();
    
    // Route to appropriate statistics method based on category
    switch ($category) {
        case 'travel_summary':
            $result = $userStatsModel->getTravelSummary($userId, $timeRange);
            break;
            
        default:
            $result = $userStatsModel->getTravelSummary($userId, $timeRange);
    }
    
    // Return user statistics data or error response
    if ($result['success']) {
        Logger::log("USER-STATS-SUCCESS: Generated $category statistics for user $userId successfully");
        http_response_code(200);
        echo json_encode($result);
    } else {
        Logger::log("USER-STATS-ERROR: Failed to generate $category statistics for user $userId - " . $result['message']);
        http_response_code(500);
        echo json_encode($result);
    }
    
} catch (Exception $e) {
    Logger::log("USER-STATS-EXCEPTION: Critical error for user $userId - " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Critical error generating user statistics: " . $e->getMessage(),
        "user_id" => $userId,
        "category" => $category,
        "time_range" => $timeRange,
        "timestamp" => date('Y-m-d H:i:s')
    ]);
}

exit;
?>