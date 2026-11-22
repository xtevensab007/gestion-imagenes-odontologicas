
import { apiRequest } from "./api";

export interface ResultadoImportacion {
  id_importacion: number;
  tipo: string;
  archivo: string;
  total: number;
  insertados: number;
  actualizados: number;
  omitidos: number;
  rechazados: number;
  pacientes_nuevos: number;
  aseguradoras_nuevas: number;
  odontologicos: number;
  bucales_sin_codigo: number;
  ejemplos: string[];
}

export interface Importacion {
  id_importacion: number;
  tipo: string;
  nombre_archivo: string;
  estado: string;
  total_registros: number;
  insertados: number;
  actualizados: number;
  rechazados: number;
  creado_en: string;
  finalizado_en: string | null;
  profesional: string;
}

export interface HistorialImportaciones {
  items: Importacion[];
  total: number;
  page: number;
  page_size: number;
}

export function importarCatalogoCie10(
  archivo: File,
  soloFilasMarcadas = false
) {
  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("solo_filas_marcadas", String(soloFilasMarcadas));

  return apiRequest<ResultadoImportacion>(
    "/importaciones/catalogo-cie10",
    {
      method: "POST",
      body: formData,
    }
  );
}

export function importarAtenciones(archivo: File) {
  const formData = new FormData();
  formData.append("archivo", archivo);

  return apiRequest<ResultadoImportacion>(
    "/importaciones/atenciones",
    {
      method: "POST",
      body: formData,
    }
  );
}

export function listarImportaciones(page = 1, pageSize = 20) {
  return apiRequest<HistorialImportaciones>(
    `/importaciones?page=${page}&page_size=${pageSize}`
  );
}
