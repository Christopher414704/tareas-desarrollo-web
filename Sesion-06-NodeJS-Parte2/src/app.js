import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// __dirname y __filename reproducidos con import.meta.url (ES Modules)
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// =====================================================
// Utilidades (ya implementadas — no las modifiques)
// =====================================================

/**
 * Crea un id único.
 * @returns {string}
 */
export function generarId() {
    return `r-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

// =====================================================
// TODO: implementa las siguientes funciones
// =====================================================

/**
 * Componentes y módulos.
 *
 * TODO 1: crea un módulo `src/math.js` (named exports) con:
 *   - const PI = 3.14159
 *   - function sumar(a, b)
 *   - function restar(a, b)
 *
 * TODO 2: crea un módulo `src/logger.js` (default export) con:
 *   - default function registrarProceso(msg) → string con formato
 *     `[fecha ISO] msg` (solo devuelve el string, no lo imprime)
 *
 * TODO 3: en `src/index.js` re-exporta (barrel exports) todo lo anterior:
 *   export { PI, sumar, restar } from "./math.js";
 *   export { default as logger } from "./logger.js";
 *   export { ... } from "./app.js";   // las funciones públicas
 *
 * Cuando termines, corre el test "Estructura de módulos"
 * para verificar que los re-exports funcionan.
 */

/**
 * Filtra las líneas de un archivo de log que contienen un texto y
 * escribe el resultado en otro archivo, usando Streams + pipeline.
 *
 * IMPORTANTE: usa `import { createReadStream, createWriteStream } from 'node:fs'`
 * y `pipeline` de 'node:stream/promises' (ya importados arriba).
 *
 * @param {string} origen  - Ruta del archivo de entrada.
 * @param {string} destino - Ruta del archivo de salida.
 * @param {string} texto   - Texto que deben contener las líneas.
 * @returns {Promise<number>} cantidad de líneas que coincidieron (0 si no hay).
 */
export async function filtrarLogs(origen, destino, texto) {
    let coincidencias = 0;
    let buffer = '';

    const filtro = new Transform({
        transform(chunk,encoding,callback){
            buffer += chunk.toString();

            const lineas = buffer.split(/\r?\n/);

            buffer = lineas.pop() ?? '';

            for(const linea of lineas){
                if(linea.includes(texto)){
                    this.push(`${linea}\n`);
                    coincidencias++;
                }
            }

            callback();
        },

        flush(callback){
            if(buffer.length>0 && buffer.includes(texto)){
                this.push(`${buffer}\n`);
                coincidencias++;
            }

            callback();
        }
    });

    await pipeline(
        createReadStream(origen, {encoding: 'utf-8'}),
        filtro,
        createWriteStream(destino, { encoding: 'utf-8' })
    );

    return coincidencias;
}

/**
 * Lee un archivo de texto y devuelve las líneas como arreglo,
 * sin líneas vacías. NO uses readFile: debes usar un Readable + recolección
 * (puedes leer con `createReadStream` y acumular por chunks).
 *
 * @param {string} ruta
 * @returns {Promise<string[]>}
 */
export async function leerLineas(ruta) {
    const stream = createReadStream(ruta, {
        encoding: 'utf-8'
    });

    let contenido = '';

    for await(const chunk of stream){
        contenido += chunk;
    }

    return contenido
    .split(/\r?\n/)
    .filter((linea) => linea.trim().length > 0);
}

/**
 * Devuelve una ruta absoluta a partir de una ruta relativa al proyecto.
 * Usa el __dirname que definimos arriba + join.
 *
 * @param {string} rutaRelativa
 * @returns {string}
 */
export function rutaAbsoluta(rutaRelativa) {
    return join(__dirname,rutaRelativa);
}

/**
 * Parsea el contenido de un archivo de configuración ".env" (simple).
 * Formato por línea: CLAVE=VALOR  (ignora líneas vacías y las que empiezan con #).
 * Devuelve un objeto con las claves en mayúsculas.
 *
 * @param {string} contenido
 * @returns {Record<string, string>}
 */
export function parsearEnv(contenido) {
    const resultado = {};

    const lineas = contenido.split(/\r?\n/);

    for (const linea of lineas){
        const lineaLimpia = linea.trim();
        
        if(!lineaLimpia || lineaLimpia.startsWith('#')){
            continue;
        }

        const posicionIgual = lineaLimpia.indexOf('=');

        if(posicionIgual === -1){
            continue;
        }

        const clave = lineaLimpia
        .slice(0, posicionIgual)
        .trim()
        .toUpperCase();

        const valor = lineaLimpia
        .slice(posicionIgual + 1)
        .trim();

        if(!clave){
            continue;
        }

        resultado[clave] = valor;
    }

    return resultado;
}