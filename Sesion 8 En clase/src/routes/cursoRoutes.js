const express = require('express');

const {
  obtenerCursos,
  crearCurso
} = require('../controllers/cursoController');

const validarCurso = require('../validators/cursoValidator');
const authJWT = require('../middlewares/authJWT');

const router = express.Router();

router.get('/', obtenerCursos);

router.post(
  '/',
  authJWT,
  validarCurso,
  crearCurso
);

module.exports = router;