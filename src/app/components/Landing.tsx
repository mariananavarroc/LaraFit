import { useNavigate } from "react-router";
import {
  Flower2,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Clock,
  ChevronDown,
  ArrowRight,
  Star,
} from "lucide-react";

const classes = [
  {
    name: "Trampolín",
    desc: "Cardio de alto impacto en trampolín. Quema calorías mientras te diviertes y cuidas tus articulaciones.",
    img: "https://images.unsplash.com/photo-1767128890940-6dfe3d9fc3db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFtcG9saW5lJTIwZml0bmVzcyUyMGNsYXNzJTIwd29tZW58ZW58MXx8fHwxNzcyNzYyMDAzfDA&ixlib=rb-4.1.0&q=80&w=600",
    color: "rgba(200,184,216,0.25)",
    accent: "#7B5EA7",
  },
  {
    name: "Mat Pilates",
    desc: "Fortalece el core, mejora la postura y conecta mente y cuerpo con ejercicios de suelo guiados.",
    img: "https://images.unsplash.com/photo-1763403921315-f2ef8697199f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWxhdGVzJTIwbWF0JTIwY2xhc3MlMjB3b21lbiUyMGdyb3VwfGVufDF8fHx8MTc3Mjc2MjAwM3ww&ixlib=rb-4.1.0&q=80&w=600",
    color: "rgba(242,212,215,0.3)",
    accent: "#B05070",
  },
  {
    name: "Fuerza",
    desc: "Entrenamiento funcional con peso para tonificar y ganar resistencia muscular de forma segura.",
    img: "https://images.unsplash.com/photo-1758875569071-717cfaa97c4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlbmd0aCUyMHRyYWluaW5nJTIwd29tZW4lMjBneW18ZW58MXx8fHwxNzcyNzYyMDA2fDA&ixlib=rb-4.1.0&q=80&w=600",
    color: "rgba(212,197,226,0.35)",
    accent: "#6B4E8A",
  },
  {
    name: "Baile Fit",
    desc: "Rutinas de baile para moverse, liberarse y entrenar con energía en un ambiente festivo y motivador.",
    img: "https://images.unsplash.com/photo-1747238415033-b74eec07eb59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWxhdGVzJTIwd29tZW4lMjBmaXRuZXNzJTIwc3R1ZGlvJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzI3NjIwMDF8MA&ixlib=rb-4.1.0&q=80&w=600",
    color: "rgba(146,193,210,0.25)",
    accent: "#2E7D9A",
  },
];

const schedule = [
  { time: "07:10 – 08:00", lun: "Trampolín", mar: "Mat", mie: "Baile Fit", jue: "Fuerza", vie: "Trampolín" },
  { time: "08:10 – 09:00", lun: "Trampolín", mar: "Trampolín", mie: "Trampolín", jue: "Trampolín", vie: "Trampolín" },
  { time: "17:00 – 18:00", lun: "Mat", mar: "Trampolín", mie: "Fuerza", jue: "Mat", vie: "Especial" },
  { time: "18:00 – 19:00", lun: "Mat", mar: "Fuerza", mie: "Fuerza", jue: "Trampolín", vie: "—" },
  { time: "19:00 – 20:00", lun: "Mat", mar: "Baile Fit", mie: "Fuerza", jue: "Baile Fit", vie: "—" },
  { time: "20:00 – 21:00", lun: "Trampolín", mar: "Trampolín", mie: "Trampolín", jue: "Trampolín", vie: "—" },
];

const classColors: Record<string, { bg: string; color: string }> = {
  Trampolín: { bg: "rgba(200,184,216,0.2)", color: "#7B5EA7" },
  Mat: { bg: "rgba(240,237,232,0.9)", color: "#6B6560" },
  Fuerza: { bg: "rgba(212,197,226,0.35)", color: "#6B4E8A" },
  "Baile Fit": { bg: "rgba(146,193,210,0.25)", color: "#2E7D9A" },
  Especial: { bg: "rgba(242,212,215,0.4)", color: "#B05070" },
  "—": { bg: "transparent", color: "#D0CCC8" },
};

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const testimonials = [
  { name: "Sofía M.", text: "Lara Fit cambió completamente mi relación con el ejercicio. ¡No puedo imaginar mi semana sin mis clases!", stars: 5 },
  { name: "Camila R.", text: "El ambiente es increíble. Las profes son súper atentas y las clases de trampolín son adictivas.", stars: 5 },
  { name: "Valentina P.", text: "Llevo 8 meses y nunca había sentido tan bien mi cuerpo. El Mat Pilates transformó mi postura.", stars: 5 },
];

