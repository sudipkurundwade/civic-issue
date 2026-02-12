import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_PASSWORD || process.env.JWT_SECRET;

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log("Auth Header:", authHeader ? authHeader.substring(0, 20) + "..." : "Missing"); // Debug log
    // console.log("JWT_SECRET available:", !!JWT_SECRET); // Debug log

    if (!authHeader?.startsWith('Bearer ')) {
      console.log("Auth failed: No Bearer token");
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("Decoded Token:", decoded); // Debug log
    } catch (verifyErr) {
      console.error("JWT Verify Error:", verifyErr.message);
      throw verifyErr;
    }

    const user = await User.findById(decoded.userId)
      .select('_id email name role region department')
      .lean();

    if (!user) {
      console.log("Auth failed: User not found for ID", decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = { ...user, id: user._id.toString() };
    next();
  } catch (err) {
    console.error("Auth Middleware Final Error:", err.name, err.message); // Debug log
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
};
