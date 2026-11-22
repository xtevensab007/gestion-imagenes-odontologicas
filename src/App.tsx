import { useState, useEffect } from "react";
import { supabase } from "./services/supabase";
import { cerrarSesion } from "./services/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ImportData from "./pages/ImportData";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import AttentionDetail from "./pages/AttentionDetail";
import Attentions from "./pages/Attentions";
import Images from "./pages/Images";
import Diagnostics from "./pages/Diagnostics";
import Reports from "./pages/Reports";
import ReportGenerated from "./pages/ReportGenerated";
import Sidebar from "./components/Sidebar";
import Settings from "./pages/Settings";

type PageState = {
  page: string;
  extra?: any;
};


function AppShell({ state, onNavigate, onLogout }: { state: PageState; onNavigate: (page: string, extra?: any) => void; onLogout: () => void }) {
  const sidebarPage = state.page.startsWith("patient-detail") || state.page.startsWith("attention-detail") ? "patients" : state.page;

  function renderPage() {
    switch (state.page) {
      case "dashboard":
        return <Dashboard onNavigate={onNavigate} />;
      case "patients":
        return <Patients onNavigate={onNavigate} />;
      case "patient-detail":
        return <PatientDetail patientId={state.extra?.patientId || "P001"} onNavigate={onNavigate} />;
      case "attention-detail":
        return <AttentionDetail attentionId={state.extra?.attentionId || "A001"} onNavigate={onNavigate} />;
      case "attentions":
        return <Attentions onNavigate={onNavigate} />;
      case "import":
        return <ImportData />;
      case "images":
        return <Images initialPatientId={state.extra?.patientId} onNavigate={onNavigate} />;
      case "diagnostics":
        return <Diagnostics onNavigate={onNavigate} />;
      case "reports":
  return <Reports onNavigate={onNavigate} />;

case "report-generated":
  return (
    <ReportGenerated
      onNavigate={onNavigate}
      reporte={state.extra?.reporte || null}
    />
  );
      case "settings":
        return <Settings />;
      default:
        return <Dashboard onNavigate={onNavigate} />;
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar currentPage={sidebarPage} onNavigate={onNavigate} />
      <main style={{ flex: 1, overflowY: "auto", background: "#f9fafb" }}>
        {/* Topbar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(249,250,251,0.95)", backdropFilter: "blur(8px)",
          borderBottom: "1px solid #e5e7eb",
          padding: "12px 36px",
          display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12,
        }}>
          {/*<button style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            color: "#6b7280", fontSize: 13, fontFamily: "inherit",
            padding: "6px 10px", borderRadius: 6, transition: "all 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
          onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Notificaciones
          </button>*/}
          <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
          <button
            onClick={onLogout}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              color: "#6b7280", fontSize: 13, fontFamily: "inherit",
              padding: "6px 10px", borderRadius: 6, transition: "all 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Cerrar sesión
          </button>
        </div>
        {renderPage()}
      </main>
    </div>
  );
}

function PasswordRecovery({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) throw error;

      onComplete();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la contraseña."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f9fafb",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="card" style={{
        width: "100%",
        maxWidth: 420,
        padding: 32
      }}>
        <h2 style={{ color: "#1a3557", marginTop: 0 }}>
          Restablecer contraseña
        </h2>

        <p style={{ color: "#6b7280", fontSize: 14 }}>
          Ingresa tu nueva contraseña para continuar.
        </p>

        <label>Nueva contraseña</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          style={{ width: "100%", margin: "8px 0 16px", padding: 12 }}
        />

        <label>Confirmar contraseña</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Repite la contraseña"
          style={{ width: "100%", margin: "8px 0 16px", padding: 12 }}
        />

        {error && (
          <p style={{ color: "#dc2626", fontSize: 13 }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#1a3557",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          {loading ? "Guardando..." : "Guardar nueva contraseña"}
        </button>
      </div>
    </div>
  );
}
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [pageState, setPageState] = useState<PageState>({
    page: "dashboard"
  });

  // Verificar si existe una sesión activa en Supabase
  useEffect(() => {
  let mounted = true;

  supabase.auth.getSession().then(({ data, error }) => {
    if (!mounted) return;

    if (error) {
      console.error("Error verificando sesión:", error);
    }

    setLoggedIn(!!data.session);
    setCheckingSession(false);
  });

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (!mounted) return;

    if (event === "PASSWORD_RECOVERY") {
      setRecoveryMode(true);
    }

    if (event === "SIGNED_OUT") {
      setRecoveryMode(false);
    }

    setLoggedIn(!!session);
    setCheckingSession(false);
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  function handleNavigate(page: string, extra?: any) {
    setPageState({ page, extra });
  }

  async function handleLogout() {
    try {
      await cerrarSesion();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  // Mientras se verifica la sesión
  if (checkingSession) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        color: "#1a3557"
      }}>
        Verificando sesión...
      </div>
    );
  }
  if (recoveryMode) {
  return (
    <PasswordRecovery
      onComplete={() => setRecoveryMode(false)}
    />
  );
}
  // Si no hay sesión, mostrar Login
  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <AppShell
      state={pageState}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}

