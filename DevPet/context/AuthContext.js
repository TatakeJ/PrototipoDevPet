import React, { createContext, useState, useContext } from 'react';
import { registerUser, loginUser } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const register = async (user_name, email, password, confirm_password) => {
    if (password !== confirm_password) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (!user_name || !email || !password) {
      throw new Error('Todos los campos son obligatorios');
    }

    const result = await registerUser(user_name, email, password);
    setUserId(result.user_id);
    return result;
  };

  const login = async (user_name, password) => {
    if (!user_name || !password) {
      throw new Error('Todos los campos son obligatorios');
    }

    const result = await loginUser(user_name, password);
    setUserId(result.user_id);
    return result;
  };

  const logout = () => {
    setUserId(null);
  };

  const value = {
    userId,
    loading,
    setLoading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
