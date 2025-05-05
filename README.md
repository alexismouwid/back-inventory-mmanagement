# 🛍️ Backend Inventario y Ventas - Node.js + MongoDB

Este es un backend para gestionar productos e inventario, incluyendo registro de ventas y almacenamiento de imágenes en MongoDB.

---

## 📦 Tecnologías

- Node.js + Express
- MongoDB Atlas (con Mongoose)
- Multer (para subir imágenes)
- dotenv (variables de entorno)
- CORS habilitado

---

## 📁 Estructura de carpetas
/backend
├── /routes
│ ├── productos.routes.js # Rutas para productos
│ └── ventas.routes.js # Rutas para ventas
├── /middlewares
│ └── multerConfig.js # Configuración de multer para imágenes
├── /models
│ ├── Producto.js # Esquema de producto
│ └── Venta.js # Esquema de venta
├── .env # Variables de entorno
├── server.js # Punto de entrada principal







