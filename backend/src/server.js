const app = require('./app');
const config = require('./config');
const connectDB = require('./config/db');

const start = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
