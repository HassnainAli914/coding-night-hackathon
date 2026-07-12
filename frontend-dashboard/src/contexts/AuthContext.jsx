import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, setTokens, clearTokens, getAccessToken } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const CACHE_USER_KEY = 'cached_user';
  const CACHE_PROFILE_KEY = 'cached_profile';

  // Initialize state from cache if available for instant UI rendering
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem(CACHE_USER_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [profile, setProfile] = useState(() => {
    const cached = localStorage.getItem(CACHE_PROFILE_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  
  // Only set loading true if we don't have cached data
  const [isLoading, setIsLoading] = useState(!user);

  // Track background verification separately from initial load
  const [isVerifying, setIsVerifying] = useState(!!getAccessToken());

  const saveToCache = (userData, profileData) => {
    if (userData) localStorage.setItem(CACHE_USER_KEY, JSON.stringify(userData));
    if (profileData) localStorage.setItem(CACHE_PROFILE_KEY, JSON.stringify(profileData));
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_USER_KEY);
    localStorage.removeItem(CACHE_PROFILE_KEY);
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/users/profile');
      if (res.success && res.data?.profile) {
        setProfile(res.data.profile);
        saveToCache(null, res.data.profile);
        return res.data.profile;
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    return null;
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        setIsVerifying(true);
        const res = await api.get('/api/auth/user');
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          saveToCache(res.data.user, null);
          await fetchProfile();
        } else {
          // Token invalid or expired, clear everything
          clearTokens();
          clearCache();
          setUser(null);
          setProfile(null);
        }
      } else {
        clearCache();
      }
      setIsLoading(false);
      setIsVerifying(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.success) {
      if (res.data?.requiresOtp) {
        return { success: true, requiresOtp: true, email: res.data.email };
      }
      if (res.data?.session) {
        setTokens(res.data.session.access_token, res.data.session.refresh_token);
        setUser(res.data.user);
        saveToCache(res.data.user, null);
        await fetchProfile();
        return { success: true };
      }
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const loginWithPhone = async (phone, password) => {
    const res = await api.post('/api/auth/login/phone', { phone, password });
    if (res.success) {
      return { success: true, requiresOtp: true, phone: res.data?.phone || phone };
    }
    return { success: false, message: res.message || 'Phone login failed' };
  };

  const verifyOtp = async (token, type, phone, email) => {
    const res = await api.post('/api/auth/verify-otp', { token, type, phone, email });
    if (res.success && res.data?.session) {
      setTokens(res.data.session.access_token, res.data.session.refresh_token);
      setUser(res.data.user);
      saveToCache(res.data.user, null);
      await fetchProfile();
      return { success: true };
    }
    return { success: false, message: res.message || 'OTP verification failed' };
  };

  const resendOtp = async (type, phone, email) => {
    const res = await api.post('/api/auth/resend-otp', { type, phone, email });
    return res;
  };

  const signup = async (email, password, name, phone, role) => {
    const res = await api.post('/api/auth/signup', { email, password, name, phone, role });
    if (res.success) {
      if (res.data?.session) {
        setTokens(res.data.session.access_token, res.data.session.refresh_token);
        setUser(res.data.user);
        saveToCache(res.data.user, null);
        await fetchProfile();
        return { success: true, requiresOtp: false };
      } else {
        return { success: true, requiresOtp: true };
      }
    }
    return { success: false, message: res.message || 'Signup failed' };
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    clearTokens();
    clearCache();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isVerifying, login, loginWithPhone, verifyOtp, resendOtp, signup, logout, fetchProfile }}>
      {children}
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
