const express = require('express');
const Producto = require('../models/Producto');
const upload = require('../utils/multerConfig');
const { isAuthenticated } = require('./auth');
const router = express.Router();

// Subir producto
router.post('/subir', isAuthenticated, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, cantidad, talla, color, precioVenta, fechaCompra } = req.body;
    console.log('Usuario autenticado:', req.auth);
    const imagen = req.file;
    const usuario = req.auth._id;

    if (!imagen) return res.status(400).json({ mensaje: 'No se subió ninguna imagen' });

    const precioNum = parseFloat(precio);
    const cantidadNum = parseInt(cantidad);
    const precioUnidad = precioNum / cantidadNum;
    const precioVentaNum = parseFloat(precioVenta);

    const nuevoProducto = new Producto({
      nombre,
      precio: precioNum,
      cantidad: cantidadNum,
      precioUnidad,
      talla,
      color,
      precioTotal: precioNum * cantidadNum,
      precioVenta: precioVentaNum,
      utilidad: (precioVentaNum * cantidadNum) - (precioNum * cantidadNum),
      fechaCompra: new Date(fechaCompra),
      imagen: {
        data: imagen.buffer,
        contentType: imagen.mimetype
      },
      usuario,
    });

    await nuevoProducto.save();
    res.json({ mensaje: 'Producto guardado correctamente', producto: nuevoProducto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al subir producto', error: error.message });
  }
});

// Obtener productos sin imagen
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const productos = await Producto.find({ usuario: req.auth._id }, '-imagen')
      .sort({ createdAt: -1 });

    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
});

// Obtener imagen por ID
router.get('/:id/imagen', isAuthenticated, async (req, res) => {
  try {
    const producto = await Producto.findOne({ _id: req.params.id, usuario: req.auth._id });

    if (!producto || !producto.imagen?.data) {
      return res.status(404).send('Imagen no encontrada');
    }

    res.set('Content-Type', producto.imagen.contentType);
    res.send(producto.imagen.data);
  } catch (error) {
    res.status(500).send('Error al obtener imagen');
  }
});
// Eliminar producto
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const producto = await Producto.findOneAndDelete({
      _id: req.params.id,
      usuario: req.auth._id,
    });

    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
});
module.exports = router;

