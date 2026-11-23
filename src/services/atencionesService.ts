
import { apiRequest } from "./api";

export interface AtencionListado {
  id_atencion: string;
  codigo_atencion: string;
  fecha_atencion: string;
  hora_atencion: string | null;
  paciente: {
    id_paciente: string;
    codigo: string;
    nombre: string;
    documento_identidad: string;
  };
  aseguradora: string | null;
  profesional: string | null;
  diagnostico_hospitalario: string | null;
  diagnosticos_bucales: string[];
  total_imagenes: number;
}
export interface AtencionDetalle {
  id_atencion: string;
  observaciones: string | null;
}
export interface RespuestaAtenciones {
  items: AtencionListado[];
  total: number;
  page: number;
  page_size: number;
}

export interface NuevaAtencion {
  id_paciente: string;
  fecha_atencion: string;
  hora_atencion?: string | null;
  id_aseguradora?: number;
  ubicacion?: string;
  id_profesional?: number;
  profesional_texto?: string;
  plan_tratamiento?: string;
  observaciones?: string;
  ids_tratamientos?: number[];
  diagnostico_hospitalario: {
    descripcion_original: string;
    cod_4: string;
  };
  diagnosticos_bucales: {
    descripcion: string;
    codigos: string[];
  }[];
}
export async function actualizarAtencion(
  idAtencion: string,
  datos: {
    plan_tratamiento?: string | null;
  }
) {
  return apiRequest(
    `/atenciones/${idAtencion}`,
    {
      method: "PATCH",
      body: JSON.stringify(datos),
    }
  );
}
export interface FiltrosAtenciones {
  q?: string;
  cod_4?: string;
  id_paciente?: string;
  id_aseguradora?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  page_size?: number;
}

// Listar y buscar atenciones
export function listarAtenciones(filtros: FiltrosAtenciones = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") {
      params.set(clave, String(valor));
    }
  });

  return apiRequest<RespuestaAtenciones>(
    `/atenciones?${params.toString()}`
  );
}

// Registrar una atención
export function crearAtencion(datos: NuevaAtencion) {
  return apiRequest<RespuestaCrearAtencion>("/atenciones", {
    method: "POST",
    body: JSON.stringify(datos)
  });
}

// Consultar detalle de una atención
export function obtenerAtencion(id: string) {
  return apiRequest<AtencionDetalle>(`/atenciones/${id}`);
}

export interface RespuestaCrearAtencion {
  id_atencion: string;
  codigo_atencion: string;
}
