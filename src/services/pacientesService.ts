import { apiRequest } from "./api";

export interface PacienteBackend {
  id_paciente: string;
  codigo: string;
  tipo_documento: string | null;
  documento_identidad: string;
  nombre: string;
  fecha_nacimiento: string | null;
  edad: number | null;
  sexo: string | null;
  telefono: string | null;
  correo: string | null;
  ciudad: string | null;
  total_atenciones: number;
  ultima_atencion: string | null;
}

export interface RespuestaPacientes {
  items: PacienteBackend[];
  total: number;
  page: number;
  page_size: number;
}


export function listarPacientes(
  pagina: number,
  busqueda: string,
  fechaDesde?: string,
  fechaHasta?: string
) {
  const params = new URLSearchParams({
    page: String(pagina),
    page_size: "20"
  });

  if (busqueda.trim()) {
    params.set("q", busqueda.trim());
  }

  if (fechaDesde) {
    params.set("fecha_desde", fechaDesde);
  }

  if (fechaHasta) {
    params.set("fecha_hasta", fechaHasta);
  }

  return apiRequest<RespuestaPacientes>(
    `/pacientes?${params.toString()}`
  );
}

export interface NuevoPaciente {
  tipo_documento: "CC" | "TI" | "RC" | "CE" | "PA" | "PE" | "PT";
  documento_identidad: string;
  nombre: string;
  fecha_nacimiento?: string | null;
  sexo?: "M" | "F" | "O" | null;
  telefono?: string | null;
  correo?: string | null;
  ciudad?: string | null;
}

export function crearPaciente(datos: NuevoPaciente) {
  return apiRequest<PacienteBackend>("/pacientes", {
    method: "POST",
    body: JSON.stringify(datos)
  });
}
export function obtenerPaciente(id: string) {
  return apiRequest<PacienteBackend>(`/pacientes/${id}`);
}

export function actualizarPaciente(
  id: string,
  datos: Partial<NuevoPaciente>
) {
  return apiRequest<PacienteBackend>(`/pacientes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(datos)
  });
}