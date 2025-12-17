# E-commerce API - Complete Implementation Guide

## Project Overview

This is a production-ready E-commerce API built with Node.js and Express.js that implements:
- JWT-based authentication with role-based access control (ADMIN/CUSTOMER)
- Product management with inventory tracking
- Shopping cart functionality
- Order processing with ACID transactions
- Optimistic locking for concurrency control
- Redis-based caching for product listings
- RabbitMQ for asynchronous email notifications

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL/PostgreSQL (ACID transactions)
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: bcryptjs, helmet, cors

## Project Structure

```
ecommerce-api/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── rabbitmq.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   └── orderController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   └── orderService.js
│   ├── repositories/
│   │   ├── userRepository.js
│   │   ├── productRepository.js
│   │   ├── cartRepository.js
│   │   └── orderRepository.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   └── orderRoutes.js
│   ├── workers/
│   │   └── emailWorker.js
│   └── app.js
├── database/
│   └── schema.sql
├── docs/
│   ├── api-endpoints.md
│   ├── architecture.md
│   └── ERD.md
├── .env.example
├── package.json
├── README.md
└── server.js
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MySQL/PostgreSQL
- Redis
- RabbitMQ

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

3. Update environment variables in `.env`
4. Install dependencies:
   ```bash
   npm install
   ```

5. Set up database:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

6. Start the server:
   ```bash
   npm start
   ```
   
   Or for development:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Products (Public)
- `GET /api/products` - List all products (with caching)
- `GET /api/products/:id` - Get product details
- `GET /api/products?category=electronics&sort=price` - Filter and sort

### Products (Admin Only)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Shopping Cart (Customer Only)
- `POST /api/cart/items` - Add to cart
- `GET /api/cart` - View cart
- `DELETE /api/cart/items/:id` - Remove from cart

### Orders (Customer Only)
- `POST /api/orders` - Place order
- `GET /api/orders/:id` - Get order details

## Key Features

### 1. JWT Authentication
- Stateless authentication using JWT tokens
- Tokens include user ID, email, and role
- Token expiry: 24 hours (configurable)

### 2. Role-Based Access Control
- ADMIN: Full access to product management
- CUSTOMER: Access to products, cart, and orders

### 3. Optimistic Locking
- Product version field prevents race conditions
- Stock updates are atomic with version checks
- Concurrent orders correctly prevent overselling

### 4. ACID Transactions
- Order placement is wrapped in database transaction
- Stock deduction + Order creation = atomic operation
- Automatic rollback on error

### 5. Caching Strategy
- Redis cache for product listings
- Cache-aside pattern implementation
- Automatic invalidation on product changes

### 6. Async Email Notifications
- RabbitMQ message queue for async processing
- Order confirmation emails sent without blocking API
- Retry logic for failed deliveries

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'CUSTOMER') DEFAULT 'CUSTOMER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT NOT NULL,
  version INT DEFAULT 1,  -- For optimistic locking
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'SHIPPED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Testing

### Unit Tests
```bash
npm test
```

### Concurrency Tests
```bash
npm run test:concurrency
```

This simulates 100 concurrent orders for the same product with limited stock to verify optimistic locking works correctly.

## Error Handling

- 400: Bad Request (validation error)
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (concurrency error, overselling attempt)
- 500: Internal Server Error

## Architecture Decisions

1. **Layered Architecture**: Clear separation between controllers, services, and repositories
2. **Optimistic Locking**: Chosen over pessimistic locks for better concurrency
3. **Async Processing**: RabbitMQ for non-blocking email notifications
4. **Cache-Aside Pattern**: Lazy loading of cache for product listings
5. **JWT over Sessions**: Stateless, scalable authentication

## Security Considerations

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens include expiry timestamps
- Role-based middleware enforces access control
- Helmet.js protects against common vulnerabilities
- CORS configured for specific origins
- SQL injection prevention via parameterized queries

## Performance Optimizations

- Database indexes on frequently queried columns
- Redis caching for product listings
- Connection pooling for database
- Async email processing
- Pagination for large result sets

## Deployment

### Docker
```bash
docker-compose up
```

### Environment Variables
All configuration via `.env` file - never commit credentials

### Production Checklist
- [ ] Update JWT_SECRET to strong random value
- [ ] Enable HTTPS
- [ ] Configure production database
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Load testing completed
- [ ] Security audit performed

## Contributing

1. Follow the layered architecture
2. Write tests for new features
3. Follow Node.js best practices
4. Document all API changes

## License

MIT
