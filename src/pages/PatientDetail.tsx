import { useEffect, useState } from "react";
import {
  obtenerPaciente,
  actualizarPaciente,
  type PacienteBackend,
  type NuevoPaciente
} from "../services/pacientesService";
import {
  listarAtenciones,
  type AtencionListado
} from "../services/atencionesService";
import {
  listarImagenes,
  type ImagenClinica
} from "../services/imagenesService";
interface Props {
  patientId: string;
  onNavigate: (page: string, extra?: any) => void;
}

export default function PatientDetail({ patientId, onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState("resumen");

  const [patient, setPatient] = useState<PacienteBackend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [patientAttentions, setPatientAttentions] = useState<AtencionListado[]>([]);
const [patientImages, setPatientImages] = useState<ImagenClinica[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState("");

  const [editedPatient, setEditedPatient] = useState({
    nombre: "",
    fecha_nacimiento: "",
    sexo: "",
    telefono: "",
    correo: "",
    ciudad: ""
  });

  useEffect(() => {
    const cargarPaciente = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await obtenerPaciente(patientId);
        setPatient(data);

      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar el paciente"
        );
      } finally {
        setLoading(false);
      }
    };

    cargarPaciente();
  }, [patientId]);
  useEffect(() => {
  const cargarAtenciones = async () => {
    try {
      const respuesta = await listarAtenciones({
        id_paciente: patientId,
        page: 1,
        page_size: 100
      });

      setPatientAttentions(respuesta.items);
    } catch (err) {
      console.error("Error al cargar atenciones del paciente:", err);
    }
  };

  cargarAtenciones();
}, [patientId]);
useEffect(() => {
  const cargarImagenes = async () => {
    try {
      const respuesta = await listarImagenes({
        id_paciente: patientId,
        page: 1,
        page_size: 100
      });

      setPatientImages(respuesta.items);
    } catch (err) {
      console.error("Error al cargar imágenes del paciente:", err);
    }
  };

  cargarImagenes();
}, [patientId]);


const allDentalDiags = [
  ...new Set(patientAttentions.flatMap(a => a.diagnosticos_bucales || []))
];

  const abrirEdicion = () => {
    if (!patient) return;

    setEditedPatient({
      nombre: patient.nombre || "",
      fecha_nacimiento: patient.fecha_nacimiento || "",
      sexo: patient.sexo || "",
      telefono: patient.telefono || "",
      correo: patient.correo || "",
      ciudad: patient.ciudad || ""
    });

    setErrorEdicion("");
    setIsEditModalOpen(true);
  };
