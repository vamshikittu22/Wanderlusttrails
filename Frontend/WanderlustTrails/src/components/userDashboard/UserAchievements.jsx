// UserAchievements.jsx
// Path: Frontend/WanderlustTrails/src/components/statistics/user/UserAchievements.jsx

import React from 'react';

/**
 * USER TRAVEL ACHIEVEMENTS COMPONENT
 * 
 * Purpose: Gamification system displaying user's travel milestones and progress
 * Features: Achievement badges, progress bars, user ranking, completion status
 * Data: Travel achievements, user rank percentile, completion statistics
 * 
 * @author Your Name
 * @business_impact HIGH - User engagement and retention through gamification
 */
const UserAchievements = ({ 
    achievements = [], 
    userRank = {}, 
    achievementSummary = {}, 
    user = {} 
}) => {
    /**
     * GET ACHIEVEMENT BADGE STYLING
     * Returns appropriate styling based on achievement level and status
     */
    const getAchievementBadgeStyle = (achievement) => {
        const levelStyles = {
            legendary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400',
            platinum: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900 border-gray-300',
            gold: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 border-yellow-300',
            silver: 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-900 border-gray-400',
            bronze: 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900 border-orange-300',
            progress: 'bg-gray-700 text-gray-300 border-gray-600'
        };
        
        return levelStyles[achievement.level] || levelStyles.progress;
    };

    /**
     * GET RANK BADGE COLOR
     * Returns color scheme based on user's percentile ranking
     */
    const getRankBadgeColor = (percentile) => {
        if (percentile >= 90) return 'from-purple-600 to-pink-600';
        if (percentile >= 75) return 'from-yellow-400 to-orange-500';
        if (percentile >= 50) return 'from-blue-500 to-indigo-600';
        if (percentile >= 25) return 'from-green-500 to-teal-600';
        return 'from-gray-500 to-gray-600';
    };

    return (
        <div className="space-y-8">
            {/* 🏆 ACHIEVEMENT SUMMARY HEADER */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg p-6">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        🏆 Your Travel Achievements
                    </h2>
                    <p className="text-gray-300">
                        Unlock badges and climb the traveler rankings!
                    </p>
                </div>
                
                {/* Achievement Progress Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-3xl font-bold text-white">
                            {achievementSummary.total_unlocked || 0}
                        </div>
                        <div className="text-gray-300 text-sm">Achievements Unlocked</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">
                            {achievementSummary.in_progress || 0}
                        </div>
                        <div className="text-gray-300 text-sm">In Progress</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">
                            {achievementSummary.completion_percentage || 0}%
                        </div>
                        <div className="text-gray-300 text-sm">Completion Rate</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">
                            #{userRank.percentile || 0}
                        </div>
                        <div className="text-gray-300 text-sm">Percentile Rank</div>
                    </div>
                </div>
            </div>

            {/* 🎖️ USER RANK DISPLAY */}
            <div className={`bg-gradient-to-r ${getRankBadgeColor(userRank.percentile)} rounded-lg p-6`}>
                <div className="text-center text-white">
                    <div className="text-4xl mb-2">👑</div>
                    <h3 className="text-2xl font-bold mb-1">
                        {userRank.rank_description || 'New Explorer'}
                    </h3>
                    <p className="text-sm opacity-90">
                        You rank higher than {userRank.percentile || 0}% of all travelers
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                        Out of {(userRank.total_users || 0).toLocaleString()} total users
                    </p>
                </div>
            </div>

            {/* 🏅 ACHIEVEMENT BADGES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => (
                    <div key={achievement.id || index} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                        {/* Achievement header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getAchievementBadgeStyle(achievement)}`}>
                                {achievement.level?.toUpperCase()}
                            </div>
                            <div className="text-2xl">
                                {achievement.progress === 100 ? '🏆' : '🎯'}
                            </div>
                        </div>
                        
                        {/* Achievement details */}
                        <div className="mb-4">
                            <h3 className="font-bold text-white mb-1 text-lg">
                                {achievement.title}
                            </h3>
                            <p className="text-gray-400 text-sm">
                                {achievement.description}
                            </p>
                        </div>
                        
                        {/* Progress bar for incomplete achievements */}
                        {achievement.progress < 100 ? (
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-400 mb-2">
                                    <span>Progress</span>
                                    <span>{achievement.current || 0} / {achievement.target || 0}</span>
                                </div>
                                <div className="bg-gray-700 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${achievement.progress || 0}%` }}
                                    ></div>
                                </div>
                                <div className="text-center text-gray-400 text-xs mt-1">
                                    {(achievement.progress || 0).toFixed(1)}% Complete
                                </div>
                            </div>
                        ) : (
                            /* Unlocked achievement indicator */
                            <div className="mb-4">
                                <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-semibold">
                                    <span>✅</span>
                                    <span>{achievement.unlocked_at || 'Unlocked!'}</span>
                                </div>
                                {/* Show achievement value if applicable */}
                                {achievement.value && (
                                    <div className="text-center text-indigo-300 text-sm mt-1">
                                        {achievement.value}
                                    </div>
                                )}
                                {achievement.destinations && (
                                    <div className="text-center text-indigo-300 text-sm mt-1">
                                        {achievement.destinations} destinations
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Achievement category badge */}
                        <div className="text-center">
                            <span className="inline-block px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                                {achievement.category?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 🎯 ACHIEVEMENT CATEGORIES PROGRESS */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-6">📊 Achievement Categories</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Travel Volume Category */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                            ✈️ Travel Volume
                        </h4>
                        {achievements.filter(a => a.category === 'travel_volume').map(achievement => (
                            <div key={achievement.id} className="flex items-center gap-3">
                                <div className="text-lg">
                                    {achievement.progress === 100 ? '🏆' : '🎯'}
                                </div>
                                <div className="flex-1">
                                    <div className="text-white text-sm">{achievement.title}</div>
                                    {achievement.progress < 100 && (
                                        <div className="bg-gray-700 rounded-full h-1 mt-1">
                                            <div 
                                                className="bg-blue-500 h-1 rounded-full"
                                                style={{ width: `${achievement.progress}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Spending Category */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                            💰 Spending Milestones
                        </h4>
                        {achievements.filter(a => a.category === 'spending').map(achievement => (
                            <div key={achievement.id} className="flex items-center gap-3">
                                <div className="text-lg">
                                    {achievement.progress === 100 ? '💎' : '💰'}
                                </div>
                                <div className="flex-1">
                                    <div className="text-white text-sm">{achievement.title}</div>
                                    {achievement.value && (
                                        <div className="text-green-400 text-xs">{achievement.value}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Exploration Category */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                            🌍 Exploration
                        </h4>
                        {achievements.filter(a => a.category === 'exploration').map(achievement => (
                            <div key={achievement.id} className="flex items-center gap-3">
                                <div className="text-lg">🗺️</div>
                                <div className="flex-1">
                                    <div className="text-white text-sm">{achievement.title}</div>
                                    {achievement.destinations && (
                                        <div className="text-purple-400 text-xs">{achievement.destinations} places visited</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Community Category */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                            📝 Community Contributor
                        </h4>
                        {achievements.filter(a => a.category === 'content').map(achievement => (
                            <div key={achievement.id} className="flex items-center gap-3">
                                <div className="text-lg">
                                    {achievement.progress === 100 ? '📝' : '✍️'}
                                </div>
                                <div className="flex-1">
                                    <div className="text-white text-sm">{achievement.title}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 🎯 NEXT GOALS SECTION */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">🎯 Your Next Goals</h3>
                <div className="space-y-4">
                    {achievements.filter(a => a.progress < 100).map(goal => (
                        <div key={goal.id} className="p-4 bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-white">{goal.title}</h4>
                                <span className="text-indigo-400 font-bold">
                                    {(goal.progress || 0).toFixed(1)}%
                                </span>
                            </div>
                            
                            <p className="text-gray-300 text-sm mb-3">{goal.description}</p>
                            
                            <div className="bg-gray-600 rounded-full h-2 mb-2">
                                <div 
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${goal.progress || 0}%` }}
                                ></div>
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>{goal.current || 0} completed</span>
                                <span>{goal.target || 0} required</span>
                            </div>
                        </div>
                    ))}
                    
                    {achievements.filter(a => a.progress < 100).length === 0 && (
                        <div className="text-center p-6">
                            <div className="text-6xl mb-4">🌟</div>
                            <h4 className="text-xl font-bold text-white mb-2">All Current Goals Achieved!</h4>
                            <p className="text-gray-300">
                                You're an amazing traveler! Keep exploring for future achievements.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* 📈 ACHIEVEMENT STATISTICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <div className="text-3xl mb-2">🏅</div>
                    <div className="text-2xl font-bold text-white">
                        {achievementSummary.total_unlocked || 0}
                    </div>
                    <div className="text-gray-300 text-sm">Badges Earned</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-2xl font-bold text-white">
                        {achievementSummary.completion_percentage || 0}%
                    </div>
                    <div className="text-gray-300 text-sm">Achievement Rate</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <div className="text-3xl mb-2">👑</div>
                    <div className="text-2xl font-bold text-white">
                        {userRank.percentile || 0}%
                    </div>
                    <div className="text-gray-300 text-sm">Top Percentile</div>
                </div>
            </div>

            {/* 🎉 CONGRATULATIONS FOR RECENT ACHIEVEMENTS */}
            {achievements.filter(a => a.progress === 100).length > 0 && (
                <div className="bg-gradient-to-r from-green-800 to-emerald-800 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        🎉 Recent Achievements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.filter(a => a.progress === 100).slice(0, 4).map(achievement => (
                            <div key={achievement.id} className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                                <div className="text-2xl">🏆</div>
                                <div>
                                    <div className="font-semibold text-white">{achievement.title}</div>
                                    <div className="text-green-200 text-sm">{achievement.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 💡 TIPS FOR EARNING MORE ACHIEVEMENTS */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">💡 Tips to Earn More Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-700 rounded-lg">
                        <div className="text-lg mb-2">🎒</div>
                        <h4 className="font-semibold text-white mb-1">Book More Trips</h4>
                        <p className="text-gray-300 text-sm">Each booking brings you closer to travel volume achievements</p>
                    </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                        <div className="text-lg mb-2">🌍</div>
                        <h4 className="font-semibold text-white mb-1">Explore New Destinations</h4>
                        <p className="text-gray-300 text-sm">Visit unique locations to unlock exploration badges</p>
                    </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                        <div className="text-lg mb-2">📝</div>
                        <h4 className="font-semibold text-white mb-1">Share Your Experiences</h4>
                        <p className="text-gray-300 text-sm">Write blogs and reviews to become a community contributor</p>
                    </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                        <div className="text-lg mb-2">👥</div>
                        <h4 className="font-semibold text-white mb-1">Travel with Friends</h4>
                        <p className="text-gray-300 text-sm">Group travel unlocks social achievement badges</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAchievements;