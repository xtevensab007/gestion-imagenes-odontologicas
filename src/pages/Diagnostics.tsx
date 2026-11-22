import { useEffect, useState } from "react";
import { listarCie10 } from "../services/cie10Service";
import type { Cie10Backend } from "../services/cie10Service";
import {
  listarPacientesPorEnfermedad
} from "../services/enfermedadesService";

import type {
  PacienteEnfermedad
} from "../services/enfermedadesService";

interface Props {
  onNavigate: (page: string, extra?: any) => void;
}

export default function Diagnostics({ onNavigate }: Props) {
  const [search, setSearch] = useState("");
const [selected, setSelected] = useState<Cie10Backend | null>(null);
const [diagnosticos, setDiagnosticos] = useState<Cie10Backend[]>([]);
const [cargando, setCargando] = useState(true);
const [errorCarga, setErrorCarga] = useState("");
const [pacientesRelacionados, setPacientesRelacionados] = useState<PacienteEnfermedad[]>([]);
const [totalPacientes, setTotalPacientes] = useState(0);
const [cargandoPacientes, setCargandoPacientes] = useState(false);
const [errorPacientes, setErrorPacientes] = useState("");

useEffect(() => {
  if (!selected) {
    setPacientesRelacionados([]);
    setTotalPacientes(0);
    return;
  }

  async function cargarPacientes() {
    try {
      setCargandoPacientes(true);
      setErrorPacientes("");

      const respuesta = await listarPacientesPorEnfermedad(
        selected!.cod_4,
        "cualquiera",
        1,
        20,
        3
      );

      setPacientesRelacionados(respuesta.items);
      setTotalPacientes(respuesta.total);
    } catch (error) {
      setErrorPacientes(
        error instanceof Error
          ? error.message
          : "Error al cargar pacientes relacionados"
      );
    } finally {
      setCargandoPacientes(false);
    }
  }

  cargarPacientes();
}, [selected]);

  useEffect(() => {
  async function cargarDiagnosticos() {
    try {
      setCargando(true);
      setErrorCarga("");

      const respuesta = await listarCie10(search, undefined, 1, 100);

      setDiagnosticos(respuesta.items);
    } catch (error) {
      setErrorCarga(
        error instanceof Error
          ? error.message
          : "Error al cargar diagnósticos"
      );
    } finally {
      setCargando(false);
    }
  }

  cargarDiagnosticos();
}, [search]);

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1300, width: "100%" }}>
      <div className="page-header">
        <h1 className="page-title">Diagnósticos</h1>
        <p className="page-subtitle">Búsqueda de enfermedades por código CIE-10 y pacientes relacionados</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24 }}>
        {/* Left: search catalog */}
        <div>
          <div className="search-bar" style={{ marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar enfermedad o código CIE-10..."
            />
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                {diagnosticos.length} códigos encontrados
              </p>
            </div>
            <div style={{ maxHeight: 520, overflowY: "auto" }}>
              {diagnosticos.map(c => {
                const cat = c.es_odontologico
  ? { bg: "#f0fdf4", text: "#15803d" }
  : { bg: "#f3f4f6", text: "#374151" };
                return (
                  <button
                    key={c.cod_4}
                    onClick={() => setSelected(c)}
                    style={{
                      width: "100%", textAlign: "left", padding: "14px 16px",
                      borderBottom: "1px solid #f3f4f6",
                      background: selected?.cod_4 === c.cod_4 ? "#eff6ff" : "white",
                      border: "none",
                      borderLeft: selected?.cod_4 === c.cod_4 ? "3px solid #1a3557" : "3px solid transparent",
                      cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start",
                      transition: "all 0.1s",
                    }}
                  >
                    <span style={{
                      fontFamily: "monospace", fontSize: 12, fontWeight: 800,
                      background: "#dbeafe", color: "#1d4ed8",
                      padding: "3px 8px", borderRadius: 4, flexShrink: 0, marginTop: 2,
                    }}>
                      {c.cod_4}
                    </span>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#1f2937", fontWeight: selected?.cod_4 === c.cod_4  ? 600 : 400, lineHeight: 1.3 }}>
                        {c.descripcion_4}
                      </p>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: cat.bg, color: cat.text, fontWeight: 500 }}>
                        {c.es_odontologico ? "Odontológico" : "No odontológico"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: details */}
        <div>
          {!selected ? (
            <div className="card" style={{ padding: "60px 40px", textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>🔍</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>
                Seleccione un diagnóstico
              </h3>
              <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>
                Busque y seleccione un código CIE-10 para ver los pacientes relacionados
              </p>
            </div>
          ) : (
            <div>
              {/* Diagnosis card */}
              <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{
                    padding: "12px 18px", borderRadius: 12,
                    background: "linear-gradient(135deg, #1a3557, #2563eb)",
                    color: "white", textAlign: "center", flexShrink: 0,
                  }}>
                    <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 800 }}>{selected.cod_4}</div>
                    <div style={{ fontSize: 10, marginTop: 2, opacity: 0.7 }}>CIE-10</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#1a3557", fontFamily: "'DM Sans', sans-serif" }}>
                      {selected.descripcion_4}
                    </h2>
                    <div style={{ display: "flex", gap: 10 }}>
                      <span style={{
                        fontSize: 12, padding: "3px 12px", borderRadius: 20,
                       background: selected.es_odontologico ? "#f0fdf4" : "#f3f4f6",
                        color: selected.es_odontologico ? "#15803d" : "#374151",
                        fontWeight: 500,
                      }}>
                        {selected.es_odontologico ? "Odontológico" : "No odontológico"}
                      </span>
                      <span className="badge badge-gray">{totalPacientes} pacientes</span>
                    </div>
                  </div>
                </div>
              </div>

              
                      

{/* Related patients */}
<div className="card">
  <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1f2937" }}>
      Pacientes relacionados ({totalPacientes})
    </h3>
  </div>

  {cargandoPacientes ? (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <p style={{ color: "#6b7280", fontSize: 14 }}>
        Cargando pacientes relacionados...
      </p>
    </div>
  ) : errorPacientes ? (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <p style={{ color: "#dc2626", fontSize: 14 }}>{errorPacientes}</p>
    </div>
  ) : pacientesRelacionados.length === 0 ? (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
        No hay pacientes con este diagnóstico
      </p>
    </div>
  ) : (
    <table className="data-table">
      <thead>
        <tr>
          <th>Documento</th>
          <th>Paciente</th>
          <th>Fecha de atención</th>
          <th>Diagnóstico bucal</th>
          <th style={{ textAlign: "center" }}>Imágenes</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {pacientesRelacionados.map((a) => (
          <tr key={a.id_atencion}>
            <td style={{ fontFamily: "monospace", fontSize: 12, color: "#4b5563" }}>
              {a.documento_identidad}
            </td>
            <td>
              <button
                onClick={() => onNavigate("patient-detail", { patientId: a.id_paciente })}
                style={{ background: "none", border: "none", padding: 0, color: "#1a3557", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
              >
                {a.nombre}
              </button>
            </td>
            <td style={{ fontSize: 13, color: "#6b7280" }}>
              {a.fecha_atencion}
            </td>
            <td>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {a.diagnosticos_bucales.map((d, index) => (
                  <span key={`${d}-${index}`} className="badge badge-gray" style={{ fontSize: 11 }}>
                    {d}
                  </span>
                ))}
              </div>
            </td>
            <td style={{ textAlign: "center" }}>
              <button
                onClick={() => onNavigate("images", { patientId: a.id_paciente })}
                style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "#1a3557", fontWeight: 600, fontFamily: "inherit" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                {a.total_imagenes}
              </button>
            </td>
            <td>
              <button
                className="btn-ghost"
                style={{ fontSize: 12, padding: "5px 10px" }}
                onClick={() => onNavigate("attention-detail", { attentionId: a.id_atencion })}
              >
                Ver atención
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
