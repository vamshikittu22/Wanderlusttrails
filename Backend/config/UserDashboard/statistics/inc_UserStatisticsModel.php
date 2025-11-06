<?php
/**
 * WANDERLUST TRAILS - USER PERSONAL STATISTICS MODEL
 * Path: Backend/config/statistics/user/inc_UserStatisticsModel.php
 * 
 * This is the PERSONAL ANALYTICS ENGINE for individual users
 * Generates personalized travel insights, achievements, and recommendations
 * 
 * Data Sources: users, bookings, payments, blogs, reviews, todos (user-specific)
 * Security: User can only access their own data
 * Features: Travel achievements, spending analysis, content statistics
 * 
 * @author Your Name
 * @business_impact MEDIUM - User engagement and platform retention
 */

// Include required dependencies
require_once __DIR__ . "/../../inc_databaseClass.php"; 
require_once __DIR__ . "/../../inc_logger.php";

class UserStatisticsModel {
    private $db;
    
    /**
     * Constructor - Initialize database connection for user analytics
     */
    public function __construct() {
        $this->db = new DatabaseClass();
        Logger::log("USER-STATS-MODEL: Personal analytics engine initialized");
    }
    
    /**
     * 🎒 USER TRAVEL SUMMARY - PERSONAL TRAVEL DASHBOARD
     * Comprehensive overview of user's travel history and patterns
     * 
     * @param int $userId - ID of the user requesting statistics
     * @param string $timeRange - Analysis period 
     * @return array - Personal travel summary data
     */

/**
 * 🎒 ENHANCED USER TRAVEL SUMMARY - DUAL CONDITIONS + WORKING BASE
 * Uses your working structure with business logic improvements
 */
public function getTravelSummary($userId, $timeRange = '365') {
    Logger::log("USER-TRAVEL-SUMMARY: Generating dashboard for user $userId (Range: $timeRange days)");
    
    // Build time condition (same as your working version)
    $timeCondition = '';
    if ($timeRange !== 'all') {
        $timeCondition = 'AND b.created_at >= DATE_SUB(NOW(), INTERVAL ' . (int)$timeRange . ' DAY)';
    }
    
    // 🎯 ENHANCED SQL - KEEPING YOUR WORKING STRUCTURE + DUAL CONDITIONS
    $travelSummaryQuery = "
        SELECT 
            -- 🎒 PERSONAL BOOKING METRICS (same as working)
            COUNT(DISTINCT b.id) as total_trips,
            COUNT(CASE WHEN b.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as recent_trips,
            COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as completed_trips,
            COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as upcoming_trips,
            COUNT(CASE WHEN b.status = 'canceled' THEN 1 END) as canceled_trips,
            
            -- 📊 BOOKING CATEGORY BREAKDOWN (same as working)
            COUNT(CASE WHEN b.booking_type = 'package' THEN 1 END) as my_package_bookings,
            COUNT(CASE WHEN b.booking_type = 'flight_hotel' THEN 1 END) as my_flight_hotel_bookings,
            COUNT(CASE WHEN b.booking_type = 'itinerary' THEN 1 END) as my_itinerary_bookings,
            
            -- 👥 CO-TRAVELER ANALYTICS (same as working)
            COALESCE(SUM(b.persons), 0) as total_companions_traveled_with,
            COALESCE(AVG(b.persons), 0) as avg_companions_per_trip,
            COUNT(CASE WHEN b.persons = 1 THEN 1 END) as solo_trips,
            COUNT(CASE WHEN b.persons = 2 THEN 1 END) as couple_trips,
            COUNT(CASE WHEN b.persons >= 3 THEN 1 END) as group_trips,
            
            -- 💰 ENHANCED SPENDING ANALYTICS - DUAL CONDITIONS ADDED
            COALESCE(SUM(CASE WHEN p.payment_status = 'completed' THEN p.amount END), 0) as total_spent_on_travel,
            COALESCE(SUM(CASE WHEN p.payment_date >= DATE_SUB(NOW(), INTERVAL ? DAY) AND p.payment_status = 'completed' THEN p.amount END), 0) as recent_spending,
            COALESCE(AVG(CASE WHEN p.payment_status = 'completed' THEN p.amount END), 0) as avg_trip_cost,
            COALESCE(MAX(CASE WHEN p.payment_status = 'completed' THEN p.amount END), 0) as most_expensive_trip,
            
            -- 💡 ADDED: Spending breakdown by booking status
            COALESCE(SUM(CASE 
                WHEN p.payment_status = 'completed' AND b.status = 'confirmed' 
                THEN p.amount 
            END), 0) as spending_on_confirmed_trips,
            
            COALESCE(SUM(CASE 
                WHEN p.payment_status = 'completed' AND b.status = 'canceled' 
                THEN p.amount 
            END), 0) as spending_on_canceled_trips,
            
            COALESCE(SUM(CASE 
                WHEN p.payment_status = 'completed' AND b.status = 'pending' 
                THEN p.amount 
            END), 0) as spending_on_pending_trips,
            
            -- 📅 TRAVEL DURATION INSIGHTS (same as working)
            COALESCE(AVG(CASE WHEN b.end_date IS NOT NULL THEN DATEDIFF(b.end_date, b.start_date) END), 0) as avg_trip_length_days,
            COALESCE(MAX(CASE WHEN b.end_date IS NOT NULL THEN DATEDIFF(b.end_date, b.start_date) END), 0) as longest_trip_days,
            COALESCE(SUM(CASE WHEN b.end_date IS NOT NULL THEN DATEDIFF(b.end_date, b.start_date) END), 0) as total_days_traveled,
            
            -- 🛡️ INSURANCE CALCULATIONS (same as working - this was correct!)
            COUNT(CASE 
                WHEN b.insurance_type IN ('basic', 'premium', 'elite') THEN 1 
                ELSE NULL 
            END) as trips_with_insurance,
            
            COUNT(CASE WHEN b.insurance_type = 'basic' THEN 1 END) as basic_insurance_trips,
            COUNT(CASE WHEN b.insurance_type = 'premium' THEN 1 END) as premium_insurance_trips,
            COUNT(CASE WHEN b.insurance_type = 'elite' THEN 1 END) as elite_insurance_trips,
            COUNT(CASE WHEN b.insurance_type = 'none' THEN 1 END) as no_insurance_trips,
            
            -- 📊 INSURANCE PERCENTAGE (same as working)
            ROUND(
                (COUNT(CASE WHEN b.insurance_type IN ('basic', 'premium', 'elite') THEN 1 END) / NULLIF(COUNT(b.id), 0)) * 100, 2
            ) as insurance_usage_percentage,
            
            -- 🌍 UNIQUE DESTINATIONS VISITED (same as working)
            COUNT(DISTINCT CASE WHEN b.package_name IS NOT NULL AND b.package_name != '' THEN b.package_name END) as unique_destinations_visited,
            
            -- ⭐ USER ACCOUNT INFORMATION (same as working - this was correct!)
            u.createdAt as member_since,
            DATEDIFF(NOW(), u.createdAt) as days_as_member,
            u.firstName,
            u.lastName,
            u.nationality as my_nationality
            
        FROM users u
        LEFT JOIN bookings b ON u.id = b.user_id $timeCondition
        LEFT JOIN payments p ON b.id = p.booking_id
        WHERE u.id = ?
        GROUP BY u.id, u.createdAt, u.firstName, u.lastName, u.nationality
    ";
    
    // Execute with proper parameter count (same as working)
    $timeParam = $timeRange === 'all' ? 999999 : (int)$timeRange;
    $travelSummary = $this->db->fetchQuery($travelSummaryQuery, "iii", $timeParam, $timeParam, $userId);
    
    if ($travelSummary && !empty($travelSummary)) {
        $data = $travelSummary[0];
        
        // 📊 ENHANCED DEBUG - Show both spending calculations
        Logger::log("ENHANCED-DEBUG: User $userId - Total: {$data['total_trips']}, Insurance: {$data['trips_with_insurance']} ({$data['insurance_usage_percentage']}%), Total Spending: {$data['total_spent_on_travel']}, Confirmed Spending: {$data['spending_on_confirmed_trips']}, Canceled: {$data['spending_on_canceled_trips']}");
        
        // Generate enhanced insights with spending breakdown
        $insights = [];
        $recommendations = [];
        
        if ($data['total_trips'] == 0) {
            $insights[] = [
                "type" => "welcome",
                "icon" => "👋",
                "message" => "Welcome to Wanderlust Trails, {$data['firstName']}! You joined {$data['days_as_member']} days ago.",
                "action" => "Start your first adventure by browsing our travel packages"
            ];
        } else {
            // Basic traveler profile (same as working)
            $insights[] = [
                "type" => "traveler_profile",
                "icon" => "🎒",
                "message" => "You're an active traveler with {$data['total_trips']} trips!",
                "action" => "Continue exploring new destinations"
            ];
            
            // Enhanced spending insight with dual conditions
            if ($data['spending_on_canceled_trips'] > 0) {
                $insights[] = [
                    "type" => "info",
                    "icon" => "💰",
                    "title" => "Spending Breakdown",
                    "message" => "Total payments: $" . number_format($data['total_spent_on_travel'], 2) . " | Confirmed trips: $" . number_format($data['spending_on_confirmed_trips'], 2) . " | Canceled: $" . number_format($data['spending_on_canceled_trips'], 2),
                    "action" => "Contact support about refunds if needed"
                ];
            } else {
                $insights[] = [
                    "type" => "success",
                    "icon" => "✅",
                    "title" => "Clean Travel Record",
                    "message" => "All your spending ($" . number_format($data['total_spent_on_travel'], 2) . ") was for confirmed trips!",
                    "action" => "Excellent travel planning!"
                ];
            }
            
            // Insurance insight (same as working - this was correct!)
            if ($data['trips_with_insurance'] > 0) {
                $insights[] = [
                    "type" => "insurance_wise",
                    "icon" => "🛡️",
                    "message" => "Great choice! You've protected {$data['trips_with_insurance']} of your {$data['total_trips']} trips with insurance ({$data['insurance_usage_percentage']}%).",
                    "action" => "Consider insurance for your next adventure too"
                ];
            }
        }
        
        return [
            "success" => true,
            "data" => [
                "travel_summary" => $data,
                "spending_breakdown" => [
                    "total_payments_made" => $data['total_spent_on_travel'],          // All payments
                    "confirmed_trip_spending" => $data['spending_on_confirmed_trips'], // Confirmed only
                    "canceled_trip_payments" => $data['spending_on_canceled_trips'],  // Refundable
                    "pending_trip_payments" => $data['spending_on_pending_trips'],    // Processing
                    "spending_note" => "Breakdown shows payment allocation by booking status"
                ],
                "insights" => $insights,
                "recommendations" => $recommendations,
                "dashboard_type" => "user_personal_travel_enhanced",
                "generated_at" => date('Y-m-d H:i:s'),
                "analysis_period" => $timeRange === 'all' ? 'All time' : "$timeRange days",
                "user_id" => $userId
            ]
        ];
    }
    
    return ["success" => false, "message" => "No travel data found"];
}





}
?>