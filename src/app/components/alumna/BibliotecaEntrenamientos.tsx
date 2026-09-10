import { useMemo, useState } from "react";
import {
  Play,
  Clock,
  Flame,
  Target,
  Dumbbell,
  X,
  ChevronLeft,
} from "lucide-react";

type Disciplina = "Trampolín" | "Fuerza" | "Pilates" | "Baile";
type Nivel = "Principiante" | "Intermedio" | "Avanzado";

type Entrenamiento = {
  id: string;
  nombre: string;
  disciplina: Disciplina;
  nivel: Nivel;
  duracion: number; // minutos
  objetivo: string;
  descripcion: string;
  indicaciones: string;
  color: string;
  premium: boolean;
};

const entrenamientos: Entrenamiento[] = [
  {
    id: "1",
    nombre: "Trampolín Cardio Intenso",
    disciplina: "Trampolín",
    nivel: "Intermedio",
    duracion: 45,
    objetivo: "Cardio y resistencia",
    descripcion:
      "Rutina de alta intensidad sobre trampolín para quemar calorías y mejorar tu resistencia cardiovascular.",
    indicaciones:
      "Mantén el core activo durante toda la sesión. Hidrátate cada 10 minutos.",
    color: "rgba(200,184,216,0.35)",
    premium: true,
  },
  {
    id: "2",
    nombre: "Fuerza Total Cuerpo",
    disciplina: "Fuerza",
    nivel: "Avanzado",
    duracion: 60,
    objetivo: "Tonificación muscular",
    descripcion:
      "Circuito completo de fuerza con pesas para tonificar todos los grupos musculares.",
    indicaciones:
      "Calienta 5 minutos antes. Usa mancuernas de 3-5 kg si eres principiante.",
    color: "rgba(212,197,226,0.45)",
    premium: true,
  },
  {
    id: "3",
    nombre: "Pilates Matinal",
    disciplina: "Pilates",
    nivel: "Principiante",
    duracion: 30,
    objetivo: "Flexibilidad y core",
    descripcion:
      "Secuencia suave de Pilates para activar el core y mejorar la flexibilidad al iniciar el día.",
    indicaciones:
      "Respira profundo en cada movimiento. No fuerces el rango de movimiento.",
    color: "rgba(240,237,232,0.9)",
    premium: false,
  },
  {
    id: "4",
    nombre: "Baile Fit Latina",
    disciplina: "Baile",
    nivel: "Intermedio",
    duracion: 50,
    objetivo: "Cardio divertido",
    descripcion:
      "Coreografías latinas para hacer cardio mientras te diviertes. ¡Ritmo y energía!",
    indicaciones:
      "Sigue el ritmo a tu propio paso. No hay movimientos incorrectos.",
    color: "rgba(146,193,210,0.35)",
    premium: true,
  },
  {
    id: "5",
    nombre: "Trampolín Principiantes",
    disciplina: "Trampolín",
    nivel: "Principiante",
    duracion: 30,
    objetivo: "Iniciación",
    descripcion:
      "Aprende las bases del trampolín con movimientos suaves y seguros.",
    indicaciones:
      "Mantén los pies en el centro del trampolín. Empieza con rebotes suaves.",
    color: "rgba(200,184,216,0.25)",
    premium: false,
  },
  {
    id: "6",
    nombre: "Pilates con Balón",
    disciplina: "Pilates",
    nivel: "Avanzado",
    duracion: 45,
    objetivo: "Estabilidad",
    descripcion:
      "Pilates avanzado usando balón de estabilidad para trabajar el core profundo.",
    indicaciones:
      "Controla el balón en todo momento. Evita arquear la espalda.",
    color: "rgba(230,220,240,0.5)",
    premium: true,
  },
];

const disciplinas: Array<Disciplina | "Todas"> = [
  "Todas",
  "Trampolín",
  "Fuerza",
  "Pilates",
  "Baile",
];

const niveles: Array<Nivel | "Todos"> = [
  "Todos",
  "Principiante",
  "Intermedio",
  "Avanzado",
];

