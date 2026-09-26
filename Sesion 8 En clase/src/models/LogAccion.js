const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogAccion = sequelize.define('LogAccion', {
  accion: {
    type: DataTypes.STRING,
    allowNull: false
  },

  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = LogAccion;