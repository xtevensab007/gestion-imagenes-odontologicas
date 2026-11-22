
import { apiRequest } from "./api";

export interface ProfesionalBackend {
  id_profesional: number;
  nombre: string;
  especializacion: string | null;
  activo: boolean;
  identificacion?: string;
  correo?: string;
  auth_id?: string;
}

export interface ProfesionalGestion extends ProfesionalBackend {
  correo: string;
  auth_id: string;
  tiene_cuenta: boolean;
  rol: string;
  cuenta_bloqueada: boolean;
}
export interface CrearProfesionalCuenta {
  nombre: string;
  identificacion: string;
  correo: string;
  especializacion: string;
  password: string;
  rol: "odontologo" | "administrador";
}
export function cambiarPasswordProfesional(
  id: number,
  password: string
) {
  return apiRequest<void>(`/profesionales/${id}/password`, {
    method: "PUT",
    body: JSON.stringify({ password }),
  });
}

export function cambiarRolProfesional(
  id: number,
  rol: "odontologo" | "administrador"
) {
  return apiRequest<ProfesionalGestion>(
    `/profesionales/${id}/rol`,
    {
      method: "PUT",
      body: JSON.stringify({ rol }),
    }
  );
}
export interface NuevoProfesional {
  nombre: string;
  identificacion: string;
  correo: string;
  especializacion: string;
  auth_id: string;
}

export interface ActualizarProfesional {
  nombre?: string;
  correo?: string;
  especializacion?: string;
  auth_id?: string;
  activo?: boolean;
}

export function listarProfesionales() {
  return apiRequest<ProfesionalBackend[]>("/profesionales");
}

export function listarProfesionalesGestion() {
  return apiRequest<ProfesionalGestion[]>("/profesionales/gestion");
}
export function crearProfesionalCuenta(datos: CrearProfesionalCuenta) {
  return apiRequest<ProfesionalGestion>("/profesionales", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}
export function obtenerMiProfesional() {
  return apiRequest<ProfesionalBackend>("/profesionales/yo");
}

export function crearProfesional(datos: NuevoProfesional) {
  return apiRequest<ProfesionalBackend>("/profesionales", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarProfesional(
  id: number,
  datos: ActualizarProfesional
) {
  return apiRequest<ProfesionalBackend>(`/profesionales/${id}`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  });
}
