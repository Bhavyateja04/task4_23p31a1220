const amqp = require('amqplib');

let connection;
let channel;

const initRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    
    // Declare email queue
    await channel.assertQueue('email_queue', { durable: true });
    
    console.log('RabbitMQ connected');
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    setTimeout(initRabbitMQ, 5000);
  }
};

const sendToQueue = async (queue, message) => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
};

module.exports = { initRabbitMQ, channel, connection, sendToQueue };
