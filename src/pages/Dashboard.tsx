import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";
import { listarPacientes } from "../services/pacientesService";
import {
  listarAtenciones,
  type AtencionListado
} from "../services/atencionesService";
import { listarImagenes } from "../services/imagenesService";
import { obtenerMiProfesional } from "../services/profesionalesService";

interface DashboardProps {
  onNavigate: (page: string, extra?: any) => void;
}

function StatCard({ label, value, icon, color, sub }: { label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <div className="stat-card" style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</p>
          <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "#1a3557", fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9ca3af" }}>{sub}</p>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: color,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white",
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }: DashboardProps) {

const [atenciones, setAtenciones] = useState<AtencionListado[]>([]);
const [totalPacientes, setTotalPacientes] = useState(0);
const [totalAtenciones, setTotalAtenciones] = useState(0);
const [totalImagenes, setTotalImagenes] = useState(0);
const [cargando, setCargando] = useState(true);
const [error, setError] = useState("");
const [nombreUsuario, setNombreUsuario] = useState("");


useEffect(() => {
  const cargarDashboard = async () => {
    try {
      setCargando(true);
      setError("");
      const profesional = await obtenerMiProfesional();
setNombreUsuario(profesional.nombre);
      const [pacientes, respuestaAtenciones, imagenes] = await Promise.all([
        listarPacientes(1, ""),
        listarAtenciones({
          page: 1,
          page_size: 100
        }),
        listarImagenes({
          page: 1,
          page_size: 100
        })
      ]);

      setTotalPacientes(pacientes.total);
      setTotalAtenciones(respuestaAtenciones.total);
      setAtenciones(respuestaAtenciones.items);
      setTotalImagenes(imagenes.total);

    } catch (err) {
      console.error("Error al cargar el dashboard:", err);
      setError("No fue posible cargar la información del dashboard.");
    } finally {
      setCargando(false);
    }
  };

  cargarDashboard();
}, []);

// Atenciones agrupadas por aseguradora
const insurerData = Object.entries(
  atenciones.reduce((acumulado, atencion) => {
    const nombre = atencion.aseguradora || "Sin aseguradora";
    acumulado[nombre] = (acumulado[nombre] || 0) + 1;
    return acumulado;
  }, {} as Record<string, number>)
)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count);

// Diagnósticos bucales más frecuentes
const dentalDiagnosisData = Object.entries(
  atenciones
    .flatMap(a => a.diagnosticos_bucales || [])
    .reduce((acumulado, diagnostico) => {
      acumulado[diagnostico] = (acumulado[diagnostico] || 0) + 1;
      return acumulado;
    }, {} as Record<string, number>)
)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);

// Colores para los diagnósticos
const dentalDiagColors = [
  "#1a3557",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706"
];

const recent = [...atenciones]
  .sort((a, b) =>
    new Date(b.fecha_atencion).getTime() -
    new Date(a.fecha_atencion).getTime()
  )
  .slice(0, 6);

if (cargando) {
  return (
    <div style={{ padding: 32 }}>
      Cargando información del dashboard...
    </div>
  );
}

if (error) {
  return (
    <div style={{ padding: 32 }}>
      <p style={{ color: "#dc2626" }}>{error}</p>
    </div>
  );
}
  return (
    <div style={{ padding: "32px 36px", maxWidth: 1400, width: "100%" }}>
      <div className="page-header">
        <h1 className="page-title">
  Bienvenido, {nombreUsuario || "usuario"}
</h1>
        <p className="page-subtitle">Panel de control del sistema odontológico · Hospital Alma Mater</p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard
          label="Total de pacientes"
          value={totalPacientes}
sub="Pacientes registrados"
          color="#1a3557"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard
          label="Total de atenciones"
          value={totalAtenciones}
sub="Atenciones registradas"
          color="#2563eb"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
        <StatCard
          label="Imágenes clínicas"
          value={totalImagenes}
sub="Imágenes registradas"
          color="#0891b2"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
        />
        <StatCard
          label="Diagnósticos"
          value={new Set(atenciones.flatMap(a => a.diagnosticos_bucales || [])).size}
sub="Tipos de diagnósticos bucales"
          color="#059669"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ padding: "24px" }}>
          <h3 className="section-title">Atenciones por aseguradora</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={insurerData} margin={{ top: 0, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }} />
              <Bar dataKey="count" fill="#1a3557" radius={[4,4,0,0]} name="Atenciones" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: "24px" }}>
          <h3 className="section-title">Diagnósticos bucales más frecuentes</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <ResponsiveContainer width={160} height={200}>
              <PieChart>
                <Pie data={dentalDiagnosisData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="count" paddingAngle={3}>
                  {dentalDiagnosisData.map((entry, index) => (
                    <Cell key={index} fill={Object.values(dentalDiagColors)[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              {dentalDiagnosisData.map((d, i) => {
                const total = dentalDiagnosisData.reduce((s, x) => s + x.count, 0);
                const pct = Math.round(d.count / total * 100);
                const color = Object.values(dentalDiagColors)[i];
                return (
                  <div key={d.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#4b5563", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
                        {d.name}
                      </span>
                      <span style={{ fontSize: 12, color: "#1a3557", fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent attentions */}
      <div className="card">
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1f2937" }}>Últimas atenciones</h3>
          <button className="btn-ghost" onClick={() => onNavigate("attentions")}>Ver todas →</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Aseguradora</th>
                <th>Diagnóstico hospitalario</th>
                <th>Diagnóstico bucal</th>
                <th>Imágenes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            
<tbody>
  {recent.map(a => (
    <tr key={a.id_atencion}>
      <td style={{
        whiteSpace: "nowrap",
        color: "#6b7280",
        fontSize: 13
      }}>
        {a.fecha_atencion}
      </td>

      <td>
        <button
          onClick={() => onNavigate("patient-detail", {
            patientId: a.paciente.id_paciente
          })}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: "#1a3557",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "inherit"
          }}
        >
          {a.paciente.nombre}
        </button>
        <div style={{ fontSize: 11, color: "#9ca3af" }}>
          {a.paciente.documento_identidad}
        </div>
      </td>

      <td>
        <span className="badge badge-blue">
          {a.aseguradora || "Sin aseguradora"}
        </span>
      </td>

      <td>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#374151"
        }}>
          {a.diagnostico_hospitalario || "Sin diagnóstico"}
        </span>
      </td>

      <td>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4
        }}>
          {a.diagnosticos_bucales.map((d, i) => (
            <span
              key={i}
              className="badge badge-green"
              style={{ fontSize: 11 }}
            >
              {d}
            </span>
          ))}
        </div>
      </td>

      <td>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 5
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="#9ca3af" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span style={{
            fontSize: 13,
            color: "#374151",
            fontWeight: 500
          }}>
            {a.total_imagenes}
          </span>
        </div>
      </td>

      <td>
        <button
          className="btn-ghost"
          style={{ fontSize: 12, padding: "5px 10px" }}
          onClick={() => onNavigate("attention-detail", {
            attentionId: a.id_atencion
          })}
        >
          Ver detalle
        </button>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
