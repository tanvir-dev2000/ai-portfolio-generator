import axios from 'axios';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  sendEmailVerification
} from 'firebase/auth';

const API_URL = process.env.REACT_APP_API_URL;

// Register new user through backend
export const registerUser = async (email, password) => {
  try {
    // Create user through backend (which sets custom claims)
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      email,
      password
    });
    
    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Send email verification
    await sendEmailVerification(userCredential.user);
    
    // Force token refresh to get custom claims
    await userCredential.user.getIdToken(true);
    
    return {
      user: userCredential.user,
      requiresVerification: true
    };
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

// Login existing user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Force token refresh
    await userCredential.user.getIdToken(true);
    
    return userCredential.user;
  } catch (error) {
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password');
    }
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email');
    }
    if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password');
    }
    throw error;
  }
};

// Google Sign-In
export const googleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if this is a new user
    const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
    
    if (isNewUser) {
      // Set custom claims for new Google users
      const token = await result.user.getIdToken();
      await axios.post(
        `${API_URL}/api/auth/set-claims`,
        { uid: result.user.uid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Force token refresh
      await result.user.getIdToken(true);
    }
    
    // Google accounts are automatically verified
    return result.user;
  } catch (error) {
    throw error;
  }
};

// Resend verification email
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    
    if (user.emailVerified) {
      throw new Error('Email already verified');
    }
    
    await sendEmailVerification(user);
    return true;
  } catch (error) {
    throw error;
  }
};

// Check if email is verified (refresh user data)
export const checkEmailVerified = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return false;
    }
    
    // Reload user data from Firebase
    await user.reload();
    
    // Force token refresh if verified
    if (user.emailVerified) {
      await user.getIdToken(true);
    }
    
    return user.emailVerified;
  } catch (error) {
    console.error('Error checking verification:', error);
    return false;
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};
