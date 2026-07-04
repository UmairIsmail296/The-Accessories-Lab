const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
  signup, login, forgotPassword, verifyOtp, resetPassword,
  getProfile, addToCart, removeFromCart, updateCartQuantity,
  getCart, clearCart, updateProfile, addRecentlyViewed, getRecentlyViewed,
} = require('../controllers/authController');
const { protectUser } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/profile', protectUser, getProfile);

// Use uploadProfile for Cloudinary
router.put('/profile', protectUser, uploadProfile.single('profilePic'), updateProfile);

router.get('/recently-viewed', protectUser, getRecentlyViewed);
router.post('/recently-viewed', protectUser, addRecentlyViewed);

router.get('/cart', protectUser, getCart);
router.post('/cart', protectUser, addToCart);
router.delete('/cart/:productId', protectUser, removeFromCart);
router.put('/cart/:productId', protectUser, updateCartQuantity);
router.delete('/cart', protectUser, clearCart);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    res.redirect(`${process.env.FRONTEND_URL}/google-callback?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}&id=${req.user._id}`);
  }
);

module.exports = router;