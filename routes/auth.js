const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { expressjwt: expressJwt } = require("express-jwt");
const User = require("../models/user.model.js");
const dotenv = require("dotenv");

dotenv.config();



// ✅ Middleware para validar el token JWT
const validateJwt = expressJwt({
  secret: process.env.SECRET, // Secreto para validar el token
  algorithms: ["HS256"], // Algoritmo de firma del token
});

// ✅ Función para generar un token JWT
const signToken = (_id) => jwt.sign({ _id }, process.env.SECRET);

// ✅ Middleware para buscar y asignar el usuario autenticado
const findAndAssignUser = async (req, res, next) => {
  try {

       console.log('✅ Token decodificado:', req.auth); // <-- esto debería mostrar: { _id: '...' }
     const user = await User.findById(req.auth._id); // Buscar usuario por ID del token
    if (!user) {
            console.log('❌ Usuario no encontrado con ID:', req.auth._id);

      return res.status(401).end();
    }

    console.log('✅ Usuario autenticado:', user.email);
    req.auth = user// Asignar usuario autenticado a la petición
    console.log(req.auth);
    next();
  } catch (e) {
    console.log('❌ Error en findAndAssignUser:', e.message);
    next(e);
  }
};

// ✅ Middleware de autenticación
const isAuthenticated = express.Router().use(validateJwt, findAndAssignUser);


// ✅ Controlador de autenticación
const Auth = {
  // 🔹 Endpoint para iniciar sesión
  login: async (req, res) => {
    const { body } = req;
    try {
      const user = await User.findOne({ email: body.email });
      if (!user) {
        return res.status(401).send("Usuario y/o contraseña inválida");
      } else {
        const isMatch = await bcrypt.compare(body.password, user.password);
        if (isMatch) {
          const signed = signToken(user._id);
          res.status(200).json({ token: signed, nombre: user.nombre });
        } else {
          res.status(401).send("Usuario y/o contraseña inválida");
        }
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Error en el servidor");
    }
  },

  // 🔹 Endpoint para registrar un usuario nuevo
  register: async (req, res) => {
    const { body } = req;
    try {
      const isUser = await User.findOne({ email: body.email });
      if (isUser) {
        return res.status(409).json({ message: "El usuario ya existe" });
      } else {
        const salt = await bcrypt.genSalt();
        const hashed = await bcrypt.hash(body.password, salt);
        const user = await User.create({
          nombre: body.nombre,
          email: body.email,
          password: hashed,
          salt,
        });
        const signed = signToken(user._id);
        res.json({ token: signed, nombre: user.nombre });
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  },

createOrder: async (req, res) => {
    const { products, address, phone } = req.body;

    // Obtener información del usuario autenticado
    const user = req.auth;

    // Calcular el total del pedido
    const total = products.reduce((sum, product) => sum + product.subtotal, 0);

    try {
      const newOrder = new Order({
        user: user._id, // Usar el ID del usuario autenticado
        products,
        total,
        buyerName: user.nombre, // Usar el nombre del usuario autenticado
        address,
        email: user.email, // Usar el email del usuario autenticado
        phone,
      });

      await newOrder.save();
      res.status(201).send(newOrder);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
 getUserOrders: async (req, res) => {
    try {
      const user = req.auth; // Usuario autenticado (obtenido del token JWT)

      // Buscar todos los pedidos del usuario
      const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }); // Ordenar por fecha descendente

      // Devolver los pedidos
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
};


// ✅ Exportar módulos
module.exports = { Auth, isAuthenticated};


