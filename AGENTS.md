# AGENTS.md

## Proyecto
Cuaderno de tareas: aplicación web que funciona solo en el navegador. Cada usuario
crea una cuenta, inicia sesión y crea, edita, completa y elimina sus tareas.

## Stack
- HTML, CSS y JavaScript sin frameworks; los datos se guardan en localStorage
- Node.js 25 para las pruebas (node --test con jsdom) y ESLint para el estilo
- Python solo para servir los archivos en desarrollo (python -m http.server)

## Comandos
- Instalar: `npm install` y activar el hook con `git config core.hooksPath .githooks`
- Ejecutar: `npm start` (http://localhost:4173)
- Pruebas: `npm test`
- Estilo: `npm run lint`

## Estructura
- index.html: pantallas de acceso y de tareas, y el diálogo de tarea
- app.js: cuentas, sesión, tareas y almacenamiento (todo en un archivo)
- styles.css: estilos
- tests/: pruebas; tests/ayudantes.js carga la app en jsdom
- .githooks/pre-commit: revisa el estilo y corre las pruebas antes de cada commit

## Qué no hacer
- No modificar las pruebas para que pasen: se corrige el código.
- No escribir claves en el código ni guardar contraseñas en texto plano.
- No instalar dependencias sin verificar que existen en npmjs.com y explicar para qué sirven.
- No hacer commit ni push sin la confirmación del aprendiz.

## Lecciones aprendidas
- Si los datos guardados están dañados, la app avisa y no guarda nada encima: nunca los trata como una lista vacía.
