const express = require('express');
const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const router = express.Router();

// Registrar venta
router.post('/', async (req, res) => {
  try {
    const { productoId, cantidadVendida, nombreCliente, pagado } = req.body;

    const producto = await Producto.findById(productoId);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    if (producto.cantidad < cantidadVendida) {
      return res.status(400).json({ mensaje: 'Stock insuficiente' });
    }

    producto.cantidad -= cantidadVendida;
    await producto.save();

    const nuevaVenta = new Venta({
      productoId: producto._id,
      nombreProducto: producto.nombre,
      precioVenta: producto.precioVenta,
      cantidadVendida,
      nombreCliente,
      pagado,
      imagenVenta: producto.imagen ? {
        data: producto.imagen.data,
        contentType: producto.imagen.contentType
      } : null
    });

    await nuevaVenta.save();
    res.json({ mensaje: 'Venta registrada correctamente', venta: nuevaVenta, productoActualizado: producto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar venta', error: error.message });
  }
});

// Obtener todas las ventas
router.get('/', async (req, res) => {
  try {
    const ventas = await Venta.find().sort({ fechaVenta: -1 });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ventas', error: error.message });
  }
});

// Obtener imagen de venta
router.get('/:id/imagen', async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta || !venta.imagenVenta?.data) return res.status(404).send('Imagen no encontrada');
    res.set('Content-Type', venta.imagenVenta.contentType);
    res.send(venta.imagenVenta.data);
  } catch (error) {
    res.status(500).send('Error al obtener imagen de venta');
  }
});

// Eliminar venta
router.delete('/:id', async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta) return res.status(404).json({ mensaje: 'Registro de venta no encontrado' });

    await venta.deleteOne();
    res.json({ mensaje: 'Registro de venta eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar venta', error: error.message });
  }
});

module.exports = router;

