
import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL;

// --- Inicio de sesión ---
export async function iniciarSesion(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
}

// --- Cierre de sesión ---
export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

// --- Peticiones al backend ---
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error("No hay una sesión activa. Inicia sesión nuevamente.");
  }

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(
    `${API_URL}/api/v1${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (response.status === 401) {
    await supabase.auth.signOut();
    throw new Error("La sesión ha vencido. Inicia sesión nuevamente.");
  }

  if (!response.ok) {
  const error = await response.json().catch(() => null);
  const detalle = error?.detail;

  if (Array.isArray(detalle)) {
    const mensajes = detalle.map((item: any) => {
      const campo = item.loc?.at(-1);

      const nombreCampo = campo
        ? String(campo)
            .replace(/_/g, " ")
            .replace(/^./, letra => letra.toUpperCase())
        : "Dato";

      return `${nombreCampo}: ${item.msg}`;
    });

    throw new Error(mensajes.join("\n"));
  }

  throw new Error(
    typeof detalle === "string"
      ? detalle
      : `Error del servidor: ${response.status}`
  );
}

  if (response.status === 204) {
  return undefined as T;
}

// Permitir respuestas de archivos (Excel, PDF, etc.)
const contentType = response.headers.get("content-type") || "";

if (
  contentType.includes("application/vnd.openxmlformats-officedocument") ||
  contentType.includes("application/octet-stream") ||
  contentType.includes("application/pdf")
) {
  return response.blob() as Promise<T>;
}

if (endpoint.includes("/excel")) {
  return response.blob() as Promise<T>;
}

return response.json();
}
export async function actualizarPassword(nuevaPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: nuevaPassword,
  });

  if (error) throw error;
}
{/*export async function solicitarRecuperacionPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });

  if (error) throw error;
}*/}
export async function solicitarRecuperacionPassword(email: string) {
  const resultado = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });

  console.log("Respuesta Supabase:", resultado);

  if (resultado.error) throw resultado.error;

  return resultado;
}
{/*const API_URL = import.meta.env.VITE_API_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${API_TOKEN}`);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(
    `${API_URL}/api/v1${endpoint}`,
    {
      ...options,
      headers
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.detail || `Error del servidor: ${response.status}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
*/}
