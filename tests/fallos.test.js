// Pruebas de los tres fallos elegidos de la auditoría del taller 3.
import { test } from "node:test";
import assert from "node:assert/strict";
import { abrirApp, crearTarea, registrar } from "./ayudantes.js";

test("los datos dañados no se sobrescriben y se avisa al usuario", async () => {
  const conCuentasDanadas = abrirApp({ cuaderno_users: "{dañado" });
  await registrar(conCuentasDanadas);
  assert.equal(conCuentasDanadas.localStorage.getItem("cuaderno_users"), "{dañado");
  assert.match(conCuentasDanadas.document.getElementById("authError").textContent, /dañados/);

  const conTareasDanadas = abrirApp();
  await registrar(conTareasDanadas);
  conTareasDanadas.localStorage.setItem("cuaderno_tasks", "{dañado");
  crearTarea(conTareasDanadas, "Tarea nueva");
  assert.equal(conTareasDanadas.localStorage.getItem("cuaderno_tasks"), "{dañado");
  assert.match(conTareasDanadas.document.getElementById("taskError").textContent, /dañados/);
});

test("una tarea con datos inválidos se rechaza y no se guarda", async () => {
  const window = abrirApp();
  await registrar(window);
  const error = () => window.document.getElementById("taskError").textContent;

  crearTarea(window, "   ");
  assert.match(error(), /título/);
  crearTarea(window, "t".repeat(101));
  assert.match(error(), /100 caracteres/);
  crearTarea(window, "Título válido", "n".repeat(301));
  assert.match(error(), /300 caracteres/);
  assert.equal(window.localStorage.getItem("cuaderno_tasks"), null);
});