const validarEdicion = (): string => {
  const nombre = editedPatient.nombre.trim();
  const telefono = editedPatient.telefono.trim();
  const correo = editedPatient.correo.trim();
  const fechaNacimiento = editedPatient.fecha_nacimiento;

  if (!nombre) {
    return "El nombre completo es obligatorio.";
  }

  if (!/^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u.test(nombre)) {
    return "El nombre solo puede contener letras, espacios y guiones.";
  }

  if (telefono) {
    if (!/^[+\d\s()-]+$/.test(telefono)) {
      return "El teléfono contiene caracteres no permitidos.";
    }

    const digitosTelefono = telefono.replace(/\D/g, "");

    if (digitosTelefono.length < 7 || digitosTelefono.length > 15) {
      return "El teléfono debe tener entre 7 y 15 dígitos.";
    }
  }

  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return "Ingresa un correo electrónico válido.";
  }

  if (fechaNacimiento) {
    const fecha = new Date(`${fechaNacimiento}T00:00:00`);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (Number.isNaN(fecha.getTime())) {
      return "La fecha de nacimiento no es válida.";
    }

    if (fecha > hoy) {
      return "La fecha de nacimiento no puede ser futura.";
    }
  }

  return "";
};
  const guardarCambios = async () => {
  if (!patient) return;

  const errorValidacion = validarEdicion();

  if (errorValidacion) {
    setErrorEdicion(errorValidacion);
    return;
  }

  try {
      setGuardando(true);
      setErrorEdicion("");

      const datos: Partial<NuevoPaciente> = {
        nombre: editedPatient.nombre.trim(),
        fecha_nacimiento: editedPatient.fecha_nacimiento || null,
        sexo: (editedPatient.sexo || null) as NuevoPaciente["sexo"],
        telefono: editedPatient.telefono || null,
        correo: editedPatient.correo || null,
        ciudad: editedPatient.ciudad || null
      };

      const actualizado = await actualizarPaciente(
        patient.id_paciente,
        datos
      );

      setPatient(actualizado);
      setIsEditModalOpen(false);

    } catch (err) {
      setErrorEdicion(
        err instanceof Error
          ? err.message
          : "No fue posible actualizar el paciente."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 32 }}>Cargando paciente...</div>;
  }

  if (error || !patient) {
    return (
      <div style={{ padding: 32 }}>
        <p style={{ color: "#dc2626" }}>
          {error || "No se encontró el paciente."}
        </p>
        <button className="btn-secondary" onClick={() => onNavigate("patients")}>
          Volver a pacientes
        </button>
      </div>
    );
  }



  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200, width: "100%" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "#6b7280" }}>
        <button onClick={() => onNavigate("patients")} style={{ background: "none", border: "none", color: "#1a3557", cursor: "pointer", fontWeight: 500, fontSize: 13, padding: 0, fontFamily: "inherit" }}>
          Pacientes
        </button>
        <span>›</span>
        <span>{patient.nombre}</span>
      </div>

      {/* Patient header card */}
      <div className="card" style={{ padding: "24px 28px", marginBottom: 24, display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, #1a3557, #2563eb)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 700, fontSize: 24, flexShrink: 0,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {patient.nombre.split(" ").slice(0, 2).map(n => n[0]).join("")}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#1a3557", fontFamily: "'DM Sans', sans-serif" }}>
            {patient.nombre}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, color: "#6b7280" }}>
            <span>🪪 {patient.documento_identidad}</span>
            <span>🎂 {patient.edad} años</span>
            <span>📞 {patient.telefono}</span>
            <span>📍 {patient.ciudad || "Sin ciudad"}</span>
            <span>✉️ {patient.correo}</span>
            <span>⚧ {patient.sexo === "F" ? "Femenino" : "Masculino"}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-secondary"
            onClick={abrirEdicion}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar
          </button>
        </div>
      </div>

      {/* Summary stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
  { label: "Total atenciones", value: patientAttentions.length, icon: "📅", color: "#eff6ff" },
  { label: "Diagnósticos hosp.", value: new Set(patientAttentions.map(a => a.diagnostico_hospitalario).filter(Boolean)).size, icon: "🏥", color: "#f0fdf4" },
  { label: "Diagnósticos bucales", value: allDentalDiags.length, icon: "🦷", color: "#fff7ed" },
  { label: "Imágenes asociadas", value: patientImages.length, icon: "🖼️", color: "#fdf4ff" },
].map(s => (
          <div key={s.label} className="stat-card" style={{ background: s.color }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{s.label}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26 }}>{s.icon}</span>
              <span style={{ fontSize: 32, fontWeight: 700, color: "#1a3557", fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card">
        <div style={{ padding: "0 24px" }}>
          <div className="tab-nav">
            {["resumen", "atenciones", "diagnosticos", "imagenes"].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "resumen" ? "Resumen" : tab === "atenciones" ? "Atenciones" : tab === "diagnosticos" ? "Diagnósticos" : "Imágenes"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          {activeTab === "resumen" && (
            <div>
              <h3 className="section-title">Últimas atenciones</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Aseguradora</th>
                    <th>Diagnóstico hospitalario</th>
                    <th>Diagnósticos bucales</th>
                    <th style={{ textAlign: "center" }}>Imágenes</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
  {patientAttentions.map(a => (
    <tr key={a.id_atencion}>
      <td style={{ fontSize: 13, color: "#6b7280", whiteSpace: "nowrap" }}>
        {a.fecha_atencion}
      </td>

      <td>
        <span className="badge badge-blue">
          {a.aseguradora || "Sin aseguradora"}
        </span>
      </td>

      <td>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1a3557" }}>
          {a.diagnostico_hospitalario || "Sin diagnóstico"}
        </span>
      </td>

      <td>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {a.diagnosticos_bucales.map((d, i) => (
            <span key={i} className="badge badge-gray" style={{ fontSize: 11 }}>
              {d}
            </span>
          ))}
        </div>
      </td>

      <td style={{ textAlign: "center", fontWeight: 600, color: "#374151" }}>
        {a.total_imagenes}
      </td>

      <td>
        <button
          className="btn-ghost"
          style={{ fontSize: 12, padding: "5px 10px" }}
          onClick={() => onNavigate("attention-detail", {
            attentionId: a.id_atencion
          })}
        >
          Ver atención
        </button>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          )}

          {activeTab === "atenciones" && (
  <div>
    <h3 className="section-title">
      Todas las atenciones ({patientAttentions.length})
    </h3>

    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {patientAttentions.map(a => (
        <div
          key={a.id_atencion}
          style={{
            padding: 16,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            display: "flex",
            gap: 20,
            alignItems: "center"
          }}
        >
          <div style={{ textAlign: "center", minWidth: 90 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a3557" }}>
              {a.fecha_atencion}
            </div>
          </div>

          <div style={{ width: 1, height: 40, background: "#e5e7eb", flexShrink: 0 }} />

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>
                {a.diagnostico_hospitalario || "Sin diagnóstico hospitalario"}
              </span>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="badge badge-blue" style={{ fontSize: 11 }}>
                {a.aseguradora || "Sin aseguradora"}
              </span>

              {a.diagnosticos_bucales.map((d, i) => (
                <span key={i} className="badge badge-gray" style={{ fontSize: 11 }}>
                  {d}
                </span>
              ))}

              <span className="badge badge-gray" style={{ fontSize: 11 }}>
                {a.total_imagenes} imágenes
              </span>
            </div>
          </div>

          <button
            className="btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => onNavigate("attention-detail", {
              attentionId: a.id_atencion
            })}
          >
            Ver →
          </button>
        </div>
      ))}
    </div>
  </div>
)}

          {activeTab === "diagnosticos" && (
  <div>
    <h3 className="section-title">Historial de diagnósticos</h3>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
          Diagnósticos hospitalarios (CIE-10)
        </h4>

        {[...new Set(
          patientAttentions
            .map(a => a.diagnostico_hospitalario)
            .filter(Boolean)
        )].map(codigo => (
          <div
            key={codigo}
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              marginBottom: 8
            }}
          >
            <span style={{
              fontFamily: "monospace",
              fontSize: 12,
              background: "#eff6ff",
              color: "#1d4ed8",
              padding: "3px 8px",
              borderRadius: 4,
              fontWeight: 700
            }}>
              {codigo}
            </span>
          </div>
        ))}
      </div>

      <div>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
          Diagnósticos bucales
        </h4>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {allDentalDiags.map((d, i) => (
            <span
              key={i}
              className="badge badge-gray"
              style={{ padding: "8px 16px", fontSize: 14, borderRadius: 20 }}
            >
              🦷 {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
)}


{activeTab === "imagenes" && (
  <div>
    <h3 className="section-title">
      Imágenes clínicas ({patientImages.length})
    </h3>

    {patientImages.length === 0 ? (
      <p style={{ color: "#6b7280", fontSize: 14, padding: "20px 0" }}>
        Este paciente todavía no tiene imágenes clínicas registradas.
      </p>
    ) : (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 16
      }}>
        {patientImages.map(imagen => (
          <div
            key={imagen.id_imagen}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              overflow: "hidden",
              background: "#fff"
            }}
          >
            <a
              href={imagen.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={imagen.url}
                alt={imagen.nombre_archivo}
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                  background: "#f3f4f6"
                }}
              />
            </a>

            <div style={{ padding: 12 }}>
              <p style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1f2937",
                margin: "0 0 8px",
                wordBreak: "break-word"
              }}>
                {imagen.nombre_archivo}
              </p>

              <span className="badge badge-blue">
                {imagen.id_atencion
                  ? "Asociada a atención"
                  : "Asociada al paciente"}
              </span>

              <p style={{
                fontSize: 11,
                color: "#6b7280",
                marginTop: 8
              }}>
                Cargada: {new Date(imagen.fecha_carga).toLocaleDateString("es-CO")}
              </p>

              {imagen.diagnostico && (
                <p style={{
                  fontSize: 12,
                  color: "#6b7280",
                  margin: "4px 0 0"
                }}>
                  Diagnóstico: {imagen.diagnostico}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

        </div>
      </div>
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">

            {/* Encabezado */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Editar información del paciente
                </h2>
                <p className="text-sm text-gray-500">
                  Modifica la información del paciente
                </p>
              </div>

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            {/* Formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={editedPatient.nombre}
                  onChange={(e) =>
                    setEditedPatient({
                      ...editedPatient,
                      nombre: e.target.value
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documento de identidad
                </label>
                <input
                  type="text"
                  value={patient.documento_identidad}
                  disabled
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={editedPatient.fecha_nacimiento}
                  onChange={(e) =>
                    setEditedPatient({
                      ...editedPatient,
                      fecha_nacimiento: e.target.value
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género
                </label>
                <select
                  value={editedPatient.sexo}
                  onChange={(e) =>
                    setEditedPatient({
                      ...editedPatient,
                      sexo: e.target.value
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">Seleccionar</option>
                  <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                  <option value="O">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={editedPatient.telefono}
                  onChange={(e) =>
                    setEditedPatient({
                      ...editedPatient,
                      telefono: e.target.value
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={editedPatient.correo}
                  onChange={(e) =>
                    setEditedPatient({
                      ...editedPatient,
                      correo: e.target.value
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Ciudad
  </label>
  <select
    value={editedPatient.ciudad}
    onChange={(e) =>
      setEditedPatient({
        ...editedPatient,
        ciudad: e.target.value
      })
    }
    className="w-full rounded-lg border border-gray-300 px-3 py-2"
  >
    <option value="">Seleccione una ciudad</option>
    <option value="Medellín">Medellín</option>
    <option value="Bogotá">Bogotá</option>
    <option value="Cali">Cali</option>
    <option value="Barranquilla">Barranquilla</option>
    <option value="Cartagena">Cartagena</option>
    <option value="Bucaramanga">Bucaramanga</option>
    <option value="Pereira">Pereira</option>
    <option value="Manizales">Manizales</option>
    <option value="Armenia">Armenia</option>
    <option value="Ibagué">Ibagué</option>
    <option value="Cúcuta">Cúcuta</option>
    <option value="Santa Marta">Santa Marta</option>
    <option value="Villavicencio">Villavicencio</option>
    <option value="Pasto">Pasto</option>
    <option value="Montería">Montería</option>
    <option value="Sincelejo">Sincelejo</option>
    <option value="Valledupar">Valledupar</option>
    <option value="Popayán">Popayán</option>
    <option value="Neiva">Neiva</option>
    <option value="Tunja">Tunja</option>
  </select>
</div>
            </div>

            {/* Botones */}
            {errorEdicion && (
              <p style={{ color: "#dc2626", fontSize: 13, padding: "0 24px" }}>
                {errorEdicion}
              </p>
            )}
            <div className="flex justify-end gap-3 border-t px-6 py-4">

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>

              <button
                onClick={guardarCambios}
                className="btn-primary"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
