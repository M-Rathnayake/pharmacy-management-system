// Simple user database
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'System Admin'
  },
  {
    id: 2,
    username: 'pharmacist',
    password: 'pharma123',
    role: 'pharmacist',
    name: 'John Smith'
  },
  {
    id: 3,
    username: 'cashier',
    password: 'cashier123',
    role: 'cashier',
    name: 'Jane Doe'
  }
];

export const authenticateUser = (username, password) => {
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

export default users; 