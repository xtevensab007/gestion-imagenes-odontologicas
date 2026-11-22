import { useEffect, useState, useRef } from "react";
import { listarImagenes, subirImagen } from "../services/imagenesService";
import type { ImagenClinica } from "../services/imagenesService";
import { listarPacientes } from "../services/pacientesService";
import type { PacienteBackend } from "../services/pacientesService";
import { listarAtenciones } from "../services/atencionesService";
import type { AtencionListado } from "../services/atencionesService";

interface Props {
  initialPatientId?: string;
  onNavigate: (page: string, extra?: any) => void;
}

export default function Images({ initialPatientId, onNavigate }: Props) {
  const [search, setSearch] = useState("");
  const [patientFilter, setPatientFilter] = useState(initialPatientId || "all");
  const [diagFilter, setDiagFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [imagenes, setImagenes] = useState<ImagenClinica[]>([]);
  const [pacientes, setPacientes] = useState<PacienteBackend[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImagenClinica | null>(null);

  const [pagina, setPagina] = useState(1);
  const [totalImagenes, setTotalImagenes] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [mostrarModalSubida, setMostrarModalSubida] = useState(false);
const [pacienteSubida, setPacienteSubida] = useState("");
const [atencionSubida, setAtencionSubida] = useState("");
const [archivosSubida, setArchivosSubida] = useState<File[]>([]);
const [atencionesPaciente, setAtencionesPaciente] = useState<AtencionListado[]>([]);
const [subiendo, setSubiendo] = useState(false);
const [errorSubida, setErrorSubida] = useState("");
const [recargar, setRecargar] = useState(0);
const inputArchivosRef = useRef<HTMLInputElement>(null);

async function handleSubirImagenes() {
  if (!pacienteSubida) {
    setErrorSubida("Selecciona un paciente.");
    return;
  }

  if (archivosSubida.length === 0) {
    setErrorSubida("Selecciona al menos una imagen.");
    return;
  }

  try {
    setSubiendo(true);
    setErrorSubida("");

    for (const archivo of archivosSubida) {
      await subirImagen(
        archivo,
        pacienteSubida,
        atencionSubida || undefined
      );

      setArchivosSubida(prev =>
        prev.filter(item => item !== archivo)
      );
    }

    setMostrarModalSubida(false);
    setPacienteSubida("");
    setAtencionSubida("");
    setArchivosSubida([]);
    setPagina(1);
    setRecargar(prev => prev + 1);

  } catch (error) {
    setErrorSubida(
      error instanceof Error
        ? error.message
        : "No fue posible subir las imágenes."
    );
  } finally {
    setSubiendo(false);
  }
}

useEffect(() => {
  async function cargarAtencionesPaciente() {
    if (!pacienteSubida) {
      setAtencionesPaciente([]);
      setAtencionSubida("");
      return;
    }

    try {
      const respuesta = await listarAtenciones({
        id_paciente: pacienteSubida,
        page: 1,
        page_size: 100
      });

      setAtencionesPaciente(respuesta.items);
    } catch (error) {
      console.error("Error al cargar atenciones:", error);
      setAtencionesPaciente([]);
    }
  }

  cargarAtencionesPaciente();
}, [pacienteSubida]);

  useEffect(() => {
    async function cargarImagenes() {
      try {
        setCargando(true);
        setErrorCarga("");

        const respuesta = await listarImagenes({
          id_paciente: patientFilter !== "all" ? patientFilter : undefined,
          q: search || undefined,
          diagnostico: diagFilter !== "all" ? diagFilter : undefined,
          fecha_desde: dateFilter ? `${dateFilter}-01` : undefined,
          fecha_hasta: dateFilter
            ? `${dateFilter}-${new Date(
              Number(dateFilter.split("-")[0]),
              Number(dateFilter.split("-")[1]),
              0
            ).getDate()}`
            : undefined,
          page: pagina,
          page_size: 20
        });

        setImagenes(respuesta.items);
        setTotalImagenes(respuesta.total);
      } catch (error) {
        setErrorCarga(
          error instanceof Error ? error.message : "Error al cargar imágenes"
        );
      } finally {
        setCargando(false);
      }
    }

    cargarImagenes();
  }, [search, patientFilter, diagFilter, dateFilter, pagina, recargar]);

  useEffect(() => {
    async function cargarPacientes() {
      try {
        const respuesta = await listarPacientes(1, "");
        setPacientes(respuesta.items);
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      }
    }

    cargarPacientes();
  }, []);

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1400, width: "100%" }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Imágenes clínicas</h1>
          <p className="page-subtitle">Galería de imágenes odontológicas asociadas a pacientes y diagnósticos</p>
        </div>
        <button
  className="btn-primary"
  onClick={() => {
    setErrorSubida("");
    setMostrarModalSubida(true);
  }}
>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          Subir imagen
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 240 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por archivo, paciente o diagnóstico..." />
        </div>
        <select className="select-field" style={{ width: 200 }} value={patientFilter} onChange={e => setPatientFilter(e.target.value)}>
          <option value="all">Todos los pacientes</option>
          {pacientes.map(p => (
            <option key={p.id_paciente} value={p.id_paciente}>
              {p.nombre}
            </option>
          ))}
        </select>
        <input
          className="input-field"
          style={{ width: 200 }}
          placeholder="Código CIE-10"
          value={diagFilter === "all" ? "" : diagFilter}
          onChange={e => {
            setDiagFilter(e.target.value || "all");
            setPagina(1);
          }}
        />
        <input type="month" className="input-field" style={{ width: 160 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ padding: "8px 14px", borderRadius: 8, background: "#f3f4f6", fontSize: 13 }}>
          <span style={{ color: "#6b7280" }}>Total imágenes: </span>
          <span style={{ color: "#1a3557", fontWeight: 700 }}>{totalImagenes}</span>
        </div>

        <div style={{ padding: "8px 14px", borderRadius: 8, background: "#f3f4f6", fontSize: 13 }}>
          <span style={{ color: "#6b7280" }}>Mostrando: </span>
          <span style={{ color: "#1a3557", fontWeight: 700 }}>{imagenes.length}</span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
        {imagenes.map(img => (
          <div
            key={img.id_imagen}
            className="img-card"
            onClick={() => setSelectedImage(img)}
          >
            <div style={{
              width: "100%",
              height: 160,
              overflow: "hidden",
              background: "#f3f4f6"
            }}>
              <img
                src={img.url}
                alt={img.nombre_archivo}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            </div>

            <div style={{ padding: "12px 14px" }}>
              <p style={{
                margin: "0 0 6px",
                fontSize: 12,
                fontWeight: 600,
                color: "#1f2937",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {img.nombre_archivo}
              </p>

              <p style={{
                margin: "0 0 6px",
                fontSize: 12,
                color: "#6b7280"
              }}>
                👤 {img.paciente_nombre}
              </p>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span className="badge badge-gray" style={{ fontSize: 11 }}>
                  {img.diagnostico || "Sin diagnóstico"}
                </span>

                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  {img.fecha_carga.slice(0, 10)}
                </span>
              </div>

              <button
                className="btn-ghost"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: 8,
                  fontSize: 12
                }}
              >
                Ver imagen →
              </button>
            </div>
          </div>
        ))}
      </div>
      {cargando && <p>Cargando imágenes...</p>}

      {errorCarga && (
        <p style={{ color: "#dc2626" }}>{errorCarga}</p>
      )}
      {!cargando && imagenes.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#9ca3af"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#6b7280",
            marginBottom: 8
          }}>
            No se encontraron imágenes
          </p>
          <p style={{ fontSize: 14 }}>
            Intente con otros filtros de búsqueda
          </p>
        </div>
      )}

      {/* Paginación */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        marginTop: 24
      }}>
        <button
          className="btn-secondary"
          disabled={pagina === 1}
          onClick={() => setPagina(p => p - 1)}
        >
          Anterior
        </button>

        <span style={{ fontSize: 13, color: "#6b7280" }}>
          Página {pagina} de {Math.max(1, Math.ceil(totalImagenes / 20))}
        </span>

        <button
          className="btn-secondary"
          disabled={pagina >= Math.ceil(totalImagenes / 20)}
          onClick={() => setPagina(p => p + 1)}
        >
          Siguiente
        </button>
      </div>

