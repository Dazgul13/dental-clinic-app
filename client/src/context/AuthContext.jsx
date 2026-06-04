import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (username, password, organizationId = '') => {
    try {
      // Basic client-side validation
      if (!username || !password) {
        return { success: false, message: 'Username and password are required' };
      }

      const loginData = { username, password };
      // Only add organizationId if provided (for super admin login)
      if (organizationId) {
        loginData.organizationId = organizationId;
      }

      const { data } = await api.post('/auth/login', loginData);
      
      // Validate response data
      if (!data.token || !data._id) {
        return { success: false, message: 'Invalid response from server' };
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (error) {
      // Clear any existing auth data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

   const register = async ({ username, email, password, organizationName, organizationEmail, organizationPhone }) => {
     try {
       if (!username || username.length < 3) {
         return { success: false, message: 'Username must be at least 3 characters' };
       }
       if (!password || password.length < 8) {
         return { success: false, message: 'Password must be at least 8 characters' };
       }
       if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
         return { 
           success: false, 
           message: 'Password must contain uppercase, lowercase, and number' 
         };
       }

       const { data } = await api.post('/auth/register', {
         username,
         email,
         password,
         organizationName,
         organizationEmail,
         organizationPhone
       });
       
       if (!data.token || !data._id) {
         return { success: false, message: 'Invalid response from server' };
       }

       localStorage.setItem('token', data.token);
       localStorage.setItem('user', JSON.stringify(data));
       setUser(data);
       return { success: true };
     } catch (error) {
       return { 
         success: false, 
         message: error.response?.data?.message || 'Registration failed. Please try again.' 
       };
     }
   };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
