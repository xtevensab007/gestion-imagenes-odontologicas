import { apiRequest } from "./api";

export interface Cie10Backend {
  cod_4: string;
  descripcion_4: string;
  cod_3: string;
  descripcion_3: string;
  es_odontologico: boolean;
}

export interface RespuestaCie10 {
  items: Cie10Backend[];
  total: number;
  page: number;
  page_size: number;
}

export function listarCie10(
  busqueda: string,
  odontologico?: boolean,
  pagina = 1,
  pageSize = 20
) {
  const params = new URLSearchParams({
    page: String(pagina),
    page_size: String(pageSize)
  });

  if (busqueda.trim()) {
    params.set("q", busqueda.trim());
  }

  if (odontologico !== undefined) {
    params.set("odontologico", String(odontologico));
  }

  return apiRequest<RespuestaCie10>(
    `/cie10?${params.toString()}`
  );
}