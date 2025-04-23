const mongoose = require('mongoose');

const VentaSchema = new mongoose.Schema({
  productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  nombreProducto: String,
  precioVenta: Number,
  cantidadVendida: Number,
  nombreCliente: String,
  pagado: Boolean,
  fechaVenta: { type: Date, default: Date.now },
  imagenUrl: String
});

module.exports = mongoose.model('Venta', VentaSchema);
