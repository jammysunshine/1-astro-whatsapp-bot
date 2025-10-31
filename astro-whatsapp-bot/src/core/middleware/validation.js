const { BirthData } = require('../models');

const validateBirthData = (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    const birthData = new BirthData(req.body);
    birthData.validate();

    req.validatedBirthData = birthData;
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

module.exports = {
  validateBirthData,
  errorHandler
};