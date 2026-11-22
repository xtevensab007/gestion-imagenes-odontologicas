
import { apiRequest } from "./api";

export interface ImagenEnfermedad {
  id_imagen: string;
  id_paciente: string;
  paciente_nombre: string;
  id_atencion: string;
  fecha_atencion: string;
  id_diagnostico_bucal: string | null;
  diagnostico: string | null;
  nombre_archivo: string;
  fecha_carga: string;
  url: string;
  url_expira_en_segundos: number;
  activo: boolean;
}

export interface PacienteEnfermedad {
  id_paciente: string;
  codigo_paciente: string;
  documento_identidad: string;
  nombre: string;
  id_atencion: string;
  fecha_atencion: string;
  coincide_en: string[];
  diagnostico_hospitalario: string | null;
  diagnosticos_bucales: string[];
  total_imagenes: number;
  imagenes: ImagenEnfermedad[];
}

export interface RespuestaPacientesEnfermedad {
  codigo: {
    cod_4: string;
    descripcion: string;
    es_odontologico: boolean;
  };
  items: PacienteEnfermedad[];
  total: number;
  page: number;
  page_size: number;
}

export function listarPacientesPorEnfermedad(
  cod4: string,
  en: "hospitalizacion" | "bucal" | "cualquiera" = "cualquiera",
  page = 1,
  pageSize = 20,
  maxImagenes = 3
) {
  const params = new URLSearchParams({
    en,
    page: String(page),
    page_size: String(pageSize),
    max_imagenes: String(maxImagenes)
  });

  return apiRequest<RespuestaPacientesEnfermedad>(
    `/enfermedades/${encodeURIComponent(cod4)}/pacientes?${params.toString()}`
  );
}
