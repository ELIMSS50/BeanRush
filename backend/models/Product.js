const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  category: String
});

module.exports = mongoose.model('Product', productSchema);
