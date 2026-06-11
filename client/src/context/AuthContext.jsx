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

  const login = async (username, password, clinicSlug = '') => {
    try {
      if (!username || !password) {
        return { success: false, message: 'Username and password are required' };
      }

      const loginData = { username, password };
      // SECURITY: Send clinic slug as header for anti-spam lookups
      // The backend will verify the slug and check organization approval status
      const headers = {};
      if (clinicSlug) {
        headers['X-Clinic-Slug'] = clinicSlug;
      }

      const { data } = await api.post('/auth/login', loginData, { headers });
      
      if (!data.token || !data._id) {
        return { success: false, message: 'Invalid response from server' };
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (error) {
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
