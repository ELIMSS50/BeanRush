const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/beanrush')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.listen(4000, () => console.log('Servidor corriendo en http://localhost:4000'));
