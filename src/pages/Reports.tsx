import { useEffect, useState } from "react";
import {
  listarAseguradoras,
  type AseguradoraBackend,
} from "../services/aseguradorasService";

import {
  listarProfesionales,
  type ProfesionalBackend,
} from "../services/profesionalesService";
import {
  obtenerTiposReportes,
  generarReporte,
  exportarReporteExcel,
  type TipoReporte,
  type FiltrosReporte,
  type ReporteBackend,
} from "../services/reportesService";

interface Props {
  onNavigate: (page: string, extra?: any) => void;
}
import {
  listarCie10,
  type Cie10Backend,
} from "../services/cie10Service";


export default function Reports({ onNavigate }: Props) {
  const [reportTypes, setReportTypes] = useState<TipoReporte[]>([]);
  const [reportType, setReportType] = useState("");
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [errorTypes, setErrorTypes] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [insurer, setInsurer] = useState("all");
  const [diagnosis, setDiagnosis] = useState("all");
  const [professional, setProfessional] = useState("all");
  const [diagnosisSearch, setDiagnosisSearch] = useState("");
  const [diagnosisOptions, setDiagnosisOptions] = useState<Cie10Backend[]>([]);
  const [aseguradoras, setAseguradoras] = useState<AseguradoraBackend[]>([]);
  const [profesionales, setProfesionales] = useState<ProfesionalBackend[]>([]);
  const [reporte, setReporte] = useState<ReporteBackend | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [errorReport, setErrorReport] = useState("");
  const [loadingExcel, setLoadingExcel] = useState(false);

  useEffect(() => {
    const cargarTipos = async () => {
      try {
        setLoadingTypes(true);
        setErrorTypes("");

        const tipos = await obtenerTiposReportes();

        setReportTypes(tipos);

        if (tipos.length > 0) {
          setReportType(tipos[0].tipo);
        }
      } catch (error) {
        setErrorTypes(
          error instanceof Error
            ? error.message
            : "Error al cargar los tipos de reporte"
        );
      } finally {
        setLoadingTypes(false);
      }
    };

    cargarTipos();
  }, []);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [aseguradorasData, profesionalesData] = await Promise.all([
          listarAseguradoras(),
          listarProfesionales(),
        ]);

        setAseguradoras(aseguradorasData.filter(item => item.activo));
        setProfesionales(profesionalesData.filter(item => item.activo));
      } catch (error) {
        console.error("Error al cargar filtros:", error);
      }
    };

    cargarCatalogos();
  }, []);

  useEffect(() => {
    let activo = true;

    const cargarDiagnosticos = async () => {
      if (!diagnosisSearch.trim()) {
        setDiagnosisOptions([]);
        return;
      }

      try {
        const respuesta = await listarCie10(diagnosisSearch, undefined);

        if (activo) {
          setDiagnosisOptions(respuesta.items);
        }
      } catch (error) {
        console.error("Error al cargar diagnósticos:", error);
      }
    };

    cargarDiagnosticos();

    return () => {
      activo = false;
    };
  }, [diagnosisSearch]);

  const manejarGenerarReporte = async () => {
    if (!reportType) return;

    try {
      setLoadingReport(true);
      setErrorReport("");

      const filtros: FiltrosReporte = {
        fecha_desde: dateFrom || undefined,
        fecha_hasta: dateTo || undefined,
        id_aseguradora: insurer !== "all" ? Number(insurer) : undefined,
        cod_4: diagnosis !== "all" ? diagnosis : undefined,
        id_profesional: professional !== "all" ? Number(professional) : undefined,
      };

      const resultado = await generarReporte(reportType, filtros);
      console.log("Reporte recibido:", resultado);
      console.log("Filas del reporte:", resultado.filas);

      setReporte(resultado);
      onNavigate("report-generated", {
        reporte: resultado,
      });
    } catch (error) {
      setErrorReport(
        error instanceof Error ? error.message : "Error al generar el reporte"
      );
    } finally {
      setLoadingReport(false);
    }
  };

  const manejarExportarExcel = async () => {
    if (!reportType) return;

    try {
      setLoadingExcel(true);
      setErrorReport("");

      const filtros: FiltrosReporte = {
        fecha_desde: dateFrom || undefined,
        fecha_hasta: dateTo || undefined,
        id_aseguradora: insurer !== "all" ? Number(insurer) : undefined,
        cod_4: diagnosis !== "all" ? diagnosis : undefined,
        id_profesional: professional !== "all" ? Number(professional) : undefined,
      };

      const archivo = await exportarReporteExcel(reportType, filtros);

      const url = window.URL.createObjectURL(archivo);
      const enlace = document.createElement("a");

      enlace.href = url;
      enlace.download = `reporte_${reportType}.xlsx`;
      enlace.style.display = "none";

      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      setErrorReport(
        error instanceof Error ? error.message : "Error al exportar el reporte"
      );
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1000, width: "100%" }}>
      <div className="page-header">
        <h1 className="page-title">Reportes</h1>
        <p className="page-subtitle">Generación y exportación de reportes estadísticos odontológicos</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Report type selector */}
        <div>
          <div className="card" style={{ padding: "24px", marginBottom: 20 }}>
            <h3 className="section-title">Tipo de reporte</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {loadingTypes ? (
                <p>Cargando tipos de reporte...</p>
              ) : errorTypes ? (
                <p style={{ color: "#dc2626" }}>{errorTypes}</p>
              ) : (
                reportTypes.map(type => (
                  <button
                    key={type.tipo}
                    onClick={() => setReportType(type.tipo)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 8,
                      border: `1px solid ${reportType === type.tipo ? "#1a3557" : "#e5e7eb"}`,
                      background: reportType === type.tipo ? "#eff6ff" : "white",
                      color: reportType === type.tipo ? "#1a3557" : "#374151",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: reportType === type.tipo ? 600 : 400,
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontFamily: "inherit",
                    }}
                  >
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%",
                      border: `2px solid ${reportType === type.tipo ? "#1a3557" : "#d1d5db"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {reportType === type.tipo && (
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a3557", display: "block" }} />
                      )}
                    </span>
                    {type.titulo}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Filters panel */}
        <div>
          <div className="card" style={{ padding: "24px", marginBottom: 16 }}>
            <h3 className="section-title">Filtros</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Fecha desde</label>
                <input type="date" className="input-field" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Fecha hasta</label>
                <input type="date" className="input-field" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Aseguradora</label>
                <select
                  className="select-field"
                  value={insurer}
                  onChange={e => setInsurer(e.target.value)}
                >
                  <option value="all">Todas</option>
                  {aseguradoras.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Diagnóstico</label>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b7280",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em"
                  }}>
                    Diagnóstico CIE-10
                  </label>

                  <input
                    className="select-field"
                    placeholder="Buscar código o diagnóstico..."
                    value={diagnosisSearch}
                    onChange={e => {
                      setDiagnosisSearch(e.target.value);
                      setDiagnosis("all");
                    }}
                  />

                  {diagnosisSearch && (
                    <div style={{
                      maxHeight: 150,
                      overflowY: "auto",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      background: "white"
                    }}>
                      {diagnosisOptions.map(option => (
                        <div
                          key={option.cod_4}
                          onClick={() => {
                            setDiagnosis(option.cod_4);
                            setDiagnosisSearch(
                              `${option.cod_4} - ${option.descripcion_4}`
                            );
                            setDiagnosisOptions([]);
                          }}
                          style={{
                            padding: 10,
                            cursor: "pointer",
                            fontSize: 13
                          }}
                        >
                          <strong>{option.cod_4}</strong> - {option.descripcion_4}
                        </div>
                      ))}
                    </div>
                  )}

                  {diagnosis !== "all" && (
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => {
                        setDiagnosis("all");
                        setDiagnosisSearch("");
                        setDiagnosisOptions([]);
                      }}
                      style={{ fontSize: 12, marginTop: 5 }}
                    >
                      Limpiar diagnóstico ×
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Profesional</label>
                <select
                  className="select-field"
                  value={professional}
                  onChange={e => setProfessional(e.target.value)}
                >
                  <option value="all">Todos</option>
                  {profesionales.map(item => (
                    <option
                      key={item.id_profesional}
                      value={item.id_profesional}
                    >
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 14, fontWeight: 600, marginBottom: 10 }}
            onClick={manejarGenerarReporte} disabled={loadingReport || !reportType}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            {loadingReport ? "Generando..." : "Generar reporte"}
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button
              className="btn-secondary"
              style={{ justifyContent: "center", fontSize: 12 }}
              onClick={manejarGenerarReporte}
              disabled={loadingReport || !reportType}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              Vista previa
            </button>
            <button className="btn-secondary" style={{ justifyContent: "center", fontSize: 12 }}
              onClick={manejarExportarExcel}
              disabled={loadingExcel || !reportType}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              {loadingExcel ? "Exportando..." : "Excel"}
            </button>
          </div>
        </div>
      </div>

      {/* Report type info card */}
      {/*<div className="card" style={{ padding: "20px 24px", marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: "#eff6ff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, flexShrink: 0,
          }}>📊</div>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#1a3557" }}>
              {reportType}
              {errorReport && (
                <p style={{ color: "#dc2626", marginTop: 12 }}>
                  {errorReport}
                </p>
              )}

              {reporte && (
                <div style={{
                  marginTop: 20,
                  padding: 20,
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10
                }}>
                  <h3>{reporte.titulo}</h3>

                  <p>{reporte.hallazgo}</p>

                  <div style={{
                    display: "flex",
                    gap: 20,
                    marginBottom: 16
                  }}>
                    <span>Pacientes: {reporte.totales.pacientes}</span>
                    <span>Atenciones: {reporte.totales.atenciones}</span>
                    <span>Imágenes: {reporte.totales.imagenes}</span>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th>{reporte.columna_principal}</th>
                        <th>{reporte.columna_secundaria}</th>
                        <th>Cantidad</th>
                        <th>Porcentaje</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reporte.filas.map((fila, index) => (
                        <tr key={index}>
                          <td>{fila.etiqueta}</td>
                          <td>{fila.etiqueta_secundaria}</td>
                          <td>{fila.cantidad}</td>
                          <td>{fila.porcentaje}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Periodo: {dateFrom} al {dateTo} · {insurer === "all" ? "Todas las aseguradoras" : insurer} · {professional === "all" ? "Todos los profesionales" : professional}
            </p>
          </div>
          <button className="btn-ghost" style={{ marginLeft: "auto" }} onClick={() => onNavigate("report-generated")}>
            Generar →
          </button>
        </div>
      </div>*/}
    </div>
  );
}
