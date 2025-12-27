const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('./errorHandler');

const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new ErrorHandler('Not authorized to access this route', 401));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    next(new ErrorHandler('Not authorized to access this route', 401));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new ErrorHandler('Not authorized to access this route', 403));
    }
    next();
  };
};

module.exports = { protect, authorize };
