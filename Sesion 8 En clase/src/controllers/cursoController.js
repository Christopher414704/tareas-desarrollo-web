const { validationResult } = require('express-validator');

const cursoRepository =
  require('../repositories/cursoRepository');

const logRepository =
  require('../repositories/logRepository');


const obtenerCursos = async (req, res) => {
  try {
    const cursos =
      await cursoRepository.obtenerCursos();

    return res.json(cursos);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Error al obtener los cursos'
    });
  }
};


const crearCurso = async (req, res) => {
  try {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        errores: errores.array()
      });
    }

    const {
      nombre,
      codigo,
      creditos
    } = req.body;

    const cursoExistente =
      await cursoRepository.buscarPorCodigo(codigo);

    if (cursoExistente) {
      return res.status(409).json({
        error: 'El código del curso ya existe'
      });
    }

    const nuevoCurso =
      await cursoRepository.crearCurso({
        nombre,
        codigo,
        creditos
      });


    // FIRE AND FORGET
    logRepository.crearLog({
      accion: 'CREAR_CURSO',
      descripcion: `Se creó el curso ${codigo}`
    })
    .catch((error) => {
      console.error(
        'Error al guardar el log:',
        error.message
      );
    });


    return res.status(201).json(nuevoCurso);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Error al crear el curso'
    });
  }
};


module.exports = {
  obtenerCursos,
  crearCurso
};