// path: Frontend/WanderlustTrails/src/context/UserContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import logoutUser from '../utils/logout';

const UserContext = createContext();

export function useUser() {
    return useContext(UserContext);
}

export function UserProvider({ children }) {
    const defaultUser = {
        firstname: null,
        lastname: null,
        userName: null,
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

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        console.log('[UserContext] Initial user from localStorage:', storedUser);
        return storedUser ? JSON.parse(storedUser) : null; // Set to null initially
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [logoutTimer, setLogoutTimer] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const isTokenExpired = (token) => {
        if (!token) {
            console.log('[UserContext] isTokenExpired: No token provided');
            return true;
        }
        try {
            const decoded = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
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

    const setTokenExpirationTimer = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiration = (decoded.exp - currentTime) * 1000;
            console.log('[UserContext] setTokenExpirationTimer:', {
                token,
                exp: decoded.exp,
                currentTime,
                timeUntilExpiration,
            });

            if (timeUntilExpiration <= 0) {
                console.log('[UserContext] Token already expired, logging out');
                logout();
                return;
            }

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

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        console.log('[UserContext] useEffect on mount:', { storedToken, storedUser });

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log('[UserContext] Parsed user:', parsedUser);
                if (!parsedUser.id || isNaN(parseInt(parsedUser.id, 10))) {
                    console.log('[UserContext] Invalid user.id, logging out');
                    logout();
                    setIsInitialized(true);
                    return;
                }
                parsedUser.id = parseInt(parsedUser.id, 10);

                if (isTokenExpired(storedToken)) {
                    console.log('[UserContext] Stored token expired, logging out');
                    logout();
                } else {
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
            setUser(null); // Set to null
            setToken(null);
        }

        setIsInitialized(true);
        console.log('[UserContext] Initialization complete');

        return () => {
            if (logoutTimer) {
                clearTimeout(logoutTimer);
                console.log('[UserContext] Cleaned up logout timer');
            }
        };
    }, []);

    const login = (userData, userToken) => {
        try {
            console.log('[UserContext] login:', { userData, userToken });
            const normalizedUser = { ...userData };
            if (!normalizedUser.id) {
                throw new Error('User ID is required');
            }
            const numericId = parseInt(normalizedUser.id, 10);
            if (isNaN(numericId)) {
                throw new Error('User ID must be a valid number');
            }
            normalizedUser.id = numericId;

            if (!userToken || isTokenExpired(userToken)) {
                throw new Error('Invalid or expired token');
            }

            localStorage.setItem('user', JSON.stringify(normalizedUser));
            localStorage.setItem('token', userToken);
            setUser(normalizedUser);
            setToken(userToken);
            setIsAuthenticated(true);
            setTokenExpirationTimer(userToken);
            console.log('[UserContext] login successful:', normalizedUser);

            toast.success('Logged in successfully!');
        } catch (error) {
            console.error('[UserContext] login error:', error);
            setUser(null); // Set to null
            setToken(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            toast.error(error.message || 'Failed to log in.');
            throw error;
        }
    };

    const logout = () => {
        console.log('[UserContext] logout called');
        if (logoutTimer) {
            clearTimeout(logoutTimer);
            setLogoutTimer(null);
        }
        logoutUser(() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            setUser(null); // Set to null
            setToken(null);
            setIsAuthenticated(false);
            console.log('[UserContext] logout completed:', { user: null, isAuthenticated: false });
        });
    };

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

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}