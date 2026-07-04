const config = require('../config');

const errorHandler = (err, req, res, _next) => {
  if (config.nodeEnv !== 'test') {
    console.error(err);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Données invalides', errors: messages });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ message: `Ce ${field} existe déjà` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Format d\'identifiant invalide' });
  }

  if (err.name === 'RateLimitError' || err.statusCode === 429) {
    return res.status(429).json({ message: 'Trop de requêtes. Réessayez plus tard.' });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Format JSON invalide' });
  }

  const statusCode = err.statusCode || 500;
  const isProduction = config.nodeEnv === 'production';

  res.status(statusCode).json({
    message: isProduction && statusCode === 500 ? 'Erreur interne du serveur' : err.message || 'Erreur interne du serveur',
  });
};

module.exports = errorHandler;
