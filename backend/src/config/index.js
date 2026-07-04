const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  wave: {
    apiKey: process.env.WAVE_API_KEY || '',
    apiSecret: process.env.WAVE_API_SECRET || '',
  },
  orangeMoney: {
    clientId: process.env.ORANGE_MONEY_CLIENT_ID || '',
    clientSecret: process.env.ORANGE_MONEY_CLIENT_SECRET || '',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
