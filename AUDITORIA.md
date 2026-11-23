# Auditoría del reto 0

"Taller 3" es el estado del código al terminar el taller 3 (commit `705e5e4`).
"Hoy" es el estado después de corregir los tres fallos elegidos en el taller 7.

| Criterio | Taller 3 | Hoy | Cómo se comprobó |
| --- | --- | --- | --- |
| Ejecución | Parcial | Parcial | `npm start` sirve la app con Python; sigue sin README (los comandos solo están en AGENTS.md). |
| Validación de entradas | No cumple | Cumple | Prueba: título vacío, título de más de 100 caracteres y nota de más de 300 se rechazan y no se guardan. |
| Contraseñas y hash | No cumple | Cumple | Hash PBKDF2-SHA-256 con sal por usuario; prueba: la contraseña no aparece en lo guardado y las cuentas antiguas se migran. |
| Secretos y claves | Cumple | Cumple | `git grep`: no hay claves; "secreta123" es la contraseña de las pruebas. |
| Control de acceso | No cumple | No cumple | Sin cambios: la sesión sigue siendo el id del usuario en localStorage. Arreglarlo del todo requiere un servidor. |
| Dependencias | Cumple | Cumple | Solo de desarrollo (jsdom, eslint, @eslint/js, globals): existen en npmjs.com (HTTP 200) y `npm ls` no muestra errores. |
| Pruebas | No cumple | Parcial | 7 pruebas en verde: 3 de humo y 4 de los fallos; no cubren editar, completar ni eliminar tareas. |
| Manejo de errores | No cumple | Cumple | Prueba: los datos dañados no se sobrescriben y se avisa al usuario; los errores al guardar también se muestran. |
| Estructura | Parcial | Parcial | Todo sigue en `app.js` (450 líneas). |

## Fallos elegidos

| N.º | Criterio | Descripción del fallo | Archivo y línea (taller 3) |
| --- | --- | --- | --- |
| 1 | Manejo de errores | Los datos dañados se tratan como una lista vacía y el siguiente guardado borra todas las cuentas o tareas | `app.js:48-51` |
| 2 | Validación de entradas | Un título de más de 100 caracteres o una nota de más de 300 se aceptan si se salta el límite del HTML | `app.js:307-314` |
| 3 | Contraseñas y hash | La contraseña se guarda y se compara en texto plano | `app.js:121`, `129` |

Orden de corrección: el fallo 1 va primero porque las otras dos correcciones guardan datos (tareas validadas y contraseñas con hash), y mientras `read()` oculte los datos dañados, cualquier guardado puede borrar todas las cuentas y tareas.
