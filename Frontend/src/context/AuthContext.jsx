import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, setTokens, getAccessToken, getRefreshToken, addAuthChangeListener, removeAuthChangeListener } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile details
  const fetchProfile = async () => {
    try {
      const profile = await api.get('/api/auth/me');
      setUser(profile);
      setIsAuthenticated(true);
      return profile;
    } catch (err) {
      // Clear invalid state
      handleLogoutLocal();
      throw err;
    }
  };

  // Helper local logout
  const handleLogoutLocal = () => {
    setTokens(null, null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Silent refresh on mount or token expiry
  const attemptInitialAuth = async () => {
    const access = getAccessToken();
    const refresh = getRefreshToken();

    if (access) {
      try {
        await fetchProfile();
      } catch {
        // Access token failed, maybe expired. Refresh handled by client interceptor.
        // But if client also failed, it cleared it.
      }
    } else if (refresh) {
      try {
        // Try refreshing access token
        const data = await api.post('/api/auth/refresh', { refreshToken: refresh });
        setTokens(data.accessToken, data.refreshToken || refresh);
        await fetchProfile();
      } catch {
        handleLogoutLocal();
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    attemptInitialAuth();

    // Listen to global client logout/auth-failure events
    const handleAuthChange = ({ loggedOut }) => {
      if (loggedOut) {
        handleLogoutLocal();
      }
    };
    addAuthChangeListener(handleAuthChange);

    return () => {
      removeAuthChangeListener(handleAuthChange);
    };
  }, []);

  // Periodic silent refresh timer (e.g. refresh token every 4 minutes if JWT expiry is 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const data = await api.post('/api/auth/refresh', { refreshToken: refresh });
          setTokens(data.accessToken, data.refreshToken || refresh);
        } catch {
          // Failure will trigger logout through authChangeListener
        }
      }
    }, 4 * 60 * 1000); // 4 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await api.post('/api/auth/login', { email, password });
      setTokens(data.accessToken, data.refreshToken);
      const profile = await fetchProfile();
      setIsLoading(false);
      return profile;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const register = async (email, password, firstName, lastName, role = 'PASSENGER', accessCode = '') => {
    setIsLoading(true);
    try {
      // Send the selected role and accessCode for registration
      await api.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName,
        role,
        accessCode
      });

      // Trigger AeroIndia Welcome Email
      try {
        await api.post('/api/notifications/welcome', {
          passengerName: `${firstName} ${lastName}`,
          passengerEmail: email
        });
      } catch (e) {
        console.warn('Welcome email trigger offline', e);
      }

      setIsLoading(false);
      
      // Auto login after registration
      return await login(email, password);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    // Send pending booking / abandoned payment notice with coupon code if logging out during pending checkout
    try {
      const savedPending = sessionStorage.getItem('pendingBooking');
      if (savedPending) {
        const parsed = JSON.parse(savedPending);
        if (parsed && parsed.passengerEmail) {
          sessionStorage.removeItem('pendingBooking');
          await api.post('/api/notifications/abandoned-payment', parsed);
        }
      }
    } catch (err) {
      console.warn('Pending booking notification error', err);
    }
    handleLogoutLocal();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    isPassenger: user?.role === 'PASSENGER',
    isStaff: user?.role === 'STAFF',
    isAdmin: user?.role === 'ADMIN',
    role: user?.role
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
