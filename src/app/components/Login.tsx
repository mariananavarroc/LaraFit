import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Flower2, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("El correo ingresado no es válido.");
      return;
    }
    if (!password) {
      setError("Ingresa tu contraseña.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Redirigir según rol detectado automáticamente
      if (result.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/mi-cuenta");
      }
    } else {
      setError(result.error || "Correo o contraseña incorrectos.");
    }
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: 12,
    border: "1.5px solid #E8E4DF",
    background: "#FFFFFF",
    fontSize: "0.9rem",
    color: "#1A1A1A",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Panel izquierdo decorativo ── */}
      <div
        style={{
          flex: "0 0 44%",
          background: "linear-gradient(160deg, #1A1A1A 0%, #2D2030 60%, #1A1A1A 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 48px",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden md:flex"
      >
        {/* Círculos decorativos */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 380, height: 380, borderRadius: "50%", background: "rgba(200,184,216,0.07)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(242,212,215,0.06)" }} />
        <div style={{ position: "absolute", top: "40%", left: "10%", width: 120, height: 120, borderRadius: "50%", background: "rgba(200,184,216,0.04)" }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 28px rgba(200,184,216,0.35)",
            }}
          >
            <Flower2 size={30} color="#1A1A1A" />
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#FFFFFF",
              fontSize: "2.4rem",
              fontWeight: 400,
              letterSpacing: "0.05em",
              lineHeight: 1.2,
              marginBottom: 10,
            }}
          >
            Lara Fit Studio
          </h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 52 }}>
            Estudio Fitness Femenino
          </p>

          {/* Tarjeta de cita */}
          <div
            style={{
              border: "1px solid rgba(200,184,216,0.2)",
              borderRadius: 16,
              padding: "28px 32px",
              maxWidth: 320,
              margin: "0 auto 40px",
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(8px)",
            }}
          >
            <p style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(255,255,255,0.6)", fontSize: "1.05rem", lineHeight: 1.75, fontStyle: "italic" }}>
              "Tu cuerpo puede hacerlo. Solo necesitas convencer a tu mente."
            </p>
          </div>

          {/* Hint de demo */}
          <div
            style={{
              border: "1px solid rgba(200,184,216,0.15)",
              borderRadius: 12,
              padding: "16px 20px",
              maxWidth: 320,
              margin: "0 auto",
              background: "rgba(200,184,216,0.06)",
              textAlign: "left",
            }}
          >
            <p style={{ color: "rgba(200,184,216,0.7)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
              Cuenta demo admin
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", lineHeight: 1.8 }}>
              📧 admin@larafit.cl<br />
              🔑 admin123
            </p>
          </div>
        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div
        style={{
          flex: 1,
          background: "#F8F6F4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Volver al inicio */}
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9D9D9D",
              fontSize: "0.8rem",
              marginBottom: 40,
              padding: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <ArrowLeft size={14} />
            Volver al inicio
          </button>

          {/* Encabezado */}
          <p style={{ color: "#C8B8D8", fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 8 }}>
            Bienvenida
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2.1rem",
              fontWeight: 400,
              color: "#1A1A1A",
              marginBottom: 6,
              lineHeight: 1.15,
            }}
          >
            Iniciar sesión
          </h2>
          <p style={{ color: "#9D9D9D", fontSize: "0.84rem", marginBottom: 36, lineHeight: 1.6 }}>
            Ingresa con tu correo y contraseña. El sistema detectará tu perfil automáticamente.
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "0.7rem", color: "#9D9D9D", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="tu@correo.cl"
                autoComplete="email"
                style={inputBase}
                onFocus={(e) => (e.target.style.borderColor = "#C8B8D8")}
                onBlur={(e) => (e.target.style.borderColor = "#E8E4DF")}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label style={{ display: "block", fontSize: "0.7rem", color: "#9D9D9D", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ ...inputBase, paddingRight: 48 }}
                  onFocus={(e) => (e.target.style.borderColor = "#C8B8D8")}
                  onBlur={(e) => (e.target.style.borderColor = "#E8E4DF")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#C0BAB4",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(242,212,215,0.35)",
                  border: "1px solid rgba(176,80,112,0.25)",
                  borderRadius: 10,
                  padding: "11px 15px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <span style={{ color: "#B05070", fontSize: "0.88rem", lineHeight: 1.5 }}>⚠ {error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                border: "none",
                background: loading
                  ? "#E8E4DF"
                  : "linear-gradient(135deg, #C8B8D8 0%, #F2D4D7 100%)",
                color: loading ? "#B0A8A0" : "#1A1A1A",
                fontSize: "0.92rem",
                cursor: loading ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                transition: "opacity 0.2s",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Validando...
                </>
              ) : (
                <>
                  Ingresar <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#E8E4DF" }} />
            <span style={{ fontSize: "0.72rem", color: "#C0BAB4" }}>¿Eres nueva?</span>
            <div style={{ flex: 1, height: 1, background: "#E8E4DF" }} />
          </div>

          {/* Registro */}
          <button
            onClick={() => navigate("/alumna/registro")}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 12,
              border: "1.5px solid #E8E4DF",
              background: "#FFFFFF",
              color: "#1A1A1A",
              fontSize: "0.88rem",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#C8B8D8";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(200,184,216,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8E4DF";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            Crear una cuenta de alumna
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
