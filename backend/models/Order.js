const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  customerAddress: {
    type: String,
    required: true,
  },
  customerCity: {
    type: String,
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  subtotal: {
    type: Number,
    required: true,
  },
  deliveryCharges: {
    type: Number,
    default: 700,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'dispatch', 'delivery', 'completed', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [
    {
      status: String,
      date: { type: Date, default: Date.now },
      estimatedDays: Number,
    },
  ],
  trackingId: {
    type: String,
    unique: true,
  },
}, { timestamps: true });

// Generate tracking ID before save
orderSchema.pre('save', function (next) {
  if (!this.trackingId) {
    const prefix = 'TAL';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.trackingId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);