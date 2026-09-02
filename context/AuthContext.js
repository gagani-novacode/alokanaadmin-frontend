import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loginAdmin, getCurrentUser } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      // Clear legacy localStorage tokens if any exist
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }

      const storedToken = sessionStorage.getItem('admin_token');
      const storedUser = sessionStorage.getItem('admin_user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            setUser(null);
          }
        }
        // Verify token with backend
        try {
          const res = await getCurrentUser();
          if (res.success && res.user) {
            setUser(res.user);
            sessionStorage.setItem('admin_user', JSON.stringify(res.user));
          }
        } catch (err) {
          // Token invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const data = await loginAdmin(username, password);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      sessionStorage.setItem('admin_token', data.token);
      sessionStorage.setItem('admin_user', JSON.stringify(data.user));
      router.push('/');
      return { success: true };
    }
    return { success: false, message: data.message || 'Login failed' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
