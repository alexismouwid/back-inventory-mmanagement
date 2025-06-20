const express = require('express');
const { Auth } = require('./auth'); // Asegúrate que esta ruta sea correcta
const router = express.Router();

// Rutas de autenticación
router.post('/login', Auth.login);
router.post('/register', Auth.register);

module.exports = router;

