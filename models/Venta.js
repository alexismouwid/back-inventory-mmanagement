const mongoose = require('mongoose');

const VentaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  nombreProducto: String,
  precioVenta: Number,
  cantidadVendida: Number,
  nombreCliente: String,
  pagado: Boolean,
  imagenUrl: String,
  imagenVenta: {
    data: Buffer,
    contentType: String
  },
  fechaVenta: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Venta', VentaSchema);
