const admin = require('../config/firebase');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // Verify token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user data and check verification
    const user = await admin.auth().getUser(decodedToken.uid);
    
    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address before creating a portfolio'
      });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable',
        message: 'Unable to verify authentication. Please check your internet connection and try again.'
      });
    }
    
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { verifyFirebaseToken };
