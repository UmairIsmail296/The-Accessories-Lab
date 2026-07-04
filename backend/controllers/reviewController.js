const Review = require('../models/Review');

// @desc    Create review
exports.createReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    const review = await Review.create({
      user: req.user._id,
      userName: req.user.name,
      userProfilePic: req.user.profilePic || '',
      rating: Number(rating),
      title,
      comment,
    });

    const io = req.app.get('io');
    io.emit('new_review', review);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all approved reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews (Admin)
exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete review (Admin)
exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};