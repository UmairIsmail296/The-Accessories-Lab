import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const adminData = localStorage.getItem('admin');

    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const signupUser = async (name, email, password) => {
    const { data } = await axios.post('/api/auth/signup', { name, email, password });
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const loginAdmin = async (email, password) => {
    const { data } = await axios.post('/api/admin/login', { email, password });
    localStorage.setItem('admin', JSON.stringify(data));
    setAdmin(data);
    return data;
  };

  const logoutUser = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  const setGoogleUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // ✅ NEW FUNCTION: Update user data (for profile pic, name, phone update)
  const updateUser = (updatedData) => {
    const currentUser = JSON.parse(localStorage.getItem('user')) || user;
    const newUserData = {
      ...currentUser,
      ...updatedData,
    };
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  // ✅ NEW FUNCTION: Refresh user data from server
  const refreshUser = async () => {
    if (!user?.token) return;
    try {
      const { data } = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const updatedUser = {
        ...user,
        name: data.name,
        email: data.email,
        phone: data.phone,
        profilePic: data.profilePic,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    admin,
    loading,
    loginUser,
    signupUser,
    loginAdmin,
    logoutUser,
    logoutAdmin,
    setGoogleUser,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};