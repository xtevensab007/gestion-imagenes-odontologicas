import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import type { ReporteBackend } from "../services/reportesService";

interface Props {
  onNavigate: (page: string, extra?: any) => void;
  reporte: ReporteBackend | null;
}

export default function ReportGenerated({ onNavigate, reporte }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);

  const descargarPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`reporte_${reporte?.tipo || "hospital"}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("No fue posible generar el PDF.");
    }
  };

  if (!reporte) {
    return (
      <div style={{ padding: 32 }}>
        <p>No hay información de un reporte generado.</p>
        <button
          className="btn-secondary"
          onClick={() => onNavigate("reports")}
        >
          Volver a reportes
        </button>
      </div>
    );
  }
  return (
    <div
  ref={reportRef}
  style={{ padding: "32px 36px", maxWidth: 1000, width: "100%" }}
>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13, color: "#6b7280" }}>
            <button onClick={() => onNavigate("reports")} style={{ background: "none", border: "none", color: "#1a3557", cursor: "pointer", fontWeight: 500, fontSize: 13, padding: 0, fontFamily: "inherit" }}>
              Reportes
            </button>
            <span>›</span>
            <span>Reporte generado</span>
          </div>
          <h1 className="page-title">{reporte.titulo}</h1>
          <p className="page-subtitle">
            Generado el {new Date(reporte.generado_en).toLocaleString("es-CO")}
            {" · Hospital Alma Mater"}
          </p>
        </div>
       {/* <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            Vista previa
          </button>
          <button className="btn-primary" onClick={descargarPDF}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Descargar PDF
          </button>
        </div>*/}
      </div>

      {/* Report header */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 20, background: "linear-gradient(135deg, #1a3557, #2a4a7f)", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26,
          }}>🏥</div>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
              Hospital Alma Mater
            </h2>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>Sistema de Gestión de Imágenes Odontológicas · Área de Odontología</p>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <p style={{ margin: "0 0 2px", fontSize: 13, opacity: 0.7 }}>Periodo</p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
              {reporte.filtros.fecha_desde || "Sin fecha inicial"}
              {" - "}
              {reporte.filtros.fecha_hasta || "Sin fecha final"}
            </p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {[
          {
            label: "Pacientes",
            value: reporte.totales.pacientes,
            icon: "👤",
            sub: "Total registrado"
          },
          {
            label: "Atenciones",
            value: reporte.totales.atenciones,
            icon: "🏥",
            sub: "Total registrado"
          },
          {
            label: "Imágenes",
            value: reporte.totales.imagenes,
            icon: "🖼️",
            sub: "Total registrado"
          },
          {
            label: "Registros",
            value: reporte.filas.reduce((total, fila) => total + fila.cantidad, 0),
            icon: "📊",
            sub: "Total de resultados"
          },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: "#6b7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</p>
                <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 700, color: "#1a3557", fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{s.sub}</p>
              </div>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card" style={{ padding: "24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 className="section-title" style={{ margin: 0 }}>
            {reporte.columna_principal}
          </h3>
          <span className="badge badge-blue">Noviembre 2024</span>
        </div>
        <ResponsiveContainer
          width="100%"
          height={Math.max(350, reporte.filas.length * 75)}
        >
          <BarChart
            data={reporte.filas}
            layout="vertical"
            margin={{ top: 10, right: 30, bottom: 10, left: 20 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />

            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
            />

            <YAxis
              type="category"
              dataKey="etiqueta"
              width={220}
              interval={0}
              tick={{ fontSize: 11, fill: "#6b7280" }}
            />

            <Tooltip />

            <Bar
              dataKey="cantidad"
              fill="#1a3557"
              radius={[0, 6, 6, 0]}
              name="Cantidad"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1f2937" }}>
            Detalle del reporte
          </h3>
          <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Exportar Excel
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Filtro</th>
              <th style={{ textAlign: "right" }}>Atenciones</th>
              <th style={{ textAlign: "right" }}>Porcentaje</th>
              <th>Distribución</th>
            </tr>
          </thead>
          <tbody>
            {reporte.filas.map((fila, i) => (
              <tr key={i}>
                <td style={{ color: "#9ca3af", fontSize: 13 }}>
                  {i + 1}
                </td>

                <td style={{ fontWeight: 600, color: "#1f2937" }}>
                  {fila.etiqueta}
                </td>

                <td style={{ textAlign: "right", fontWeight: 700, color: "#1a3557" }}>
                  {fila.cantidad}
                </td>

                <td style={{ textAlign: "right" }}>
                  <span className="badge badge-blue">
                    {fila.porcentaje}%
                  </span>
                </td>

                <td style={{ width: 200 }}>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(100, Math.max(0, fila.porcentaje))}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}

            <tr style={{ background: "#f9fafb" }}>
              <td colSpan={2} style={{ fontWeight: 700, color: "#374151" }}>
                Total
              </td>
              <td style={{ textAlign: "right", fontWeight: 800, color: "#1a3557" }}>
                {reporte.filas.reduce((total, fila) => total + fila.cantidad, 0)}
              </td>
              <td style={{ textAlign: "right" }}>
                <span className="badge badge-green">100%</span>
              </td>
              <td />
            </tr>
          </tbody>
        </table>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="btn-secondary" onClick={() => onNavigate("reports")}>
            ← Volver a reportes
          </button>
          <button className="btn-primary" onClick={descargarPDF}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
