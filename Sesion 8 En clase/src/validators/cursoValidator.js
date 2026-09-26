const { body } = require('express-validator');

const validarCurso = [

  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio'),

  body('codigo')
    .notEmpty()
    .withMessage('El código es obligatorio'),

  body('creditos')
    .isInt({ min: 1 })
    .withMessage('Los créditos deben ser un número entero mayor a 0')

];

module.exports = validarCurso;