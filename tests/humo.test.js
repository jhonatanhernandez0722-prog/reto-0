// Pruebas de humo: lo básico de la app funciona.
import { test } from "node:test";
import assert from "node:assert/strict";
import { abrirApp, crearTarea, leerGuardado, registrar } from "./ayudantes.js";

test("la pantalla de acceso aparece al abrir la app", () => {
  const window = abrirApp();
  assert.equal(window.document.getElementById("authShell").hidden, false);
  assert.equal(window.document.getElementById("workspace").hidden, true);
});

test("registrar una cuenta abre el espacio de tareas", async () => {
  const window = abrirApp();
  await registrar(window, { nombre: "Ana" });
  assert.equal(window.document.getElementById("workspace").hidden, false);
  assert.equal(window.document.getElementById("profileName").textContent, "Ana");
});

test("una tarea creada aparece en la lista y se guarda", async () => {
  const window = abrirApp();
  await registrar(window);
  crearTarea(window, "Repasar matemáticas");
  assert.match(window.document.getElementById("taskList").textContent, /Repasar matemáticas/);
  assert.equal(leerGuardado(window, "cuaderno_tasks").length, 1);
});
