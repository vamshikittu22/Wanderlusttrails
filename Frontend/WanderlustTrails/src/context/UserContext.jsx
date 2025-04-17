//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx


import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function useUser() {
    return useContext(UserContext);
}

export function UserProvider({ children }) {
    const defaultUser = {
        firstname: null,
        lastname: null,
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
        return storedUser ? JSON.parse(storedUser) : defaultUser;
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        console.log("Stored token:", storedToken);
        console.log("Stored user:", storedUser);

        if (storedToken && storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Ensure id is numeric when loading from localStorage
            if (parsedUser.id && !isNaN(parseInt(parsedUser.id, 10))) {
                parsedUser.id = parseInt(parsedUser.id, 10);
            } else {
                parsedUser.id = null;
            }
            setUser(parsedUser);
            setToken(storedToken);
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            setUser(defaultUser);
            setToken(null);
        }
    }, []);

    const login = (userData, userToken) => {
        try {
            console.log('Login userData:', userData);
            // Validate and normalize user.id
            const normalizedUser = { ...userData };
            if (normalizedUser.id) {
                const numericId = parseInt(normalizedUser.id, 10);
                if (isNaN(numericId)) {
                    console.error('Invalid user ID in login data:', normalizedUser.id);
                    throw new Error('User ID must be a valid number');
                }
                normalizedUser.id = numericId;
            } else {
                console.error('Missing user ID in login data');
                throw new Error('User ID is required');
            }

            localStorage.setItem('user', JSON.stringify(normalizedUser));
            localStorage.setItem('token', userToken);
            setUser(normalizedUser);
            setToken(userToken);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Error storing user data in localStorage:", error);
            setUser(defaultUser);
            setToken(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            throw error; // Let the caller handle the error
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(defaultUser);
        setToken(null);
        setIsAuthenticated(false);
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
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}