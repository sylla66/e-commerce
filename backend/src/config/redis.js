const Redis = require('redis');
const config = require('./index');

let redisClient = null;

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = Redis.createClient({ url: config.redisUrl });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
  }
  return redisClient;
};

module.exports = { getRedisClient };
