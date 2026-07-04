const express = require('express');
const router = express.Router();
const { createReview, getReviews, getAllReviewsAdmin, deleteReview } = require('../controllers/reviewController');
const { protectUser, protectAdmin } = require('../middleware/auth');

router.get('/', getReviews);
router.post('/', protectUser, createReview);
router.get('/admin/all', protectAdmin, getAllReviewsAdmin);
router.delete('/admin/:id', protectAdmin, deleteReview);

module.exports = router;