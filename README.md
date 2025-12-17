# E-Commerce API with Inventory Management and Transactional Orders

![Node.js](https://img.shields.io/badge/Node.js-14+-green)
![Express](https://img.shields.io/badge/Express-4.18+-blue)
![MySQL](https://img.shields.io/badge/MySQL-8+-orange)
![Redis](https://img.shields.io/badge/Redis-6+-red)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.8+-yellowgreen)

## Overview

A production-ready E-commerce API built with Node.js, Express, and MySQL that implements advanced concepts including:

✅ **JWT-based Authentication** with role-based access control (ADMIN/CUSTOMER)  
✅ **Product Management** with inventory tracking  
✅ **Shopping Cart** functionality  
✅ **Order Processing** with ACID transactions  
✅ **Optimistic Locking** to prevent race conditions  
✅ **Redis Caching** for product listings  
✅ **RabbitMQ** for asynchronous email notifications  
✅ **Layered Architecture** (Controller → Service → Repository)  

## Tech Stack

- **Backend Framework**: Node.js + Express.js
- **Database**: MySQL/PostgreSQL (ACID transactions)
- **Caching**: Redis
- **Message Queue**: RabbitMQ
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Security**: helmet, cors, morgan

## Project Structure

```
ecommerce-api/
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── rabbitmq.js
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── middlewares/
│   ├── routes/
│   └── workers/
├── database/
│   └── schema.sql
├── .env.example
├── package.json
├── server.js
├── COMPLETE_IMPLEMENTATION.md
└── SOURCE_CODE_GUIDE.md
```

## Installation

### Prerequisites
- Node.js v14 or higher
- MySQL 8 or PostgreSQL 12+
- Redis 6+
- RabbitMQ 3.8+

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Bhavyateja04/task4_23p31a1220.git
   cd task4_23p31a1220
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database, Redis, and RabbitMQ credentials
   ```

4. **Initialize database**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

5. **Start the server**
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
```

### Products (Public)
```
GET    /api/products               # List all products (cached)
GET    /api/products/:id           # Get product details
GET    /api/products?category=electronics&sort=price
```

### Products (Admin Only)
```
POST   /api/products               # Create product
PUT    /api/products/:id           # Update product
DELETE /api/products/:id           # Delete product
```

### Shopping Cart (Customer Only)
```
GET    /api/cart                   # View cart
POST   /api/cart/items             # Add to cart
DELETE /api/cart/items/:id         # Remove from cart
```

### Orders (Customer Only)
```
POST   /api/orders                 # Place order
GET    /api/orders/:id             # Get order details
```

## Key Features

### 1. JWT Authentication
- Stateless authentication using JSON Web Tokens
- Tokens include user ID, email, and role
- 24-hour token expiry (configurable)

### 2. Role-Based Access Control (RBAC)
- **ADMIN**: Create, update, delete products
- **CUSTOMER**: Browse products, manage cart, place orders

### 3. Optimistic Locking
- Product `version` field prevents concurrent modifications
- Stock updates are atomic with version verification
- Prevents overselling under concurrent orders

### 4. ACID Transactions
- Order placement wrapped in database transaction
- Atomicity: Stock deduction + Order creation succeed or fail together
- Automatic rollback on error

### 5. Redis Caching
- Cache-aside pattern for product listings
- 1-hour cache TTL
- Automatic invalidation on product changes

### 6. Async Email Notifications
- RabbitMQ message queue for non-blocking operations
- Order confirmation emails sent asynchronously
- Retry mechanism for failed deliveries

## Database Schema

### Core Tables
- **users**: User accounts with roles
- **products**: Product catalog with version field for optimistic locking
- **carts**: Shopping carts per user
- **cart_items**: Items in cart
- **orders**: Customer orders
- **order_items**: Order line items with price snapshot

See `database/schema.sql` for complete schema.

## Documentation

- **[COMPLETE_IMPLEMENTATION.md](./COMPLETE_IMPLEMENTATION.md)** - Detailed implementation guide
- **[SOURCE_CODE_GUIDE.md](./SOURCE_CODE_GUIDE.md)** - Source code file specifications
- **[.env.example](./.env.example)** - Environment variable template

## Error Handling

- `400` Bad Request - Validation errors
- `401` Unauthorized - Invalid/expired token
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `409` Conflict - Concurrency error (overselling attempt)
- `500` Internal Server Error

## Security

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens with expiry
- Role-based middleware enforcement
- Helmet.js for HTTP headers security
- CORS configuration
- SQL injection prevention via parameterized queries

## Performance

- Database connection pooling
- Redis caching for frequent queries
- Async email processing
- Pagination for large result sets
- Database indexes on frequently queried columns

## Testing

```bash
# Run tests
npm test

# Run concurrency tests
npm run test:concurrency
```

## Deployment

### Docker
```bash
docker-compose up
```

### Environment Setup
All configuration via `.env` file - never commit credentials.

## Contributing

1. Follow the layered architecture
2. Write tests for new features
3. Follow Node.js best practices
4. Document API changes

## License

MIT

## Author

Penke Bhavya Teja  
[GitHub](https://github.com/Bhavyateja04)  
Student | Full-Stack Developer
