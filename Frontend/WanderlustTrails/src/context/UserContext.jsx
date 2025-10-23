// Frontend/WanderlustTrails/src/context/UserContext.jsx

// React core hooks and modules
import React, { createContext, useContext, useState, useEffect } from 'react';
// For decoding JWT tokens to extract expiration or user info
import { jwtDecode } from 'jwt-decode';
// Toast notifications for feedback to user
import { toast } from 'react-toastify';
// Utility to handle logout logic across the app
import logoutUser from '../utils/logout';
// Custom context hook for Todo-related features (especially reminders)
import { useTodo } from './TodoContext';

// Create a new context object to share user data globally
const UserContext = createContext();

// Custom hook for using the UserContext
export function useUser() {
    return useContext(UserContext);
}

// Context Provider that wraps children components and shares user data
export function UserProvider({ children }) {
    // Define a default user object structure
    const defaultUser = {
        firstname: null,
        lastname: null,
        username: null,
        role: null,
        id: null,
        email: null,
        phone: null,
        dob: null,
        gender: null,
        nationality: null,
        street: null,
        city: null,
        state: null,
        zip: null,
    };

    // Load user from localStorage if available, otherwise null
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        console.log('[UserContext] Initial user from localStorage:', storedUser);
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth state
    const [token, setToken] = useState(null);                       // JWT token
    const [logoutTimer, setLogoutTimer] = useState(null);          // Auto-logout timer
    const [isInitialized, setIsInitialized] = useState(false);     // Check if context initialized
    const { checkAndSendDueDateReminders } = useTodo();            // Reminder function from TodoContext

    // Utility: Checks whether token is expired using `exp` claim in the JWT
    const isTokenExpired = (token) => {
        if (!token) {
            console.log('[UserContext] isTokenExpired: No token provided');
            return true;
        }
        try {
            const decoded = jwtDecode(token); // Decode token payload
            const currentTime = Math.floor(Date.now() / 1000); // Current epoch time (in seconds)
            console.log('[UserContext] isTokenExpired:', {
                token,
                decodedExp: decoded.exp,
                currentTime,
                isExpired: decoded.exp < currentTime,
            });
            return decoded.exp < currentTime;
        } catch (error) {
            console.error('[UserContext] Error decoding token:', error);
            return true;
        }
    };

    // Sets a timer that logs the user out when the JWT token expires
    const setTokenExpirationTimer = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiration = (decoded.exp - currentTime) * 1000; // Convert to milliseconds

            console.log('[UserContext] setTokenExpirationTimer:', {
                token,
                exp: decoded.exp,
                currentTime,
                timeUntilExpiration,
            });

            // If already expired, log out immediately
            if (timeUntilExpiration <= 0) {
                console.log('[UserContext] Token already expired, logging out');
                logout();
                return;
            }

            // Schedule logout on token expiry
            const timer = setTimeout(() => {
                console.log('[UserContext] Token expired, logging out');
                toast.info('Your session has expired. Please log in again.');
                logout();
            }, timeUntilExpiration);

            setLogoutTimer(timer);
            console.log('[UserContext] Timer set for', timeUntilExpiration / 1000, 'seconds');
        } catch (error) {
            console.error('[UserContext] Error setting timer:', error);
            toast.error('Session error. Please log in again.');
            logout();
        }
    };

    // Runs once on component mount: attempts to load and validate stored user/token
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        console.log('[UserContext] useEffect on mount:', { storedToken, storedUser });

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);

                // Validate user ID before proceeding
                if (!parsedUser.id || isNaN(parseInt(parsedUser.id, 10))) {
                    console.log('[UserContext] Invalid user.id, logging out');
                    logout();
                    setIsInitialized(true);
                    return;
                }

                parsedUser.id = parseInt(parsedUser.id, 10);

                // Check token validity
                if (isTokenExpired(storedToken)) {
                    console.log('[UserContext] Stored token expired, logging out');
                    logout();
                } else {
                    // Restore session
                    setUser(parsedUser);
                    setToken(storedToken);
                    setIsAuthenticated(true);
                    setTokenExpirationTimer(storedToken);
                    console.log('[UserContext] User loaded:', parsedUser, 'isAuthenticated:', true);
                }
            } catch (error) {
                console.error('[UserContext] Error parsing user:', error);
                logout();
            }
        } else {
            console.log('[UserContext] No token or user, setting defaults');
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
        }

        setIsInitialized(true);
        console.log('[UserContext] Initialization complete');

        // Cleanup token timer on unmount
        return () => {
            if (logoutTimer) {
                clearTimeout(logoutTimer);
                console.log('[UserContext] Cleaned up logout timer');
            }
        };
    }, []);

    // Login function: Validates and saves user and token to state + localStorage
    const login = (userData, userToken) => {
        try {
            console.log('[UserContext] login:', { userData, userToken });
            const normalizedUser = { ...userData };

            // Ensure valid numeric ID
            if (!normalizedUser.id) throw new Error('User ID is required');
            const numericId = parseInt(normalizedUser.id, 10);
            if (isNaN(numericId)) throw new Error('User ID must be a valid number');
            normalizedUser.id = numericId;

            // Check token validity
            if (!userToken || isTokenExpired(userToken)) {
                throw new Error('Invalid or expired token');
            }

            // Save to localStorage and context
            localStorage.setItem('user', JSON.stringify(normalizedUser));
            localStorage.setItem('token', userToken);
            setUser(normalizedUser);
            setToken(userToken);
            setIsAuthenticated(true);
            setTokenExpirationTimer(userToken);
            console.log('[UserContext] login successful:', normalizedUser);

            // Trigger reminder check once user is logged in
            checkAndSendDueDateReminders();

            toast.success('Logged in successfully!');
        } catch (error) {
            console.error('[UserContext] login error:', error);

            // Reset session on error
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');

            toast.error(error.message || 'Failed to log in.');
            throw error;
        }
    };

    // Logout function: clears timers, session, and state
    const logout = () => {
        console.log('[UserContext] logout called');

        // Clear any pending logout timer
        if (logoutTimer) {
            clearTimeout(logoutTimer);
            setLogoutTimer(null);
        }

        // Call shared logout utility and clear state
        logoutUser(() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
            console.log('[UserContext] logout completed:', { user: null, isAuthenticated: false });
        });
    };

    // Context value exposed to consumers
    const value = {
        user,
        setUser,
        token,
        setToken,
        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,
        isInitialized,
    };

    // Provide context to all children components
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
