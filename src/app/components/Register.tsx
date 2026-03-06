import { useState } from "react";
import { useNavigate } from "react-router";
import { signup } from "../../../backend/auth"
import { Flower2, Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";

export function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
      setError("Por favor completa todos los campos.");
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

    const result = await signup({
      nombre: name.trim() || undefined,
      email: email.trim(),
      password,
    });

    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Error al registrar.");
    }
  };

  const inputStyle: React.CSSProperties = {
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

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.72rem",
    color: "#9D9D9D",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 8,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'DM Sans', sans-serif",
        background: "#F8F6F4",
      }}
    >
      {/* Left panel */}
      <div
        style={{
          flex: "0 0 45%",
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
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(200,184,216,0.07)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(242,212,215,0.06)" }} />

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
              letterSpacing: "0.06em",
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Lara Fit Studio
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 48 }}>
            Panel Administrativo
          </p>

          {/* Benefits list */}
          <div style={{ textAlign: "left", maxWidth: 320, margin: "0 auto" }}>
            {[
              "Gestión completa de alumnas",
              "Control de asistencia diario",
              "Seguimiento de pagos y matrículas",
              "Registro rápido con teclado numérico",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(200,184,216,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Check size={12} color="#C8B8D8" />
                </div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-3 mb-10">
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flower2 size={18} color="#1A1A1A" />
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", color: "#1A1A1A" }}>
              Lara Fit Studio
            </span>
          </div>

          <p style={{ color: "#C8B8D8", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
            Nuevo acceso
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, color: "#1A1A1A", marginBottom: 6 }}>
            Crear Cuenta
          </h2>
          <p style={{ color: "#9D9D9D", fontSize: "0.85rem", marginBottom: 32 }}>
            Completa los datos para registrar tu acceso administrativo.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Name */}
            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lara González"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#C8B8D8")}
                onBlur={(e) => (e.target.style.borderColor = "#E8E4DF")}
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@larafitstudio.cl"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#C8B8D8")}
                onBlur={(e) => (e.target.style.borderColor = "#E8E4DF")}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Contraseña</label>
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#C0BAB4", display: "flex", alignItems: "center" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 2,
                          background: i <= passwordStrength ? strengthColor : "#E8E4DF",
                          transition: "background 0.3s",
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: "0.7rem", color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label style={labelStyle}>Confirmar contraseña</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  style={{
                    ...inputStyle,
                    paddingRight: 48,
                    borderColor: confirmPassword && confirmPassword !== password ? "rgba(176,80,112,0.5)" : "#E8E4DF",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#C8B8D8")}
                  onBlur={(e) => (e.target.style.borderColor = confirmPassword && confirmPassword !== password ? "rgba(176,80,112,0.5)" : "#E8E4DF")}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#C0BAB4", display: "flex", alignItems: "center" }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p style={{ fontSize: "0.72rem", color: "#B05070", marginTop: 5 }}>Las contraseñas no coinciden.</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "rgba(242,212,215,0.4)", border: "1px solid rgba(234,160,176,0.4)", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", color: "#B05070" }}>
                {error}
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
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.85rem", color: "#9D9D9D" }}>
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => navigate("/admin/login")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#7B5EA7", fontSize: "0.85rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}