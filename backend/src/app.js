const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const config = require('./config');
const routes = require('./routes');
const webhookRoutes = require('./routes/webhook');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
  xDownloadOptions: false,
}));
app.use(cors({
  origin: config.nodeEnv === 'production' ? config.frontendUrl : ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
}));

if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/v1/webhook', webhookRoutes);

app.use('/api/', apiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

module.exports = app;
