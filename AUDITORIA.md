# Auditoría del reto 0

Estado del código al terminar el taller 3 (commit `705e5e4`).

| Criterio | Taller 3 | Cómo se comprobó |
| --- | --- | --- |
| Ejecución | Parcial | `npm start` sirve la app con Python, pero no hay README que explique cómo ejecutarla. |
| Validación de entradas | No cumple | Los límites de 100 y 300 caracteres solo están en `index.html:129` y `133`; `app.js:307-314` solo rechaza el título vacío. |
| Contraseñas y hash | No cumple | La contraseña se guarda y se compara en texto plano en localStorage: `app.js:121` y `129`. |
| Secretos y claves | Cumple | `git grep` no encuentra claves; solo la contraseña que escribe el usuario (`app.js:93`, `129`). |
| Control de acceso | No cumple | La sesión es solo el id del usuario en localStorage (`app.js:57-61`, `125`): quien lo cambie entra a otra cuenta. `saveUserTask` y `deleteUserTask` no comprueban el dueño (`app.js:153-164`). |
| Dependencias | Cumple | No usa dependencias externas. |
| Pruebas | No cumple | No hay pruebas. |
| Manejo de errores | No cumple | `read()` devuelve una lista vacía si los datos están dañados (`app.js:48-51`) y el siguiente guardado borra todas las cuentas o tareas. `write()` no controla los errores al guardar (`app.js:53-55`). |
| Estructura | Parcial | Toda la lógica está en `app.js` (354 líneas): interfaz, sesión y almacenamiento juntos. |

## Fallos elegidos

| N.º | Criterio | Descripción del fallo | Archivo y línea |
| --- | --- | --- | --- |
| 1 | Manejo de errores | Los datos dañados se tratan como una lista vacía y el siguiente guardado borra todas las cuentas o tareas | `app.js:48-51` |
| 2 | Validación de entradas | Un título de más de 100 caracteres o una nota de más de 300 se aceptan si se salta el límite del HTML | `app.js:307-314` |
| 3 | Contraseñas y hash | La contraseña se guarda y se compara en texto plano | `app.js:121`, `129` |

Orden de corrección: el fallo 1 va primero porque las otras dos correcciones guardan datos (tareas validadas y contraseñas con hash), y mientras `read()` oculte los datos dañados, cualquier guardado puede borrar todas las cuentas y tareas.
