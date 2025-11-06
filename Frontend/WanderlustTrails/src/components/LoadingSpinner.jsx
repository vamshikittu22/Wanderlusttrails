// LoadingSpinner.jsx
// Path: Frontend/WanderlustTrails/src/components/statistics/shared/LoadingSpinner.jsx

import React from 'react';

/**
 * LOADING SPINNER COMPONENT FOR STATISTICS DASHBOARDS
 * 
 * Purpose: Consistent loading state across admin and user statistics
 * Features: Animated spinner with customizable message
 * Usage: Displayed during data fetching operations
 * 
 * @author Your Name
 * @component_type SHARED - Used by both admin and user dashboards
 */
const LoadingSpinner = ({ 
    message = "Loading statistics...", 
    size = "normal",
    fullScreen = true 
}) => {
    // Size configurations
    const sizeConfigs = {
        small: {
            spinner: "w-8 h-8",
            text: "text-sm",
            container: "p-4"
        },
        normal: {
            spinner: "w-12 h-12", 
            text: "text-base",
            container: "p-6"
        },
        large: {
            spinner: "w-16 h-16",
            text: "text-lg",
            container: "p-8"
        }
    };

    const config = sizeConfigs[size];

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className={`text-center ${config.container}`}>
                    {/* Animated travel-themed loader */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            {/* Spinning plane icon */}
                            <div className={`${config.spinner} animate-spin text-indigo-500`}>
                                ✈️
                            </div>
                            {/* Orbit ring */}
                            <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>
                    
                    {/* Loading message */}
                    <div className={`text-white font-medium mb-2 ${config.text}`}>
                        {message}
                    </div>
                    
                    {/* Loading dots animation */}
                    <div className="flex justify-center gap-1">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    
                    {/* Loading tips */}
                    <div className="text-gray-400 text-xs mt-4 max-w-md">
                        💡 Analyzing your travel data and generating insights...
                    </div>
                </div>
            </div>
        );
    }

    // Inline loading component (not full screen)
    return (
        <div className={`flex items-center justify-center ${config.container}`}>
            <div className="text-center">
                <div className={`${config.spinner} animate-spin text-indigo-500 mx-auto mb-3`}>
                    🔄
                </div>
                <div className={`text-white ${config.text}`}>
                    {message}
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;