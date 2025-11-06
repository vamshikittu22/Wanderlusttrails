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
     * 🏢 FLEXIBLE ADMIN BUSINESS OVERVIEW
     * Adapts to your actual booking status values
     */
    public function getBusinessOverview($days = 30) {
        Logger::log("ADMIN-OVERVIEW: Generating dashboard for last $days days");
        
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
                
                -- 💰 FLEXIBLE REVENUE METRICS - ADAPTS TO YOUR DATA
                
                -- Option A: All successful payments (original approach)
                COALESCE(SUM(CASE WHEN p.payment_status = 'completed' THEN p.amount END), 0) as total_revenue_all_payments,
                
                -- Option B: Only confirmed bookings (strict approach)
                COALESCE(SUM(CASE 
                    WHEN p.payment_status = 'completed' AND b.status = 'confirmed' 
                    THEN p.amount 
                END), 0) as total_revenue_confirmed_only,
                
                -- Option C: Non-canceled bookings (middle ground)
                COALESCE(SUM(CASE 
                    WHEN p.payment_status = 'completed' AND (b.status != 'canceled' OR b.status IS NULL)
                    THEN p.amount 
                END), 0) as total_revenue_non_canceled,
                
                -- Recent revenue variants
                COALESCE(SUM(CASE 
                    WHEN p.payment_status = 'completed' 
                    AND p.payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                    THEN p.amount 
                END), 0) as recent_revenue_all_payments,
                
                COALESCE(SUM(CASE 
                    WHEN p.payment_status = 'completed' AND (b.status != 'canceled' OR b.status IS NULL)
                    AND p.payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                    THEN p.amount 
                END), 0) as recent_revenue_non_canceled,
                
                -- Average booking value
                COALESCE(AVG(CASE WHEN p.payment_status = 'completed' THEN p.amount END), 0) as avg_booking_value,
                
                -- 📈 CONVERSION RATE
                ROUND((COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) / NULLIF(COUNT(b.id), 0)) * 100, 2) as booking_confirmation_rate
                
            FROM users u
            LEFT JOIN bookings b ON u.id = b.user_id
            LEFT JOIN payments p ON b.id = p.booking_id
        ";
        
        $overview = $this->db->fetchQuery($businessOverviewQuery, "");
        
        if ($overview && !empty($overview)) {
            $data = $overview[0];
            
            // 🎯 SMART REVENUE SELECTION - Choose best approach based on your data
            $selectedRevenue = 0;
            $selectedRecentRevenue = 0;
            $revenueMethod = '';
            
            if ($data['total_revenue_confirmed_only'] > 0) {
                // Use confirmed bookings if available
                $selectedRevenue = $data['total_revenue_confirmed_only'];
                $selectedRecentRevenue = $data['recent_revenue_non_canceled']; // fallback for recent
                $revenueMethod = 'confirmed_bookings_only';
            } elseif ($data['total_revenue_non_canceled'] > 0) {
                // Use non-canceled bookings as middle ground
                $selectedRevenue = $data['total_revenue_non_canceled'];
                $selectedRecentRevenue = $data['recent_revenue_non_canceled'];
                $revenueMethod = 'non_canceled_bookings';
            } else {
                // Fall back to all successful payments
                $selectedRevenue = $data['total_revenue_all_payments'];
                $selectedRecentRevenue = $data['recent_revenue_all_payments'];
                $revenueMethod = 'all_successful_payments';
            }
            
            $dailyRevenue = $days > 0 ? ($selectedRecentRevenue / $days) : 0;
            
            // 🎯 DEBUG LOGGING - Show which method was selected
            Logger::log("REVENUE-DEBUG: Selected method: $revenueMethod | Total: $selectedRevenue | Recent: $selectedRecentRevenue | Confirmed only: {$data['total_revenue_confirmed_only']} | Non-canceled: {$data['total_revenue_non_canceled']} | All payments: {$data['total_revenue_all_payments']}");
            
            // Generate insights
            $insights = [];
            
            // Revenue method insight
            $insights[] = [
                "type" => "info",
                "icon" => "📊",
                "title" => "Revenue Calculation Method",
                "message" => "Using revenue method: " . str_replace('_', ' ', $revenueMethod),
                "action" => "Revenue: $" . number_format($selectedRevenue, 2),
                "priority" => "low"
            ];
            
            // Pending bookings alert
            if ($data['pending_bookings_requiring_attention'] > 0) {
                $insights[] = [
                    "type" => "warning",
                    "icon" => "⏳",
                    "title" => "Pending Bookings Alert",
                    "message" => "{$data['pending_bookings_requiring_attention']} bookings need attention",
                    "action" => "Review and confirm pending bookings",
                    "priority" => "high"
                ];
            }
            
            return [
                "success" => true,
                "data" => [
                    "business_metrics" => array_merge($data, [
                        "total_revenue" => $selectedRevenue,
                        "recent_revenue" => $selectedRecentRevenue,
                        "daily_revenue_avg" => round($dailyRevenue, 2),
                        "revenue_method_used" => $revenueMethod
                    ]),
                    "revenue_breakdown" => [
                        "all_payments" => $data['total_revenue_all_payments'],
                        "confirmed_only" => $data['total_revenue_confirmed_only'],
                        "non_canceled" => $data['total_revenue_non_canceled'],
                        "selected_method" => $revenueMethod,
                        "selected_amount" => $selectedRevenue
                    ],
                    "calculated_metrics" => [
                        "estimated_monthly_revenue" => round($dailyRevenue * 30, 2),
                        "profit_share_percentage" => 25.0,
                        "estimated_profit_this_period" => round($selectedRevenue * 0.25, 2)
                    ],
                    "insights" => $insights,
                    "dashboard_type" => "admin_executive_overview_flexible",
                    "generated_at" => date('Y-m-d H:i:s'),
                    "analysis_period" => "$days days"
                ]
            ];
        }
        
        return ["success" => false, "message" => "Failed to generate business overview"];
    }




}
?>