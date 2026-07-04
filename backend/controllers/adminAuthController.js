const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (id, role = 'admin') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register admin (requires secret key)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid admin secret key' });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({ name, email, password });

    const token = generateToken(admin._id, 'admin');

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login admin
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id, 'admin');

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    res.json(req.admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};