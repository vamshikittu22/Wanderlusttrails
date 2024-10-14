import { createContext, useContext, useState } from 'react';

export const UserContext = createContext({
  user: null, 
  setUser: () => {}, // Provide a default no-op function
});

export const UserProvider = UserContext.Provider;

export default function useUser() {
  return useContext(UserContext);
}