
import { apiRequest } from "./api";

// Tipos de reporte disponibles
export interface TipoReporte {
  tipo: string;
  titulo: string;
}

// Filtros para generar o exportar reportes
export interface FiltrosReporte {
  fecha_desde?: string;
  fecha_hasta?: string;
  id_aseguradora?: number;
  cod_4?: string;
  id_profesional?: number;
}

// Estructura de cada fila del reporte
export interface FilaReporte {
  etiqueta: string;
  etiqueta_secundaria: string;
  cantidad: number;
  porcentaje: number;
}

// Respuesta del reporte
export interface ReporteBackend {
  tipo: string;
  titulo: string;
  generado_en: string;
  filtros: FiltrosReporte;
  totales: {
    pacientes: number;
    atenciones: number;
    imagenes: number;
  };
  columna_principal: string;
  columna_secundaria: string;
  filas: FilaReporte[];
  hallazgo: string;
  truncado: boolean;
}

// Consultar los tipos de reporte
export async function obtenerTiposReportes(): Promise<TipoReporte[]> {
  return apiRequest<TipoReporte[]>("/reportes/tipos");
}

// Generar vista previa
export async function generarReporte(
  tipo: string,
  filtros: FiltrosReporte
): Promise<ReporteBackend> {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const query = params.toString();

  return apiRequest<ReporteBackend>(
    `/reportes/${encodeURIComponent(tipo)}${query ? `?${query}` : ""}`
  );
}

// Exportar reporte a Excel
export async function exportarReporteExcel(
  tipo: string,
  filtros: FiltrosReporte
): Promise<Blob> {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const query = params.toString();

  return apiRequest<Blob>(
    `/reportes/${encodeURIComponent(tipo)}/excel${query ? `?${query}` : ""}`,
    {
      headers: {
        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    }
  );
}
