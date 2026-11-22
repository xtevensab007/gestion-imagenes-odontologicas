import { useEffect, useState, useRef } from "react";
import { subirImagen } from "../services/imagenesService";
import { attentions } from "../data/mockData";
import {
  listarProfesionales,
  type ProfesionalBackend
} from "../services/profesionalesService";
import {
  listarAseguradoras,
  type AseguradoraBackend
} from "../services/aseguradorasService";
import {
  listarPacientes,
  type PacienteBackend
} from "../services/pacientesService";
import {
  listarAtenciones,
  crearAtencion,
  type AtencionListado,
  type NuevaAtencion
} from "../services/atencionesService";
import {
  listarCie10,
  type Cie10Backend
} from "../services/cie10Service";

interface Props {
  initialPatientId?: string;
  onNavigate: (page: string, extra?: any) => void;
}
import { obtenerTokenSesion } from "../services/supabase";

export default function Attentions({ initialPatientId, onNavigate }: Props) {
  const [search, setSearch] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
const [fechaHasta, setFechaHasta] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [patientFilter, setPatientFilter] = useState(initialPatientId || "all");
  const [patientSearch, setPatientSearch] = useState("");
  const [cieSearch, setCieSearch] = useState("");
  const [dentalSearch, setDentalSearch] = useState("");
  const [atenciones, setAtenciones] = useState<AtencionListado[]>([]);
  const [descripcionesCie, setDescripcionesCie] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [totalAtenciones, setTotalAtenciones] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [aseguradoras, setAseguradoras] = useState<AseguradoraBackend[]>([]);
  const [pacientesBackend, setPacientesBackend] = useState<PacienteBackend[]>([]);
  const [profesionales, setProfesionales] = useState<ProfesionalBackend[]>([]);
  const [cieOptions, setCieOptions] = useState<Cie10Backend[]>([]);
  const [dentalOptions, setDentalOptions] = useState<Cie10Backend[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState("");
  const [recargar, setRecargar] = useState(0);
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState<File[]>([]);
  const inputImagenRef = useRef<HTMLInputElement>(null);
  const [atencionPendienteId, setAtencionPendienteId] = useState("");
  const [newAttention, setNewAttention] = useState({
    date: "",
    insurer: "",
    patientId: initialPatientId || "",
    cieCodes: [] as string[],
    dentalDiagnoses: [] as string[],
    professional: "",
    location: "",
    observations: ""
  });
  const resetNewAttention = () => {
    setNewAttention({
      date: "",
      insurer: "",
      patientId: "",
      cieCodes: [] as string[],
      dentalDiagnoses: [] as string[],
      professional: "",
      location: "",
      observations: ""


    });
    setPatientSearch("");
    setCieSearch("");
    setDentalSearch("");
    setImagenesSeleccionadas([]);
    setAtencionPendienteId("");
    setShowModal(false);

  };
  const handleGuardarAtencion = async () => {
    setErrorGuardar("");

    if (
      !newAttention.date ||
      !newAttention.patientId ||
      newAttention.cieCodes.length === 0
    ) {
      setErrorGuardar(
        "Debes seleccionar la fecha, el paciente y el diagnóstico hospitalario."
      );
      return;
    }

    try {
      setGuardando(true);

      let idAtencion = atencionPendienteId;

      // Crear la atención solamente si todavía no existe
      if (!idAtencion) {
        const [cod_4, ...descripcionHospitalaria] =
          newAttention.cieCodes[0].split(" - ");

        const diagnosticosBucales = newAttention.dentalDiagnoses.map(
          diagnostico => {
            const [codigo, ...descripcion] = diagnostico.split(" - ");

            return {
              descripcion: descripcion.join(" - "),
              codigos: [codigo]
            };
          }
        );

        const datos: NuevaAtencion = {
          id_paciente: newAttention.patientId,
          fecha_atencion: newAttention.date,
          ubicacion: newAttention.location,

          ...(newAttention.insurer
            ? { id_aseguradora: Number(newAttention.insurer) }
            : {}),

          ...(newAttention.professional
            ? { id_profesional: Number(newAttention.professional) }
            : {}),

          observaciones: newAttention.observations,

          diagnostico_hospitalario: {
            descripcion_original: descripcionHospitalaria.join(" - "),
            cod_4
          },

          diagnosticos_bucales: diagnosticosBucales
        };

        const respuesta = await crearAtencion(datos);

        idAtencion = respuesta.id_atencion;
        setAtencionPendienteId(idAtencion);
      }

      // Subir las imágenes seleccionadas
      for (const archivo of imagenesSeleccionadas) {
        await subirImagen(
          archivo,
          newAttention.patientId,
          idAtencion
        );

        // Quitar de la lista solamente la imagen subida correctamente
        setImagenesSeleccionadas(prev =>
          prev.filter(imagen => imagen !== archivo)
        );
      }

      // Todo terminó correctamente
      setAtencionPendienteId("");
      resetNewAttention();

      setPagina(1);
      setRecargar(valor => valor + 1);

    } catch (error) {
      setErrorGuardar(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la atención o subir las imágenes."
      );
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    let activo = true;

    const cargarDiagnosticosBucales = async () => {
      if (!dentalSearch.trim()) {
        setDentalOptions([]);
        return;
      }

      try {
        const respuesta = await listarCie10(dentalSearch, true);

        if (activo) {
          setDentalOptions(respuesta.items);
        }
      } catch (error) {
        console.error("Error al cargar diagnósticos bucales:", error);
      }
    };

    cargarDiagnosticosBucales();

    return () => {
      activo = false;
    };
  }, [dentalSearch]);

  useEffect(() => {
    let activo = true;

    const cargarCie10 = async () => {
      if (!cieSearch.trim()) {
        setCieOptions([]);
        return;
      }

      try {
        const respuesta = await listarCie10(cieSearch, false);

        if (activo) {
          setCieOptions(respuesta.items);
        }
      } catch (error) {
        console.error("Error al cargar CIE-10:", error);
      }
    };

    cargarCie10();

    return () => {
      activo = false;
    };
  }, [cieSearch]);

  useEffect(() => {
    const cargarProfesionales = async () => {
      try {
        const token = await obtenerTokenSesion();
        console.log("Token disponible:", !!token);

        const respuesta = await listarProfesionales();
        console.log("Profesionales recibidos del backend:", respuesta);
        setProfesionales(respuesta.filter(p => p.activo));
      } catch (error) {
        console.error("Error al cargar profesionales:", error);
      }
    };

    cargarProfesionales();
  }, []);

  useEffect(() => {
    const cargarAseguradoras = async () => {
      try {
        const respuesta = await listarAseguradoras();
        setAseguradoras(respuesta.filter(a => a.activo));
      } catch (error) {
        console.error("Error al cargar aseguradoras:", error);
      }
    };

    cargarAseguradoras();
  }, []);

  useEffect(() => {
    let activo = true;

    const cargarPacientes = async () => {
      try {
        const respuesta = await listarPacientes(1, patientSearch);

        if (activo) {
          setPacientesBackend(respuesta.items);
        }
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      }
    };

    cargarPacientes();

    return () => {
      activo = false;
    };
  }, [patientSearch]);

  useEffect(() => {
    const cargarAtenciones = async () => {
      try {
        setCargando(true);
        setErrorCarga("");

        const respuesta = await listarAtenciones({
        q: search.trim() || undefined,
        id_paciente:
          patientFilter !== "all" ? patientFilter : undefined,
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
        page: pagina,
        page_size: 20
      });

        setAtenciones(respuesta.items);
        setTotalAtenciones(respuesta.total);

      } catch (error) {
        setErrorCarga(
          error instanceof Error
            ? error.message
            : "No fue posible cargar las atenciones."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarAtenciones();
  }, [search, patientFilter, fechaDesde, fechaHasta, pagina, recargar]);
  useEffect(() => {
    const cargarDescripciones = async () => {
      const codigos = [
        ...new Set(
          atenciones
            .map(a => a.diagnostico_hospitalario)
            .filter((codigo): codigo is string => Boolean(codigo))
        )
      ];

      try {
        const resultados = await Promise.all(
          codigos.map(async codigo => {
            const respuesta = await listarCie10(codigo, false);

            const diagnostico = respuesta.items.find(
              item => item.cod_4.toUpperCase() === codigo.toUpperCase()
            );

            return {
              codigo,
              descripcion: diagnostico?.descripcion_4 || ""
            };
          })
        );

        setDescripcionesCie(
          Object.fromEntries(
            resultados.map(item => [item.codigo, item.descripcion])
          )
        );
      } catch (error) {
        console.error("Error al consultar descripciones CIE-10:", error);
      }
    };

    if (atenciones.length > 0) {
      cargarDescripciones();
    }
  }, [atenciones]);




  const diagColors: Record<string, string> = {
    "Caries": "badge-blue",
    "Gingivitis": "badge-green",
    "Mucositis": "badge-orange",
    "Resto radicular": "badge-purple",
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1300, width: "100%" }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Atenciones</h1>
          <p className="page-subtitle">Gestión y consulta de Atenciones realizadas</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nueva Atencion
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 280 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por paciente, documento o código CIE-10..." />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
  <label style={{ fontSize: 13, color: "#6b7280" }}>Desde:</label>
  <input
    type="date"
    className="select-field"
    value={fechaDesde}
    onChange={e => {
      setFechaDesde(e.target.value);
      setPagina(1);
    }}
  />

  <label style={{ fontSize: 13, color: "#6b7280" }}>Hasta:</label>
  <input
    type="date"
    className="select-field"
    value={fechaHasta}
    onChange={e => {
      setFechaHasta(e.target.value);
      setPagina(1);
    }}
  />

  {(fechaDesde || fechaHasta) && (
    <button
      className="btn-secondary"
      onClick={() => {
        setFechaDesde("");
        setFechaHasta("");
        setPagina(1);
      }}
    >
      Limpiar
    </button>
  )}
</div>
      </div>

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Aseguradora</th>
                <th>CIE-10</th>
                <th>Diagnósticos bucales</th>
                <th>Profesional</th>
                <th style={{ textAlign: "center" }}>Imágenes</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: 24 }}>
                    Cargando atenciones...
                  </td>
                </tr>
              )}

              {!cargando && errorCarga && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: 24, color: "red" }}>
                    {errorCarga}
                  </td>
                </tr>
              )}

              {!cargando && !errorCarga && atenciones.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: 24 }}>
                    No se encontraron atenciones.
                  </td>
                </tr>
              )}

              {!cargando && !errorCarga && atenciones.map(a => (
                  <tr key={a.id_atencion}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: 11, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4, color: "#4b5563" }}>
                        {a.codigo_atencion}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "#6b7280", whiteSpace: "nowrap" }}>{a.fecha_atencion}</td>
                    <td>
                      <button onClick={() => onNavigate("patient-detail", { patientId: a.paciente.id_paciente })} style={{ background: "none", border: "none", padding: 0, color: "#1a3557", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                        {a.paciente.nombre}
                      </button>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{a.paciente.documento_identidad}</div>
                    </td>
                    <td><span className="badge badge-blue">{a.aseguradora}</span></td>
                    <td>
                      <div style={{ padding: "2px 0" }}>
                        <div style={{
                          fontFamily: "monospace",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#1d4ed8",
                          background: "#dbeafe",
                          padding: "2px 8px",
                          borderRadius: 4,
                          display: "inline-block"
                        }}>
                          {a.diagnostico_hospitalario}
                        </div>

                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                          {a.diagnostico_hospitalario
                            ? descripcionesCie[a.diagnostico_hospitalario] || "Consultando descripción..."
                            : "Sin diagnóstico"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                        {a.diagnosticos_bucales.map(d => (
                          <span key={d} className={`badge ${diagColors[d] || "badge-gray"}`} style={{ fontSize: 11 }}>{d}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "#6b7280" }}>{a.profesional}</td>
                    <td style={{ textAlign: "center", fontWeight: 600, color: "#374151" }}>{a.total_imagenes}</td>
                    <td>
                      <button className="btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => onNavigate("attention-detail", { attentionId: a.id_atencion })}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "14px 20px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Mostrando {atenciones.length} de {totalAtenciones} atenciones</p>
          <div className="pagination">
            <button className="page-btn" disabled>‹</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">›</button>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={resetNewAttention}>
          <div className="modal-content" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1a3557", fontFamily: "'DM Sans', sans-serif" }}>Nueva Atencion</h2>
              <button onClick={resetNewAttention} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Fecha </label>
                  <input
                    className="input-field"
                    type="date"
                    value={newAttention.date}
                    onChange={e =>
                      setNewAttention({
                        ...newAttention,
                        date: e.target.value
                      })
                    }
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Aseguradora</label>
                  <select
                    className="select-field"
                    value={newAttention.insurer}
                    onChange={e =>
                      setNewAttention({
                        ...newAttention,
                        insurer: e.target.value
                      })
                    }
                  >
                    <option value="">Seleccionar aseguradora</option>

                    {aseguradoras.map(aseguradora => (
                      <option
                        key={aseguradora.id}
                        value={aseguradora.id}
                      >
                        {aseguradora.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Paciente
                </label>

                <input
                  className="select-field"
                  placeholder="Buscar por nombre o documento..."
                  value={patientSearch}
                  onChange={e => {
                    setPatientSearch(e.target.value);
                    setNewAttention({ ...newAttention, patientId: "" });
                  }}
                />

                {patientSearch && (
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, maxHeight: 150, overflowY: "auto" }}>
                    {pacientesBackend.map(p => (
                      <div
                        key={p.id_paciente}
                        onClick={() => {
                          setNewAttention({
                            ...newAttention,
                            patientId: p.id_paciente
                          });
                          setPatientSearch(p.nombre);
                        }}
                        style={{ padding: 10, cursor: "pointer", fontSize: 13 }}
                      >
                        {p.nombre} - {p.documento_identidad}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label>Diagnóstico CIE10</label>

                  <input
                    placeholder="Buscar código o diagnóstico..."
                    value={cieSearch}
                    onChange={e => setCieSearch(e.target.value)}
                    style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
                  />

                  {cieSearch && (
                    <div style={{ maxHeight: 130, overflowY: "auto", border: "1px solid #ddd", borderRadius: 6 }}>
                      {cieOptions.map(option => (
                        <div
                          key={option.cod_4}
                          onClick={() => {
                            const codigo = `${option.cod_4} - ${option.descripcion_4}`;

                            if (!newAttention.cieCodes.includes(codigo)) {
                              setNewAttention({
                                ...newAttention,
                                cieCodes: [codigo]
                              });
                            }

                            setCieSearch("");
                          }}
                          style={{ padding: 10, cursor: "pointer" }}
                        >
                          <strong>{option.cod_4}</strong> - {option.descripcion_4}
                        </div>
                      ))}
                    </div>
                  )}

                  {newAttention.cieCodes.map(code => (
                    <div key={code} style={{ display: "flex", justifyContent: "space-between", padding: 6 }}>
                      <span>{code}</span>
                      <button type="button" onClick={() => setNewAttention({
                        ...newAttention,
                        cieCodes: newAttention.cieCodes.filter(c => c !== code)
                      })}>×</button>
                    </div>
                  ))}
                </div>
                <div>
                  <label>Diagnóstico Bucal</label>

                  <input
                    placeholder="Buscar diagnóstico bucal..."
                    value={dentalSearch}
                    onChange={e => setDentalSearch(e.target.value)}
                    style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
                  />

                  {dentalSearch && (
                    <div style={{ maxHeight: 130, overflowY: "auto", border: "1px solid #ddd", borderRadius: 6 }}>
                      {dentalOptions.map(option => (
                        <div
                          key={option.cod_4}
                          onClick={() => {
                            const codigo = `${option.cod_4} - ${option.descripcion_4}`;

                            if (!newAttention.dentalDiagnoses.includes(codigo)) {
                              setNewAttention({
                                ...newAttention,
                                dentalDiagnoses: [
                                  ...newAttention.dentalDiagnoses,
                                  codigo
                                ]
                              });
                            }

                            setDentalSearch("");
                          }}
                          style={{ padding: 10, cursor: "pointer" }}
                        >
                          <strong>{option.cod_4}</strong> - {option.descripcion_4}
                        </div>
                      ))}
                    </div>
                  )}

                  {newAttention.dentalDiagnoses.map(diagnosis => (
                    <div key={diagnosis} style={{ display: "flex", justifyContent: "space-between", padding: 6 }}>
                      <span>{diagnosis}</span>
                      <button type="button" onClick={() => setNewAttention({
                        ...newAttention,
                        dentalDiagnoses: newAttention.dentalDiagnoses.filter(d => d !== diagnosis)
                      })}>×</button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Profesional</label>
                <select
                  className="select-field"
                  value={newAttention.professional}
                  onChange={e =>
                    setNewAttention({
                      ...newAttention,
                      professional: e.target.value
                    })
                  }
                >
                  <option value="">Seleccionar profesional</option>

                  {profesionales.map(profesional => (
                    <option
                      key={profesional.id_profesional}
                      value={profesional.id_profesional}
                    >
                      {profesional.nombre}
                      {profesional.especializacion
                        ? ` - ${profesional.especializacion}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div>
                  <label>Ubicación</label>
                  <input
                    className="input-field"
                    value={newAttention.location}
                    onChange={e =>
                      setNewAttention({
                        ...newAttention,
                        location: e.target.value
                      })
                    }
                    placeholder="Ej. Bloque, piso y habitación..."
                  />
                </div>
                <label>Observaciones</label>
                <textarea
                  className="input-field"
                  value={newAttention.observations}
                  onChange={e =>
                    setNewAttention({ ...newAttention, observations: e.target.value })
                  }
                  placeholder="Escribe las observaciones..."
                />
              </div>
              <div>
                <input
                  ref={inputImagenRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={e => {
                    const archivos = Array.from(e.target.files || []);

                    setImagenesSeleccionadas(prev => [
                      ...prev,
                      ...archivos
                    ]);

                    e.target.value = "";
                  }}
                />

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => inputImagenRef.current?.click()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Seleccionar imágenes
                </button>

                {imagenesSeleccionadas.map((archivo, indice) => (
                  <div
                    key={`${archivo.name}-${indice}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 8,
                      fontSize: 12
                    }}
                  >
                    <span>{archivo.name}</span>

                    <button
                      type="button"
                      onClick={() =>
                        setImagenesSeleccionadas(prev =>
                          prev.filter((_, i) => i !== indice)
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {errorGuardar && (
                <p style={{ color: "red", fontSize: 13 }}>
                  {errorGuardar}
                </p>
              )}
              <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
                <button
                  className="btn-primary"
                  onClick={handleGuardarAtencion}
                  disabled={guardando}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {guardando ? "Guardando..." : "Guardar Atención"}
                </button>
                <button
                  className="btn-secondary"
                  onClick={resetNewAttention}
                  style={{ flex: 1, justifyContent: "center" }}
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
