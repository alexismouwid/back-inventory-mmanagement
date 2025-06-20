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
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Producto', ProductoSchema);

