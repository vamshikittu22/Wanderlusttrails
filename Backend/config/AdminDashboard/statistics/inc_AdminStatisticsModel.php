<?php
/**
 * WANDERLUST TRAILS - ADMIN BUSINESS STATISTICS MODEL
 * Path: Backend/config/statistics/admin/inc_AdminStatisticsModel.php
 * 
 * This is the BUSINESS INTELLIGENCE ENGINE for administrators
 * Generates comprehensive analytics from all available database tables
 * 
 * Data Sources: users, bookings, payments, blogs, reviews, todos, packages
 * Security: Admin-level access to sensitive business metrics
 * Performance: Optimized queries with proper indexing considerations
 * 
 * @author Your Name
 * @business_impact CRITICAL - Powers executive decision making
 */

// Include required dependencies
require_once __DIR__ . "/../../inc_databaseClass.php";
require_once __DIR__ . "/../../inc_logger.php";

class AdminStatisticsModel {
    private $db;
    
    /**
     * Constructor - Initialize database connection for statistics queries
     */
    public function __construct() {
        $this->db = new DatabaseClass();
        Logger::log("ADMIN-STATS-MODEL: Business intelligence engine initialized");
    }
    
    /**
 * 🏢 BUSINESS OVERVIEW - PAYMENT FAILURES HANDLED
 * Fixed to properly exclude failed payments and count payment success rates
 */
    /**
 * 🎯 FIXED ADMIN STATISTICS MODEL
 * Single source of truth for payment success rate
 */
public function getBusinessOverview($days = 30) {
    Logger::log("ADMIN-OVERVIEW: Generating dashboard for last $days days");
    
    // 📊 BASIC BUSINESS QUERY (without payment rate confusion)
    $businessOverviewQuery = "
        SELECT 
            -- 👥 USER METRICS
            COUNT(DISTINCT u.id) as total_users,
            COUNT(DISTINCT CASE WHEN u.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN u.id END) as new_users_period,
            
            -- 🎒 BOOKING METRICS
            COUNT(DISTINCT b.id) as total_bookings,
            COUNT(DISTINCT CASE WHEN b.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN b.id END) as new_bookings_period,
            COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
            COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_bookings_requiring_attention,
            COUNT(CASE WHEN b.status = 'canceled' THEN 1 END) as canceled_bookings,
            
            -- 📊 BOOKING CATEGORIES
            COUNT(CASE WHEN b.booking_type = 'package' THEN 1 END) as package_bookings,
            COUNT(CASE WHEN b.booking_type = 'flight_hotel' THEN 1 END) as flight_hotel_bookings,
            COUNT(CASE WHEN b.booking_type = 'itinerary' THEN 1 END) as itinerary_bookings,
            
            -- 👥 TRAVELER ANALYTICS
            COALESCE(SUM(b.persons), 0) as total_travelers,
            COALESCE(AVG(b.persons), 0) as avg_travelers_per_booking,
            
            -- 💰 REVENUE METRICS
            COALESCE(SUM(CASE WHEN p.payment_status = 'completed' THEN p.amount END), 0) as total_revenue,
            COALESCE(SUM(CASE WHEN p.payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND p.payment_status = 'completed' THEN p.amount END), 0) as recent_revenue,
            COALESCE(AVG(CASE WHEN p.payment_status = 'completed' THEN p.amount END), 0) as avg_booking_value,
            
            -- 📈 BASIC CONVERSION RATE (without payment confusion)
            ROUND((COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) / NULLIF(COUNT(b.id), 0)) * 100, 2) as booking_confirmation_rate
            
        FROM users u
        LEFT JOIN bookings b ON u.id = b.user_id
        LEFT JOIN payments p ON b.id = p.booking_id
    ";
    
    // 💳 SEPARATE PAYMENT SUCCESS RATE QUERY
    $paymentSuccessQuery = "
        SELECT 
            COUNT(*) as total_payments,
            COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as successful_payments,
            COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
            COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_payments,
            COUNT(CASE WHEN payment_status NOT IN ('completed', 'pending', 'failed') THEN 1 END) as unknown_status_payments,
            
            -- 🎯 ACCURATE SUCCESS RATE
            CASE 
                WHEN COUNT(*) > 0 THEN ROUND((COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) / COUNT(*)) * 100, 2)
                ELSE 0
            END as payment_success_rate
        FROM payments
    ";
    
    // Execute both queries
    $overview = $this->db->fetchQuery($businessOverviewQuery, "");
    $paymentStats = $this->db->fetchQuery($paymentSuccessQuery, "");
    
    if ($overview && !empty($overview)) {
        $businessData = $overview[0];
        $paymentData = $paymentStats[0] ?? ['payment_success_rate' => 0, 'total_payments' => 0];
        
        $dailyRevenue = $days > 0 ? ($businessData['recent_revenue'] / $days) : 0;
        
        // 🎯 GENERATE ACCURATE INSIGHTS
        $insights = [];
        
        // Payment performance insight (FIXED!)
        if ($paymentData['total_payments'] == 0) {
            $insights[] = [
                "type" => "info",
                "icon" => "💳",
                "title" => "Payment System Status", 
                "message" => "No payment data available for analysis",
                "action" => "Verify payment system integration",
                "priority" => "medium"
            ];
        } elseif ($paymentData['payment_success_rate'] < 70) {
            $insights[] = [
                "type" => "warning",
                "icon" => "⚠️", 
                "title" => "Payment Success Rate Needs Attention",
                "message" => "Payment success rate is {$paymentData['payment_success_rate']}%",
                "action" => "Review payment gateway performance",
                "priority" => "high"
            ];
        } elseif ($paymentData['payment_success_rate'] >= 80) {
            $insights[] = [
                "type" => "success",
                "icon" => "✅",
                "title" => "Excellent Payment Performance",
                "message" => "Payment success rate is {$paymentData['payment_success_rate']}%",
                "action" => "Maintain current payment system configuration", 
                "priority" => "low"
            ];
        }
        
        // Business performance insights
        if ($businessData['pending_bookings_requiring_attention'] > 0) {
            $insights[] = [
                "type" => "warning",
                "icon" => "⏳",
                "title" => "Pending Bookings Alert",
                "message" => "{$businessData['pending_bookings_requiring_attention']} bookings need attention",
                "action" => "Review and confirm pending bookings",
                "priority" => "high"
            ];
        }
        
        return [
            "success" => true,
            "data" => [
                "business_metrics" => array_merge($businessData, [
                    "daily_revenue_avg" => round($dailyRevenue, 2),
                    "payment_success_rate" => $paymentData['payment_success_rate']  // SINGLE SOURCE OF TRUTH
                ]),
                "payment_breakdown" => [
                    "total_payments" => $paymentData['total_payments'],
                    "successful_payments" => $paymentData['successful_payments'],
                    "pending_payments" => $paymentData['pending_payments'],
                    "failed_payments" => $paymentData['failed_payments'],
                    "success_rate_display" => $paymentData['payment_success_rate'] . "%"
                ],
                "calculated_metrics" => [
                    "estimated_monthly_revenue" => round($dailyRevenue * 30, 2),
                    "profit_share_percentage" => 25.0,
                    "estimated_profit_this_period" => round($businessData['recent_revenue'] * 0.25, 2)
                ],
                "insights" => $insights,
                "dashboard_type" => "admin_executive_overview",
                "generated_at" => date('Y-m-d H:i:s'),
                "analysis_period" => "$days days"
            ]
        ];
    }
    
    return ["success" => false, "message" => "Failed to generate business overview"];
}


}
?>