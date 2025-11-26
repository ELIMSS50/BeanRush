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

// POST - Agregar nuevo producto (CORREGIDO)
router.post('/', async (req, res) => {
  try {
    console.log('📥 DATOS RECIBIDOS EN BACKEND:', req.body);
    
    // Obtener el último ID para generar uno nuevo
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const newId = lastProduct ? lastProduct.id + 1 : 1;
    
    // Crear producto con TODOS los datos recibidos
    const newProduct = new Product({
      id: newId,
      name: req.body.name,
      price: parseFloat(req.body.price),
      category: req.body.category,
      qty: req.body.qty || 0,
      isCombo: req.body.isCombo !== undefined ? req.body.isCombo : false,
      description: req.body.description || '',
      includedProducts: req.body.includedProducts || []
    });
    
    console.log('💾 GUARDANDO EN BD:', newProduct);
    
    const savedProduct = await newProduct.save();
    
    console.log('✅ PRODUCTO GUARDADO:', savedProduct);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('❌ ERROR AL GUARDAR:', error);
    res.status(500).json({ error: 'Error al agregar producto: ' + error.message });
  }
});

// PUT - Actualizar producto (CORREGIDO)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔄 ACTUALIZANDO PRODUCTO ID:', id);
    console.log('DATOS RECIBIDOS:', req.body);
    
    const updatedProduct = await Product.findOneAndUpdate(
      { id: parseInt(id) },
      { 
        name: req.body.name,
        price: parseFloat(req.body.price),
        category: req.body.category,
        qty: req.body.qty || 0,
        isCombo: req.body.isCombo !== undefined ? req.body.isCombo : false,
        description: req.body.description || '',
        includedProducts: req.body.includedProducts || []
      },
      { new: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    console.log('✅ PRODUCTO ACTUALIZADO:', updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    console.error('❌ ERROR ACTUALIZANDO:', error);
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