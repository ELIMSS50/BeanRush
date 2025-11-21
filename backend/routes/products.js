const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Agregar nuevo producto
router.post('/', async (req, res) => {
  try {
    const { name, price, category } = req.body;
    
    // Obtener el último ID para generar uno nuevo
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const newId = lastProduct ? lastProduct.id + 1 : 1;
    
    const newProduct = new Product({
      id: newId,
      name,
      price: parseFloat(price),
      category
    });
    
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

// PUT - Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category } = req.body;
    
    const updatedProduct = await Product.findOneAndUpdate(
      { id: parseInt(id) },
      { name, price: parseFloat(price), category },
      { new: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedProduct = await Product.findOneAndDelete({ id: parseInt(id) });
    
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto eliminado correctamente', deletedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;