
import { apiRequest } from "./api";

export interface EventoAuditoria {
  id_evento: number;
  fecha_hora: string;
  accion: string;
  entidad_afectada: string;
  id_paciente: string | null;
  id_profesional: number | null;
  profesional_nombre: string | null;
  auth_sub: string | null;
  email: string | null;
  ip_origen: string | null;
  detalle: Record<string, unknown>;
}

export interface RespuestaAuditoria {
  items: EventoAuditoria[];
  total: number;
  page: number;
  page_size: number;
}

export interface FiltrosAuditoria {
  id_paciente?: string;
  id_profesional?: number;
  auth_sub?: string;
  accion?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  page_size?: number;
}

export async function listarAuditoria(
  filtros: FiltrosAuditoria = {}
): Promise<RespuestaAuditoria> {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const query = params.toString();

  return apiRequest<RespuestaAuditoria>(
    `/auditoria${query ? `?${query}` : ""}`
  );
}
