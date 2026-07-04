const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
} = require('../controllers/adminAuthController');
const { protectAdmin } = require('../middleware/auth');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/profile', protectAdmin, getAdminProfile);

module.exports = router;