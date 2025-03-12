// frontend/utils/auth.ts
// Utility functions for demo authentication using localStorage

export const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  };
  
  export const handleLogin = async (username: string, password: string) => {
    // In demo mode, simply return a demo user.
    const demoUser = { username };
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(demoUser));
    }
    return demoUser;
  };
  
  export const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  };
  