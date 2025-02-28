const jwt = require('jsonwebtoken');

// Authentication middleware to verify JWT tokens
const authenticateToken = (req, res, next) => {
  // For demo purposes, we'll make auth optional
  // This allows the app to work without login if needed
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // For demo, we'll create a "guest" user if no token
    req.user = { id: 'guest', username: 'guest' };
    return next();
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };