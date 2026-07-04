const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, config.jwtSecret, {
    expiresIn: '30d',
  });
};

module.exports = { generateToken, generateRefreshToken };
