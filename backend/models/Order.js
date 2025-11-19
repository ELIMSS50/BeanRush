const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: Number,
  table: String,
  items: [
    {
      id: Number,
      name: String,
      price: Number,
      qty: Number,
      category: String
    }
  ],
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'preparing', 'done', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema); // apunta a la colección 'orders'
