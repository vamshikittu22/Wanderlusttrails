// UserStatisticsDashboard.jsx - LOADING ISSUE FIXED
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import StatisticCard from './../StatisticCard';
import LoadingSpinner from './../LoadingSpinner';

/**
 * USER PERSONAL STATISTICS DASHBOARD - LOADING FIXED
 * Handles all data types safely and shows loading states properly
 */
const UserStatisticsDashboard = ({ user }) => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('travel_summary');
    const [timeRange, setTimeRange] = useState('365');
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // 🛠️ HELPER: Convert database strings to numbers safely
    const toNumber = (value) => {
        if (value === null || value === undefined) return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    // 🛠️ HELPER: Format numbers safely
    const formatNumber = (value, decimals = 0) => {
        const num = toNumber(value);
        return decimals > 0 ? num.toFixed(decimals) : num.toLocaleString();
    };

    /**
     * FETCH USER STATISTICS - FIXED ERROR HANDLING
     */
    const fetchUserStatistics = async (category = selectedCategory, range = timeRange) => {
        try {
            console.log('🔍 Starting user statistics fetch:', { userId: user?.id, category, range });
            
            // Validate user exists
            if (!user || !user.id) {
                throw new Error('User information is required');
            }

            setRefreshing(true);
            setError(null);
            
            // Build correct API URL
            const apiUrl = `http://localhost/wanderlusttrails/Backend/config/UserDashboard/statistics/getUserStatistics.php?user_id=${user.id}&category=${category}&time_range=${range}`;
            
            console.log('📡 Fetching from URL:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log('📥 Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 Response data:', data);
            
            if (data.success) {
                setStatistics(data.data);
                setLoading(false); // ✅ CRITICAL: Set loading to false on success
                toast.success(`Travel data updated successfully!`);
            } else {
                throw new Error(data.message || 'Failed to load travel statistics');
            }
            
        } catch (error) {
            console.error('❌ User statistics error:', error);
            setError(error.message);
            setLoading(false); // ✅ CRITICAL: Set loading to false on error too
            toast.error(`Error loading travel data: ${error.message}`);
        } finally {
            setRefreshing(false);
        }
    };

    // Load statistics when component mounts or parameters change
    useEffect(() => {
        console.log('🔄 Effect triggered:', { user: user?.id, selectedCategory, timeRange });
        if (user?.id) {
            fetchUserStatistics();
        } else {
            console.log('⚠️ No user provided, staying in loading state');
        }
    }, [user?.id, selectedCategory, timeRange]);

    /**
     * HANDLE CATEGORY CHANGE
     */
    const handleCategoryChange = (category) => {
        console.log('📂 Category changed to:', category);
        setSelectedCategory(category);
        setLoading(true);
    };

    /**
     * HANDLE TIME RANGE CHANGE
     */
    const handleTimeRangeChange = (range) => {
        console.log('📅 Time range changed to:', range);
        setTimeRange(range);
        setLoading(true);
    };

    /**
     * MANUAL REFRESH
     */
    const handleRefresh = () => {
        console.log('🔄 Manual refresh triggered');
        fetchUserStatistics();
    };

    // 🚨 DEBUG: Show current state
    console.log('📊 Current component state:', { 
        hasUser: !!user, 
        userId: user?.id, 
        loading, 
        hasStatistics: !!statistics, 
        error 
    });

    //Show loading spinner during initial load
    if (loading && !statistics) {
        return <LoadingSpinner message="Loading your travel analytics..." />;
    }

    // Show error state
    if (error && !statistics) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">😔</div>
                    <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Your Data</h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <button 
                        onClick={handleRefresh}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        🔄 Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Show message if no statistics data
    if (!statistics) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-500 text-6xl mb-4">📊</div>
                    <h2 className="text-2xl font-bold text-white mb-4">No Statistics Available</h2>
                    <p className="text-gray-300 mb-6">Unable to load your travel data</p>
                    <button 
                        onClick={handleRefresh}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        🔄 Reload Data
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 👤 PERSONAL DASHBOARD HEADER */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🎒 Your Travel Journey
                    </h1>
                    <p className="text-gray-300">
                        Welcome back, <span className="text-indigo-300 font-semibold">{user?.firstName || 'Explorer'}</span>! 
                        Here's your personalized travel analytics
                    </p>
                </div>

                {/* 📊 PERSONAL STATISTICS DISPLAY - FIXED DATA TYPES */}
                {statistics?.travel_summary && (
                    <UserTravelSummary 
                        data={statistics.travel_summary}
                        insights={statistics.insights}
                        recommendations={statistics.recommendations}
                        timeRange={timeRange}
                        user={user}
                    />
                )}

                {/* Show refreshing overlay */}
                {refreshing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg p-6 flex items-center gap-4">
                            <div className="animate-spin text-2xl">🔄</div>
                            <span className="text-white">Updating your travel data...</span>
                        </div>
                    </div>
                )}

                {/* 🐛 DEBUG INFO (remove in production) */}
                <div className="mt-8 bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white text-sm mb-2">🐛 Debug Info:</h3>
                    <div className="text-gray-400 text-xs space-y-1">
                        <div>User ID: {user?.id || 'Not provided'}</div>
                        <div>Has Statistics: {statistics ? 'Yes' : 'No'}</div>
                        <div>Loading: {loading ? 'Yes' : 'No'}</div>
                        <div>Error: {error || 'None'}</div>
                        <div>Category: {selectedCategory}</div>
                        <div>Time Range: {timeRange}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * 🎒 USER TRAVEL SUMMARY - FIXED DATA TYPES
 */
const UserTravelSummary = ({ data, insights, recommendations, timeRange, user }) => {
    // 🛠️ SAFE DATA CONVERSION
    const toNumber = (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    const formatNumber = (value, decimals = 0) => {
        const num = toNumber(value);
        return decimals > 0 ? num.toFixed(decimals) : num.toLocaleString();
    };

    return (
        <div className="space-y-6">
            {/* Personal Travel Stats Cards - SAFE FORMATTING */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatisticCard
                    title="My Trips"
                    value={formatNumber(data.total_trips)}
                    change={`${formatNumber(data.completed_trips)} completed`}
                    icon="✈️"
                    color="blue"
                    trend="up"
                />
                <StatisticCard
                    title="Total Spent"
                    value={`$${formatNumber(data.total_spent_on_travel)}`}
                    change={`$${formatNumber(data.avg_trip_cost)} avg/trip`}
                    icon="💸"
                    color="green"
                    trend="up"
                />
                <StatisticCard
                    title="Destinations"
                    value={formatNumber(data.unique_destinations_visited)}
                    change="unique places"
                    icon="🌍"
                    color="purple"
                    trend="up"
                />
                <StatisticCard
                    title="Travel Companions"
                    value={formatNumber(data.total_companions_traveled_with)}
                    change={`${formatNumber(data.avg_companions_per_trip, 1)} avg/trip`}
                    icon="👥"
                    color="orange"
                    trend="up"
                />
            </div>

            {/* Travel Preferences Breakdown - SAFE DATA ACCESS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">📊 My Booking Preferences</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-300">Package Tours</span>
                            <span className="text-white font-semibold">{formatNumber(data.my_package_bookings)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">Flight + Hotel</span>
                            <span className="text-white font-semibold">{formatNumber(data.my_flight_hotel_bookings)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">Custom Itinerary</span>
                            <span className="text-white font-semibold">{formatNumber(data.my_itinerary_bookings)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">👥 My Travel Style</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-300">Solo Adventures</span>
                            <span className="text-white font-semibold">{formatNumber(data.solo_trips)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">Couple Trips</span>
                            <span className="text-white font-semibold">{formatNumber(data.couple_trips)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">Group Adventures</span>
                            <span className="text-white font-semibold">{formatNumber(data.group_trips)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">📅 Trip Duration Insights</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-300">Average Trip</span>
                            <span className="text-white font-semibold">{formatNumber(data.avg_trip_length_days, 1)} days</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">Longest Trip</span>
                            <span className="text-white font-semibold">{formatNumber(data.longest_trip_days)} days</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">Total Travel Days</span>
                            <span className="text-white font-semibold">{formatNumber(data.total_days_traveled)} days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Membership Information - SAFE CALCULATIONS */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">⭐ Your Wanderlust Trails Journey</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {Math.floor(toNumber(data.days_as_member) / 365)} years, {Math.floor((toNumber(data.days_as_member) % 365) / 30)} months
                        </div>
                        <div className="text-gray-300 text-sm">Member Since</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {formatNumber(data.trips_with_insurance)} / {formatNumber(data.total_trips)}
                        </div>
                        <div className="text-gray-300 text-sm">Trips with Insurance</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {data.my_nationality || 'Unknown'}
                        </div>
                        <div className="text-gray-300 text-sm">Home Country</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {formatNumber(data.upcoming_trips)}
                        </div>
                        <div className="text-gray-300 text-sm">Upcoming Trips</div>
                    </div>
                </div>
            </div>

            {/* Personal Insights - SAFE RENDERING */}
            {insights && insights.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">💡 Your Travel Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights.map((insight, index) => (
                            <div key={index} className="p-4 bg-gray-700 rounded-lg border-l-4 border-blue-500">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{insight.icon || '💡'}</span>
                                    <div>
                                        <p className="text-gray-300 text-sm">{insight.message || 'No message'}</p>
                                        <p className="text-indigo-300 text-xs mt-1">💡 {insight.action || 'No action needed'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations - SAFE RENDERING */}
            {recommendations && recommendations.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">🎯 Recommended for You</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recommendations.map((rec, index) => (
                            <div key={index} className="p-4 bg-gradient-to-br from-indigo-800 to-purple-800 rounded-lg">
                                <h4 className="font-bold text-white mb-2">{rec.title || 'Recommendation'}</h4>
                                <p className="text-gray-300 text-sm mb-3">{rec.message || 'No details'}</p>
                                <button className="text-indigo-300 text-sm hover:text-indigo-200 transition-colors">
                                    {rec.cta || 'Learn More'} →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};



export default UserStatisticsDashboard;
