const admin = require('../config/firebase');

// Register new user (sends verification email automatically via Firebase)
exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password strength (min 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Create user in Firebase
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: false, // Start as unverified
    });
    
    // Set custom claims immediately (Supabase requires this)
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'authenticated'
    });
    
    console.log(`User created: ${userRecord.uid} - Email: ${email}`);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email before creating a portfolio.',
      uid: userRecord.uid,
      requiresVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    res.status(400).json({ error: error.message });
  }
};

// Set custom claims for users (for Google Sign-In)
exports.setUserClaims = async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }
    
    await admin.auth().setCustomUserClaims(uid, {
      role: 'authenticated'
    });
    
    console.log(`Custom claims set for user: ${uid}`);
    
    res.json({ 
      success: true, 
      message: 'Custom claims set successfully' 
    });
  } catch (error) {
    console.error('Error setting claims:', error);
    res.status(500).json({ error: error.message });
  }
};
