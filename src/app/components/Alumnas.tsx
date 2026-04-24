import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getAlumnas } from "../../../backend/alumnas";
import type { Student } from "../data/mockData";
import {
  Search,
  Plus,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

function PaymentBadge({ status }: { status: Student["paymentStatus"] }) {
  const styles = {
    "Al día": { bg: "rgba(209,231,201,0.5)", color: "#4A7C59" },
    Pendiente: { bg: "rgba(200,184,216,0.35)", color: "#7B5EA7" },
    Vencido: { bg: "rgba(242,212,215,0.6)", color: "#B05070" },
  };
  const s = styles[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 12px",
        borderRadius: 20,
        fontSize: "0.72rem",
        background: s.bg,
        color: s.color,
      }}
    >
      {status}
    </span>
  );
}

export function Alumnas() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Todas" | "Al día" | "Pendiente" | "Vencido">("Todas");

  useEffect(() => {
    getAlumnas()
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.matricula.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Todas" || s.paymentStatus === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1200 }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p style={{ color: "#C8B8D8", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
            Gestión
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              fontWeight: 400,
              color: "#1A1A1A",
            }}
          >
            Alumnas
          </h1>
          <p style={{ color: "#9D9D9D", fontSize: "0.85rem", marginTop: 4 }}>
            {loading ? "Cargando alumnas..." : `${students.length} alumnas registradas en el estudio.`}
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
          <Plus size={15} />
          Registrar Alumna
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div
          style={{
            flex: 1,
            maxWidth: 340,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#FFFFFF",
            borderRadius: 12,
            padding: "10px 16px",
            boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Search size={15} color="#C0BAB4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o matrícula..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "0.85rem",
              color: "#1A1A1A",
              width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} color="#9D9D9D" />
          {(["Todas", "Al día", "Pendiente", "Vencido"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 16px",
                borderRadius: 20,
                border: filter === f ? "1.5px solid #C8B8D8" : "1.5px solid #E8E4DF",
                background: filter === f ? "rgba(200,184,216,0.15)" : "#FFFFFF",
                color: filter === f ? "#7B5EA7" : "#9D9D9D",
                fontSize: "0.78rem",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FDFCFB", borderBottom: "1px solid #F0EDE8" }}>
              {["Alumna", "Matrícula", "Celular", "Plan", "Horario", "Prox. Pago", "Estado", ""].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "14px 20px",
                      fontSize: "0.68rem",
                      color: "#9D9D9D",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr
                key={s.id}
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid #F8F6F4" : "none",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FDFCFB")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                onClick={() => navigate(`/dashboard/alumnas/${s.id}`)}
              >
                <td style={{ padding: "16px 20px" }}>
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background:
                          i % 3 === 0
                            ? "linear-gradient(135deg, #C8B8D8, #E8DFF0)"
                            : i % 3 === 1
                            ? "linear-gradient(135deg, #F2D4D7, #FAE8EA)"
                            : "linear-gradient(135deg, #D4C5E2, #F7E8EA)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.72rem",
                        color: "#1A1A1A",
                        flexShrink: 0,
                      }}
                    >
                      {s.initials}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.88rem", color: "#1A1A1A" }}>{s.name}</p>
                      <p style={{ fontSize: "0.72rem", color: "#C0BAB4" }}>{s.email}</p>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: 3,
                          padding: "1px 8px",
                          borderRadius: 20,
                          fontSize: "0.65rem",
                          letterSpacing: "0.06em",
                          background: "rgba(200,184,216,0.18)",
                          color: "#7B5EA7",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {s.matricula}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 20px", fontSize: "0.82rem", color: "#9D9D9D" }}>
                  {s.matricula}
                </td>
                <td style={{ padding: "16px 20px", fontSize: "0.82rem", color: "#1A1A1A" }}>
                  {s.phone}
                </td>
                <td style={{ padding: "16px 20px", fontSize: "0.82rem", color: "#9D9D9D" }}>
                  {s.plan}
                </td>
                <td style={{ padding: "16px 20px", fontSize: "0.8rem", color: "#9D9D9D", maxWidth: 180 }}>
                  {s.schedule}
                </td>
                <td style={{ padding: "16px 20px", fontSize: "0.82rem", color: "#1A1A1A" }}>
                  {new Date(s.nextPaymentDate).toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <PaymentBadge status={s.paymentStatus} />
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <ChevronRight size={16} color="#C8B8D8" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#C0BAB4", fontSize: "0.9rem" }}>
            No se encontraron alumnas con ese filtro.
          </div>
        )}
      </div>
    </div>
  );
}