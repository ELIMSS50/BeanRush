const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// PUT - Actualizar orden completa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findOneAndUpdate(
      { id: parseInt(id) },
      req.body,
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

module.exports = router;