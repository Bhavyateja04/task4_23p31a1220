# Source Code Implementation Guide

This file contains all the source code needed to complete the E-commerce API implementation. Follow the file creation instructions below.

## File Structure

```
src/
  app.js
  config/
    database.js
    redis.js
    rabbitmq.js
  controllers/
    authController.js
    productController.js
    cartController.js
    orderController.js
  services/
    authService.js
    productService.js
    cartService.js
    orderService.js
  repositories/
    userRepository.js
    productRepository.js
    cartRepository.js
    orderRepository.js
  middlewares/
    authMiddleware.js
    roleMiddleware.js
    errorHandler.js
  routes/
    authRoutes.js
    productRoutes.js
    cartRoutes.js
    orderRoutes.js
  workers/
    emailWorker.js
```

## Implementation Steps

### Step 1: Create `src/app.js`
Main Express application setup with middleware and route mounting.

**Key functionality**:
- Initialize Express app
- Mount middleware (helmet, cors, morgan)
- Mount routes
- Error handling middleware

### Step 2: Create `src/config/` files

#### database.js
- MySQL connection pool using mysql2/promise
- Connection retry logic
- Export pool for queries

#### redis.js
- Redis client initialization
- Connection event handlers
- Export redisClient

#### rabbitmq.js
- AMQP connection setup
- Channel creation
- Queue assertion
- Export publishToQueue function

### Step 3: Create Service Layer Files

#### authService.js
**Methods**:
- `register(email, password, firstName, lastName)` - Hash password and create user
- `login(email, password)` - Verify password and generate JWT
- `generateToken(user)` - Create JWT with user info and 24h expiry
- `verifyPassword(plain, hash)` - Use bcryptjs to verify

#### productService.js
**Methods**:
- `getAllProducts(page, limit, category, sort)` - Cache-aside pattern
- `getProductById(id)` - Get single product
- `createProduct(name, price, stock, category)` - Admin only
- `updateProduct(id, updates)` - Invalidate cache on update
- `deleteProduct(id)` - Invalidate cache on delete
- `searchProducts(query)` - Search with filters

#### cartService.js
**Methods**:
- `getOrCreateCart(userId)` - Get or create user's cart
- `addToCart(userId, productId, quantity)` - Add item to cart
- `removeFromCart(userId, cartItemId)` - Remove item from cart
- `viewCart(userId)` - Get all cart items
- `clearCart(userId)` - Clear entire cart

#### orderService.js
**Methods**:
- `placeOrder(userId)` - ACID transaction order creation
  - Start transaction
  - Get cart items
  - Check stock for each item (SELECT FOR UPDATE)
  - Create order record
  - Create order_items with snapshot pricing
  - Update product stock with optimistic locking
  - Clear cart
  - Commit transaction
  - Queue email notification
  - Return order details
- `getOrderDetails(orderId, userId)` - Get order with items
- `updateOrderStatus(orderId, status)` - Update order status

### Step 4: Create Repository Layer Files

#### userRepository.js
- `createUser(userData)`
- `findByEmail(email)`
- `findById(id)`
- `updateUser(id, updates)`

#### productRepository.js
- `create(productData)` - Create product
- `findAll(filters, sort, pagination)` - Find with filters
- `findById(id)` - Get single product
- `update(id, updates)` - Update with version check (optimistic lock)
- `delete(id)` - Delete product
- `updateStock(productId, quantity, version)` - Atomic stock update
- `findLowStock(threshold)` - Find low stock products

#### cartRepository.js
- `create(userId)`
- `findByUserId(userId)`
- `addItem(cartId, productId, quantity)`
- `removeItem(cartItemId)`
- `findCartItems(cartId)`
- `clear(cartId)`

#### orderRepository.js
- `create(userId, totalAmount, connection)` - Use connection for transaction
- `findById(orderId)`
- `findByUserId(userId)` - Get user's orders
- `createOrderItem(orderId, product, quantity, unitPrice, connection)`
- `updateStatus(orderId, status)`

### Step 5: Create Controller Layer Files

#### authController.js
**Endpoints**:
- POST /api/auth/register
- POST /api/auth/login

**Responses**:
- Success: { user: {}, token: "jwt-token" }
- Error: { error: "message" }

#### productController.js
**Endpoints**:
- GET /api/products (public, cached)
- GET /api/products/:id (public)
- POST /api/products (admin only)
- PUT /api/products/:id (admin only)
- DELETE /api/products/:id (admin only)

#### cartController.js
**Endpoints**:
- GET /api/cart (customer only)
- POST /api/cart/items (customer only)
- DELETE /api/cart/items/:id (customer only)

#### orderController.js
**Endpoints**:
- POST /api/orders (customer only, returns 202 Accepted)
- GET /api/orders/:id (customer only)

### Step 6: Create Route Files

Each route file:
- Imports Express router
- Mounts controller methods
- Applies authentication/authorization middleware
- Implements input validation (Joi)

### Step 7: Create Middleware Files

#### authMiddleware.js
- Extract JWT from Authorization header
- Verify token
- Set req.user with decoded payload
- Handle token expiry

#### roleMiddleware.js
- Check req.user.role
- Allow only specified roles
- Return 403 if unauthorized

#### errorHandler.js
- Global error handling
- Handle different error types
- Return appropriate status codes

### Step 8: Create Worker Files

#### emailWorker.js
- Consume messages from 'email-queue'
- Send order confirmation emails
- Log delivery status
- Implement retry logic

## Key Implementation Details

### Optimistic Locking
```sql
UPDATE products 
SET stock_quantity = stock_quantity - ?, 
    version = version + 1 
WHERE id = ? AND version = ?
```

If UPDATE returns 0 rows, conflict detected - throw ConcurrencyError.

### ACID Transactions
```javascript
const connection = await pool.getConnection();
await connection.beginTransaction();
try {
  // All queries here
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

### Redis Caching
```javascript
const cacheKey = 'products:all';
let products = await redis.get(cacheKey);
if (!products) {
  products = await db.query('SELECT * FROM products');
  await redis.setex(cacheKey, 3600, JSON.stringify(products));
}
```

### Cache Invalidation
On POST/PUT/DELETE product:
```javascript
await redis.del('products:all');
```

### Async Email Notifications
```javascript
await publishToQueue('email-queue', {
  type: 'order-confirmation',
  orderId: order.id,
  userEmail: user.email,
  orderDetails: order
});
```

## Testing

### Manual Testing with Postman
1. Register a user
2. Login and get JWT token
3. Add token to Authorization: Bearer header
4. Create products (as ADMIN)
5. Add to cart (as CUSTOMER)
6. Place order
7. Verify order created

### Concurrency Testing
```bash
// Test with artillery or custom script
Simulate 100 concurrent POST /orders requests for product with stock=10
Expect: 10 successful orders, 90 409 Conflict responses
```

## Deployment Checklist

- [ ] All source files created
- [ ] Database schema initialized
- [ ] Environment variables configured
- [ ] npm install completed
- [ ] npm start works without errors
- [ ] Postman collection created
- [ ] README updated
- [ ] Architecture diagram created
- [ ] ERD diagram created
- [ ] Tests pass
- [ ] Pushed to GitHub

## Common Errors & Solutions

**JWT Token Expired**: Implement refresh token endpoint
**Stock Overselling**: Ensure version field in WHERE clause
**Cache Inconsistency**: Always invalidate on writes
**Email Delivery Fails**: Check RabbitMQ connection and SMTP credentials
