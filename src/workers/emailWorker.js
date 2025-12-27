const { channel } = require('../config/rabbitmq');

const startEmailWorker = async () => {
  try {
    if (!channel) {
      console.log('RabbitMQ channel not ready');
      return;
    }

    await channel.assertQueue('email_queue', { durable: true });
    await channel.prefetch(1);

    channel.consume('email_queue', async (msg) => {
      if (msg) {
        const emailData = JSON.parse(msg.content.toString());
        console.log('Processing email:', emailData);
        
        try {
          // Simulate email sending
          console.log(`Email sent to: ${emailData.to}`);
          channel.ack(msg);
        } catch (error) {
          console.error('Error sending email:', error);
          channel.nack(msg, false, true);
        }
      }
    });

    console.log('Email worker started');
  } catch (error) {
    console.error('Email worker error:', error);
  }
};

module.exports = { startEmailWorker };
