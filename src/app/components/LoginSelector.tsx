import { useNavigate } from "react-router";
import { Flower2, ShieldCheck, User, ArrowLeft } from "lucide-react";

export function LoginSelector() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F6F4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        padding: "40px 24px",
      }}
    >
      {/* Back */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: 28,
          left: 32,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#9D9D9D",
          fontSize: "0.82rem",
        }}
      >
        <ArrowLeft size={15} />
        Volver al inicio
      </button>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Flower2 size={26} color="#1A1A1A" />
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.8rem",
            fontWeight: 400,
            color: "#1A1A1A",
            marginBottom: 6,
          }}
        >
          Lara Fit Studio
        </h1>
        <p style={{ color: "#C8B8D8", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Iniciar sesión
        </p>
      </div>

      <p style={{ color: "#9D9D9D", fontSize: "0.9rem", marginBottom: 36, textAlign: "center" }}>
        ¿Cómo deseas ingresar?
      </p>

      {/* Cards */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 600, width: "100%" }}>
        {/* Alumna */}
        <button
          onClick={() => navigate("/alumna/login")}
          style={{
            flex: "1 1 220px",
            background: "#FFFFFF",
            border: "1.5px solid #E8E4DF",
            borderRadius: 20,
            padding: "36px 28px",
            cursor: "pointer",
            textAlign: "center",
            transition: "all 0.2s",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#C8B8D8";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(200,184,216,0.25)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8E4DF";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(200,184,216,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
            }}
          >
            <User size={24} color="#7B5EA7" />
          </div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 400, color: "#1A1A1A", marginBottom: 8 }}>
            Soy Alumna
          </h3>
          <p style={{ fontSize: "0.78rem", color: "#9D9D9D", lineHeight: 1.6 }}>
            Accede a tu perfil, revisa clases y horarios.
          </p>
        </button>

        {/* Administradora */}
        <button
          onClick={() => navigate("/admin/login")}
          style={{
            flex: "1 1 220px",
            background: "linear-gradient(135deg, #1A1A1A 0%, #2D2030 100%)",
            border: "1.5px solid transparent",
            borderRadius: 20,
            padding: "36px 28px",
            cursor: "pointer",
            textAlign: "center",
            transition: "all 0.2s",
            boxShadow: "0 4px 20px rgba(26,26,26,0.18)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(26,26,26,0.28)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(26,26,26,0.18)";
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(200,184,216,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
            }}
          >
            <ShieldCheck size={24} color="#C8B8D8" />
          </div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 400, color: "#FFFFFF", marginBottom: 8 }}>
            Administradora
          </h3>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
            Accede al panel de gestión del estudio.
          </p>
        </button>
      </div>

      {/* Register link */}
      <p style={{ marginTop: 40, fontSize: "0.85rem", color: "#9D9D9D", textAlign: "center" }}>
        ¿Eres nueva?{" "}
        <button
          onClick={() => navigate("/alumna/registro")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#7B5EA7",
            fontSize: "0.85rem",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
          }}
        >
          Regístrate como alumna
        </button>
      </p>
    </div>
  );
}
