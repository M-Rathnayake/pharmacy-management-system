import { authenticateUser } from '../data/users';

const API_URL = 'http://localhost:5000/api';

export const login = async (credentials) => {
  const { username, password } = credentials;
  const user = authenticateUser(username, password);
  
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  throw new Error('Invalid credentials');
};

export const logout = async () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = async () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
}; 