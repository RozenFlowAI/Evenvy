import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall, authHeaders, User } from '../utils/api';

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

type RegisterData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'client' | 'owner';
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken && isMounted) {
          setToken(storedToken);
          try {
            const userData = await apiCall('/auth/me', { headers: authHeaders(storedToken) });
            if (isMounted) setUser(userData);
          } catch {
            await AsyncStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('Auth load error:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Start loading auth
    loadAuth();

    // Safety timeout - ensure loading becomes false after 3 seconds max
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await AsyncStorage.setItem('auth_token', response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (data: RegisterData) => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await AsyncStorage.setItem('auth_token', response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const userData = await apiCall('/auth/me', { headers: authHeaders(token) });
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
