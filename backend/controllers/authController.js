const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// @desc    Register user
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password, isVerified: true });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password - send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send email
    const mailOptions = {
      from: `"THE ACCESSORIES LAB" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset OTP - THE ACCESSORIES LAB',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #fff; border-radius: 10px;">
          <h1 style="text-align: center; color: #e94560;">THE ACCESSORIES LAB</h1>
          <h2 style="text-align: center;">Password Reset OTP</h2>
          <p style="text-align: center; font-size: 18px;">Your OTP code is:</p>
          <div style="text-align: center; background: #16213e; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h1 style="color: #e94560; letter-spacing: 10px; font-size: 36px;">${otp}</h1>
          </div>
          <p style="text-align: center; color: #aaa;">This OTP will expire in 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('cart.product');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = await User.findById(req.user._id);

    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save({ validateBeforeSave: false });
    const updatedUser = await User.findById(req.user._id).populate('cart.product');

    res.json(updatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save({ validateBeforeSave: false });
    const updatedUser = await User.findById(req.user._id).populate('cart.product');

    res.json(updatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
exports.updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);

    const item = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        user.cart = user.cart.filter(
          (i) => i.product.toString() !== productId
        );
      }
    }

    await user.save({ validateBeforeSave: false });
    const updatedUser = await User.findById(req.user._id).populate('cart.product');

    res.json(updatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cart
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save({ validateBeforeSave: false });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ... keep all existing functions and ADD these at the bottom ...

// @desc    Update profile
// @desc    Update profile
// Update profile - Cloudinary URL
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    // If file uploaded, use Cloudinary URL
    if (req.file) {
      user.profilePic = req.file.path; // Cloudinary URL
    }

    await user.save({ validateBeforeSave: false });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add to recently viewed
exports.addRecentlyViewed = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    // Remove if already exists
    user.recentlyViewed = user.recentlyViewed.filter(
      (item) => item.product.toString() !== productId
    );

    // Add to front
    user.recentlyViewed.unshift({ product: productId, viewedAt: new Date() });

    // Keep only last 20
    if (user.recentlyViewed.length > 20) {
      user.recentlyViewed = user.recentlyViewed.slice(0, 20);
    }

    await user.save({ validateBeforeSave: false });
    res.json({ message: 'Added to recently viewed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recently viewed
exports.getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('recentlyViewed.product');
    const viewed = user.recentlyViewed
      .filter((item) => item.product)
      .slice(0, 10);
    res.json(viewed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};