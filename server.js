const Venta = require('./models/Venta');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de Multer para manejar archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Límite de 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'));
  }
});

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error de conexión a MongoDB:', err));

// Modelo de datos
const ProductoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  cantidad: Number,
  talla: String,
  color: String,
  precioTotal: Number,
  precioVenta: Number,
  utilidad: Number,
  fechaCompra: Date,
  imagenUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const Producto = mongoose.model('Producto', ProductoSchema);
// Ruta para manejar el formulario
app.post('/api/subir', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, cantidad, talla, color, precioVenta, fechaCompra } = req.body;
    const imagen = req.file;

    if (!imagen) return res.status(400).json({ mensaje: 'No se subió ninguna imagen válida' });

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
      imagenUrl: `/uploads/${imagen.filename}`
    });

    await nuevoProducto.save();
    res.json({ mensaje: 'Producto guardado correctamente', producto: nuevoProducto });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ mensaje: error.message || 'Error al procesar la solicitud' });
  }
}); 
// Ruta para obtener productos (para verificación)
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await Producto.find().sort({ createdAt: -1 }); // Ordena por los más recientes
    res.json(productos);
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al obtener productos',
      error: error.message 
    });
  }
});

// Ruta para registrar una venta
app.post('/api/ventas', async (req, res) => {
  try {
    const { productoId, cantidadVendida, nombreCliente, pagado } = req.body;
    
    // 1. Obtener el producto
    const producto = await Producto.findById(productoId);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // 2. Verificar stock suficiente
    if (producto.cantidad < cantidadVendida) {
      return res.status(400).json({ mensaje: 'Stock insuficiente' });
    }

    // 3. Actualizar inventario
    producto.cantidad -= cantidadVendida;
    await producto.save();

    // 4. Registrar la venta
    const nuevaVenta = new Venta({
      productoId: producto._id,
      nombreProducto: producto.nombre,
      precioVenta: producto.precioVenta,
      cantidadVendida,
      nombreCliente,
      pagado,
      imagenUrl: producto.imagenUrl
    });

    await nuevaVenta.save();

    res.json({ 
      mensaje: 'Venta registrada correctamente',
      venta: nuevaVenta,
      productoActualizado: producto
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar venta', error: error.message });
  }
});

// Ruta para obtener ventas
app.get('/api/ventas', async (req, res) => {
  try {
    const ventas = await Venta.find().sort({ fechaVenta: -1 });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ventas', error: error.message });
  }
});


// Ruta para eliminar un producto
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Eliminar imagen del servidor si existe
    const imagePath = path.join(__dirname, producto.imagenUrl);
    try {
      await fs.unlink(imagePath);
    } catch (err) {
      console.warn('No se pudo eliminar la imagen:', err.message);
    }

    // Eliminar producto de la base de datos
    await producto.deleteOne();

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
});

//Ruta para eliminar un registro de venta
app.delete('/api/ventas/:id', async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);

    if (!venta) {
      return res.status(404).json({ mensaje: 'Registro de venta no encontrado' });
    }

    // Si las ventas tuvieran una imagen asociada, se eliminaría aquí. 
    // Por ejemplo, si la venta tuviera un campo `imagenUrl`, usarías esto:
    /*
    if (venta.imagenUrl) {
      const imagePath = path.join(__dirname, venta.imagenUrl);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.warn('No se pudo eliminar la imagen:', err.message);
      }
    }
    */

    // Eliminar el registro de venta de la base de datos
    await venta.deleteOne();

    res.json({ mensaje: 'Registro de venta eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar venta', error: error.message });
  }
});
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
