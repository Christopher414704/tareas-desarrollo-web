const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const usuarioRepository = require('../repositories/usuarioRepository');

const registrar = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios'
      });
    }

    const usuarioExistente =
      await usuarioRepository.buscarPorEmail(email);

    if (usuarioExistente) {
      return res.status(409).json({
        error: 'El usuario ya existe'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await usuarioRepository.crearUsuario({
      nombre,
      email,
      password: passwordHash
    });

    return res.status(201).json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Error al registrar usuario'
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son obligatorios'
      });
    }

    const usuario =
      await usuarioRepository.buscarPorEmail(email);

    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });
    }

    const passwordCorrecto =
      await bcrypt.compare(
        password,
        usuario.password
      );

    if (!passwordCorrecto) {
      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    return res.json({
      mensaje: 'Inicio de sesión correcto',
      token
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Error al iniciar sesión'
    });
  }
};

module.exports = {
  registrar,
  login
};