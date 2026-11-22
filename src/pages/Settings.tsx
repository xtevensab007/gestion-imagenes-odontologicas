import { useEffect, useState } from "react";
import {
  obtenerMiProfesional,
  listarProfesionalesGestion,
  crearProfesionalCuenta,
  actualizarProfesional,
  cambiarPasswordProfesional,
  cambiarRolProfesional,
  type ProfesionalBackend,
  type ProfesionalGestion,
} from "../services/profesionalesService";
import {
  listarAuditoria,
  type EventoAuditoria,
} from "../services/auditoriaService";
import {
  listarAseguradoras,
  crearAseguradora,
  actualizarAseguradora,
  eliminarAseguradora,
  type AseguradoraBackend,
} from "../services/aseguradorasService";

export default function Settings() {
  const [profesional, setProfesional] = useState<ProfesionalBackend | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [errorPerfil, setErrorPerfil] = useState("");
  const [eventosAuditoria, setEventosAuditoria] = useState<EventoAuditoria[]>([]);
  const [cargandoAuditoria, setCargandoAuditoria] = useState(false);
  const [errorAuditoria, setErrorAuditoria] = useState("");
  const [mostrarAuditoria, setMostrarAuditoria] = useState(false);
  const [paginaAuditoria, setPaginaAuditoria] = useState(1);
  const [totalAuditoria, setTotalAuditoria] = useState(0);
  const registrosPorPagina = 20;
  const [mostrarSistema, setMostrarSistema] = useState(false);
  const [esAdministrador, setEsAdministrador] = useState(false);
  const [profesionalesGestion, setProfesionalesGestion] = useState<ProfesionalGestion[]>([]);
  const [mostrarGestion, setMostrarGestion] = useState(false);
  const [cargandoGestion, setCargandoGestion] = useState(false);
  const [errorGestion, setErrorGestion] = useState("");
  const [mostrarFormularioProfesional, setMostrarFormularioProfesional] = useState(false);
  const [guardandoProfesional, setGuardandoProfesional] = useState(false);
  const [mensajeProfesional, setMensajeProfesional] = useState("");
  const [errorProfesional, setErrorProfesional] = useState("");
  const [mostrarAseguradoras, setMostrarAseguradoras] = useState(false);
  const [aseguradoras, setAseguradoras] = useState<AseguradoraBackend[]>([]);
  const [cargandoAseguradoras, setCargandoAseguradoras] = useState(false);
  const [errorAseguradoras, setErrorAseguradoras] = useState("");

  const [nuevoNombreAseguradora, setNuevoNombreAseguradora] = useState("");
  const [guardandoAseguradora, setGuardandoAseguradora] = useState(false);
  const [actualizandoAseguradora, setActualizandoAseguradora] = useState(false);

  const [aseguradoraEditando, setAseguradoraEditando] = useState<number | null>(null);
  const [nombreAseguradoraEditando, setNombreAseguradoraEditando] = useState("");

  const [profesionalEditando, setProfesionalEditando] =
    useState<ProfesionalGestion | null>(null);

  const [datosEdicion, setDatosEdicion] = useState({
    nombre: "",
    identificacion: "",
    correo: "",
    especializacion: "",
    rol: "odontologo" as "odontologo" | "administrador",
    activo: true,
    password: "",
  });

  const [nuevoProfesional, setNuevoProfesional] = useState({
    nombre: "",
    identificacion: "",
    correo: "",
    especializacion: "",
    password: "",
    rol: "odontologo" as "odontologo" | "administrador",
  });
  const sections = [
    {
      title: "Perfil de usuario",
      desc: "Consultar los datos del profesional que inició sesión",
      icon: "👤",
    },
    {
      title: "Gestión de profesionales",
      desc: "Crear y administrar profesionales del sistema",
      icon: "👥",
    },
    {
      title: "Gestión de aseguradoras",
      desc: "Registrar, consultar, editar e inactivar aseguradoras",
      icon: "🏥",
    },
    {
      title: "Auditoría",
      desc: "Registro de actividades y accesos al sistema",
      icon: "📋",
    },
    {
      title: "Sistema",
      desc: "Versión del sistema y soporte técnico",
      icon: "⚙️",
    },
  ];
  useEffect(() => {
    async function cargarPerfil() {
      try {
        setCargandoPerfil(true);
        setErrorPerfil("");

        const respuesta = await obtenerMiProfesional();
        setProfesional(respuesta);
      } catch (error) {
        setErrorPerfil(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el perfil."
        );
      } finally {
        setCargandoPerfil(false);
      }
    }

    cargarPerfil();
  }, []);

  async function cargarAuditoria(pagina = paginaAuditoria) {
    try {
      setCargandoAuditoria(true);
      setErrorAuditoria("");
      setMostrarAuditoria(true);

      const respuesta = await listarAuditoria({
        page: paginaAuditoria,
        page_size: registrosPorPagina,
      });
      setEventosAuditoria(respuesta.items);
      setTotalAuditoria(respuesta.total);
      setPaginaAuditoria(pagina);

      setEventosAuditoria(respuesta.items);
      setTotalAuditoria(respuesta.total);

      setEventosAuditoria(respuesta.items);
    } catch (error) {
      setErrorAuditoria(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la auditoría."
      );
    } finally {
      setCargandoAuditoria(false);
    }
  }

  async function cargarGestion() {
    try {
      setCargandoGestion(true);
      setErrorGestion("");
      setMostrarGestion(true);

      const respuesta = await listarProfesionalesGestion();
      setProfesionalesGestion(respuesta);
    } catch (error) {
      setErrorGestion(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la gestión de profesionales."
      );
    } finally {
      setCargandoGestion(false);
    }
  }
  async function cargarAseguradoras() {
    try {
      setCargandoAseguradoras(true);
      setErrorAseguradoras("");

      const respuesta = await listarAseguradoras(true);
      setAseguradoras(respuesta);
    } catch (error) {
      setErrorAseguradoras(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las aseguradoras."
      );
    } finally {
      setCargandoAseguradoras(false);
    }
  }

  
async function handleCrearAseguradora() {
  setMensajeProfesional("");
  setErrorProfesional("");

  if (!nuevoNombreAseguradora.trim()) {
    setErrorProfesional("Ingresa el nombre de la aseguradora.");
    return;
  }

  try {
    setGuardandoAseguradora(true);

    await crearAseguradora(nuevoNombreAseguradora.trim());

    setNuevoNombreAseguradora("");
    await cargarAseguradoras();

    setMensajeProfesional("Aseguradora registrada correctamente.");
  } catch (error) {
    setErrorProfesional(
      error instanceof Error
        ? error.message
        : "No se pudo registrar la aseguradora."
    );
  } finally {
    setGuardandoAseguradora(false);
  }
}

  
async function handleActualizarAseguradora() {
  setMensajeProfesional("");
  setErrorProfesional("");

  if (!nombreAseguradoraEditando.trim()) {
    setErrorProfesional("Ingresa el nombre de la aseguradora.");
    return;
  }

  if (aseguradoraEditando === null) return;

  try {
    setActualizandoAseguradora(true);

    await actualizarAseguradora(aseguradoraEditando, {
      nombre: nombreAseguradoraEditando.trim(),
    });

    setAseguradoraEditando(null);
    setNombreAseguradoraEditando("");

    await cargarAseguradoras();

    setMensajeProfesional("Aseguradora actualizada correctamente.");
  } catch (error) {
    setErrorProfesional(
      error instanceof Error
        ? error.message
        : "No se pudo actualizar la aseguradora."
    );
  } finally {
    setActualizandoAseguradora(false);
  }
}

  
async function handleInactivarAseguradora(id: number) {
  setMensajeProfesional("");
  setErrorProfesional("");

  try {
    await eliminarAseguradora(id);
    await cargarAseguradoras();

    setMensajeProfesional("Aseguradora inactivada correctamente.");
  } catch (error) {
    setErrorProfesional(
      error instanceof Error
        ? error.message
        : "No se pudo inactivar la aseguradora."
    );
  }
}

  
async function handleReactivarAseguradora(id: number) {
  setMensajeProfesional("");
  setErrorProfesional("");

  try {
    await actualizarAseguradora(id, {
      activo: true,
    });

    await cargarAseguradoras();

    setMensajeProfesional("Aseguradora reactivada correctamente.");
  } catch (error) {
    setErrorProfesional(
      error instanceof Error
        ? error.message
        : "No se pudo reactivar la aseguradora."
    );
  }
}


  function validarDatosProfesional(
    datos: {
      nombre: string;
      identificacion?: string;
      correo: string;
      especializacion: string;
      password?: string;
    },
    validarIdentificacion = false
  ): string {
    const nombre = datos.nombre.trim();
    const identificacion = datos.identificacion?.trim() || "";
    const correo = datos.correo.trim();
    const especializacion = datos.especializacion.trim();
    const password = datos.password || "";

    if (!nombre) {
      return "El nombre completo es obligatorio.";
    }

    if (!/^[\p{L}]+(?:\s+[\p{L}]+)*$/u.test(nombre)) {
      return "El nombre solo puede contener letras y espacios.";
    }

    if (validarIdentificacion && !identificacion) {
      return "La identificación es obligatoria.";
    }

    if (validarIdentificacion && !/^\d+$/.test(identificacion)) {
      return "La identificación solo puede contener números.";
    }

    if (!correo) {
      return "El correo electrónico es obligatorio.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return "Ingresa un correo electrónico válido.";
    }

    if (
      especializacion &&
      !/^[\p{L}\s.,()/-]+$/u.test(especializacion)
    ) {
      return "La especialización contiene caracteres no permitidos.";
    }

    if (password && password.trim().length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }

    return "";
  }

  async function guardarNuevoProfesional() {
    try {
      setGuardandoProfesional(true);
      setMensajeProfesional("");
      setErrorProfesional("");

      if (!nuevoProfesional.password.trim()) {
        setErrorProfesional("La contraseña es obligatoria.");
        return;
      }

      const errorValidacion = validarDatosProfesional(nuevoProfesional, true);

      if (errorValidacion) {
        setErrorProfesional(errorValidacion);
        return;
      }

      await crearProfesionalCuenta(nuevoProfesional);

      setMensajeProfesional("Profesional creado correctamente.");

      setNuevoProfesional({
        nombre: "",
        identificacion: "",
        correo: "",
        especializacion: "",
        password: "",
        rol: "odontologo",
      });

      setMostrarFormularioProfesional(false);
      await cargarGestion();
    } catch (error) {
      setErrorProfesional(
        error instanceof Error
          ? error.message
          : "No se pudo crear el profesional."
      );
    } finally {
      setGuardandoProfesional(false);
    }
  }


  async function guardarEdicionProfesional() {
    if (!profesionalEditando) return;

    try {
      setErrorProfesional("");
      setMensajeProfesional("");
      const errorValidacion = validarDatosProfesional(datosEdicion);

      if (errorValidacion) {
        setErrorProfesional(errorValidacion);
        return;
      }

      await actualizarProfesional(
        profesionalEditando.id_profesional,
        {
          nombre: datosEdicion.nombre,
          correo: datosEdicion.correo,
          especializacion: datosEdicion.especializacion,
          activo: datosEdicion.activo,
        }
      );

      if (
        profesionalEditando.tiene_cuenta &&
        datosEdicion.rol !== profesionalEditando.rol
      ) {
        await cambiarRolProfesional(
          profesionalEditando.id_profesional,
          datosEdicion.rol
        );
      }

      if (datosEdicion.password.trim()) {
        if (!profesionalEditando.tiene_cuenta) {
          throw new Error("Este profesional no tiene una cuenta de acceso.");
        }

        if (datosEdicion.password.trim().length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres.");
        }

        await cambiarPasswordProfesional(
          profesionalEditando.id_profesional,
          datosEdicion.password
        );
      }

      setMensajeProfesional("Profesional actualizado correctamente.");
      setProfesionalEditando(null);

      await cargarGestion();
    } catch (error) {
      setErrorProfesional(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el profesional."
      );

      await cargarGestion();
    }
  }

  function abrirEdicionProfesional(profesional: ProfesionalGestion) {
    setProfesionalEditando(profesional);

    setDatosEdicion({
      nombre: profesional.nombre || "",
      identificacion: profesional.identificacion || "",
      correo: profesional.correo || "",
      especializacion: profesional.especializacion || "",
      rol: profesional.rol === "administrador"
        ? "administrador"
        : "odontologo",
      activo: profesional.activo,
      password: "",
    });

    setMensajeProfesional("");
    setErrorProfesional("");
  }

  useEffect(() => {
    async function verificarAdministrador() {
      try {
        const respuesta = await listarProfesionalesGestion();
        setProfesionalesGestion(respuesta);
        setEsAdministrador(true);
      } catch {
        setEsAdministrador(false);
      }
    }

    verificarAdministrador();
  }, []);

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200, width: "100%", boxSizing: "border-box" }}>
      <div className="page-header">
        <h1 className="page-title">Configuración</h1>
        <p className="page-subtitle">
          Ajustes del sistema y preferencias de usuario
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {sections
          .filter(
            (section) =>
              esAdministrador ||
              ![
                "Gestión de profesionales",
                "Gestión de aseguradoras",
                "Auditoría",
              ].includes(section.title)
          )
          .map((section) => (
            <div
              key={section.title}
              className="card"
              onClick={() => {
                if (section.title === "Auditoría") {
                  setMostrarGestion(false);
                  setMostrarSistema(false);
                  cargarAuditoria(1);
                }

                if (section.title === "Sistema") {
                  setMostrarAuditoria(false);
                  setMostrarGestion(false);
                  setMostrarSistema(true);
                }

                if (section.title === "Gestión de profesionales") {
  setMostrarAuditoria(false);
  setMostrarSistema(false);
  setMostrarAseguradoras(false);

  setAseguradoraEditando(null);
  setNombreAseguradoraEditando("");

  cargarGestion();
}
                if (section.title === "Gestión de aseguradoras") {
  setMostrarAuditoria(false);
  setMostrarGestion(false);
  setMostrarSistema(false);

  setProfesionalEditando(null);
  setMostrarFormularioProfesional(false);

  setAseguradoraEditando(null);
  setNombreAseguradoraEditando("");

  setMostrarAseguradoras(true);
  cargarAseguradoras();
}
              }}
              style={{
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {section.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {section.title}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                  {section.desc}
                </div>
              </div>
              {section.title === "Perfil de usuario" && (
                <div style={{ fontSize: 12, marginTop: 10, color: "#6b7280" }}>
                  {cargandoPerfil ? (
                    "Cargando información..."
                  ) : errorPerfil ? (
                    <span style={{ color: "#dc2626" }}>{errorPerfil}</span>
                  ) : profesional ? (
                    <>
                      <div>Nombre: {profesional.nombre}</div>
                      <div>Especialización: {profesional.especializacion || "No especificada"}</div>
                      <div>
                        Estado: {profesional.activo ? "Activo" : "Inactivo"}
                      </div>
                      <div>ID profesional: {profesional.id_profesional}</div>
                    </>
                  ) : null}
                </div>
              )}

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          ))}


        {mostrarAuditoria && (
          <div className="card" style={{ padding: "22px", marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>Registro de auditoría</h3>
                <p style={{ color: "#64748b", margin: "6px 0 0" }}>
                  Total de eventos: {eventosAuditoria.length}
                </p>
              </div>

              <button
                className="btn-secondary"
                onClick={() => setMostrarAuditoria(false)}
              >
                Cerrar
              </button>
            </div>

            {cargandoAuditoria && <p>Cargando registros de auditoría...</p>}

            {errorAuditoria && (
              <p style={{ color: "#dc2626" }}>{errorAuditoria}</p>
            )}

            {!cargandoAuditoria && !errorAuditoria && eventosAuditoria.length === 0 && (
              <p>No hay registros de auditoría disponibles.</p>
            )}

            {!cargandoAuditoria && eventosAuditoria.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Fecha y hora", "Acción", "Entidad", "Profesional", "Correo", "IP"].map(
                        (columna) => (
                          <th
                            key={columna}
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              borderBottom: "1px solid #e2e8f0",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {columna}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {eventosAuditoria.map((evento) => (
                      <tr key={evento.id_evento}>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                          {new Date(evento.fecha_hora).toLocaleString("es-CO")}
                        </td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                          {evento.accion}
                        </td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                          {evento.entidad_afectada}
                        </td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                          {evento.profesional_nombre || "No disponible"}
                        </td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                          {evento.email || "No disponible"}
                        </td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                          {evento.ip_origen || "No disponible"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 20,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#64748b" }}>
                    Página {paginaAuditoria} de {Math.max(1, Math.ceil(totalAuditoria / registrosPorPagina))}
                    {" · "}
                    {totalAuditoria} registros
                  </span>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className="btn-secondary"
                      disabled={paginaAuditoria <= 1 || cargandoAuditoria}
                      onClick={() => cargarAuditoria(paginaAuditoria - 1)}
                    >
                      Anterior
                    </button>

                    <button
                      className="btn-secondary"
                      disabled={
                        paginaAuditoria >= Math.ceil(totalAuditoria / registrosPorPagina) ||
                        cargandoAuditoria
                      }
                      onClick={() => cargarAuditoria(paginaAuditoria + 1)}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>

            )}
          </div>
        )}
        {mostrarGestion && (
          <div className="card" style={{ padding: 22, marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>Gestión de profesionales</h3>
                <p style={{ color: "#64748b", margin: "6px 0 0" }}>
                  Profesionales registrados: {profesionalesGestion.length}
                </p>
              </div>

              <button
                className="btn-secondary"
                onClick={() => setMostrarGestion(false)}
              >
                Cerrar
              </button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <button
                className="btn-primary"
                onClick={() => {
                  setMostrarFormularioProfesional(!mostrarFormularioProfesional);
                  setMensajeProfesional("");
                  setErrorProfesional("");
                }}
              >
                {mostrarFormularioProfesional ? "Cancelar" : "+ Crear profesional"}
              </button>
            </div>


            {mostrarFormularioProfesional && (
              <div
                className="card"
                style={{
                  padding: 0,
                  marginBottom: 24,
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {/* Encabezado */}
                <div
                  style={{
                    padding: "22px 28px",
                    borderBottom: "1px solid #f3f4f6",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#1a3557",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Registrar nuevo profesional
                    </h2>
                    <p style={{ margin: "5px 0 0", fontSize: 13, color: "#64748b" }}>
                      Completa la información para registrar un profesional y crear su cuenta de acceso.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setMostrarFormularioProfesional(false);
                      setErrorProfesional("");
                      setMensajeProfesional("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Campos */}
                <div
                  style={{
                    padding: "24px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 16px", color: "#1a3557", fontSize: 14 }}>
                      Información personal
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                          Nombre completo *
                        </label>
                        <input
                          className="input-field"
                          type="text"
                          name="nombreProfesional"
                          autoComplete="off"
                          placeholder="Nombre y apellidos"
                          value={nuevoProfesional.nombre}
                          onChange={(e) =>
                            setNuevoProfesional({
                              ...nuevoProfesional,
                              nombre: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                          Identificación *
                        </label>
                        <input
                          className="input-field"
                          type="text"
                          name="identificacionProfesional"
                          autoComplete="off"
                          placeholder="Número de documento"
                          value={nuevoProfesional.identificacion}
                          onChange={(e) =>
                            setNuevoProfesional({
                              ...nuevoProfesional,
                              identificacion: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                          Correo electrónico *
                        </label>
                        <input
                          className="input-field"
                          type="email"
                          name="correoProfesional"
                          autoComplete="off"
                          placeholder="correo@ejemplo.com"
                          value={nuevoProfesional.correo}
                          onChange={(e) =>
                            setNuevoProfesional({
                              ...nuevoProfesional,
                              correo: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                          Especialización
                        </label>
                        <input
                          className="input-field"
                          type="text"
                          name="especializacionProfesional"
                          autoComplete="off"
                          placeholder="Especialización"
                          value={nuevoProfesional.especializacion}
                          onChange={(e) =>
                            setNuevoProfesional({
                              ...nuevoProfesional,
                              especializacion: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20 }}>
                    <h4 style={{ margin: "0 0 16px", color: "#1a3557", fontSize: 14 }}>
                      Configuración de cuenta
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                          Contraseña *
                        </label>
                        <input
                          className="input-field"
                          type="password"
                          name="passwordProfesional"
                          autoComplete="new-password"
                          placeholder="Ingrese una contraseña"
                          value={nuevoProfesional.password}
                          onChange={(e) =>
                            setNuevoProfesional({
                              ...nuevoProfesional,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                          Rol *
                        </label>
                        <select
                          className="select-field"
                          name="rolProfesional"
                          value={nuevoProfesional.rol}
                          onChange={(e) =>
                            setNuevoProfesional({
                              ...nuevoProfesional,
                              rol: e.target.value as "odontologo" | "administrador",
                            })
                          }
                        >
                          <option value="odontologo">Odontólogo</option>
                          <option value="administrador">Administrador</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 12,
                      paddingTop: 16,
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <button
                      className="btn-secondary"
                      disabled={guardandoProfesional}
                      onClick={() => {
                        setMostrarFormularioProfesional(false);
                        setErrorProfesional("");
                        setMensajeProfesional("");
                      }}
                    >
                      Cancelar
                    </button>

                    <button
                      className="btn-primary"
                      onClick={guardarNuevoProfesional}
                      disabled={guardandoProfesional}
                      style={{ justifyContent: "center" }}
                    >
                      {guardandoProfesional ? "Guardando..." : "Guardar profesional"}
                    </button>
                  </div>

                  {mensajeProfesional && (
                    <p style={{ color: "#16a34a", margin: 0 }}>
                      {mensajeProfesional}
                    </p>
                  )}

                  {errorProfesional && (
                    <p style={{ color: "#dc2626", margin: 0 }}>
                      {errorProfesional}
                    </p>
                  )}
                </div>
              </div>
            )}


            {cargandoGestion && <p>Cargando profesionales...</p>}

            {errorGestion && (
              <p style={{ color: "#dc2626" }}>{errorGestion}</p>
            )}

            {!cargandoGestion && !errorGestion && (
              profesionalesGestion.length === 0 ? (
                <p>No hay profesionales registrados.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {[
                          "Nombre",
                          "Identificación",
                          "Correo",
                          "Especialización",
                          "Rol",
                          "Estado",
                          
                          "Acciones",
                        ].map((columna) => (
                          <th
                            key={columna}
                            style={{
                              padding: 12,
                              textAlign: "left",
                              borderBottom: "1px solid #e2e8f0",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {columna}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {profesionalesGestion.map((profesional) => (
                        <tr key={profesional.id_profesional}>
                          <td style={{ padding: 12 }}>
                            {profesional.nombre}
                          </td>
                          <td style={{ padding: 12 }}>
                            {profesional.identificacion || "—"}
                          </td>
                          <td style={{ padding: 12 }}>
                            {profesional.correo || "—"}
                          </td>
                          <td style={{ padding: 12 }}>
                            {profesional.especializacion || "—"}
                          </td>
                          <td style={{ padding: 12 }}>
                            {profesional.rol || "Sin cuenta"}
                          </td>
                          <td style={{ padding: 12 }}>
                            {profesional.activo ? "Activo" : "Inactivo"}
                          </td>
                          
                          <td style={{ padding: 12 }}>
                            <button
                              className="btn-secondary"
                              onClick={() => abrirEdicionProfesional(profesional)}
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        )}
        
{mostrarAseguradoras && (
  <div
    className="card"
    style={{
      padding: 0,
      marginTop: 24,
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      overflow: "hidden",
    }}
  >
    {/* Encabezado */}
    <div
      style={{
        padding: "22px 28px",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: "#1a3557",
          }}
        >
          Gestión de aseguradoras
        </h3>

        <p
          style={{
            margin: "6px 0 0",
            color: "#64748b",
            fontSize: 13,
          }}
        >
          Registra, consulta y administra las aseguradoras del sistema.
        </p>
      </div>

      <button
  className="btn-secondary"
  onClick={() => {
    setMostrarAseguradoras(false);
    setAseguradoraEditando(null);
    setNombreAseguradoraEditando("");
  }}
>
  Cerrar
</button>
    </div>

    <div style={{ padding: 28 }}>

      {/* Formulario de registro */}
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          marginBottom: 28,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h4
            style={{
              margin: 0,
              color: "#1a3557",
              fontSize: 15,
            }}
          >
            Registrar aseguradora
          </h4>
        </div>

        <div style={{ padding: 20 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#334155",
            }}
          >
            Nombre de la aseguradora
          </label>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              className="input-field"
              placeholder="Ej. SURA"
              value={nuevoNombreAseguradora}
              onChange={(e) =>
                setNuevoNombreAseguradora(e.target.value)
              }
              disabled={guardandoAseguradora}
              style={{
                flex: 1,
                minWidth: 220,
              }}
            />

            <button
              className="btn-primary"
              onClick={handleCrearAseguradora}
              disabled={guardandoAseguradora}
            >
              {guardandoAseguradora
                ? "Guardando..."
                : "+ Registrar aseguradora"}
            </button>
          </div>
        </div>
      </div>

      {/* Listado */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <h4
            style={{
              margin: 0,
              color: "#1a3557",
              fontSize: 16,
            }}
          >
            Listado de aseguradoras
          </h4>

          <span
            style={{
              fontSize: 13,
              color: "#64748b",
            }}
          >
            Total: {aseguradoras.length}
          </span>
        </div>

        {cargandoAseguradoras && (
          <p style={{ color: "#64748b" }}>
            Cargando aseguradoras...
          </p>
        )}

        {!cargandoAseguradoras && aseguradoras.length === 0 && (
          <p style={{ color: "#64748b" }}>
            No hay aseguradoras registradas.
          </p>
        )}

        {aseguradoras.length > 0 && (
          <div
            style={{
              overflowX: "auto",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{
                    padding: 14,
                    color: "#475569",
                    fontSize: 13,
                    borderBottom: "1px solid #e2e8f0",
                  }}>
                    Nombre
                  </th>

                  <th style={{
                    padding: 14,
                    color: "#475569",
                    fontSize: 13,
                    borderBottom: "1px solid #e2e8f0",
                  }}>
                    Estado
                  </th>

                  <th style={{
                    padding: 14,
                    color: "#475569",
                    fontSize: 13,
                    borderBottom: "1px solid #e2e8f0",
                  }}>
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {aseguradoras.map((aseguradora) => (
                  <tr key={aseguradora.id}>
                    <td style={{
                      padding: 14,
                      borderBottom: "1px solid #e2e8f0",
                      color: "#334155",
                    }}>
                      {aseguradora.nombre}
                    </td>

                    <td style={{
                      padding: 14,
                      borderBottom: "1px solid #e2e8f0",
                    }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 11px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: aseguradora.activo
                            ? "#dcfce7"
                            : "#fee2e2",
                          color: aseguradora.activo
                            ? "#166534"
                            : "#991b1b",
                        }}
                      >
                        {aseguradora.activo ? "Activa" : "Inactiva"}
                      </span>
                    </td>

                    <td style={{
                      padding: 14,
                      borderBottom: "1px solid #e2e8f0",
                      whiteSpace: "nowrap",
                    }}>
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setAseguradoraEditando(aseguradora.id);
                          setNombreAseguradoraEditando(
                            aseguradora.nombre
                          );
                        }}
                        disabled={!aseguradora.activo}
                      >
                        Editar
                      </button>

                      {aseguradora.activo ? (
                        <button
                          className="btn-secondary"
                          style={{ marginLeft: 8 }}
                          onClick={() =>
                            handleInactivarAseguradora(aseguradora.id)
                          }
                        >
                          Inactivar
                        </button>
                      ) : (
                        <button
                          className="btn-primary"
                          style={{ marginLeft: 8 }}
                          onClick={() =>
                            handleReactivarAseguradora(aseguradora.id)
                          }
                        >
                          Reactivar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edición */}
      {aseguradoraEditando !== null && (
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            marginTop: 24,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <h4
              style={{
                margin: 0,
                color: "#1a3557",
                fontSize: 15,
              }}
            >
              Editar aseguradora
            </h4>
          </div>

          <div style={{ padding: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#334155",
              }}
            >
              Nombre de la aseguradora
            </label>

            <input
              type="text"
              className="input-field"
              value={nombreAseguradoraEditando}
              onChange={(e) =>
                setNombreAseguradoraEditando(e.target.value)
              }
              placeholder="Nombre de la aseguradora"
              style={{ width: "100%" }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                className="btn-secondary"
                onClick={() => {
                  setAseguradoraEditando(null);
                  setNombreAseguradoraEditando("");
                }}
              >
                Cancelar
              </button>

              <button
                className="btn-primary"
                onClick={handleActualizarAseguradora}
                disabled={actualizandoAseguradora}
              >
                {actualizandoAseguradora
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
{mensajeProfesional && (
  <p style={{ color: "#16a34a", marginTop: 16 }}>
    {mensajeProfesional}
  </p>
)}

{errorProfesional && (
  <p style={{ color: "#dc2626", marginTop: 16 }}>
    {errorProfesional}
  </p>
)}
      {errorAseguradoras && (
        <p
          style={{
            color: "#dc2626",
            marginTop: 16,
          }}
        >
          {errorAseguradoras}
        </p>
      )}
    </div>
  </div>
)}


        {profesionalEditando && (
          <div
            className="card"
            style={{
              padding: 0,
              marginBottom: 24,
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Encabezado */}
            <div
              style={{
                padding: "22px 28px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1a3557",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Editar profesional
                </h2>
                <p style={{ margin: "5px 0 0", fontSize: 13, color: "#64748b" }}>
                  Modifica la información y los datos de acceso del profesional.
                </p>
              </div>

              <button
                onClick={() => {
                  setProfesionalEditando(null);
                  setErrorProfesional("");
                  setMensajeProfesional("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Contenido */}
            <div
              style={{
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div>
                <h4 style={{ margin: "0 0 16px", color: "#1a3557", fontSize: 14 }}>
                  Información personal
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                      Nombre completo *
                    </label>
                    <input
                      className="input-field"
                      type="text"
                      placeholder="Nombre y apellidos"
                      value={datosEdicion.nombre}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, nombre: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                      Identificación
                    </label>
                    <input
                      className="input-field"
                      type="text"
                      value={datosEdicion.identificacion}
                      disabled
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                      Correo electrónico
                    </label>
                    <input
                      className="input-field"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={datosEdicion.correo}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, correo: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                      Especialización
                    </label>
                    <input
                      className="input-field"
                      type="text"
                      placeholder="Especialización"
                      value={datosEdicion.especializacion}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          especializacion: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20 }}>
                <h4 style={{ margin: "0 0 16px", color: "#1a3557", fontSize: 14 }}>
                  Configuración de cuenta
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                      Rol
                    </label>
                    <select
                      className="select-field"
                      value={datosEdicion.rol}
                      disabled={!profesionalEditando.tiene_cuenta}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          rol: e.target.value as "odontologo" | "administrador",
                        })
                      }
                    >
                      <option value="odontologo">Odontólogo</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                      Estado
                    </label>
                    <select
                      className="select-field"
                      value={datosEdicion.activo ? "true" : "false"}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          activo: e.target.value === "true",
                        })
                      }
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                      Nueva contraseña (opcional)
                    </label>
                    <input
                      className="input-field"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Dejar vacío para conservar la contraseña actual"
                      value={datosEdicion.password}
                      disabled={!profesionalEditando.tiene_cuenta}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {!profesionalEditando.tiene_cuenta && (
                  <p style={{ color: "#64748b", fontSize: 13, marginBottom: 0 }}>
                    Este profesional no tiene cuenta de acceso. No se pueden modificar su rol ni contraseña.
                  </p>
                )}
              </div>

              {/* Botones */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  paddingTop: 16,
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setProfesionalEditando(null);
                    setErrorProfesional("");
                    setMensajeProfesional("");
                  }}
                >
                  Cancelar
                </button>

                <button
                  className="btn-primary"
                  onClick={guardarEdicionProfesional}
                  style={{ justifyContent: "center" }}
                >
                  Guardar cambios
                </button>
              </div>
              {mensajeProfesional && (
                <p style={{ color: "#16a34a" }}>{mensajeProfesional}</p>
              )}

              {errorProfesional && (
                <p style={{ color: "#dc2626" }}>{errorProfesional}</p>
              )}
            </div>

          </div>
        )}



        {mostrarSistema && (
          <div className="card" style={{ padding: 22, marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Sistema y soporte técnico</h3>

              <button
                className="btn-secondary"
                onClick={() => setMostrarSistema(false)}
              >
                Cerrar
              </button>
            </div>

            <h4 style={{ marginTop: 24 }}>Información del sistema</h4>

            <div style={{ fontSize: 14, lineHeight: 2 }}>
              <div><strong>Aplicación:</strong> Sistema de Gestión Odontológica</div>
              <div><strong>Institución:</strong> Hospital Alma Mater</div>
              <div><strong>Versión:</strong> 1.0.0</div>
              <div><strong>Frontend:</strong> React + TypeScript + Vite</div>
              <div><strong>Backend:</strong> FastAPI</div>
              <div><strong>Base de datos:</strong> PostgreSQL</div>
            </div>

            <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid #e2e8f0" }} />

            <h4>Soporte técnico</h4>

            <div style={{ fontSize: 14, lineHeight: 2 }}>
              <div><strong>Área:</strong> Soporte y mantenimiento del sistema</div>
              <div><strong>Servicio:</strong> Atención de incidentes y asistencia técnica</div>
              <div><strong>Horario:</strong> Según disponibilidad del área de soporte</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
