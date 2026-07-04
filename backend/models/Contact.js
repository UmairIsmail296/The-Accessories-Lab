const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: '',
  },
  subject: {
    type: String,
    required: true,
    enum: ['general', 'complaint', 'suggestion', 'order-issue', 'return', 'other'],
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'read', 'replied'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);