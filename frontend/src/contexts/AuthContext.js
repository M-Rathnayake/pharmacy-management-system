import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../services/authService';

const AuthContext = createContext(null);

// Simple role definitions
const ROLES = {
  ADMIN: 'admin',
  PHARMACIST: 'pharmacist',
  CASHIER: 'cashier'
};

// Simple permission mapping
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['inventory', 'orders', 'suppliers', 'customers', 'finance'],
  [ROLES.PHARMACIST]: ['inventory', 'orders', 'customers'],
  [ROLES.CASHIER]: ['orders', 'customers']
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const userData = await apiLogin(credentials);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Simple permission check
  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 