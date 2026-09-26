const LogAccion = require('../models/LogAccion');

const crearLog = async (datos) => {
  return await LogAccion.create(datos);
};

module.exports = {
  crearLog
};