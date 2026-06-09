import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  
  const { user, token, isAuthenticated, loading, login, logout, updateUser } = context;
  
  return {
    user, token, isAuthenticated, loading, login, logout, updateUser,
    role: user?.role || 'user',
    isEmployee: () => user?.role === 'user',
    isManager: () => user?.role === 'manager',
    isHR: () => user?.role === 'hr',
    isAdmin: () => user?.role === 'admin',
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => roles.includes(user?.role)
  };
}
