import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getAlumnas } from "../../../backend/alumnas";
import type { Student } from "../data/mockData";
import {
  Users,
  TrendingUp,
  AlertCircle,
  CalendarCheck,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const attendanceData = [
  { day: "L", value: 8 },
  { day: "M", value: 5 },
  { day: "X", value: 9 },
  { day: "J", value: 6 },
  { day: "V", value: 10 },
  { day: "S", value: 4 },
  { day: "D", value: 0 },
];

const recentActivity = [
  { text: "Valentina Torres asistió a Pilates Matinal", time: "Hoy, 9:05 AM" },
  { text: "Pago recibido — Catalina Reyes (Mar 2026)", time: "Hoy, 8:30 AM" },
  { text: "Nueva alumna registrada — Renata Morales", time: "Ayer, 11:20 AM" },
  { text: "Recordatorio enviado — Isadora Muñoz", time: "Ayer, 10:00 AM" },
];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 16,
        padding: "24px 28px",
        boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={19} color="#1A1A1A" />
      </div>
      <div>
        <p style={{ color: "#9D9D9D", fontSize: "0.78rem", letterSpacing: "0.04em" }}>
          {label}
        </p>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2.1rem",
            fontWeight: 500,
            color: "#1A1A1A",
            lineHeight: 1.1,
            marginTop: 2,
          }}
        >
          {value}
        </p>
        {sub && (
          <p style={{ color: "#9D9D9D", fontSize: "0.72rem", marginTop: 4 }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlumnas()
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const total = students.length;
  const alDia = students.filter((s) => s.paymentStatus === "Al día").length;
  const pendientes = students.filter((s) => s.paymentStatus !== "Al día").length;
  const vencidos = students.filter((s) => s.paymentStatus === "Vencido").length;

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1200 }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p
            style={{
              color: "#C8B8D8",
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Jueves, 6 de Marzo 2026
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              fontWeight: 400,
              color: "#1A1A1A",
              lineHeight: 1.2,
            }}
          >
            Buenos días, Lara ✦
          </h1>
          <p style={{ color: "#9D9D9D", fontSize: "0.85rem", marginTop: 4 }}>
            Aquí tienes el resumen de tu estudio hoy.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/alumnas/nueva")}
          style={{
            background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
            border: "none",
            borderRadius: 12,
            padding: "11px 22px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.85rem",
            color: "#1A1A1A",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Sparkles size={15} />
          Nueva Alumna
        </button>
      </div>

      {/* Stats */}
      <div
        className="grid gap-5 mb-8"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        <StatCard
          icon={Users}
          label="Alumnas Activas"
          value={total}
          sub="Total registradas"
          accent="rgba(200,184,216,0.3)"
        />
        <StatCard
          icon={TrendingUp}
          label="Pagos al Día"
          value={alDia}
          sub={`de ${total} alumnas`}
          accent="rgba(209,231,201,0.5)"
        />
        <StatCard
          icon={AlertCircle}
          label="Pagos Pendientes"
          value={pendientes}
          sub={`${vencidos} vencidos`}
          accent="rgba(242,212,215,0.5)"
        />
        <StatCard
          icon={CalendarCheck}
          label="Asistencia Hoy"
          value="5 / 6"
          sub="Clases activas"
          accent="rgba(200,184,216,0.2)"
        />
      </div>

      {/* Chart + Activity */}
      <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        {/* Attendance Chart */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "28px 32px",
            boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.2rem",
                  color: "#1A1A1A",
                  fontWeight: 500,
                }}
              >
                Asistencia Semanal
              </h3>
              <p style={{ color: "#9D9D9D", fontSize: "0.75rem", marginTop: 2 }}>
                Semana del 2 al 8 de Marzo
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={attendanceData}>
              <defs>
                <linearGradient id="lilacGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8B8D8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#C8B8D8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9D9D9D" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#1A1A1A",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#C8B8D8" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#C8B8D8"
                strokeWidth={2}
                fill="url(#lilacGrad)"
                dot={{ fill: "#C8B8D8", r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "28px 28px",
            boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.2rem",
              color: "#1A1A1A",
              fontWeight: 500,
              marginBottom: 20,
            }}
          >
            Actividad Reciente
          </h3>
          <div className="flex flex-col gap-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: i % 2 === 0 ? "#C8B8D8" : "#F2D4D7",
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p style={{ fontSize: "0.8rem", color: "#1A1A1A", lineHeight: 1.4 }}>
                    {item.text}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "#C0BAB4", marginTop: 2 }}>
                    <Clock size={10} style={{ display: "inline", marginRight: 4 }} />
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Students Table */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          padding: "28px 32px",
          boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.2rem",
              color: "#1A1A1A",
              fontWeight: 500,
            }}
          >
            Alumnas con Pago Próximo
          </h3>
          <button
            onClick={() => navigate("/dashboard/alumnas")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "#C8B8D8",
              fontSize: "0.8rem",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Ver todas <ChevronRight size={14} />
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid #F0EDE8",
              }}
            >
              {["Alumna", "Matrícula", "Plan", "Próximo Pago", "Estado"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    fontSize: "0.7rem",
                    color: "#9D9D9D",
                    letterSpacing: "0.08em",
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
            {students.slice(0, 5).map((s, i) => (
              <tr
                key={s.id}
                onClick={() => navigate(`/dashboard/alumnas/${s.id}`)}
                style={{
                  borderBottom: i < 4 ? "1px solid #F8F6F4" : "none",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#FDFCFB")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td style={{ padding: "12px 12px" }}>
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background:
                          i % 2 === 0
                            ? "linear-gradient(135deg, #C8B8D8, #E8DFF0)"
                            : "linear-gradient(135deg, #F2D4D7, #FAE8EA)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.68rem",
                        color: "#1A1A1A",
                      }}
                    >
                      {s.initials}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "#1A1A1A" }}>
                      {s.name}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "12px 12px", fontSize: "0.8rem", color: "#9D9D9D" }}>
                  {s.matricula}
                </td>
                <td style={{ padding: "12px 12px", fontSize: "0.8rem", color: "#9D9D9D" }}>
                  {s.plan}
                </td>
                <td style={{ padding: "12px 12px", fontSize: "0.8rem", color: "#1A1A1A" }}>
                  {new Date(s.nextPaymentDate).toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "short",
                  })}
                </td>
                <td style={{ padding: "12px 12px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: "0.72rem",
                      background:
                        s.paymentStatus === "Al día"
                          ? "rgba(209,231,201,0.5)"
                          : s.paymentStatus === "Pendiente"
                          ? "rgba(200,184,216,0.35)"
                          : "rgba(242,212,215,0.6)",
                      color:
                        s.paymentStatus === "Al día"
                          ? "#4A7C59"
                          : s.paymentStatus === "Pendiente"
                          ? "#7B5EA7"
                          : "#B05070",
                    }}
                  >
                    {s.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}