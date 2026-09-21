/**
 * app.js — CRUD de Alumnos
 * Sesión 07 · Desarrollo Web
 */

const API = '/alumnos';
const API_KEY = 'umg-2026';

// Cabeceras para las peticiones
const cabeceras = (conJson = true) => ({
    ...(conJson ? { 'Content-Type': 'application/json' } : {}),
    'x-api-key': API_KEY
});

// Elementos del HTML
const tabla = document.querySelector('#tablaAlumnos tbody');
const mensaje = document.querySelector('#mensaje');
const dialogoForm = document.querySelector('#dialogoForm');
const dialogoEliminar = document.querySelector('#dialogoEliminar');
const form = document.querySelector('#formAlumno');
const tituloForm = document.querySelector('#tituloForm');
const nombreEliminar = document.querySelector('#nombreEliminar');

let idEnEdicion = null;
let idAEliminar = null;
let alumnosActuales = [];

// =====================================
// MOSTRAR MENSAJES
// =====================================

function mostrarMensaje(texto, tipo = 'ok') {
    mensaje.textContent = texto;
    mensaje.className = tipo;
}

// =====================================
// CARGAR ALUMNOS
// =====================================

async function cargarAlumnos() {
    try {
        const respuesta = await fetch(API);

        if (!respuesta.ok) {
            throw new Error('No se pudieron cargar los alumnos');
        }

        const alumnos = await respuesta.json();

        if (!Array.isArray(alumnos)) {
            throw new Error('La respuesta de la API no es válida');
        }

        alumnosActuales = alumnos;
        tabla.innerHTML = '';

        for (const [indice, alumno] of alumnos.entries()) {
            const fila = document.createElement('tr');

            const valores = [
                indice + 1,
                alumno.nombre,
                alumno.apellido,
                alumno.email,
                alumno.edad ?? ''
            ];

            for (const valor of valores) {
                const celda = document.createElement('td');
                celda.textContent = valor;
                fila.appendChild(celda);
            }

            const acciones = document.createElement('td');

            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn-editar';

            btnEditar.addEventListener('click', () => {
                abrirDialogoEditar(alumno.id);
            });

            const btnEliminar = document.createElement('button');
            btnEliminar.type = 'button';
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.className = 'btn-eliminar';

            btnEliminar.addEventListener('click', () => {
                eliminarAlumno(alumno.id);
            });

            acciones.append(btnEditar, btnEliminar);
            fila.appendChild(acciones);

            tabla.appendChild(fila);
        }

    } catch (error) {
        mostrarMensaje(error.message, 'error');
        throw error;
    }
}

// =====================================
// NUEVO ALUMNO
// =====================================

function abrirDialogoNuevo() {
    form.reset();

    idEnEdicion = null;

    tituloForm.textContent = 'Nuevo alumno';

    dialogoForm.showModal();
}

// =====================================
// EDITAR ALUMNO
// =====================================

async function abrirDialogoEditar(id) {
    try {
        const respuesta = await fetch(`${API}/${id}`);

        if (!respuesta.ok) {
            throw new Error('No se pudo obtener el alumno');
        }

        const alumno = await respuesta.json();

        form.reset();

        document.querySelector('#nombre').value = alumno.nombre;
        document.querySelector('#apellido').value = alumno.apellido;
        document.querySelector('#email').value = alumno.email;
        document.querySelector('#edad').value = alumno.edad ?? '';

        idEnEdicion = id;

        tituloForm.textContent = 'Editar alumno';

        dialogoForm.showModal();

    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

// =====================================
// GUARDAR ALUMNO
// =====================================

async function guardarAlumno(event) {
    event.preventDefault();

    const nombre = document.querySelector('#nombre').value.trim();
    const apellido = document.querySelector('#apellido').value.trim();
    const email = document.querySelector('#email').value.trim();
    const edad = document.querySelector('#edad').value.trim();

    const datos = {
        nombre,
        apellido,
        email
    };

    if (edad !== '') {
        datos.edad = Number(edad);
    }

    const editando = idEnEdicion !== null;

    const url = editando
        ? `${API}/${idEnEdicion}`
        : API;

    const metodo = editando ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: cabeceras(),
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            const error = await respuesta.json().catch(() => ({}));

            throw new Error(
                error.error || 'No se pudo guardar el alumno'
            );
        }

        dialogoForm.close();

        idEnEdicion = null;

        await cargarAlumnos();

        mostrarMensaje('Alumno guardado correctamente', 'ok');

    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

// =====================================
// ELIMINAR ALUMNO
// =====================================

function eliminarAlumno(id) {
    idAEliminar = id;

    const alumno = alumnosActuales.find(
        (alumno) => alumno.id === id
    );

    nombreEliminar.textContent = alumno
        ? `${alumno.nombre} ${alumno.apellido}`
        : 'este alumno';

    dialogoEliminar.showModal();
}

// =====================================
// EVENTOS DEL SITIO
// =====================================

document.addEventListener('DOMContentLoaded', () => {

    // Abrir formulario de nuevo alumno
    document.querySelector('#btnNuevo').addEventListener('click', () => {
        abrirDialogoNuevo();
    });

    // Guardar alumno
    form.addEventListener('submit', guardarAlumno);

    // Cancelar formulario
    document.querySelector('#btnCancelar').addEventListener('click', () => {
        dialogoForm.close();
    });

    // Cancelar eliminación
    document.querySelector('#btnCancelarEliminar').addEventListener('click', () => {
        idAEliminar = null;
        dialogoEliminar.close();
    });

    // Confirmar eliminación
    document.querySelector('#btnConfirmarEliminar').addEventListener('click', async () => {

        if (idAEliminar === null) {
            return;
        }

        try {
            const respuesta = await fetch(`${API}/${idAEliminar}`, {
                method: 'DELETE',
                headers: cabeceras(false)
            });

            if (!respuesta.ok) {
                const error = await respuesta.json().catch(() => ({}));

                throw new Error(
                    error.error || 'No se pudo eliminar el alumno'
                );
            }

            dialogoEliminar.close();

            idAEliminar = null;

            await cargarAlumnos();

            mostrarMensaje('Alumno eliminado correctamente', 'ok');

        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    // Cargar alumnos al iniciar
    cargarAlumnos().catch(() => {});
});