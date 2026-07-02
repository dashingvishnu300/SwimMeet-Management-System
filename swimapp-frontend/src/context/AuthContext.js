import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      authAPI.getProfile()
        .then(res => setUser(res.data))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('access_token', res.data.tokens.access);
    localStorage.setItem('refresh_token', res.data.tokens.refresh);
    setUser(res.data.user);
    console.log(
      "LOGIN USER:",
      res.data.user
    );
    return res.data;
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await authAPI.logout(refresh);
    } catch (err) {}
    localStorage.clear();
    setUser(null);
  };

  const isOrganizer = () =>
    user?.role?.name === 'organizer' ||
    user?.role === 'organizer';
  
  const isCoach = () =>
    user?.role?.name === 'coach' ||
    user?.role === 'coach';
  
  const isSwimmer = () =>
    user?.role?.name === 'swimmer' ||
    user?.role === 'swimmer';

  const isAdmin = () =>
    user?.role?.name === 'admin' ||
    user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isOrganizer,
      isCoach,
      isSwimmer,
      isAdmin
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);