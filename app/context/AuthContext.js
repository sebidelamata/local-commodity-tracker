import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const API = 'https://raspberrypi0.tail833adc.ts.net';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('token').then(t => {
      if (t) setToken(t);
      setLoading(false);
    });
  }, []);

  const login = async (username, password, totpToken) => {
    try {
      console.log('Attempting login to:', API + '/auth/login');
      const res = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, totpToken })
      });
      const data = await res.json();
      console.log('Login response:', JSON.stringify(data));
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        setToken(data.token);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch(e) {
      console.error('Login error:', e.message);
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);