// Carga index.html y app.js en un navegador simulado (jsdom) para probar la app.
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { JSDOM } from "jsdom";

const raiz = new URL("../", import.meta.url);
const html = readFileSync(new URL("index.html", raiz), "utf8");
const codigo = readFileSync(new URL("app.js", raiz), "utf8");

// `datos` se guarda en localStorage antes de cargar app.js, como si ya estuviera en el navegador.
export function abrirApp(datos = {}) {
  const { window } = new JSDOM(html, {
    url: "http://localhost:4173/",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  Object.defineProperty(window, "crypto", { value: webcrypto });
  window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  window.HTMLDialogElement.prototype.close = function () { this.open = false; };
  for (const [clave, valor] of Object.entries(datos)) window.localStorage.setItem(clave, valor);
  window.eval(codigo);
  return window;
}

export async function esperar(condicion, limite = 3000) {
  const inicio = Date.now();
  while (!condicion()) {
    if (Date.now() - inicio > limite) throw new Error("La condición no se cumplió a tiempo");
    await new Promise(resolver => setTimeout(resolver, 10));
  }
}

// Envía el formulario sin pasar por la validación del HTML, como haría alguien que la salta.
function enviar(window, idFormulario) {
  window.document.getElementById(idFormulario)
    .dispatchEvent(new window.Event("submit", { cancelable: true }));
}

async function enviarAcceso(window, pestana, { nombre = "", correo, contrasena }) {
  const documento = window.document;
  documento.getElementById(pestana).click();
  documento.getElementById("name").value = nombre;
  documento.getElementById("email").value = correo;
  documento.getElementById("password").value = contrasena;
  enviar(window, "authForm");
  await esperar(() =>
    !documento.getElementById("workspace").hidden ||
    documento.getElementById("authError").textContent !== "");
}

export function registrar(window, { nombre = "Ana", correo = "ana@ejemplo.com", contrasena = "secreta123" } = {}) {
  return enviarAcceso(window, "registerTab", { nombre, correo, contrasena });
}

export function entrar(window, { correo = "ana@ejemplo.com", contrasena = "secreta123" } = {}) {
  return enviarAcceso(window, "loginTab", { correo, contrasena });
}

export function salir(window) {
  window.document.getElementById("logoutButton").click();
}

export function crearTarea(window, titulo, notas = "") {
  const documento = window.document;
  documento.getElementById("addTaskButton").click();
  documento.getElementById("taskTitle").value = titulo;
  documento.getElementById("taskNotes").value = notas;
  enviar(window, "taskForm");
}

export function leerGuardado(window, clave) {
  return JSON.parse(window.localStorage.getItem(clave));
}
