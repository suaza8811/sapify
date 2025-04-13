const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
};

module.exports = errorHandler;