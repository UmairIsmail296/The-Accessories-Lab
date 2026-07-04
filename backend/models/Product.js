const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'airpods', 'handfree', 'mobile-back-covers', 'adapters',
      'charging-leads', 'cooling-fans', 'splitters', 'connectors',
      'mobile-watch', 'headphones', 'speakers', 'powerbank',
    ],
  },
  brand: {
    type: String,
    default: '',
  },
  specifications: {
    type: String,
    default: '',
  },
  colors: [{
    type: String,
  }],
  image: {
    type: String,
    default: '',
  },
  images: [{
    type: String,
  }],
  stock: {
    type: Number,
    default: 10,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isSoldOut: {
    type: Boolean,
    default: false,
  },
  notifySubscribers: [{
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);