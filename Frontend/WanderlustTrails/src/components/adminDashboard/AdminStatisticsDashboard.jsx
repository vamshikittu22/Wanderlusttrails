// AdminStatisticsDashboard.jsx
// Path: Frontend/WanderlustTrails/src/components/statistics/admin/AdminStatisticsDashboard.jsx

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
// import AdminMetricsCards from './AdminMetricsCards';
// import AdminChartsPanel from './AdminChartsPanel';
import StatisticCard from './../StatisticCard';
import LoadingSpinner from './../LoadingSpinner';

/**
 * ADMIN STATISTICS DASHBOARD COMPONENT
 * 
 * Purpose: Provides comprehensive business intelligence interface for administrators
 * Features: Executive metrics, business analytics, operational insights
 * Data: Users, bookings, revenue, content engagement, productivity metrics
 * 
 * @author Your Name
 * @business_impact CRITICAL - Executive decision making interface
 */
const AdminStatisticsDashboard = () => {
    // State management for dashboard data and controls
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('overview');
    const [timeRange, setTimeRange] = useState('30');
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    /**
     * FETCH ADMIN STATISTICS FROM BACKEND
     * Calls the admin statistics API with current parameters
     */
    const fetchAdminStatistics = async (category = selectedCategory, range = timeRange) => {
        try {
            setRefreshing(true);
            setError(null);
            
            // Build API endpoint URL with parameters
            const apiUrl = `http://localhost/wanderlusttrails/Backend/config/AdminDashboard/statistics/getAdminStatistics.php?category=${category}&time_range=${range}&admin_id=1`;

            
            console.log('Fetching admin statistics:', { category, range, apiUrl });
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Admin statistics response:', data);
            
            if (data.success) {
                setStatistics(data.data);
                toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} statistics updated`);
            } else {
                throw new Error(data.message || 'Failed to load admin statistics');
            }
            
        } catch (error) {
            console.error('Admin statistics error:', error);
            setError(error.message);
            toast.error(`Error loading admin statistics: ${error.message}`);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Load statistics on component mount and when parameters change
    useEffect(() => {
        fetchAdminStatistics();
    }, [selectedCategory, timeRange]);

    /**
     * HANDLE CATEGORY CHANGE
     * Updates selected category and fetches new data
     */
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setLoading(true);
    };

    /**
     * HANDLE TIME RANGE CHANGE  
     * Updates time range and fetches new data
     */
    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
        setLoading(true);
    };

    /**
     * MANUAL REFRESH HANDLER
     * Forces data refresh with current parameters
     */
    const handleRefresh = () => {
        fetchAdminStatistics();
    };

    // Show loading spinner during initial load
    if (loading && !statistics) {
        return <LoadingSpinner message="Loading business intelligence dashboard..." />;
    }

    // Show error state if data fetch failed
    if (error && !statistics) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-white mb-4">Dashboard Error</h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <button 
                        onClick={handleRefresh}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        🔄 Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 🏢 DASHBOARD HEADER */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                👑 Admin Business Intelligence
                            </h1>
                            <p className="text-gray-300">
                                Executive dashboard for Wanderlust Trails performance monitoring
                            </p>
                        </div>
                        
                        {/* Real-time status indicator */}
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                Live Data
                            </div>
                            <div className="text-gray-400 text-xs">
                                Last updated: {statistics?.generated_at || 'Unknown'}
                            </div>
                        </div>
                    </div>
                    
                    {/* 🎛️ DASHBOARD CONTROLS */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        {/* Category Selection Buttons */}
                        <div className="flex gap-2">
                            {[
                                { key: 'overview', label: '🏠 Overview', desc: 'Executive Summary' },
                              
                            ].map(category => (
                                <button
                                    key={category.key}
                                    onClick={() => handleCategoryChange(category.key)}
                                    className={`px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
                                        selectedCategory === category.key
                                            ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                    title={category.desc}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>
                        
                        {/* Time Range Selection */}
                        <div className="flex gap-2">
                            {[
                                { value: '7', label: '7D', desc: 'Last 7 Days' },
                                { value: '30', label: '30D', desc: 'Last 30 Days' },
                                { value: '90', label: '90D', desc: 'Last 3 Months' },
                                { value: '365', label: '1Y', desc: 'Last Year' }
                            ].map(range => (
                                <button
                                    key={range.value}
                                    onClick={() => handleTimeRangeChange(range.value)}
                                    className={`px-3 py-2 rounded transition-all ${
                                        timeRange === range.value
                                            ? 'bg-green-600 text-white shadow-md'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                    title={range.desc}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                        
                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            title="Refresh dashboard data"
                        >
                            <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* 📊 STATISTICS CONTENT DISPLAY */}
                {statistics && (
                    <>
                        {/* Business Overview Dashboard */}
                        {selectedCategory === 'overview' && statistics.business_metrics && (
                            <AdminOverviewDashboard 
                                data={statistics.business_metrics}
                                calculatedMetrics={statistics.calculated_metrics}
                                insights={statistics.insights}
                                timeRange={timeRange}
                            />
                        )}

                        {/* User Management Analytics */}
                        {selectedCategory === 'users' && statistics.user_metrics && (
                            <AdminUserAnalytics 
                                userMetrics={statistics.user_metrics}
                                countryAnalytics={statistics.country_analytics}
                                insights={statistics.insights}
                                timeRange={timeRange}
                            />
                        )}

                        {/* Booking Performance Analytics */}
                        {selectedCategory === 'bookings' && statistics.booking_metrics && (
                            <AdminBookingAnalytics 
                                metrics={statistics.booking_metrics}
                                dailyTrends={statistics.daily_trends}
                                insights={statistics.insights}
                                timeRange={timeRange}
                            />
                        )}

                        {/* Revenue Financial Analytics */}
                        {selectedCategory === 'revenue' && statistics.revenue_metrics && (
                            <AdminRevenueAnalytics 
                                metrics={statistics.revenue_metrics}
                                paymentMethods={statistics.payment_methods}
                                dailyTrends={statistics.daily_revenue_trends}
                                calculatedMetrics={statistics.calculated_metrics}
                                insights={statistics.insights}
                                timeRange={timeRange}
                            />
                        )}

                        {/* Content Engagement Analytics */}
                        {selectedCategory === 'content' && statistics.content_metrics && (
                            <AdminContentAnalytics 
                                metrics={statistics.content_metrics}
                                topCreators={statistics.top_content_creators}
                                insights={statistics.insights}
                                timeRange={timeRange}
                            />
                        )}

                        {/* Productivity Analytics */}
                        {selectedCategory === 'productivity' && statistics.productivity_metrics && (
                            <AdminProductivityAnalytics 
                                metrics={statistics.productivity_metrics}
                                topProductiveUsers={statistics.top_productive_users}
                                insights={statistics.insights}
                                timeRange={timeRange}
                            />
                        )}
                    </>
                )}

                {/* Show loading overlay during refresh */}
                {refreshing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg p-6 flex items-center gap-4">
                            <div className="animate-spin text-2xl">🔄</div>
                            <span className="text-white">Refreshing dashboard data...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * 🏠 ADMIN OVERVIEW DASHBOARD COMPONENT - FIXED DATA TYPES
 * Handles database strings and converts to numbers properly
 */
const AdminOverviewDashboard = ({ data, calculatedMetrics, insights, timeRange }) => {
    // 🛠️ HELPER FUNCTION: Convert database values to numbers
    const toNumber = (value) => {
        if (value === null || value === undefined) return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    // 🛠️ HELPER FUNCTION: Format numbers safely  
    const formatNumber = (value, decimals = 0) => {
        const num = toNumber(value);
        return decimals > 0 ? num.toFixed(decimals) : num.toLocaleString();
    };

    return (
        <div className="space-y-6">
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatisticCard
                    title="Total Users"
                    value={formatNumber(data.total_users)}
                    change={`+${formatNumber(data.new_users_period)} new (${timeRange}d)`}
                    icon="👥"
                    color="blue"
                    trend={toNumber(data.new_users_period) > 0 ? 'up' : 'neutral'}
                />
                <StatisticCard
                    title="Total Bookings"
                    value={formatNumber(data.total_bookings)}
                    change={`${formatNumber(data.confirmed_bookings)} confirmed`}
                    icon="🎒"
                    color="green"
                    trend="up"
                />
                <StatisticCard
                    title="Total Revenue"
                    value={`$${formatNumber(data.total_revenue)}`}
                    change={`$${formatNumber(data.recent_revenue)} recent`}
                    icon="💰"
                    color="yellow"
                    trend="up"
                />
                <StatisticCard
                    title="Daily Revenue Avg"
                    value={`$${formatNumber(data.daily_revenue_avg || (toNumber(data.recent_revenue) / timeRange))}`}
                    change={`${formatNumber(data.booking_confirmation_rate, 1)}% conversion`}
                    icon="📈"
                    color="purple"
                    trend="up"
                />
            </div>

            {/* Additional Metrics Row - FIXED DATA TYPES */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatisticCard
                    title="Total Travelers"
                    value={formatNumber(data.total_travelers)}
                    change={`${formatNumber(data.avg_travelers_per_booking, 1)} avg/booking`}
                    icon="🧳"
                    color="indigo"
                    size="small"
                />
                <StatisticCard
                    title="Package Bookings"
                    value={formatNumber(data.package_bookings)}
                    change="Most popular"
                    icon="📦"
                    color="green"
                    size="small"
                />
                <StatisticCard
                    title="Flight+Hotel"
                    value={formatNumber(data.flight_hotel_bookings)}
                    change="Custom trips"
                    icon="✈️"
                    color="blue"
                    size="small"
                />
                <StatisticCard
                    title="Avg Booking Value"
                    value={`$${formatNumber(data.avg_booking_value)}`}
                    change="Per transaction"
                    icon="💎"
                    color="yellow"
                    size="small"
                />
                <StatisticCard
                    title="Pending Actions"
                    value={formatNumber(data.pending_bookings_requiring_attention)}
                    change="Need attention"
                    icon="⚠️"
                    color="orange"
                    size="small"
                />
                <StatisticCard
                    title="Success Rate"
                    value={`${formatNumber(data.payment_success_rate, 1)}%`}
                    change="Payments"
                    icon="✅"
                    color="green"
                    size="small"
                />
            </div>

            {/* Business Insights Panel - SAFE DATA HANDLING */}
            {insights && insights.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        🧠 Executive Business Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights.map((insight, index) => (
                            <div key={index} className={`p-4 rounded-lg border-l-4 ${
                                insight.priority === 'urgent' ? 'border-red-500 bg-red-900/20' :
                                insight.priority === 'high' ? 'border-yellow-500 bg-yellow-900/20' :
                                insight.priority === 'medium' ? 'border-blue-500 bg-blue-900/20' :
                                'border-green-500 bg-green-900/20'
                            }`}>
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{insight.icon || '📊'}</span>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-1">{insight.title || 'Insight'}</h4>
                                        <p className="text-gray-300 text-sm mb-2">{insight.message || 'No message'}</p>
                                        <p className="text-gray-400 text-xs">💡 {insight.action || 'No action needed'}</p>
                                        <div className="mt-2">
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                insight.priority === 'urgent' ? 'bg-red-600 text-white' :
                                                insight.priority === 'high' ? 'bg-yellow-600 text-white' :
                                                insight.priority === 'medium' ? 'bg-blue-600 text-white' :
                                                'bg-green-600 text-white'
                                            }`}>
                                                {(insight.priority || 'info').toUpperCase()} PRIORITY
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Estimated Metrics Panel - SAFE CALCULATIONS */}
            {calculatedMetrics && (
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">📊 Projected Business Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                                ${formatNumber(calculatedMetrics.estimated_monthly_revenue)}
                            </div>
                            <div className="text-gray-300 text-sm">Estimated Monthly Revenue</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                                {formatNumber(calculatedMetrics.profit_share_percentage, 1)}%
                            </div>
                            <div className="text-gray-300 text-sm">Profit Margin</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                                ${formatNumber(calculatedMetrics.estimated_profit_this_period)}
                            </div>
                            <div className="text-gray-300 text-sm">Estimated Profit</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default AdminStatisticsDashboard;