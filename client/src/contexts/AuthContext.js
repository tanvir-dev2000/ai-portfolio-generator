import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  loginUser, 
  registerUser, 
  googleSignIn, 
  logoutUser,
  resendVerificationEmail,
  checkEmailVerified
} from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Refresh token to ensure custom claims are loaded
        await user.getIdToken(true);
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const user = await loginUser(email, password);
    setUser(user);
    return user;
  };

  const register = async (email, password) => {
    const result = await registerUser(email, password);
    setUser(result.user);
    return result;
  };

  const googleLogin = async () => {
    const user = await googleSignIn();
    setUser(user);
    return user;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const resendVerification = async () => {
    return await resendVerificationEmail();
  };

  const refreshEmailVerification = async () => {
    const isVerified = await checkEmailVerified();
    if (isVerified && user) {
      // Update user state
      await user.reload();
      setUser({ ...user });
    }
    return isVerified;
  };

  const value = {
    user,
    login,
    register,
    googleLogin,
    logout,
    resendVerification,
    refreshEmailVerification,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
