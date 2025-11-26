// product.js - Schema actualizado
const mongoose = require('mongoose');

const includedProductSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  qty: Number,
  category: String
});

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  category: String,
  qty: { type: Number, default: 0 },
  isCombo: { type: Boolean, default: false },
  description: { type: String, default: '' },
  includedProducts: [includedProductSchema] // Array de productos incluidos
});

module.exports = mongoose.model('Product', productSchema);