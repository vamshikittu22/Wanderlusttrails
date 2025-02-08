import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function useUser() {
    return useContext(UserContext);
}

export function UserProvider({ children }) {

    // Default empty user object
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
        return storedUser ? JSON.parse(storedUser) : defaultUser ;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    const login = (userData, userToken) => {
        try {
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', userToken);
            setUser(userData);
            setToken(userToken);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Error storing user data in localStorage:", error);
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
