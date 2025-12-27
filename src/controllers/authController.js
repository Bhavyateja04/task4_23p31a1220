const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ErrorHandler } = require('../middlewares/errorHandler');

exports.register = async (req, res, next) => {
  try {
    const { email, password, role = 'CUSTOMER' } = req.body;
    
    if (!email || !password) {
      return next(new ErrorHandler('Please provide email and password', 400));
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email, role }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { email, role }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(new ErrorHandler('Please provide email and password', 400));
    }
    
    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token
    });
  } catch (error) {
    next(error);
  }
};
