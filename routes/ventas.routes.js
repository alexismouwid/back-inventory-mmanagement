const express = require('express');
const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const { isAuthenticated } = require('./auth');
const router = express.Router();

// Registrar venta
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { productoId, cantidadVendida, nombreCliente, pagado } = req.body;

    const producto = await Producto.findById(productoId);
    const usuario = req.auth._id;

    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    if (producto.cantidad < cantidadVendida) {
      return res.status(400).json({ mensaje: 'Stock insuficiente' });
    }

    producto.cantidad -= cantidadVendida;
    await producto.save();

    const nuevaVenta = new Venta({
      usuario,
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
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const usuario = req.auth._id;
    const ventas = await Venta.find( { usuario} ).sort({ fechaVenta: -1 });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ventas', error: error.message });
  }
});

// Obtener imagen de venta
router.get('/:id/imagen', isAuthenticated, async (req, res) => {
  try {
    const usuario = req.auth._id;
    const venta = await Venta.findOne({ _id: req.params.id, usuario });

    if (!venta || !venta.imagenVenta?.data) {
    return res.status(404).send('Imagen no encontrada');
    } 

    res.set('Content-Type', venta.imagenVenta.contentType);

    /Logs para depuración 
console.log('🧠 Sirviendo imagen para venta:', venta._id);
console.log('👉 Content-Type:', venta.imagenVenta.contentType);
console.log('👉 Buffer:', venta.imagenVenta.data.buffer.slice(0, 20));
    

    //✅Convertir el buffer a un objeto Buffer
    const buffer = Buffer.from(venta.imagenVenta.data.buffer);

    res.send(buffer);
  } catch (error) {
  console.error('❌ Error al obtener imagen de venta:', error);
    res.status(500).send('Error al obtener imagen de venta');
  }
});

// Eliminar venta
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const usuario = req.auth._id;
    const venta = await Venta.findOne({ _id: req.params.id, usuario });

    if (!venta) {
         return res.status(404).json({ mensaje: 'Registro de venta no encontrado' });

    }  

    await venta.deleteOne();
    res.json({ mensaje: 'Registro de venta eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar venta', error: error.message });
  }
});

module.exports = router;

