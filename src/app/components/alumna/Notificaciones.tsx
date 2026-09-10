import { useMemo, useState } from "react";
import {
  Bell,
  Calendar,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Info,
} from "lucide-react";

type TipoNotif = "clase" | "membresia" | "rutina" | "aviso";

type Notificacion = {
  id: string;
  tipo: TipoNotif;
  titulo: string;
  detalle: string;
  fecha: string;
  leida: boolean;
};

const iniciales: Notificacion[] = [
  {
    id: "n1",
    tipo: "clase",
    titulo: "Tu clase de Pilates es mañana",
    detalle: "Recuerda llegar 10 minutos antes. Sala 2, 19:00 hrs.",
    fecha: "2026-09-10",
    leida: false,
  },
  {
    id: "n2",
    tipo: "rutina",
    titulo: "Nueva rutina de Fuerza disponible",
    detalle: "Se agregó 'Fuerza Total Cuerpo' a tu biblioteca Premium.",
    fecha: "2026-09-09",
    leida: true,
  },
  {
    id: "n3",
    tipo: "membresia",
    titulo: "Tu membresía está próxima a vencer",
    detalle: "Vence el 30 de septiembre. Renueva para seguir sin interrupciones.",
    fecha: "2026-09-08",
    leida: false,
  },
  {
    id: "n4",
    tipo: "aviso",
    titulo: "Clase especial el viernes",
    detalle: "Habrá clase especial de Baile Fit a las 18:00. ¡Cupos limitados!",
    fecha: "2026-09-06",
    leida: true,
  },
];

const iconPorTipo: Record<TipoNotif, React.ElementType> = {
  clase: Calendar,
  membresia: AlertTriangle,
  rutina: Sparkles,
  aviso: Info,
};

const colorPorTipo: Record<TipoNotif, { bg: string; fg: string }> = {
  clase: { bg: "rgba(200,184,216,0.25)", fg: "#7B5EA7" },
  membresia: { bg: "rgba(242,212,215,0.4)", fg: "#B05070" },
  rutina: { bg: "rgba(209,231,201,0.4)", fg: "#4A7C59" },
  aviso: { bg: "rgba(240,237,232,0.9)", fg: "#6B6560" },
};

function formatearFecha(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function Notificaciones() {
  const [items, setItems] = useState<Notificacion[]>(iniciales);
  const [filtro, setFiltro] = useState<"todas" | "no-leidas">("todas");

  const visibles = useMemo(
    () => (filtro === "todas" ? items : items.filter((n) => !n.leida)),
    [items, filtro],
  );

  const noLeidas = items.filter((n) => !n.leida).length;

  const marcarLeida = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
    );
  };

  const marcarTodasLeidas = () => {
    setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <p
            style={{
              color: "#C8B8D8",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Avisos
          </p>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.5rem",
              fontWeight: 400,
              color: "#1A1A1A",
              marginBottom: 6,
            }}
          >
            Notificaciones
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#9D9D9D" }}>
            {noLeidas} sin leer · {items.length} en total
          </p>
        </div>
        {noLeidas > 0 && (
          <button
            type="button"
            onClick={marcarTodasLeidas}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: "1.5px solid #E8DFF0",
              background: "transparent",
              color: "#7B5EA7",
              fontSize: "0.78rem",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(
          [
            { id: "todas" as const, label: "Todas" },
            { id: "no-leidas" as const, label: "No leídas" },
          ]
        ).map((f) => {
          const active = filtro === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              style={{
                padding: "7px 16px",
                borderRadius: 20,
                border: active ? "1.5px solid #C8B8D8" : "1.5px solid #E8E4DF",
                background: active ? "rgba(200,184,216,0.15)" : "#FFFFFF",
                color: active ? "#7B5EA7" : "#9D9D9D",
                fontSize: "0.78rem",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibles.map((n) => {
          const Icon = iconPorTipo[n.tipo];
          const c = colorPorTipo[n.tipo];
          return (
            <div
              key={n.id}
              onClick={() => marcarLeida(n.id)}
              style={{
                background: n.leida ? "#FFFFFF" : "rgba(253,252,251,0.95)",
                borderRadius: 14,
                padding: "18px 22px",
                boxShadow: "0 1px 10px rgba(0,0,0,0.04)",
                border: n.leida
                  ? "1px solid #F0EDE8"
                  : "1.5px solid rgba(200,184,216,0.4)",
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                cursor: n.leida ? "default" : "pointer",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: c.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color={c.fg} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#1A1A1A",
                      fontWeight: n.leida ? 400 : 600,
                      margin: 0,
                    }}
                  >
                    {n.titulo}
                  </p>
                  {!n.leida && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#7B5EA7",
                        display: "inline-block",
                      }}
                    />
                  )}
                </div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "#6B6560",
                    lineHeight: 1.5,
                    margin: "0 0 6px",
                  }}
                >
                  {n.detalle}
                </p>
                <p style={{ fontSize: "0.72rem", color: "#C0BAB4", margin: 0 }}>
                  {formatearFecha(n.fecha)}
                </p>
              </div>
              {n.leida && (
                <CheckCircle2
                  size={16}
                  color="#C0BAB4"
                  style={{ flexShrink: 0, marginTop: 4 }}
                />
              )}
            </div>
          );
        })}

        {visibles.length === 0 && (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#C0BAB4",
              fontSize: "0.9rem",
            }}
          >
            No tienes notificaciones {filtro === "no-leidas" ? "sin leer" : ""}.
          </div>
        )}
      </div>
    </div>
  );
}