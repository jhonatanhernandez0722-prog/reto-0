// Pruebas de los tres fallos elegidos de la auditoría del taller 3.
import { test } from "node:test";
import assert from "node:assert/strict";
import { abrirApp, crearTarea, entrar, leerGuardado, registrar, salir } from "./ayudantes.js";

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

test("la contraseña se guarda con hash y solo se entra con la correcta", async () => {
  const window = abrirApp();
  await registrar(window, { contrasena: "secreta123" });
  const [usuario] = leerGuardado(window, "cuaderno_users");
  assert.equal(usuario.password, undefined);
  assert.doesNotMatch(JSON.stringify(usuario), /secreta123/);

  salir(window);
  await entrar(window, { contrasena: "otra-clave" });
  assert.match(window.document.getElementById("authError").textContent, /incorrectos/);
  await entrar(window, { contrasena: "secreta123" });
  assert.equal(window.document.getElementById("workspace").hidden, false);
});

test("una cuenta del taller 3 con contraseña en texto plano entra y pasa a tener hash", async () => {
  const cuentaAntigua = { id: "u1", name: "Ana", email: "ana@ejemplo.com", password: "secreta123" };
  const window = abrirApp({ cuaderno_users: JSON.stringify([cuentaAntigua]) });
  await entrar(window, { contrasena: "secreta123" });
  assert.equal(window.document.getElementById("workspace").hidden, false);
  const [usuario] = leerGuardado(window, "cuaderno_users");
  assert.equal(usuario.password, undefined);
  assert.ok(usuario.passwordHash);
});