{/* Modal para subir imágenes */}
{mostrarModalSubida && (
  <div
    className="modal-overlay"
    onClick={() => {
      if (!subiendo) setMostrarModalSubida(false);
    }}
  >
    <div
      className="modal-content"
      style={{ width: 520, padding: 28 }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24
      }}>
        <h2 style={{
          margin: 0,
          fontSize: 18,
          color: "#1a3557"
        }}>
          Subir imágenes clínicas
        </h2>

        <button
          onClick={() => setMostrarModalSubida(false)}
          disabled={subiendo}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9ca3af"
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{
          display: "block",
          marginBottom: 8,
          fontSize: 13,
          fontWeight: 600
        }}>
          Paciente *
        </label>

        <select
          className="select-field"
          style={{ width: "100%" }}
          value={pacienteSubida}
          onChange={e => setPacienteSubida(e.target.value)}
          disabled={subiendo}
        >
          <option value="">Seleccionar paciente</option>
          {pacientes.map(p => (
            <option key={p.id_paciente} value={p.id_paciente}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{
          display: "block",
          marginBottom: 8,
          fontSize: 13,
          fontWeight: 600
        }}>
          Atención (opcional)
        </label>

        <select
          className="select-field"
          style={{ width: "100%" }}
          value={atencionSubida}
          onChange={e => setAtencionSubida(e.target.value)}
          disabled={!pacienteSubida || subiendo}
        >
          <option value="">Sin atención asociada</option>

          {atencionesPaciente.map(a => (
            <option key={a.id_atencion} value={a.id_atencion}>
              {a.codigo_atencion} - {a.fecha_atencion}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 18 }}>
        <input
          ref={inputArchivosRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={e => {
            const nuevos = Array.from(e.target.files || []);
            setArchivosSubida(prev => [...prev, ...nuevos]);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          className="btn-secondary"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={() => inputArchivosRef.current?.click()}
          disabled={subiendo}
        >
          Seleccionar imágenes
        </button>

        {archivosSubida.map((archivo, indice) => (
          <div
            key={`${archivo.name}-${indice}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 10px",
              marginTop: 8,
              background: "#f9fafb",
              borderRadius: 6,
              fontSize: 12
            }}
          >
            <span style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              {archivo.name}
            </span>

            <button
              type="button"
              disabled={subiendo}
              onClick={() => setArchivosSubida(prev =>
                prev.filter((_, i) => i !== indice)
              )}
              style={{
                border: "none",
                background: "none",
                color: "#dc2626",
                cursor: "pointer"
              }}
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      {errorSubida && (
        <p style={{ color: "#dc2626", fontSize: 13 }}>
          {errorSubida}
        </p>
      )}

      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 24
      }}>
        <button
          className="btn-secondary"
          disabled={subiendo}
          onClick={() => setMostrarModalSubida(false)}
        >
          Cancelar
        </button>

        <button
          className="btn-primary"
          disabled={subiendo}
          onClick={handleSubirImagenes}
        >
          {subiendo ? "Subiendo..." : "Guardar imágenes"}
        </button>
      </div>
    </div>
  </div>
)}

      {/* Image modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" style={{ width: 860, display: "flex", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            {/* Image side */}
            <div style={{ width: 480, flexShrink: 0, background: "#0f2340" }}>
              <img src={selectedImage.url} alt={selectedImage.nombre_archivo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {/* Info side */}
            <div style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#1a3557", fontFamily: "'DM Sans', sans-serif" }}>
                    {selectedImage.nombre_archivo}
                  </h2>

                </div>
                <button onClick={() => setSelectedImage(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Paciente", value: selectedImage.paciente_nombre, icon: "👤" },
                  { label: "Fecha", value: selectedImage.fecha_carga.slice(0, 10), icon: "📅" },
                  { label: "Atención", value: selectedImage.id_atencion || "Sin atención", icon: "🏥" },
                ].map(f => (
                  <div key={f.label}>
                    <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</p>
                    <p style={{ margin: 0, fontSize: 13, color: "#1f2937", fontWeight: 500 }}>{f.icon} {f.value}</p>
                  </div>
                ))}
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>Diagnóstico</p>
                  <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Diagnóstico
                  </p>

                  <span className="badge badge-gray" style={{ fontSize: 13, padding: "6px 14px" }}>
                    🦷 {selectedImage.diagnostico || "Sin diagnóstico"}
                  </span>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>Observaciones</p>

                </div>
              </div>

              <div style={{ marginTop: 24, display: "flex", gap: 8 }}>
                <button className="btn-primary" onClick={() => {
                  setSelectedImage(null);
                  onNavigate("patient-detail", {
                    patientId: selectedImage.id_paciente
                  });
                }}>
                  Ver paciente
                </button>
                <button className="btn-secondary" onClick={() => setSelectedImage(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
