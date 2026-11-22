import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { obtenerMiProfesional } from "../services/profesionalesService";
type Page = string;

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  { id: "dashboard", label: "Inicio", icon: HomeIcon },
  { id: "patients", label: "Pacientes", icon: UsersIcon },
  { id: "attentions", label: "Atenciones", icon: CalendarIcon },
  { id: "diagnostics", label: "Diagnósticos", icon: SearchIcon },
  { id: "images", label: "Imágenes", icon: ImageIcon },
  { id: "reports", label: "Reportes", icon: ChartIcon },
  { id: "import", label: "Importar datos", icon: UploadIcon },
  { id: "settings", label: "Configuración", icon: SettingsIcon },
];

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
    </svg>
  );
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [nombreUsuario, setNombreUsuario] = useState("Cargando...");
  const [rolUsuario, setRolUsuario] = useState("");
  const [iniciales, setIniciales] = useState("U");
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          setNombreUsuario("Usuario");
          setRolUsuario("");
          setIniciales("U");
          return;
        }

        const profesional = await obtenerMiProfesional();

        const nombre = profesional.nombre || user.email || "Usuario";
        const roles = user.app_metadata?.roles || [];

        const rol = roles.includes("administrador")
          ? "Administrador"
          : roles.includes("odontologo")
            ? "Odontólogo"
            : "Usuario";

        const letras = nombre
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((palabra) => palabra[0])
          .join("")
          .toUpperCase();

        setNombreUsuario(nombre);
        setRolUsuario(rol);
        setIniciales(letras || "U");
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
        setNombreUsuario("Usuario");
        setRolUsuario("");
        setIniciales("U");
      }
    };

    cargarUsuario();
  }, []);
  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: "#1a3557",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
            flexShrink: 0,
          }}>
            
<svg
  width="22"
  height="22"
  viewBox="0 0 24 24"
  fill="none"
  stroke="white"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M12 3C9.5 1.5 5 2.5 4 7c-1 4.5 1.5 7.5 2.5 11 .7 2.3 2 3 3 1.5L12 15l2.5 4.5c1 1.5 2.3.8 3-1.5C18.5 14.5 21 11.5 20 7c-1-4.5-5.5-5.5-8-4Z" />
</svg>

          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 13, lineHeight: 1.2, fontFamily: "'DM Sans', sans-serif" }}>
              Hospital Alma Mater
            </div>
            <div style={{ color: "#93c5fd", fontSize: 10, marginTop: 2, lineHeight: 1.3 }}>
              Gestión Odontológica
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <div style={{ marginBottom: 4 }}>
          <div style={{ padding: "4px 8px", fontSize: 10, fontWeight: 600, color: "rgba(147,197,253,0.6)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
            Principal
          </div>
          {navItems.slice(0, 6).map(item => (
            <button
              key={item.id}
              className={`sidebar-link ${currentPage === item.id || (currentPage.startsWith(item.id) && item.id !== "dashboard") ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
              style={{ width: "100%", textAlign: "left", background: "none", border: "none" }}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 16, marginBottom: 4 }}>
          <div style={{ padding: "4px 8px", fontSize: 10, fontWeight: 600, color: "rgba(147,197,253,0.6)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
            Sistema
          </div>
          {navItems.slice(6).map(item => (
            <button
              key={item.id}
              className={`sidebar-link ${currentPage === item.id ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
              style={{ width: "100%", textAlign: "left", background: "none", border: "none" }}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* User */}
<div style={{
  padding: "16px 20px",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  display: "flex", alignItems: "center", gap: 12,
}}>
  <div style={{
    width: 36, height: 36, borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: 700, fontSize: 14,
    flexShrink: 0,
  }}>
    {iniciales}
  </div>
  <div>
    <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>
      {nombreUsuario}
    </div>
    <div style={{ color: "#93c5fd", fontSize: 11 }}>
      {rolUsuario}
    </div>
  </div>
</div>
    </aside>
  );
}
