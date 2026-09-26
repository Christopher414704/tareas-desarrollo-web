require('dotenv').config();

const app = require('./src/app');
const sequelize = require('./src/config/database');

const PORT = 3000;

async function iniciarServidor() {
  try {
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
      );
    });

  } catch (error) {
    console.error(
      'Error al iniciar el servidor:',
      error
    );
  }
}

iniciarServidor();