const jwt = require('jsonwebtoken');

const authJWT = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      error: 'Token requerido'
    });
  }

  const partes = authorization.split(' ');

  if (
    partes.length !== 2 ||
    partes[0] !== 'Bearer'
  ) {
    return res.status(401).json({
      error: 'Formato de token inválido'
    });
  }

  const token = partes[1];

  try {
    const datos = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = datos;

    next();

  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
};

module.exports = authJWT;