export function BibliotecaEntrenamientos() {
  const [filtroDisciplina, setFiltroDisciplina] =
    useState<(typeof disciplinas)[number]>("Todas");
  const [filtroNivel, setFiltroNivel] =
    useState<(typeof niveles)[number]>("Todos");
  const [seleccionado, setSeleccionado] = useState<Entrenamiento | null>(null);

  const filtrados = useMemo(
    () =>
      entrenamientos.filter((e) => {
        const okD =
          filtroDisciplina === "Todas" || e.disciplina === filtroDisciplina;
        const okN = filtroNivel === "Todos" || e.nivel === filtroNivel;
        return okD && okN;
      }),
    [filtroDisciplina, filtroNivel],
  );

  if (seleccionado) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setSeleccionado(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#9D9D9D",
            fontSize: "0.82rem",
            marginBottom: 24,
            fontFamily: "'DM Sans', sans-serif",
            padding: 0,
          }}
        >
          <ChevronLeft size={15} />
          Volver a la biblioteca
        </button>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "32px 32px",
            boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
            border: "1px solid #F0EDE8",
          }}
        >
          <div
            style={{
              height: 220,
              borderRadius: 14,
              background: seleccionado.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Play size={24} color="#1A1A1A" fill="#1A1A1A" />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: "0.7rem",
                background: seleccionado.color,
                color: "#6B4E8A",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {seleccionado.disciplina}
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: "0.7rem",
                background: "rgba(240,237,232,0.9)",
                color: "#6B6560",
              }}
            >
              {seleccionado.nivel}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: "0.72rem",
                color: "#9D9D9D",
              }}
            >
              <Clock size={13} />
              {seleccionado.duracion} min
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.8rem",
              fontWeight: 400,
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            {seleccionado.nombre}
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#9D9D9D",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Target size={14} />
            {seleccionado.objetivo}
          </p>

          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: "0.72rem",
                color: "#9D9D9D",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Descripción
            </h3>
            <p style={{ fontSize: "0.88rem", color: "#1A1A1A", lineHeight: 1.6 }}>
              {seleccionado.descripcion}
            </p>
          </div>

          <div>
            <h3
              style={{
                fontSize: "0.72rem",
                color: "#9D9D9D",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Indicaciones
            </h3>
            <p style={{ fontSize: "0.88rem", color: "#1A1A1A", lineHeight: 1.6 }}>
              {seleccionado.indicaciones}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p
          style={{
            color: "#C8B8D8",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Entrenamientos
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
          Biblioteca de Entrenamientos
        </h3>
        <p style={{ fontSize: "0.82rem", color: "#9D9D9D" }}>
          Explora rutinas exclusivas por disciplina y nivel.
        </p>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: 20 }}>
        <p
          style={{
            fontSize: "0.7rem",
            color: "#9D9D9D",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Disciplina
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {disciplinas.map((d) => {
            const active = filtroDisciplina === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setFiltroDisciplina(d)}
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
                {d}
              </button>
            );
          })}
        </div>

        <p
          style={{
            fontSize: "0.7rem",
            color: "#9D9D9D",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Nivel
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {niveles.map((n) => {
            const active = filtroNivel === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setFiltroNivel(n)}
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
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {filtrados.map((e) => (
          <div
            key={e.id}
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
              border: "1px solid #F0EDE8",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                height: 120,
                background: e.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Dumbbell size={32} color="#7B5EA7" style={{ opacity: 0.5 }} />
              {e.premium && (
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.85)",
                    color: "#7B5EA7",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Premium
                </span>
              )}
            </div>
            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
              <h4
                style={{
                  fontSize: "0.92rem",
                  color: "#1A1A1A",
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                {e.nombre}
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: "0.65rem",
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: e.color,
                    color: "#6B4E8A",
                  }}
                >
                  {e.disciplina}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: "rgba(240,237,232,0.9)",
                    color: "#6B6560",
                  }}
                >
                  {e.nivel}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: "0.72rem",
                  color: "#9D9D9D",
                  marginBottom: 14,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} />
                  {e.duracion} min
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Flame size={12} />
                  {e.objetivo.split(" ")[0]}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSeleccionado(e)}
                style={{
                  marginTop: "auto",
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                  color: "#1A1A1A",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                }}
              >
                Ver entrenamiento
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "#C0BAB4",
            fontSize: "0.9rem",
          }}
        >
          No hay entrenamientos con esos filtros.
        </div>
      )}
    </div>
  );
}