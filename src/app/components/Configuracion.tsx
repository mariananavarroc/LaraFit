import { Settings, Flower2, Bell, Lock, Palette } from "lucide-react";

export function Configuracion() {
  return (
    <div style={{ padding: "40px 48px", maxWidth: 800 }}>
      <div className="mb-8">
        <p style={{ color: "#C8B8D8", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
          Sistema
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2rem",
            fontWeight: 400,
            color: "#1A1A1A",
          }}
        >
          Configuración
        </h1>
        <p style={{ color: "#9D9D9D", fontSize: "0.85rem", marginTop: 4 }}>
          Personaliza tu estudio y preferencias del sistema.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {[
          {
            icon: Flower2,
            title: "Perfil del Estudio",
            desc: "Nombre, logo, dirección y datos de contacto del estudio.",
            accent: "rgba(200,184,216,0.3)",
          },
          {
            icon: Bell,
            title: "Notificaciones",
            desc: "Configura recordatorios automáticos de pago y asistencia.",
            accent: "rgba(242,212,215,0.4)",
          },
          {
            icon: Palette,
            title: "Apariencia",
            desc: "Personaliza colores, temas y estilo visual del panel.",
            accent: "rgba(200,184,216,0.15)",
          },
          {
            icon: Lock,
            title: "Seguridad",
            desc: "Cambia tu contraseña y gestiona el acceso al sistema.",
            accent: "rgba(242,212,215,0.25)",
          },
          {
            icon: Settings,
            title: "General",
            desc: "Zona horaria, idioma y configuraciones generales.",
            accent: "rgba(200,184,216,0.2)",
          },
        ].map((item) => (
          <div
            key={item.title}
            style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "22px 28px",
              boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              gap: 18,
              cursor: "pointer",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 4px 20px rgba(0,0,0,0.08)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 1px 10px rgba(0,0,0,0.05)")
            }
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: item.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <item.icon size={18} color="#7B5EA7" />
            </div>
            <div className="flex-1">
              <p style={{ fontSize: "0.92rem", color: "#1A1A1A" }}>{item.title}</p>
              <p style={{ fontSize: "0.78rem", color: "#9D9D9D", marginTop: 2 }}>{item.desc}</p>
            </div>
            <div style={{ color: "#C8B8D8", fontSize: "0.75rem" }}>Configurar →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
