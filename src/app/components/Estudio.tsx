import { MapPin, Phone, Mail, Instagram, Facebook, Clock, Star, Wifi, Car, ChevronRight } from "lucide-react";

const schedule = [
  {
    time: "07:10 – 08:00 am",
    classes: [
      { day: "Lunes", name: "Trampolín", type: "trampolin" },
      { day: "Martes", name: "Mat", type: "mat" },
      { day: "Miércoles", name: "Baile Fit", name2: "BAILE FIT", type: "baile" },
      { day: "Jueves", name: "Fuerza", type: "fuerza" },
      { day: "Viernes", name: "Trampolín", type: "trampolin" },
    ],
  },
  {
    time: "08:10 – 09:00 am",
    classes: [
      { day: "Lunes", name: "Trampolín", type: "trampolin" },
      { day: "Martes", name: "Trampolín", type: "trampolin" },
      { day: "Miércoles", name: "Trampolín", type: "trampolin" },
      { day: "Jueves", name: "Trampolín", type: "trampolin" },
      { day: "Viernes", name: "Trampolín", type: "trampolin" },
    ],
  },
  {
    time: "05:00 – 06:00 pm",
    classes: [
      { day: "Lunes", name: "Mat", type: "mat" },
      { day: "Martes", name: "Trampolín", type: "trampolin" },
      { day: "Miércoles", name: "Fuerza", type: "fuerza" },
      { day: "Jueves", name: "Mat", type: "mat" },
      { day: "Viernes", name: "Clase Especial", type: "especial" },
    ],
  },
  {
    time: "06:00 – 07:00 pm",
    classes: [
      { day: "Lunes", name: "Mat", type: "mat" },
      { day: "Martes", name: "Fuerza", type: "fuerza" },
      { day: "Miércoles", name: "Fuerza", type: "fuerza" },
      { day: "Jueves", name: "Trampolín", type: "trampolin" },
      { day: "Viernes", name: null, type: "empty" },
    ],
  },
  {
    time: "07:00 – 08:00 pm",
    classes: [
      { day: "Lunes", name: "Mat", type: "mat" },
      { day: "Martes", name: "Baile Fit", type: "baile" },
      { day: "Miércoles", name: "Fuerza", type: "fuerza" },
      { day: "Jueves", name: "Baile Fit", type: "baile" },
      { day: "Viernes", name: null, type: "empty" },
    ],
  },
  {
    time: "08:00 – 09:00 pm",
    classes: [
      { day: "Lunes", name: "Trampolín", type: "trampolin" },
      { day: "Martes", name: "Trampolín", type: "trampolin" },
      { day: "Miércoles", name: "Trampolín", type: "trampolin" },
      { day: "Jueves", name: "Trampolín", type: "trampolin" },
      { day: "Viernes", name: null, type: "empty" },
    ],
  },
];

const classColors: Record<string, { bg: string; color: string; border: string }> = {
  trampolin: { bg: "rgba(200,184,216,0.25)", color: "#7B5EA7", border: "rgba(200,184,216,0.5)" },
  mat: { bg: "rgba(240,237,232,0.8)", color: "#6B6560", border: "#E8E4DF" },
  baile: { bg: "rgba(146,193,210,0.3)", color: "#2E7D9A", border: "rgba(146,193,210,0.6)" },
  fuerza: { bg: "rgba(212,197,226,0.45)", color: "#6B4E8A", border: "rgba(200,184,216,0.6)" },
  especial: { bg: "linear-gradient(135deg, rgba(200,184,216,0.4), rgba(242,212,215,0.4))", color: "#7B5EA7", border: "rgba(200,184,216,0.5)" },
  empty: { bg: "transparent", color: "transparent", border: "transparent" },
};

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const amenities = [
  { icon: Wifi, label: "WiFi gratis" },
  { icon: Car, label: "Estacionamiento" },
  { icon: Star, label: "Vestuarios" },
  { icon: Clock, label: "Clases todos los días" },
];

