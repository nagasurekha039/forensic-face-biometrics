import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, role?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('forensic_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      username: 'investigator',
      full_name: 'Dr. Elena Vance, Ph.D.',
      role: 'Lead Forensic Examiner',
      badge_number: 'FS-8821'
    };
  });

  const login = (username: string, role: string = 'Lead Forensic Examiner') => {
    const newUser: User = {
      id: Math.floor(Math.random() * 1000) + 1,
      username,
      full_name: username === 'investigator' ? 'Dr. Elena Vance, Ph.D.' : (username === 'surveillance' ? 'Officer Marcus Kane' : 'Specialist Agent'),
      role,
      badge_number: `FS-${Math.floor(Math.random() * 8000) + 1000}`
    };
    setUser(newUser);
    localStorage.setItem('forensic_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('forensic_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