export function Landing() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#FDFCFB", color: "#1A1A1A" }}>

      {/* ── NAV ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(253,252,251,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #F0EDE8",
          padding: "0 48px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Flower2 size={16} color="#1A1A1A" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", letterSpacing: "0.04em" }}>
            Lara Fit Studio
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
          {[["Clases", "clases"], ["Horarios", "horarios"], ["Ubicación", "ubicacion"], ["Contacto", "contacto"]].map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", color: "#6B6560" }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              border: "1.5px solid #E8E4DF",
              background: "transparent",
              fontSize: "0.82rem",
              color: "#1A1A1A",
              cursor: "pointer",
            }}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate("/alumna/registro")}
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
              fontSize: "0.82rem",
              color: "#1A1A1A",
              cursor: "pointer",
            }}
          >
            Registrarse
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          minHeight: "92vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background: "linear-gradient(135deg, #1A1A1A 0%, #2D2030 55%, #1A1A1A 100%)",
        }}
      >
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1747238415033-b74eec07eb59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWxhdGVzJTIwd29tZW4lMjBmaXRuZXNzJTIwc3R1ZGlvJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzI3NjIwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="hero"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 }}
        />

        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -120, right: -120, width: 480, height: 480, borderRadius: "50%", background: "rgba(200,184,216,0.06)" }} />
        <div style={{ position: "absolute", bottom: -80, left: "30%", width: 300, height: 300, borderRadius: "50%", background: "rgba(242,212,215,0.05)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 780, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 20,
              border: "1px solid rgba(200,184,216,0.35)",
              background: "rgba(200,184,216,0.1)",
              marginBottom: 28,
            }}
          >
            <Flower2 size={12} color="#C8B8D8" />
            <span style={{ color: "#C8B8D8", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Estudio Fitness Femenino
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#FFFFFF",
              fontSize: "clamp(2.6rem, 6vw, 4.2rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "0.04em",
              marginBottom: 24,
            }}
          >
            Muévete, siéntete,
            <br />
            <em style={{ color: "#C8B8D8" }}>transfórmate.</em>
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "1rem",
              lineHeight: 1.8,
              maxWidth: 520,
              margin: "0 auto 40px",
            }}
          >
            En Lara Fit Studio combinamos Trampolín, Mat Pilates, Fuerza y Baile Fit en un espacio diseñado para mujeres que quieren más energía, fuerza y bienestar.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/alumna/registro")}
              style={{
                padding: "14px 32px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                color: "#1A1A1A",
                fontSize: "0.92rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 500,
              }}
            >
              Quiero unirme <ArrowRight size={16} />
            </button>
            <button
              onClick={() => scrollTo("clases")}
              style={{
                padding: "14px 28px",
                borderRadius: 12,
                border: "1.5px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.92rem",
                cursor: "pointer",
              }}
            >
              Ver clases
            </button>
          </div>

          <button
            onClick={() => scrollTo("clases")}
            style={{
              marginTop: 64,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              color: "rgba(255,255,255,0.3)",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              margin: "64px auto 0",
            }}
          >
            Descubrir
            <ChevronDown size={16} style={{ animation: "bounce 2s ease-in-out infinite" }} />
          </button>
        </div>
      </section>

      {/* ── CLASES ── */}
      <section id="clases" style={{ padding: "96px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ color: "#C8B8D8", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10 }}>
            Lo que ofrecemos
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", fontWeight: 400, color: "#1A1A1A" }}>
            Nuestras Clases
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {classes.map((cls) => (
            <div
              key={cls.name}
              style={{
                borderRadius: 20,
                overflow: "hidden",
                background: "#FFFFFF",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                transition: "transform 0.25s, box-shadow 0.25s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.10)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
              }}
            >
              <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                <img src={cls.img} alt={cls.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,26,26,0.5), transparent)" }} />
                <span
                  style={{
                    position: "absolute",
                    bottom: 14,
                    left: 16,
                    padding: "4px 12px",
                    borderRadius: 20,
                    background: cls.color,
                    color: cls.accent,
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    backdropFilter: "blur(8px)",
                    border: `1px solid ${cls.accent}30`,
                  }}
                >
                  {cls.name}
                </span>
              </div>
              <div style={{ padding: "20px 22px" }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 400, color: "#1A1A1A", marginBottom: 8 }}>
                  {cls.name}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "#9D9D9D", lineHeight: 1.7 }}>{cls.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HORARIOS ── */}
      <section id="horarios" style={{ background: "#F8F6F4", padding: "96px 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ color: "#C8B8D8", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10 }}>
              Semana regular
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", fontWeight: 400, color: "#1A1A1A" }}>
              Horarios
            </h2>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ background: "#FDFCFB", borderBottom: "1px solid #F0EDE8" }}>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "0.65rem", color: "#9D9D9D", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      Hora
                    </th>
                    {days.map((d) => (
                      <th key={d} style={{ padding: "14px 16px", textAlign: "center", fontSize: "0.65rem", color: "#9D9D9D", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, ri) => {
                    const cells = [row.lun, row.mar, row.mie, row.jue, row.vie];
                    return (
                      <tr key={ri} style={{ borderTop: ri === 2 ? "2px dashed #F0EDE8" : ri > 0 ? "1px solid #F8F6F4" : "none" }}>
                        <td style={{ padding: "12px 20px", fontSize: "0.75rem", color: "#9D9D9D", whiteSpace: "nowrap" }}>
                          {row.time}
                        </td>
                        {cells.map((cell, ci) => {
                          const c = classColors[cell] || classColors["—"];
                          return (
                            <td key={ci} style={{ padding: "8px 10px", textAlign: "center" }}>
                              {cell !== "—" ? (
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "4px 10px",
                                    borderRadius: 20,
                                    background: c.bg,
                                    color: c.color,
                                    fontSize: "0.68rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {cell}
                                </span>
                              ) : (
                                <span style={{ color: "#D0CCC8", fontSize: "0.75rem" }}>—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #F0EDE8", display: "flex", gap: 16, flexWrap: "wrap" }}>
              {Object.entries({ Trampolín: "Trampolín", Mat: "Mat", Fuerza: "Fuerza", "Baile Fit": "Baile Fit", Especial: "Especial" }).map(([key, label]) => {
                const c = classColors[key];
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.bg === "transparent" ? "#E8E4DF" : c.bg, border: `1px solid ${c.color}40` }} />
                    <span style={{ fontSize: "0.68rem", color: "#9D9D9D" }}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section style={{ padding: "96px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ color: "#C8B8D8", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10 }}>
            Lo que dicen ellas
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", fontWeight: 400, color: "#1A1A1A" }}>
            Testimonios
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {testimonials.map((t) => (
            <div
              key={t.name}
              style={{
                background: "#FFFFFF",
                borderRadius: 18,
                padding: "28px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                border: "1px solid #F0EDE8",
              }}
            >
              <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={13} color="#F2D4D7" fill="#F2D4D7" />
                ))}
              </div>
              <p style={{ fontSize: "0.9rem", color: "#6B6560", lineHeight: 1.75, marginBottom: 18, fontStyle: "italic" }}>
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    color: "#1A1A1A",
                    fontWeight: 500,
                  }}
                >
                  {t.name[0]}
                </div>
                <span style={{ fontSize: "0.85rem", color: "#1A1A1A" }}>{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── UBICACION + CONTACTO ── */}
      <section id="ubicacion" style={{ background: "#F8F6F4", padding: "96px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          {/* Contacto */}
          <div id="contacto">
            <p style={{ color: "#C8B8D8", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10 }}>
              Encuéntranos
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 400, color: "#1A1A1A", marginBottom: 32 }}>
              Contacto & Ubicación
            </h2>

            {/* Datos */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 32 }}>
              {[
                { icon: MapPin, text: "Av. Las Condes 12.450, Of. 301\nLas Condes, Santiago" },
                { icon: Phone, text: "+56 9 1234 5678" },
                { icon: Mail, text: "hola@larafitstudio.cl" },
                { icon: Clock, text: "Lun–Vie: 07:00 – 21:00\nSáb: 09:00 – 14:00" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(200,184,216,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} color="#7B5EA7" />
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#6B6560", lineHeight: 1.7, marginTop: 8, whiteSpace: "pre-line" }}>{text}</p>
                </div>
              ))}
            </div>

            {/* Redes */}
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { icon: Instagram, label: "@larafitstudio", color: "#C8378A", href: "https://instagram.com" },
                { icon: Facebook, label: "Lara Fit Studio", color: "#1877F2", href: "https://facebook.com" },
              ].map(({ icon: Icon, label, color, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 16px",
                    borderRadius: 10,
                    background: "#FFFFFF",
                    border: "1px solid #F0EDE8",
                    textDecoration: "none",
                    color: "#1A1A1A",
                    fontSize: "0.78rem",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <Icon size={15} color={color} />
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Mapa decorativo */}
          <div
            style={{
              background: "linear-gradient(135deg, #FFFFFF 0%, #F0EDE8 100%)",
              borderRadius: 20,
              overflow: "hidden",
              position: "relative",
              minHeight: 380,
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
              <defs>
                <pattern id="mapgrid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#C8B8D8" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mapgrid)" />
            </svg>

            {/* Fake streets */}
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.12 }}>
              <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#C8B8D8" strokeWidth="6" />
              <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#C8B8D8" strokeWidth="3" />
              <line x1="35%" y1="0" x2="35%" y2="100%" stroke="#C8B8D8" strokeWidth="6" />
              <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#C8B8D8" strokeWidth="3" />
              <rect x="35%" y="40%" width="30%" height="30%" fill="rgba(200,184,216,0.15)" rx="4" />
            </svg>

            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  boxShadow: "0 8px 28px rgba(200,184,216,0.45)",
                }}
              >
                <MapPin size={26} color="#1A1A1A" />
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#1A1A1A", marginBottom: 4 }}>
                Lara Fit Studio
              </p>
              <p style={{ fontSize: "0.75rem", color: "#9D9D9D" }}>Av. Las Condes 12.450, Of. 301</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 16,
                  padding: "8px 18px",
                  borderRadius: 10,
                  background: "#FFFFFF",
                  border: "1px solid #E8E4DF",
                  color: "#7B5EA7",
                  textDecoration: "none",
                  fontSize: "0.78rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <MapPin size={13} />
                Cómo llegar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #1A1A1A 0%, #2D2030 60%, #1A1A1A 100%)",
          padding: "96px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -80, right: -80, width: 360, height: 360, borderRadius: "50%", background: "rgba(200,184,216,0.06)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(242,212,215,0.05)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ color: "#C8B8D8", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>
            Únete hoy
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#FFFFFF",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
              marginBottom: 16,
              lineHeight: 1.2,
            }}
          >
            ¿Lista para empezar?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.95rem", marginBottom: 40, maxWidth: 420, margin: "0 auto 40px" }}>
            Regístrate hoy y da el primer paso hacia tu mejor versión.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/alumna/registro")}
              style={{
                padding: "14px 36px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                color: "#1A1A1A",
                fontSize: "0.92rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 500,
              }}
            >
              Registrarme <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "14px 28px",
                borderRadius: 12,
                border: "1.5px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.92rem",
                cursor: "pointer",
              }}
            >
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: "#1A1A1A",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "28px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flower2 size={12} color="#1A1A1A" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", color: "#FFFFFF", fontSize: "0.95rem", letterSpacing: "0.04em" }}>
            Lara Fit Studio
          </span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.72rem" }}>
          © {new Date().getFullYear()} Lara Fit Studio · Todos los derechos reservados
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.3)", display: "flex" }}>
            <Instagram size={17} />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.3)", display: "flex" }}>
            <Facebook size={17} />
          </a>
        </div>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </div>
  );
}