function ClassBadge({ name, type }: { name: string | null; type: string }) {
  if (!name || type === "empty") return <div style={{ minHeight: 32 }} />;
  const c = classColors[type] || classColors.mat;
  return (
    <div
      style={{
        padding: "5px 10px",
        borderRadius: 20,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        fontSize: "0.68rem",
        fontWeight: 500,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        textAlign: "center",
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </div>
  );
}

export function Estudio() {
  return (
    <div style={{ padding: "40px 48px", maxWidth: 1100, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ color: "#C8B8D8", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
          Información General
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, color: "#1A1A1A" }}>
          El Estudio
        </h1>
        <p style={{ color: "#9D9D9D", fontSize: "0.85rem", marginTop: 4 }}>
          Todo sobre Lara Fit Studio — horarios, ubicación y contacto.
        </p>
      </div>

      {/* Hero banner */}
      <div
        style={{
          borderRadius: 20,
          overflow: "hidden",
          position: "relative",
          height: 220,
          marginBottom: 36,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1511752229301-31156e2e6b09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWxhdGVzJTIwc3R1ZGlvJTIwYm91dGlxdWUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzI3NjA2Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Lara Fit Studio"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(120deg, rgba(26,26,26,0.65) 0%, rgba(45,32,48,0.45) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "28px 32px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#FFFFFF",
              fontSize: "1.8rem",
              fontWeight: 400,
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            Lara Fit Studio
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Pilates · Fuerza · Trampolín · Baile Fit
          </p>
        </div>
      </div>

      {/* Top cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
        {/* Contact */}
        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "24px", boxShadow: "0 1px 12px rgba(0,0,0,0.05)" }}>
          <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>
            Contacto
          </p>
          {[
            { icon: Phone, label: "+56 9 1234 5678", href: "tel:+56912345678" },
            { icon: Mail, label: "hola@larafitstudio.cl", href: "mailto:hola@larafitstudio.cl" },
          ].map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
                textDecoration: "none",
                color: "#1A1A1A",
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(200,184,216,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={14} color="#7B5EA7" />
              </div>
              <span style={{ fontSize: "0.82rem", color: "#1A1A1A" }}>{label}</span>
            </a>
          ))}
        </div>

        {/* Redes sociales */}
        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "24px", boxShadow: "0 1px 12px rgba(0,0,0,0.05)" }}>
          <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>
            Redes Sociales
          </p>
          {[
            { icon: Instagram, label: "@larafitstudio", href: "https://instagram.com/larafitstudio", color: "#C8378A" },
            { icon: Facebook, label: "Lara Fit Studio", href: "https://facebook.com/larafitstudio", color: "#1877F2" },
          ].map(({ icon: Icon, label, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
                textDecoration: "none",
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={14} color={color} />
              </div>
              <div>
                <p style={{ fontSize: "0.82rem", color: "#1A1A1A", margin: 0 }}>{label}</p>
                <p style={{ fontSize: "0.68rem", color: "#9D9D9D", margin: 0 }}>Ver perfil</p>
              </div>
              <ChevronRight size={13} color="#C0BAB4" style={{ marginLeft: "auto" }} />
            </a>
          ))}
        </div>

        {/* Amenities */}
        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "24px", boxShadow: "0 1px 12px rgba(0,0,0,0.05)" }}>
          <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>
            Servicios
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {amenities.map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 8px", borderRadius: 12, background: "rgba(200,184,216,0.08)", gap: 6 }}>
                <Icon size={16} color="#C8B8D8" />
                <span style={{ fontSize: "0.7rem", color: "#6B6560", textAlign: "center" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Horario */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, boxShadow: "0 1px 12px rgba(0,0,0,0.05)", padding: "32px", marginBottom: 28, overflow: "hidden" }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
            Semana regular
          </p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 400, color: "#1A1A1A" }}>
            Horario de Clases
          </h3>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {Object.entries({ trampolin: "Trampolín", mat: "Mat", baile: "Baile Fit", fuerza: "Fuerza", especial: "Clase Especial" }).map(([type, label]) => {
            const c = classColors[type];
            return (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.bg === "transparent" ? "#E8E4DF" : c.bg, border: `1px solid ${c.border}` }} />
                <span style={{ fontSize: "0.7rem", color: "#9D9D9D" }}>{label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
            <thead>
              <tr>
                <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.65rem", color: "#9D9D9D", letterSpacing: "0.12em", textTransform: "uppercase", background: "#FDFCFB", borderRadius: 8, whiteSpace: "nowrap" }}>
                  Hora
                </th>
                {days.map((d) => (
                  <th key={d} style={{ padding: "10px 14px", textAlign: "center", fontSize: "0.65rem", color: "#9D9D9D", letterSpacing: "0.12em", textTransform: "uppercase", background: "#FDFCFB" }}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, ri) => (
                <tr
                  key={ri}
                  style={{ borderTop: ri === 2 ? "2px dashed #F0EDE8" : ri > 0 ? "1px solid #F8F6F4" : "none" }}
                >
                  <td style={{ padding: "12px 14px", fontSize: "0.72rem", color: "#9D9D9D", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                    {row.time}
                  </td>
                  {row.classes.map((cls, ci) => (
                    <td key={ci} style={{ padding: "8px 10px", textAlign: "center", verticalAlign: "middle" }}>
                      <ClassBadge name={cls.name} type={cls.type} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 16, fontSize: "0.72rem", color: "#C0BAB4", fontStyle: "italic" }}>
          * La Clase Especial del viernes tarde se avisa con anticipación por grupo de WhatsApp.
        </p>
      </div>

      {/* Ubicación */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, boxShadow: "0 1px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {/* Info */}
          <div style={{ padding: "32px" }}>
            <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
              Dónde encontrarnos
            </p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 400, color: "#1A1A1A", marginBottom: 20 }}>
              Ubicación
            </h3>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(200,184,216,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MapPin size={18} color="#7B5EA7" />
              </div>
              <div>
                <p style={{ fontSize: "0.9rem", color: "#1A1A1A", marginBottom: 4 }}>Av. Las Condes 12.450, Of. 301</p>
                <p style={{ fontSize: "0.8rem", color: "#9D9D9D" }}>Las Condes, Santiago</p>
                <p style={{ fontSize: "0.8rem", color: "#9D9D9D" }}>Región Metropolitana, Chile</p>
              </div>
            </div>

            {/* Horario atención */}
            <div style={{ borderTop: "1px solid #F0EDE8", paddingTop: 20 }}>
              <p style={{ fontSize: "0.72rem", color: "#9D9D9D", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                Horario de atención
              </p>
              {[
                { days: "Lunes – Viernes", hours: "07:00 – 21:00 hrs" },
                { days: "Sábado", hours: "09:00 – 14:00 hrs" },
                { days: "Domingo", hours: "Cerrado" },
              ].map(({ days, hours }) => (
                <div key={days} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.82rem", color: "#6B6560" }}>{days}</span>
                  <span style={{ fontSize: "0.82rem", color: hours === "Cerrado" ? "#C0BAB4" : "#1A1A1A" }}>{hours}</span>
                </div>
              ))}
            </div>

            <a
              href="https://www.google.com/maps/place/Larafit+studio/@23.7578672,-99.1511342,17z/data=!3m1!4b1!4m6!3m5!1s0x8679530001d3e4cd:0x3f24d534875711b9!8m2!3d23.7578672!4d-99.1485593!16s%2Fg%2F11n3b_yx44?entry=ttu&g_ep=EgoyMDI2MDMwMi4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 20,
                padding: "10px 20px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                color: "#1A1A1A",
                textDecoration: "none",
                fontSize: "0.82rem",
              }}
            >
              <MapPin size={14} />
              Ver en Google Maps
            </a>
          </div>

          {/* Map embed placeholder */}
          <div
            style={{
              background: "linear-gradient(135deg, #F8F6F4 0%, #F0EDE8 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              minHeight: 320,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative grid */}
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
              <defs>
                <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#C8B8D8" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            {/* Pin */}
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  boxShadow: "0 8px 24px rgba(200,184,216,0.4)",
                }}
              >
                <MapPin size={24} color="#1A1A1A" />
              </div>
              <p style={{ fontSize: "0.85rem", color: "#6B6560" }}>Las Condes, Santiago</p>
              <p style={{ fontSize: "0.72rem", color: "#C0BAB4", marginTop: 4 }}>Lara Fit Studio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
