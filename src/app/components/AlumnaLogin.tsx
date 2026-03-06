import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Flower2, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft } from "lucide-react";

export function AlumnaLogin() {
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
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      if (result.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/mi-cuenta");
      }
    } else {
      setError(result.error || "Correo o contraseña incorrectos.");
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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'DM Sans', sans-serif",
        background: "#F8F6F4",
      }}
    >
      {/* Left – decorative */}
      <div
        className="hidden md:flex"
        style={{
          flex: "0 0 44%",
          background: "linear-gradient(160deg, #F8F6F4 0%, #EDE6F4 60%, #F8F0F2 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(200,184,216,0.2)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(242,212,215,0.2)" }} />

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
              boxShadow: "0 8px 28px rgba(200,184,216,0.4)",
            }}
          >
            <Flower2 size={30} color="#1A1A1A" />
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#1A1A1A",
              fontSize: "2.2rem",
              fontWeight: 400,
              letterSpacing: "0.05em",
              lineHeight: 1.2,
              marginBottom: 10,
            }}
          >
            Lara Fit Studio
          </h1>
          <p style={{ color: "#9D9D9D", fontSize: "0.8rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 44 }}>
            Área de Alumnas
          </p>
          <div
            style={{
              border: "1.5px solid rgba(200,184,216,0.4)",
              borderRadius: 16,
              padding: "24px 28px",
              maxWidth: 320,
              margin: "0 auto",
              background: "rgba(255,255,255,0.6)",
            }}
          >
            <p style={{ fontFamily: "'Cormorant Garamond', serif", color: "#6B6560", fontSize: "1.1rem", lineHeight: 1.7, fontStyle: "italic" }}>
              "Tu cuerpo puede hacerlo. Es solo tu mente a la que tienes que convencer."
            </p>
          </div>
        </div>
      </div>

      {/* Right – form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <button
            onClick={() => navigate("/login")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#9D9D9D", fontSize: "0.8rem", marginBottom: 36 }}
          >
            <ArrowLeft size={14} /> Volver
          </button>

          <p style={{ color: "#C8B8D8", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
            Alumna
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, color: "#1A1A1A", marginBottom: 6 }}>
            Bienvenida de vuelta
          </h2>
          <p style={{ color: "#9D9D9D", fontSize: "0.85rem", marginBottom: 36 }}>
            Ingresa con tu correo y contraseña.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", color: "#9D9D9D", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Correo electrónico
              </label>
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

            <div>
              <label style={{ display: "block", fontSize: "0.72rem", color: "#9D9D9D", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={(e) => (e.target.style.borderColor = "#C8B8D8")}
                  onBlur={(e) => (e.target.style.borderColor = "#E8E4DF")}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#C0BAB4", display: "flex", alignItems: "center" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
              }}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Ingresando...</>
              ) : (
                <>Ingresar <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 28, fontSize: "0.85rem", color: "#9D9D9D" }}>
            ¿Aún no tienes cuenta?{" "}
            <button
              onClick={() => navigate("/alumna/registro")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#7B5EA7", fontSize: "0.85rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            >
              Regístrate
            </button>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}