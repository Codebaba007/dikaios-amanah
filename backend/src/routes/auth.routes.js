const express = require('express');
const { register, login, getProfile } = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Protected route for testing RBAC
router.get('/profile', authenticate, getProfile);

// Example role-restricted route
router.get('/admin-only', authenticate, authorize(['ADMINISTRATOR']), (req, res) => {
  res.json({ message: 'Welcome Administrator' });
});

module.exports = router;
