const redisClient = require('../config/redis');
const { ErrorHandler } = require('../middlewares/errorHandler');

exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, quantity, description } = req.body;
    const cacheKey = 'products:list';
    await redisClient.del(cacheKey);
    
    res.status(201).json({
      success: true,
      message: 'Product created',
      product: { id: 1, name, price, quantity, description }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const cacheKey = 'products:list';
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.status(200).json({
        success: true,
        products: JSON.parse(cached),
        fromCache: true
      });
    }
    
    const products = [];
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(products));
    
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = 'products:list';
    await redisClient.del(cacheKey);
    
    res.status(200).json({
      success: true,
      message: 'Product updated'
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = 'products:list';
    await redisClient.del(cacheKey);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted'
    });
  } catch (error) {
    next(error);
  }
};
