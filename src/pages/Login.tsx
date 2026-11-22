import { useState } from "react";
import { solicitarRecuperacionPassword } from "../services/api";
import { iniciarSesion } from "../services/api";
interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  {/*const [recuperandoPassword, setRecuperandoPassword] = useState(false);*/}
const [mensajeRecuperacion, setMensajeRecuperacion] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await iniciarSesion(email.trim(), password);
      onLogin();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleRecuperarPassword = async () => {
  setError("");
  setMensajeRecuperacion("");

  if (!email.trim()) {
    setError("Ingresa tu correo electrónico para recuperar la contraseña.");
    return;
  }

  setLoading(true);

  try {
   
    console.log("Correo solicitado:", email.trim());

const resultado = await solicitarRecuperacionPassword(email.trim());

console.log("Resultado de recuperación:", resultado);
    setMensajeRecuperacion(
      "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña."
    );
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "No fue posible solicitar la recuperación."
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* Left panel */}
      <div style={{
        width: "45%",
        background: "linear-gradient(160deg, #0f2340 0%, #1a3557 50%, #1e4a8a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 48px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(59,130,246,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(59,130,246,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", left: "10%", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

        <div style={{ position: "relative", textAlign: "center", maxWidth: 340 }}>
          {/* Logo */}
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            boxShadow: "0 12px 40px rgba(59,130,246,0.4)",
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

          <h1 style={{ color: "white", fontSize: 28, fontWeight: 700, margin: "0 0 10px", fontFamily: "'DM Sans', sans-serif" }}>
            Hospital Alma Mater
          </h1>
          <p style={{ color: "#93c5fd", fontSize: 15, lineHeight: 1.6, margin: "0 0 48px" }}>
            Sistema de gestión de imágenes odontológicas
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "left" }}>
            {[
              { icon: "👤", text: "Gestión integral de pacientes y atenciones" },
              { icon: "🦷", text: "Catálogo de diagnósticos bucales y CIE-10" },
              { icon: "🖼️", text: "Galería de imágenes clínicas asociadas" },
              { icon: "📊", text: "Reportes y estadísticas odontológicas" },
            ].map((feat, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>
                  {feat.icon}
                </div>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: 0, lineHeight: 1.5, paddingTop: 8 }}>
                  {feat.text}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
              MVP Académico · Universidad de Antioquia
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{
        flex: 1,
        background: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#1a3557", margin: "0 0 8px", fontFamily: "'DM Sans', sans-serif" }}>
              Iniciar sesión
            </h2>
            <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
              Ingrese sus credenciales para acceder al sistema
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                Correo Electronico
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <input
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                  placeholder="Ingrese su correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <input
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                  placeholder="Ingrese su contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ accentColor: "#1a3557", width: 14, height: 14 }} />
                <span style={{ fontSize: 13, color: "#4b5563" }}>Recordar sesión</span>
              </label>
              <button onClick={handleRecuperarPassword} style={{ background: "none", border: "none", color: "#1a3557", fontSize: 13, cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>
                ¿Olvidó su contraseña?
              </button>
              {mensajeRecuperacion && (
  <p style={{ color: "#15803d", fontSize: 13 }}>
    {mensajeRecuperacion}
  </p>
)}
            </div>
            {error && (
              <p style={{
                color: "#dc2626",
                fontSize: 13,
                background: "#fef2f2",
                padding: 10,
                borderRadius: 8,
                margin: 0
              }}>
                {error}
              </p>
            )}
            <button
              className="btn-primary"
              onClick={handleLogin}
              disabled={loading || !email.trim() || !password}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "12px",
                fontSize: 15,
                fontWeight: 600,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </div>

          {/*<div style={{
            marginTop: 32, padding: 16,
            background: "#eff6ff", borderRadius: 10,
            border: "1px solid #bfdbfe",
          }}>
            <p style={{ fontSize: 12, color: "#1d4ed8", margin: 0, textAlign: "center" }}>
              <strong>Demo:</strong> Usuario: <code>sberrio</code> · Contraseña: <code>admin123</code>
            </p>
          </div>*/}

          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 11, marginTop: 32 }}>
            Hospital Alma Mater · Sistema Odontológico MVP v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
