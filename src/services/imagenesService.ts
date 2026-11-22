
import { apiRequest } from "./api";

export interface ImagenClinica {
  id_imagen: string;
  id_paciente: string;
  paciente_nombre: string;
  id_atencion: string | null;
  fecha_atencion: string | null;
  id_diagnostico_bucal: string | null;
  diagnostico: string | null;
  nombre_archivo: string;
  fecha_carga: string;
  url: string;
  url_expira_en_segundos: number;
  activo: boolean;
}

export interface RespuestaImagenes {
  items: ImagenClinica[];
  total: number;
  page: number;
  page_size: number;
}

export interface FiltrosImagenes {
  id_paciente?: string;
  id_atencion?: string;
  q?: string;
  diagnostico?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  page_size?: number;
}

export function listarImagenes(filtros: FiltrosImagenes = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") {
      params.set(clave, String(valor));
    }
  });

  return apiRequest<RespuestaImagenes>(
    `/imagenes?${params.toString()}`
  );
}

export function subirImagen(
  archivo: File,
  idPaciente: string,
  idAtencion?: string
) {
  const datos = new FormData();

  datos.append("archivo", archivo);
  datos.append("id_paciente", idPaciente);

  if (idAtencion) {
    datos.append("id_atencion", idAtencion);
  }

  return apiRequest("/imagenes", {
    method: "POST",
    body: datos
  });
}
