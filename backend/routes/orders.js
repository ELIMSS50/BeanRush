const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET - Obtener todas las órdenes
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nueva orden (AGREGA ESTA RUTA)
router.post('/', async (req, res) => {
  try {
    // Encontrar el último ID para generar uno nuevo
    const lastOrder = await Order.findOne().sort({ id: -1 });
    const newId = lastOrder ? lastOrder.id + 1 : 1;
    
    // Calcular el total automáticamente
    const total = req.body.items.reduce((sum, item) => {
      return sum + (item.price * item.qty);
    }, 0);
    
    const orderData = {
      ...req.body,
      id: newId,
      total: total,
      createdAt: new Date()
    };
    
    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar orden completa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Calcular el total automáticamente
    const total = req.body.items.reduce((sum, item) => {
      return sum + (item.price * item.qty);
    }, 0);
    
    const updatedOrder = await Order.findOneAndUpdate(
      { id: parseInt(id) },
      { 
        ...req.body,
        total: total
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Actualizar solo el estado
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedOrder = await Order.findOneAndUpdate(
      { id: parseInt(id) },
      { status },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar orden
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedOrder = await Order.findOneAndDelete({ id: parseInt(id) });
    
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    res.json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;