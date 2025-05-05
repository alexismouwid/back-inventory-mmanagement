require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productosRoutes = require('./routes/productos.routes');
const ventasRoutes = require('./routes/ventas.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const whitelist = [
  'http://localhost:5173', // desarrollo local
  'https://inventory-management-taupe-one.vercel.app' // frontend en Vercel
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (por ejemplo desde curl o Postman)
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar MongoDB:', err));

// 🔊 Esta línea es necesaria para que Render detecte el puerto
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

