{/*import { useState } from "react";
import { patients } from "../data/mockData";*/}

import { useEffect, useState } from "react";
import {
  listarPacientes,
  crearPaciente,
  obtenerPaciente,
  type PacienteBackend,
  type NuevoPaciente
} from "../services/pacientesService";
interface PatientsProps {
  onNavigate: (page: string, extra?: any) => void;
}

export default function Patients({ onNavigate }: PatientsProps) {
  const [search, setSearch] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [patients, setPatients] = useState<PacienteBackend[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const formularioInicial: NuevoPaciente = {
    tipo_documento: "CC",
    documento_identidad: "",
    nombre: "",
    fecha_nacimiento: "",
    sexo: "F",
    telefono: "",
    correo: "",
    ciudad: ""
  };

  const [nuevoPaciente, setNuevoPaciente] =
    useState<NuevoPaciente>(formularioInicial);

  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [recargar, setRecargar] = useState(0);

  const actualizarCampo = (
    campo: keyof NuevoPaciente,
    valor: string
  ) => {
    setNuevoPaciente(actual => ({
      ...actual,
      [campo]: valor
    }));
  };

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await listarPacientes(
          currentPage,
          search,
          fechaDesde || undefined,
          fechaHasta || undefined
        );
        const pacientesCompletos = await Promise.all(
          data.items.map(async (paciente) => {
            try {
              const detalle = await obtenerPaciente(paciente.id_paciente);
              return { ...paciente, ...detalle };
            } catch (error) {
              console.error(
                `Error al cargar el paciente ${paciente.id_paciente}:`,
                error
              );
              return paciente;
            }
          })
        );
        console.log("Pacientes recibidos:", data.items);
        setPatients(pacientesCompletos);
        setTotal(data.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar pacientes"
        );
      } finally {
        setLoading(false);
      }
    };

    cargarPacientes();
  }, [currentPage, search, fechaDesde, fechaHasta, recargar]);

  const totalPages = Math.ceil(total / 20);
  const validarPaciente = (): string => {
  const documento = nuevoPaciente.documento_identidad.trim();
  const nombre = nuevoPaciente.nombre.trim();
  const telefono = (nuevoPaciente.telefono || "").trim();
  const correo = (nuevoPaciente.correo || "").trim();
  const fechaNacimiento = nuevoPaciente.fecha_nacimiento || "";

  if (!documento) {
    return "El documento de identidad es obligatorio.";
  }

  if (!/^\d+$/.test(documento)) {
    return "El documento solo puede contener números.";
  }

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
  const guardarPaciente = async () => {
  const errorValidacion = validarPaciente();

  if (errorValidacion) {
    setErrorFormulario(errorValidacion);
    return;
  }

  try {
      setGuardando(true);
      setErrorFormulario("");

      await crearPaciente({
        ...nuevoPaciente,
        documento_identidad: nuevoPaciente.documento_identidad.trim(),
        nombre: nuevoPaciente.nombre.trim(),
        fecha_nacimiento: nuevoPaciente.fecha_nacimiento || null,
        telefono: nuevoPaciente.telefono || null,
        correo: nuevoPaciente.correo || null,
        ciudad: nuevoPaciente.ciudad || null
      });

      setNuevoPaciente(formularioInicial);
      setShowModal(false);
      setCurrentPage(1);
      setRecargar(actual => actual + 1);

    } catch (err) {
      setErrorFormulario(
        err instanceof Error
          ? err.message
          : "No fue posible registrar el paciente."
      );
    } finally {
      setGuardando(false);
    }
  };
  return (
    <div style={{ padding: "32px 36px", maxWidth: 1300, width: "100%" }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">Gestión y consulta de pacientes registrados en el sistema</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nuevo paciente
        </button>
      </div>

      {/* Filters bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 280 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nombre, documento o ID..."
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="date"
            className="input-field"
            value={fechaDesde}
            onChange={e => {
              setFechaDesde(e.target.value);
              setCurrentPage(1);
            }}
            title="Fecha desde"
          />

          <input
            type="date"
            className="input-field"
            value={fechaHasta}
            onChange={e => {
              setFechaHasta(e.target.value);
              setCurrentPage(1);
            }}
            title="Fecha hasta"
          />

          <button
            className="btn-secondary"
            onClick={() => {
              setFechaDesde("");
              setFechaHasta("");
              setCurrentPage(1);
            }}
          >
            Limpiar
          </button>
        </div>

        {/* <button className="btn-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Más filtros
        </button>*/}
      </div>

      {/* Summary strip */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total registrados", value: total },
          { label: "Con atenciones", value: patients.filter(p => p.total_atenciones > 0).length },
          { label: "Resultados", value: patients.length },
        ].map(s => (
          <div key={s.label} style={{ padding: "8px 16px", borderRadius: 8, background: "#f3f4f6", fontSize: 13 }}>
            <span style={{ color: "#6b7280" }}>{s.label}: </span>
            <span style={{ color: "#1a3557", fontWeight: 700 }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="card">
        {loading && (
          <p style={{ padding: 20, color: "#6b7280" }}>
            Cargando pacientes...
          </p>
        )}

        {error && (
          <p style={{ padding: 20, color: "#dc2626" }}>
            {error}
          </p>
        )}
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Documento</th>
                <th>Nombre completo</th>
                <th>Edad</th>
                <th>Género</th>
                <th style={{ textAlign: "center" }}>Total atenciones</th>
                <th>Última atención</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id_paciente}>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: 12, background: "#f3f4f6", padding: "2px 8px", borderRadius: 4, color: "#4b5563" }}>
                      {p.codigo}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: "#4b5563" }}>{p.documento_identidad}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 14 }}>{p.nombre}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{p.correo}</div>
                  </td>
                  <td style={{ fontSize: 13, color: "#4b5563" }}>{p.edad} años</td>
                  <td>
                    <span className={`badge ${p.sexo === "F" ? "badge-purple" : "badge-blue"}`}>
                      {p.sexo === "F" ? "Femenino" : "Masculino"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28, borderRadius: "50%",
                      background: p.total_atenciones >= 5 ? "#1a3557" : p.total_atenciones >= 3 ? "#2563eb" : "#e5e7eb",
                      color: p.total_atenciones >= 3 ? "white" : "#374151",
                      fontSize: 13, fontWeight: 700,
                    }}>
                      {p.total_atenciones}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: "#6b7280", whiteSpace: "nowrap" }}>{p.ultima_atencion}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn-ghost"
                        style={{ fontSize: 12, padding: "5px 12px" }}
                        onClick={() => onNavigate("patient-detail", { patientId: p.id_paciente })}
                      >
                        Ver detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Mostrando {total === 0 ? 0 : (currentPage - 1) * 20 + 1}
            {" - "}
            {Math.min(currentPage * 20, total)}
            {" de "}
            {total} pacientes
          </p>
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
                disabled={loading}
              >
                {page}
              </button>
            ))}

            <button
              className="page-btn"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* New Patient Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setNuevoPaciente(formularioInicial);
          setErrorFormulario("");
          setShowModal(false);
        }}>
          <div className="modal-content" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1a3557", fontFamily: "'DM Sans', sans-serif" }}>Nuevo paciente</h2>
              <button
                onClick={() => {
                  setNuevoPaciente(formularioInicial);
                  setErrorFormulario("");
                  setShowModal(false);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Documento *</label>
                  <input
                    className="input-field"
                    placeholder="Número de documento"
                    value={nuevoPaciente.documento_identidad}
                    onChange={e => actualizarCampo("documento_identidad", e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Tipo de documento</label>
                  <select
                    className="select-field"
                    value={nuevoPaciente.tipo_documento}
                    onChange={e => actualizarCampo("tipo_documento", e.target.value)}
                  >
                    <option value="CC">Cédula de ciudadanía</option>
                    <option value="TI">Tarjeta de identidad</option>
                    <option value="RC">Registro civil</option>
                    <option value="CE">Cédula de extranjería</option>
                    <option value="PA">Pasaporte</option>
                    <option value="PE">Permiso especial</option>
                    <option value="PT">Permiso por protección temporal</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Nombre completo *</label>
                <input
                  className="input-field"
                  placeholder="Nombre y apellidos"
                  value={nuevoPaciente.nombre}
                  onChange={e => actualizarCampo("nombre", e.target.value)}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Fecha de nacimiento</label>
                  <input
                    className="input-field"
                    type="date"
                    value={nuevoPaciente.fecha_nacimiento || ""}
                    onChange={e => actualizarCampo("fecha_nacimiento", e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Género</label>
                  <select
                    className="select-field"
                    value={nuevoPaciente.sexo || ""}
                    onChange={e => actualizarCampo("sexo", e.target.value)}
                  >
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
  <div>
    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
      Teléfono
    </label>
    <input
      className="input-field"
      placeholder="Ingrese número telefónico"
      value={nuevoPaciente.telefono || ""}
      onChange={e => actualizarCampo("telefono", e.target.value)}
    />
  </div>

  <div>
    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
      Ciudad
    </label>
    <select
      className="select-field"
      value={nuevoPaciente.ciudad || ""}
      onChange={e => actualizarCampo("ciudad", e.target.value)}
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
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Correo electrónico</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={nuevoPaciente.correo || ""}
                  onChange={e => actualizarCampo("correo", e.target.value)}
                />
              </div>
              {errorFormulario && (
                <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>
                  {errorFormulario}
                </p>
              )}

              <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
                <button
                  className="btn-primary"
                  onClick={guardarPaciente}
                  disabled={guardando}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {guardando ? "Guardando..." : "Guardar paciente"}
                </button>

                <button
                  className="btn-secondary"
                  disabled={guardando}
                  onClick={() => {
                    setNuevoPaciente(formularioInicial);
                    setErrorFormulario("");
                    setShowModal(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
