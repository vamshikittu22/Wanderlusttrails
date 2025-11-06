// StatisticCard.jsx
// Path: Frontend/WanderlustTrails/src/components/statistics/shared/StatisticCard.jsx

import React from 'react';

/**
 * REUSABLE STATISTIC CARD COMPONENT
 * 
 * Purpose: Consistent display card for both admin and user statistics
 * Features: Configurable colors, icons, trends, and sizes
 * Usage: Used across both admin business intelligence and user personal analytics
 * 
 * @author Your Name
 * @component_type SHARED - Used by both admin and user dashboards
 */
const StatisticCard = ({ 
    title, 
    value, 
    change, 
    icon, 
    color = 'blue', 
    trend = 'neutral',
    size = 'normal',
    onClick = null,
    loading = false 
}) => {
    // Define color schemes for different metric types
    const colorSchemes = {
        blue: 'border-blue-500 bg-blue-900/20 text-blue-400',
        green: 'border-green-500 bg-green-900/20 text-green-400',
        yellow: 'border-yellow-500 bg-yellow-900/20 text-yellow-400',
        red: 'border-red-500 bg-red-900/20 text-red-400',
        purple: 'border-purple-500 bg-purple-900/20 text-purple-400',
        orange: 'border-orange-500 bg-orange-900/20 text-orange-400',
        indigo: 'border-indigo-500 bg-indigo-900/20 text-indigo-400',
        pink: 'border-pink-500 bg-pink-900/20 text-pink-400'
    };

    // Define trend indicators
    const trendIcons = {
        up: '📈',
        down: '📉', 
        neutral: '➡️'
    };

    // Size variants
    const sizeClasses = {
        small: 'p-4',
        normal: 'p-6',
        large: 'p-8'
    };

    const textSizes = {
        small: {
            title: 'text-xs',
            value: 'text-lg',
            change: 'text-xs',
            icon: 'text-lg'
        },
        normal: {
            title: 'text-sm',
            value: 'text-2xl',
            change: 'text-xs',
            icon: 'text-3xl'
        },
        large: {
            title: 'text-base',
            value: 'text-3xl',
            change: 'text-sm',
            icon: 'text-4xl'
        }
    };

    return (
        <div 
            className={`
                bg-gray-800 rounded-lg border-l-4 transition-all transform hover:scale-105 
                ${colorSchemes[color]} 
                ${sizeClasses[size]}
                ${onClick ? 'cursor-pointer hover:bg-gray-700' : ''}
                ${loading ? 'animate-pulse' : ''}
            `}
            onClick={onClick}
        >
            {loading ? (
                // Loading state
                <div className="animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-600 rounded w-20"></div>
                            <div className="h-6 bg-gray-600 rounded w-16"></div>
                            <div className="h-3 bg-gray-600 rounded w-24"></div>
                        </div>
                        <div className="w-8 h-8 bg-gray-600 rounded"></div>
                    </div>
                </div>
            ) : (
                // Normal display
                <div className="flex items-center justify-between">
                    <div>
                        {/* Metric title */}
                        <p className={`text-gray-400 font-medium mb-1 ${textSizes[size].title}`}>
                            {title}
                        </p>
                        
                        {/* Main metric value */}
                        <p className={`font-bold text-white mb-1 ${textSizes[size].value}`}>
                            {value}
                        </p>
                        
                        {/* Change indicator with trend */}
                        <div className={`text-gray-500 flex items-center gap-1 ${textSizes[size].change}`}>
                            <span>{trendIcons[trend]}</span>
                            <span>{change}</span>
                        </div>
                    </div>
                    
                    {/* Metric icon */}
                    <div className={textSizes[size].icon}>
                        {icon}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatisticCard;