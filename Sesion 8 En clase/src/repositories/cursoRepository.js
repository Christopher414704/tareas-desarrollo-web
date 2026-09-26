const Curso = require('../models/Curso');

const obtenerCursos = async () => {
  return await Curso.findAll();
};

const crearCurso = async (datos) => {
  return await Curso.create(datos);
};

const buscarPorCodigo = async (codigo) => {
  return await Curso.findOne({
    where: { codigo }
  });
};

module.exports = {
  obtenerCursos,
  crearCurso,
  buscarPorCodigo
};