const mongoose = require('mongoose');

const colorVariantSchema = new mongoose.Schema({
  colorName: { type: String, required: true },
  colorHex: { type: String, default: '#000000' },
  images: [{ type: String }],
}, { _id: false });

const showcaseSectionSchema = new mongoose.Schema({
  sectionType: {
    type: String,
    default: 'custom',
  },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  images: [{ type: String }],
  layout: { type: String, default: 'image-right' },
  backgroundColor: { type: String, default: '#f5f5f7' },
  textColor: { type: String, default: '#1a1a2e' },
  order: { type: Number, default: 0 },
}, { _id: false });

const specItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const specGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  icon: { type: String, default: '⚙️' },
  items: [specItemSchema],
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  tagline: { type: String, default: '' },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  category: {
    type: String,
    required: true,
    enum: [
      'airpods', 'handfree', 'mobile-back-covers', 'adapters',
      'charging-leads', 'cooling-fans', 'splitters', 'connectors',
      'mobile-watch', 'headphones', 'speakers', 'powerbank',
    ],
  },
  brand: { type: String, default: '' },
  modelNumber: { type: String, default: '' },
  specifications: { type: String, default: '' },

  specGroups: { type: [specGroupSchema], default: [] },

  colors: [{ type: String }],
  colorVariants: { type: [colorVariantSchema], default: [] },

  image: { type: String, default: '' },
  images: [{ type: String }],

  showcaseSections: { type: [showcaseSectionSchema], default: [] },

  stock: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
  isSoldOut: { type: Boolean, default: false },

  notifySubscribers: [{
    email: { type: String, required: true },
    name: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subscribedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);