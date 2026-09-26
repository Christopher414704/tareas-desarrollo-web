const Usuario = require('../models/Usuario');

const crearUsuario = async (datos) => {
  return await Usuario.create(datos);
};

const buscarPorEmail = async (email) => {
  return await Usuario.findOne({
    where: { email }
  });
};

module.exports = {
  crearUsuario,
  buscarPorEmail
};