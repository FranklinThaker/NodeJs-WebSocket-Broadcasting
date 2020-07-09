const rateLimit = require('express-rate-limit');

// all middlewares define here
const { errorHandler } = require('../middleware/errorHandler');

// All Routes define here
const userRoutes = require('../controllers/user/user.routes');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    error: 'Too many requests from this IP, please try again after an hour',
  },
});

const routes = (app) => {
  app.use('/api/v1/account', apiLimiter, userRoutes);
  app.use(errorHandler);
};

module.exports = { routes };
