const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  cantidad: Number,
  precioUnidad: Number,
  talla: String,
  color: String,
  precioTotal: Number,
  precioVenta: Number,
  utilidad: Number,
  fechaCompra: Date,
  imagen: {
    data: Buffer,
    contentType: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Producto', ProductoSchema);

