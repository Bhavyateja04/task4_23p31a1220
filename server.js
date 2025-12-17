const app = require('./src/app');
const { connectRabbitMQ } = require('./src/config/rabbitmq');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Connect to RabbitMQ
connectRabbitMQ().catch(err => {
  console.error('Failed to connect to RabbitMQ:', err);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = server;
