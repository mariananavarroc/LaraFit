import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Flower2, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, Check } from "lucide-react";

export function AlumnaRegistro() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ["", "Débil", "Regular", "Buena", "Fuerte"][passwordStrength];
  const strengthColor = ["", "#B05070", "#D4A040", "#7B9EA7", "#4A7C59"][passwordStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const result = await register(name, email, password, "alumna");
    setLoading(false);
    if (result.success) {
      navigate("/mi-cuenta");
    } else {
      setError(result.error || "Error al registrar.");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1.5px solid #E8E4DF",
    background: "#FFFFFF",
    fontSize: "0.88rem",
    color: "#1A1A1A",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.7rem",
    color: "#9D9D9D",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 7,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif", background: "#F8F6F4" }}>
      {/* Left – decorative */}
      <div
        className="hidden md:flex"
        style={{
          flex: "0 0 40%",
          background: "linear-gradient(160deg, #F8F6F4 0%, #EDE6F4 50%, #F8F0F2 100%)",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(200,184,216,0.2)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(242,212,215,0.2)" }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", boxShadow: "0 8px 28px rgba(200,184,216,0.4)" }}>
            <Flower2 size={28} color="#1A1A1A" />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1A1A1A", fontSize: "2rem", fontWeight: 400, letterSpacing: "0.05em", marginBottom: 8 }}>
            Únete al estudio
          </h1>
          <p style={{ color: "#9D9D9D", fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 40 }}>
            Registro de alumnas
          </p>

          <div style={{ textAlign: "left", maxWidth: 300 }}>
            {[
              "Acceso a todos los horarios",
              "Registro de clases y asistencia",
              "Información de pagos y planes",
              "Comunidad exclusiva de alumnas",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(200,184,216,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check size={11} color="#7B5EA7" />
                </div>
                <p style={{ color: "#6B6560", fontSize: "0.82rem" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right – form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 430 }}>
          <button
            onClick={() => navigate("/login")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#9D9D9D", fontSize: "0.8rem", marginBottom: 32 }}
          >
            <ArrowLeft size={14} /> Volver
          </button>

          <p style={{ color: "#C8B8D8", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
            Nueva alumna
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.9rem", fontWeight: 400, color: "#1A1A1A", marginBottom: 6 }}>
            Crear mi cuenta
          </h2>
          <p style={{ color: "#9D9D9D", fontSize: "0.82rem", marginBottom: 28 }}>
            Completa tus datos para comenzar.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Nombre */}
            <div>
              <label style={labelStyle}>Nombre completo *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#C8B8D8")}
                onBlur={(e) => (e.target.style.borderColor = "#E8E4DF")}
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Correo electrónico *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.cl"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#C8B8D8")}
                onBlur={(e) => (e.target.style.borderColor = "#E8E4DF")}
              />
            </div>

            {/* Teléfono */}
            <div>
              <label style={labelStyle}>Teléfono <span style={{ color: "#C0BAB4", textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+56 9 1234 5678"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#C8B8D8")}
                onBlur={(e) => (e.target.style.borderColor = "#E8E4DF")}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Contraseña *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={(e) => (e.target.style.borderColor = "#C8B8D8")}
                  onBlur={(e) => (e.target.style.borderColor = "#E8E4DF")}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#C0BAB4", display: "flex" }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= passwordStrength ? strengthColor : "#E8E4DF", transition: "background 0.3s" }} />
                    ))}
                  </div>
                  <p style={{ fontSize: "0.68rem", color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label style={labelStyle}>Confirmar contraseña *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  style={{ ...inputStyle, paddingRight: 48, borderColor: confirmPassword && confirmPassword !== password ? "rgba(176,80,112,0.5)" : "#E8E4DF" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C8B8D8")}
                  onBlur={(e) => (e.target.style.borderColor = confirmPassword && confirmPassword !== password ? "rgba(176,80,112,0.5)" : "#E8E4DF")}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#C0BAB4", display: "flex" }}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p style={{ fontSize: "0.7rem", color: "#B05070", marginTop: 5 }}>Las contraseñas no coinciden.</p>
              )}
            </div>

            {error && (
              <div style={{ background: "rgba(242,212,215,0.4)", border: "1px solid rgba(234,160,176,0.4)", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", color: "#B05070" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                border: "none",
                background: loading ? "#E8E4DF" : "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                color: loading ? "#B0A8A0" : "#1A1A1A",
                fontSize: "0.9rem",
                cursor: loading ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
              }}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Creando cuenta...</>
              ) : (
                <>Crear mi cuenta <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.84rem", color: "#9D9D9D" }}>
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => navigate("/alumna/login")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#7B5EA7", fontSize: "0.84rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}