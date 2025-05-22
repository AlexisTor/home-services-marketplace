import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import winston from 'winston';
import auth from './middleware/auth.mjs';

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-gateway-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});


app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  // Log request information
  logger.info(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    headers: req.headers
  });
  
  // Capture the original res.end to add response logging
  const originalEnd = res.end;
  res.end = function(...args) {
    // Log response information
    logger.info(`Response ${res.statusCode}`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: Date.now() - req._startTime
    });
    
    originalEnd.apply(res, args);
  };
  
  // Add timestamp for response time calculation
  req._startTime = Date.now();
  
  next();
});


// Routes
app.use('/api/users', auth, createProxyMiddleware({ 
  target: process.env.USER_SERVICE_URL || 'http://user-service:3001',
  changeOrigin: true,
  pathRewrite: {'^/api/users': ''}
}));

app.use('/api/professionals', auth, createProxyMiddleware({ 
  target: process.env.PROFESSIONAL_SERVICE_URL || 'http://professional-service:3002',
  changeOrigin: true,
  pathRewrite: {'^/api/professionals': ''}
}));

app.use('/api/jobs', auth, createProxyMiddleware({ 
  target: process.env.JOB_SERVICE_URL || 'http://job-service:3003',
  changeOrigin: true,
  pathRewrite: {'^/api/jobs': ''}
}));

app.use('/api/payments', auth, createProxyMiddleware({ 
  target: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004',
  changeOrigin: true,
  pathRewrite: {'^/api/payments': ''}
}));

app.use('/api/notifications', auth, createProxyMiddleware({ 
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
  changeOrigin: true,
  pathRewrite: {'^/api/notifications': ''}
}));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
