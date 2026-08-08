import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { apiClient } from '../services/apiClient';
import { mergeAvatar, saveAvatar, readFileAsDataUrl } from '../utils/avatarStorage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (name: string, password: string, phone: string, location: string, latitude: number | null, longitude: number | null) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistUser = useCallback((userData: User) => {
    const withAvatar = mergeAvatar(userData);
    setUser(withAvatar);
    localStorage.setItem('user', JSON.stringify(withAvatar));
    return withAvatar;
  }, []);

  const refreshProfile = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return;

    try {
      const res = await apiClient.get<User>('/users/profile');
      persistUser(res.data);
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
  }, [persistUser]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      persistUser(JSON.parse(savedUser));
      refreshProfile();
    }
  }, [persistUser, refreshProfile]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { token: receivedToken, ...userData } = res.data;
      setToken(receivedToken);
      localStorage.setItem('token', receivedToken);
      persistUser(userData);
      await refreshProfile();
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/auth/signup', { name, email, password });
      const { token: receivedToken, ...userData } = res.data;
      setToken(receivedToken);
      localStorage.setItem('token', receivedToken);
      persistUser(userData);
      await refreshProfile();
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Signup failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (name: string, password: string, phone: string, location: string, latitude: number | null, longitude: number | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = { name, phone, location, latitude, longitude };
      if (password) payload.password = password;

      const res = await apiClient.put<User>('/users/profile', payload);
      persistUser(res.data);
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Profile update failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) {
      throw new Error('You must be logged in to upload an avatar.');
    }

    setIsLoading(true);
    setError(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      saveAvatar(user.id, dataUrl);
      persistUser({ ...user, avatar: dataUrl });
    } catch (err: any) {
      const message = err.message || 'Avatar upload failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, refreshProfile, updateProfile, uploadAvatar, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
