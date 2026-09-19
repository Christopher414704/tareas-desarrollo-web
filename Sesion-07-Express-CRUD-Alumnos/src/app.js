import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// __dirname en ES Modules
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

/**
 * Comprueba la clave enviada en x-api-key.
 */
export function autenticacionFalsa(req, res, next) {
    const clave = req.get('x-api-key');
    const claveCorrecta = process.env.API_KEY ?? 'umg-2026';

    if (clave !== claveCorrecta) {
        return res.status(401).json({
            error: 'No autorizado'
        });
    }

    next();
}


/**
 * Valida los datos de un alumno.
 */
export function validarAlumno(req, res, next) {
    const datos = req.body ?? {};

    const { nombre, apellido, email, edad } = datos;

    // Validar nombre
    if (typeof nombre !== 'string' || !nombre.trim()) {
        return res.status(400).json({
            error: 'El nombre es obligatorio'
        });
    }

    // Validar apellido
    if (typeof apellido !== 'string' || !apellido.trim()) {
        return res.status(400).json({
            error: 'El apellido es obligatorio'
        });
    }

    // Validar email
    if (
        typeof email !== 'string' ||
        !email.trim() ||
        !email.includes('@')
    ) {
        return res.status(400).json({
            error: 'El email es inválido'
        });
    }

    // Validar edad (opcional)
    if (
        edad !== undefined &&
        (
            typeof edad !== 'number' ||
            !Number.isFinite(edad) ||
            edad < 0
        )
    ) {
        return res.status(400).json({
            error: 'La edad debe ser un número mayor o igual a 0'
        });
    }

    next();
}

/**
 * Crea la aplicación con sus rutas CRUD.
 *
 * @param {import('./repositorio.js').RepositorioAlumnos} repositorio
 * @returns {import('express').Express}
 */
export function crearApp(repositorio) {
    const app = express();

    // Permitir recibir JSON
    app.use(express.json());

    // Servir archivos del sitio web
    app.use(express.static(join(__dirname, '..', 'public')));


    app.get('/alumnos', (req, res) => {
        const alumnos = repositorio.listar();

        return res.status(200).json(alumnos);
    });

    app.get('/alumnos/:id', (req, res) => {
        const alumno = repositorio.obtener(req.params.id);

        if (!alumno) {
            return res.status(404).json({
                error: 'Alumno no encontrado'
            });
        }

        return res.status(200).json(alumno);
    });

    app.post(
        '/alumnos',
        autenticacionFalsa,
        validarAlumno,
        (req, res) => {
            const { nombre, apellido, email, edad } = req.body;

            const nuevoAlumno = repositorio.crear({
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                email: email.trim(),
                ...(edad !== undefined ? { edad } : {})
            });

            return res.status(201).json(nuevoAlumno);
        }
    );

    app.put(
        '/alumnos/:id',
        autenticacionFalsa,
        validarAlumno,
        (req, res) => {
            const { nombre, apellido, email, edad } = req.body;

            const datos = {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                email: email.trim(),
                ...(edad !== undefined ? { edad } : {})
            };

            const alumno = repositorio.actualizar(
                req.params.id,
                datos
            );

            if (!alumno) {
                return res.status(404).json({
                    error: 'Alumno no encontrado'
                });
            }

            return res.status(200).json(alumno);
        }
    );

    // ==================================
    // DELETE /alumnos/:id
    // ==================================

    app.delete(
        '/alumnos/:id',
        autenticacionFalsa,
        (req, res) => {
            const eliminado = repositorio.eliminar(req.params.id);

            if (!eliminado) {
                return res.status(404).json({
                    error: 'Alumno no encontrado'
                });
            }

            return res.status(204).end();
        }
    );

    return app;
}