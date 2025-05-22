require('dotenv').config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const winston = require('winston');
const express = require('express');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'notification-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Configure email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Initialize Express app for health checks and internal monitoring
const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 3005;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Internal HTTP server started on port ${PORT}`);
});

// Handle notifications
async function sendEmail(recipient, subject, content) {
  try {
    const info = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: recipient,
      subject: subject,
      html: content
    });
    logger.info(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    return false;
  }
}

// Connect to RabbitMQ and consume messages
async function startConsumer() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();
    
    // Ensure queues exist
    await channel.assertQueue('email-notifications', { durable: true });
    
    logger.info('Connected to RabbitMQ, waiting for messages...');
    
    // Consume email notifications
    channel.consume('email-notifications', async (msg) => {
      if (msg !== null) {
        try {
          const notification = JSON.parse(msg.content.toString());
          logger.info(`Processing email notification: ${notification.id}`);
          
          await sendEmail(
            notification.recipient,
            notification.subject,
            notification.content
          );
          
          channel.ack(msg);
        } catch (error) {
          logger.error(`Error processing message: ${error.message}`);
          // Nack and requeue if it's a temporary failure
          channel.nack(msg, false, true);
        }
      }
    });
    
    // Handle connection closure
    process.on('SIGINT', async () => {
      await channel.close();
      await connection.close();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
    // Retry connection after delay
    setTimeout(startConsumer, 5000);
  }
}

// Start the consumer
startConsumer();
