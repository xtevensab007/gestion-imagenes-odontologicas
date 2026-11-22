import { useEffect, useState } from "react";
import {
  obtenerAtencion,
  actualizarAtencion,
} from "../services/atencionesService";

interface Props {
  attentionId: string;
  onNavigate: (page: string, extra?: any) => void;
}

export default function AttentionDetail({ attentionId, onNavigate }: Props) {
  const [attention, setAttention] = useState<any>(null);
  const [editandoPlan, setEditandoPlan] = useState(false);
const [planTratamiento, setPlanTratamiento] = useState("");
const [guardandoPlan, setGuardandoPlan] = useState(false);

useEffect(() => {
  const cargarAtencion = async () => {
    try {
      const respuesta = await obtenerAtencion(attentionId);
      setAttention(respuesta);
    } catch (error) {
      console.error("Error al cargar atención:", error);
    }
  };

  cargarAtencion();
}, [attentionId]);
const handleGuardarPlan = async () => {
  try {
    setGuardandoPlan(true);

    const respuesta = await actualizarAtencion(attentionId, {
      plan_tratamiento: planTratamiento.trim(),
    });

    if (respuesta) {
      setAttention(respuesta);
    }

    setEditandoPlan(false);
  } catch (error) {
    console.error("Error al actualizar el plan de tratamiento:", error);
    alert("No fue posible actualizar el plan de tratamiento.");
  } finally {
    setGuardandoPlan(false);
  }
};

if (!attention) {
  return <div style={{ padding: 32 }}>Cargando atención...</div>;
}

  const diagColors: Record<string, { bg: string; text: string }> = {
    "Caries": { bg: "#eff6ff", text: "#1d4ed8" },
    "Gingivitis": { bg: "#f0fdf4", text: "#15803d" },
    "Mucositis": { bg: "#fff7ed", text: "#c2410c" },
    "Resto radicular": { bg: "#f5f3ff", text: "#6d28d9" },
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1000, width: "100%" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "#6b7280" }}>
        <button onClick={() => onNavigate("patients")} style={{ background: "none", border: "none", color: "#1a3557", cursor: "pointer", fontWeight: 500, fontSize: 13, padding: 0, fontFamily: "inherit" }}>Pacientes</button>
        <span>›</span>
        <button onClick={() => onNavigate("patient-detail", { patientId: attention.paciente?.id_paciente })} style={{ background: "none", border: "none", color: "#1a3557", cursor: "pointer", fontWeight: 500, fontSize: 13, padding: 0, fontFamily: "inherit" }}>{attention.paciente?.nombre}</button>
        <span>›</span>
        <span>Atención {attention.codigo_atencion}</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Detalle de atención</h1>
          <p className="page-subtitle">Información completa del encuentro clínico odontológico</p>
        </div>
        <button className="btn-primary" onClick={() => onNavigate("images", { patientId: attention.paciente?.id_paciente })}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Ver imágenes ({attention.imagenes?.length || 0})
        </button>
      </div>

      {/* Meta info */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
        <h3 className="section-title" style={{ marginBottom: 16 }}>Información general</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { label: "Fecha de atención", value: attention.fecha_atencion, icon: "📅" },
  { label: "Paciente", value: attention.paciente?.nombre, icon: "👤" },
  { label: "Documento", value: attention.paciente?.documento_identidad, icon: "🪪" },
  { label: "Aseguradora", value: attention.aseguradora, icon: "🏢" },
  { label: "Ubicación", value: attention.ubicacion, icon: "📍" },
  { label: "Profesional", value: attention.profesional, icon: "👨‍⚕️" },
          ].map(field => (
            <div key={field.label}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>{field.label}</p>
              <p style={{ margin: 0, fontSize: 14, color: "#1f2937", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                <span>{field.icon}</span>{field.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Hospital diagnosis */}
        <div className="card" style={{ padding: "20px 24px" }}>
          <h3 className="section-title">Diagnóstico hospitalario</h3>
          <div style={{ padding: "16px 18px", borderRadius: 10, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span>
  {attention.diagnostico_hospitalario?.codigo?.cod_4 || "Sin código"}
</span>

<p>
  {attention.diagnostico_hospitalario?.codigo?.descripcion ||
    attention.diagnostico_hospitalario?.descripcion_original ||
    "Sin descripción"}
</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>Clasificación CIE-10</p>
              </div>
            </div>
          </div>
        

        {/* Dental diagnoses */}
        <div className="card" style={{ padding: "20px 24px" }}>
          <h3 className="section-title">Diagnósticos bucales</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {(attention.diagnosticos_bucales || []).map((d: any) => {
  const nombre = d.descripcion || "Sin descripción";
  const c = diagColors[nombre] || { bg: "#f3f4f6", text: "#374151" };
              return (
                <div key={d.id_diagnostico_bucal} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 16px", borderRadius: 10,
                  background: c.bg, color: c.text,
                  fontSize: 14, fontWeight: 600,
                  border: `1px solid ${c.bg}`,
                }}>
                  🦷 {nombre}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>
      Plan de tratamiento
    </p>

    {!editandoPlan && (
      <button
        onClick={() => {
          setPlanTratamiento(attention.plan_tratamiento || "");
          setEditandoPlan(true);
        }}
        style={{ border: "none", background: "transparent", color: "#2563eb", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
      >
        Editar
      </button>
    )}
  </div>

  {editandoPlan ? (
    <>
      <textarea
        value={planTratamiento}
        onChange={(e) => setPlanTratamiento(e.target.value)}
        rows={3}
        style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6, resize: "vertical", fontSize: 13, boxSizing: "border-box" }}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <button
          onClick={() => setEditandoPlan(false)}
          disabled={guardandoPlan}
          style={{ padding: "7px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer" }}
        >
          Cancelar
        </button>

        <button
          onClick={handleGuardarPlan}
          disabled={guardandoPlan}
          style={{ padding: "7px 12px", border: "none", borderRadius: 6, background: "#2563eb", color: "#fff", cursor: "pointer" }}
        >
          {guardandoPlan ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </>
  ) : (
    <p style={{ margin: 0, fontSize: 13, color: "#374151", fontWeight: 500 }}>
      {attention.plan_tratamiento || "Sin plan de tratamiento"}
    </p>
  )}
</div>
        </div>
      </div>

      {/* Observations */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
        <h3 className="section-title">Observaciones clínicas</h3>
        <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.7, padding: "14px 16px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
          {attention.observaciones || "Sin observaciones"}
        </p>
      </div>

      {/* Image preview strip */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 className="section-title" style={{ margin: 0 }}>
  Imágenes clínicas ({attention.imagenes?.length || 0})
</h3>
          <button className="btn-ghost" onClick={() => onNavigate("images", { patientId: attention.paciente?.id_paciente})}>Ver galería completa →</button>
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
          {(attention.imagenes || []).slice(0, 4).map((img: any, i: number) => (
            <div key={i} style={{
              width: 120, height: 90, borderRadius: 8, overflow: "hidden",
              flexShrink: 0, background: "#f3f4f6", position: "relative",
              cursor: "pointer",
            }} onClick={() => onNavigate("images", { patientId: attention.paciente?.id_paciente})}>
              <img
  src={img.url}
  alt={img.nombre_archivo}
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }}
/>
              <div style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.5)", color: "white", fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>
                IMG {String(i+1).padStart(3,"0")}
              </div>
            </div>
          ))}
          {(attention.imagenes?.length || 0) > 4 && (
            <div style={{
              width: 120, height: 90, borderRadius: 8,
              background: "#1a3557", display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 20, fontWeight: 700, flexShrink: 0, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }} onClick={() => onNavigate("images", { patientId: attention.paciente?.id_paciente})}>
              ++{attention.imagenes.length - 4}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
