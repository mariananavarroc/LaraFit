import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Flower2, LogOut, User, Calendar, CreditCard, Instagram, Facebook, MapPin } from "lucide-react";

import { logout, getActiveSession, getUserData } from "../../../backend/auth";

export function MiCuenta() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const sessionData = await getActiveSession();
      if (!sessionData) {
        navigate("/login");
        return;
      } else {
        setSession(sessionData);
      }

      const userData = await getUserData(sessionData.id);
      if (!userData) {
        navigate("/login");
        return;
      } else {
        setUser(userData);
      }
    };
    fetchUserData();
  }, [])

  const handleLogout = async () => {
    const error = await logout();
    navigate("/");
  };

  if (!user || !session) {
    return (
      <div>No tienes cuenta</div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F6F4",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          background: "rgba(253,252,251,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #F0EDE8",
          padding: "0 40px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Flower2 size={14} color="#1A1A1A" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#1A1A1A", letterSpacing: "0.04em" }}>
            Lara Fit Studio
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: "0.82rem", color: "#9D9D9D" }}>
            Hola, <strong style={{ color: "#1A1A1A" }}>{user.nombre.split(" ")[0]}</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: "1.5px solid #E8E4DF",
              background: "transparent",
              cursor: "pointer",
              fontSize: "0.78rem",
              color: "#6B6560",
            }}
          >
            <LogOut size={13} />
            Salir
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 32px" }}>
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1A1A1A 0%, #2D2030 100%)",
            borderRadius: 20,
            padding: "36px 40px",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(200,184,216,0.07)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative", zIndex: 1 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                color: "#1A1A1A",
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {user.nombre.charAt(0) || "A"}
            </div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                Mi cuenta
              </p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: "#FFFFFF", fontSize: "1.8rem", fontWeight: 400 }}>
                {user.nombre}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: 2 }}>{session.email}</p>
            </div>
          </div>
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              background: "rgba(200,184,216,0.15)",
              border: "1px solid rgba(200,184,216,0.2)",
              color: "#C8B8D8",
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              position: "relative",
              zIndex: 1,
            }}
          >
            Alumna activa
          </div>
        </div>

        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
          {[
            {
              icon: User,
              label: "Datos personales",
              value: session.email || "—",
              sub: "Correo registrado",
            },
            {
              icon: Calendar,
              label: "Miembro desde",
              value: user.created_at
                ? new Date(user.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })
                : "—",
              sub: "Fecha de registro",
            },
            {
              icon: CreditCard,
              label: "Plan actual",
              value: "Plan mensual",
              sub: "Trampolín + Mat",
            },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                padding: "22px 24px",
                boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
                border: "1px solid #F0EDE8",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(200,184,216,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={14} color="#7B5EA7" />
                </div>
                <p style={{ fontSize: "0.72rem", color: "#9D9D9D", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</p>
              </div>
              <p style={{ fontSize: "0.95rem", color: "#1A1A1A", marginBottom: 2 }}>{value}</p>
              <p style={{ fontSize: "0.72rem", color: "#C0BAB4" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Horario rápido */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "28px 28px",
            boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
            border: "1px solid #F0EDE8",
            marginBottom: 20,
          }}
        >
          <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>
            Próximas clases
          </p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 400, color: "#1A1A1A", marginBottom: 18 }}>
            Esta semana
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { day: "Lunes", time: "07:10 – 08:00", class: "Trampolín", color: "rgba(200,184,216,0.25)", textColor: "#7B5EA7" },
              { day: "Miércoles", time: "19:00 – 20:00", class: "Fuerza", color: "rgba(212,197,226,0.35)", textColor: "#6B4E8A" },
              { day: "Viernes", time: "08:10 – 09:00", class: "Trampolín", color: "rgba(200,184,216,0.25)", textColor: "#7B5EA7" },
            ].map((item) => (
              <div
                key={item.day}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "#FDFCFB",
                  border: "1px solid #F0EDE8",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: item.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Calendar size={16} color={item.textColor} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "#1A1A1A" }}>{item.day}</p>
                    <p style={{ fontSize: "0.72rem", color: "#9D9D9D" }}>{item.time}</p>
                  </div>
                </div>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    background: item.color,
                    color: item.textColor,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {item.class}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contacto rápido */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "22px 28px",
            boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
            border: "1px solid #F0EDE8",
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: "0.72rem", color: "#9D9D9D", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              ¿Necesitas ayuda?
            </p>
            <p style={{ fontSize: "0.88rem", color: "#1A1A1A" }}>Contáctanos en nuestras redes o al +56 9 1234 5678</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(200,56,138,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Instagram size={16} color="#C8378A" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(24,119,242,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Facebook size={16} color="#1877F2" />
            </a>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(200,184,216,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin size={16} color="#7B5EA7" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
