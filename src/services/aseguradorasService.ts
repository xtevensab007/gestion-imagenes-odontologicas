import { apiRequest } from "./api";

export interface AseguradoraBackend {
  id: number;
  nombre: string;
  activo: boolean;
}

export function listarAseguradoras(incluirInactivas = false) {
  return apiRequest<AseguradoraBackend[]>(
    `/aseguradoras?incluir_inactivas=${incluirInactivas}`
  );
}

export function crearAseguradora(nombre: string) {
  return apiRequest<AseguradoraBackend>("/aseguradoras", {
    method: "POST",
    body: JSON.stringify({ nombre }),
  });
}

export function actualizarAseguradora(
  id: number,
  datos: {
    nombre?: string;
    activo?: boolean;
  }
) {
  return apiRequest<AseguradoraBackend>(`/aseguradoras/${id}`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  });
}

export function eliminarAseguradora(id: number) {
  return apiRequest<void>(`/aseguradoras/${id}`, {
    method: "DELETE",
  });
}