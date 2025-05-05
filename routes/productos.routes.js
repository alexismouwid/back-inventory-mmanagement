const express = require('express');
const Producto = require('../models/Producto');
const upload = require('../utils/multerConfig');
const router = express.Router();

// Subir producto
router.post('/subir', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, cantidad, talla, color, precioVenta, fechaCompra } = req.body;
    const imagen = req.file;

    if (!imagen) return res.status(400).json({ mensaje: 'No se subió ninguna imagen' });

    const precioNum = parseFloat(precio);
    const cantidadNum = parseInt(cantidad);
    const precioVentaNum = parseFloat(precioVenta);

    const nuevoProducto = new Producto({
      nombre,
      precio: precioNum,
      cantidad: cantidadNum,
      talla,
      color,
      precioTotal: precioNum * cantidadNum,
      precioVenta: precioVentaNum,
      utilidad: (precioVentaNum * cantidadNum) - (precioNum * cantidadNum),
      fechaCompra: new Date(fechaCompra),
      imagen: {
        data: imagen.buffer,
        contentType: imagen.mimetype
      }
    });

    await nuevoProducto.save();
    res.json({ mensaje: 'Producto guardado correctamente', producto: nuevoProducto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al subir producto', error: error.message });
  }
});

// Obtener productos sin imagen
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find({}, '-imagen').sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
});

// Obtener imagen por ID
router.get('/:id/imagen', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
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
router.delete('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    await producto.deleteOne();
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
});

module.exports = router;

