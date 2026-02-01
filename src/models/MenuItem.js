import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage'],
    index: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  ingredients: [{
    type: String,
    trim: true,
  }],
  isAvailable: {
    type: Boolean,
    default: true,
  },
  preparationTime: {
    type: Number,
    min: [0, 'Preparation time cannot be negative'],
    default: 15,
  },
  imageUrl: {
    type: String,
    default: '/foodplaceholder.png',
  },
}, {
  timestamps: true,
});

// Create text index for search functionality
menuItemSchema.index({ name: 'text', description: 'text', ingredients: 'text' });

export default mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);