import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to parse JWT and get payload
const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT:', e);
    return null;
  }
};

// Create context
const UserContext = createContext();

// Hook to access context
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState(null);

  // Helper to set user from token
  const setUserFromToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const payload = parseJwt(token);
        if (payload?.sub) {
          setCurrentUserId(payload.sub);
        }
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
  };

  useEffect(() => {
    setUserFromToken(); // Initial fetch
  }, []);

  return (
    <UserContext.Provider value={{ currentUserId, setUserFromToken }}>
      {children}
    </UserContext.Provider>
  );
};