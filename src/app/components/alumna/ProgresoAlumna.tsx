import { useState } from "react";
import {
  Scale,
  Ruler,
  Percent,
  Dumbbell,
  Plus,
  Camera,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Registro = {
  id: string;
  fecha: string;
  peso: number;
  cintura: number;
  cadera: number;
  grasa: number;
  musculo: number;
};

const historialInicial: Registro[] = [
  { id: "r1", fecha: "2026-08-01", peso: 65, cintura: 72, cadera: 96, grasa: 28, musculo: 32 },
  { id: "r2", fecha: "2026-08-15", peso: 64, cintura: 71, cadera: 95, grasa: 27, musculo: 33 },
  { id: "r3", fecha: "2026-09-01", peso: 63.5, cintura: 70, cadera: 94, grasa: 26, musculo: 34 },
];

function formatearFecha(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ProgresoAlumna() {
  const [historial] = useState<Registro[]>(historialInicial);
  const [mostrarForm, setMostrarForm] = useState(false);

  const ultimo = historial[historial.length - 1];
  const primero = historial[0];
  const deltaPeso = (ultimo.peso - primero.peso).toFixed(1);
  const deltaGrasa = (ultimo.grasa - primero.grasa).toFixed(0);
  const deltaMusculo = (ultimo.musculo - primero.musculo).toFixed(0);

  const chartData = historial.map((r) => ({
    fecha: formatearFecha(r.fecha),
    peso: r.peso,
    grasa: r.grasa,
    musculo: r.musculo,
  }));

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
            Mi evolución
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
            Progreso
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#9D9D9D" }}>
            Última medición: {formatearFecha(ultimo.fecha)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMostrarForm((v) => !v)}
          style={{
            padding: "9px 16px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
            color: "#1A1A1A",
            fontSize: "0.78rem",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus size={14} />
          Nuevo registro
        </button>
      </div>

      {mostrarForm && (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "22px 24px",
            boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
            border: "1px solid #F0EDE8",
            marginBottom: 24,
          }}
        >
          <p style={{ fontSize: "0.82rem", color: "#9D9D9D", margin: 0 }}>
            Aquí puedes registrar tu nuevo peso, medidas y porcentajes. (Formulario de ejemplo —
            conecta con tu backend cuando lo tengas listo.)
          </p>
        </div>
      )}

      {/* Resumen actual */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { icon: Scale, label: "Peso", value: `${ultimo.peso} kg`, delta: `${deltaPeso} kg`, positivo: Number(deltaPeso) < 0 },
          { icon: Ruler, label: "Cintura", value: `${ultimo.cintura} cm`, delta: "—", positivo: true },
          { icon: Percent, label: "Grasa corporal", value: `${ultimo.grasa}%`, delta: `${deltaGrasa}%`, positivo: Number(deltaGrasa) < 0 },
          { icon: Dumbbell, label: "Masa muscular", value: `${ultimo.musculo}%`, delta: `+${deltaMusculo}%`, positivo: Number(deltaMusculo) > 0 },
        ].map(({ icon: Icon, label, value, delta, positivo }) => (
          <div
            key={label}
            style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "18px 20px",
              boxShadow: "0 1px 10px rgba(0,0,0,0.04)",
              border: "1px solid #F0EDE8",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "rgba(200,184,216,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={14} color="#7B5EA7" />
              </div>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "#9D9D9D",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {label}
              </p>
            </div>
            <p style={{ fontSize: "1.4rem", color: "#1A1A1A", margin: 0 }}>{value}</p>
            <p
              style={{
                fontSize: "0.72rem",
                color: positivo ? "#4A7C59" : "#B05070",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {positivo ? <TrendingDown size={12} /> : null}
              {delta !== "—" ? `${delta} desde el inicio` : "Sin comparación"}
            </p>
          </div>
        ))}
      </div>

      {/* Gráfica */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          padding: "24px 28px",
          boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
          border: "1px solid #F0EDE8",
          marginBottom: 24,
        }}
      >
        <h4
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.2rem",
            fontWeight: 400,
            color: "#1A1A1A",
            marginBottom: 20,
          }}
        >
          Evolución
        </h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="fecha"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9D9D9D" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9D9D9D" }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: "#1A1A1A",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="peso"
              stroke="#C8B8D8"
              strokeWidth={2}
              dot={{ fill: "#C8B8D8", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="grasa"
              stroke="#F2D4D7"
              strokeWidth={2}
              dot={{ fill: "#F2D4D7", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="musculo"
              stroke="#A8D8B0"
              strokeWidth={2}
              dot={{ fill: "#A8D8B0", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 12,
            flexWrap: "wrap",
            fontSize: "0.72rem",
            color: "#9D9D9D",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#C8B8D8" }} />
            Peso (kg)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F2D4D7" }} />
            Grasa (%)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#A8D8B0" }} />
            Músculo (%)
          </span>
        </div>
      </div>

      {/* Historial */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          padding: "24px 28px",
          boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
          border: "1px solid #F0EDE8",
          marginBottom: 24,
        }}
      >
        <h4
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.2rem",
            fontWeight: 400,
            color: "#1A1A1A",
            marginBottom: 18,
          }}
        >
          Historial de mediciones
        </h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead>
              <tr style={{ background: "#FDFCFB", borderBottom: "1px solid #F0EDE8" }}>
                {["Fecha", "Peso", "Cintura", "Cadera", "Grasa", "Músculo"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 14px",
                      fontSize: "0.65rem",
                      color: "#9D9D9D",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...historial].reverse().map((r, i) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: i < historial.length - 1 ? "1px solid #F8F6F4" : "none",
                  }}
                >
                  <td style={{ padding: "12px 14px", fontSize: "0.82rem", color: "#1A1A1A" }}>
                    {formatearFecha(r.fecha)}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.82rem", color: "#1A1A1A" }}>
                    {r.peso} kg
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.82rem", color: "#6B6560" }}>
                    {r.cintura} cm
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.82rem", color: "#6B6560" }}>
                    {r.cadera} cm
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.82rem", color: "#6B6560" }}>
                    {r.grasa}%
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.82rem", color: "#6B6560" }}>
                    {r.musculo}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fotos */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          padding: "24px 28px",
          boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
          border: "1px solid #F0EDE8",
        }}
      >
        <h4
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.2rem",
            fontWeight: 400,
            color: "#1A1A1A",
            marginBottom: 18,
          }}
        >
          Fotografías de progreso
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 12,
          }}
        >
          {historial.map((r) => (
            <div
              key={r.id}
              style={{
                aspectRatio: "1 / 1",
                borderRadius: 12,
                background: "linear-gradient(135deg, #F8F6F4, #EDE6F4)",
                border: "1.5px dashed #E8E4DF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <Camera size={22} color="#C8B8D8" />
              <p style={{ fontSize: "0.72rem", color: "#9D9D9D", margin: 0 }}>
                {formatearFecha(r.fecha)}
              </p>
              <p style={{ fontSize: "0.65rem", color: "#C0BAB4", margin: 0 }}>
                Subir foto
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}