import { useState } from "react";
import { students } from "../data/mockData";
import {
  CreditCard,
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Send,
  DollarSign,
} from "lucide-react";

export function Pagos() {
  const [sentReminders, setSentReminders] = useState<string[]>([]);

  const totalIngresos = students
    .flatMap((s) => s.payments)
    .filter((p) => p.status === "Pagado")
    .reduce((acc, p) => acc + p.amount, 0);

  const pendientesAlumnas = students.filter(
    (s) => s.paymentStatus === "Pendiente" || s.paymentStatus === "Vencido"
  );

  const alDiaAlumnas = students.filter((s) => s.paymentStatus === "Al día");

  const sendReminder = (id: string) => {
    setSentReminders((prev) => [...prev, id]);
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1100 }}>
      {/* Header */}
      <div className="mb-8">
        <p style={{ color: "#C8B8D8", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
          Finanzas
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2rem",
            fontWeight: 400,
            color: "#1A1A1A",
          }}
        >
          Pagos & Recordatorios
        </h1>
        <p style={{ color: "#9D9D9D", fontSize: "0.85rem", marginTop: 4 }}>
          Gestiona cobros, pagos pendientes y envía recordatorios.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 mb-8" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div
          style={{
            background: "#1A1A1A",
            borderRadius: 16,
            padding: "28px 32px",
            boxShadow: "0 1px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(200,184,216,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <DollarSign size={18} color="#C8B8D8" />
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", marginBottom: 4 }}>
            Ingresos del mes
          </p>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              color: "#FFFFFF",
              lineHeight: 1,
            }}
          >
            ${totalIngresos.toLocaleString("es-CL")}
          </p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", marginTop: 6 }}>
            Basado en pagos confirmados
          </p>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "28px 32px",
            boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(209,231,201,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <CheckCircle2 size={18} color="#4A7C59" />
          </div>
          <p style={{ color: "#9D9D9D", fontSize: "0.72rem", marginBottom: 4 }}>
            Pagos al día
          </p>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              color: "#1A1A1A",
              lineHeight: 1,
            }}
          >
            {alDiaAlumnas.length}
          </p>
          <p style={{ color: "#9D9D9D", fontSize: "0.7rem", marginTop: 6 }}>
            alumnas al corriente
          </p>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "28px 32px",
            boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(242,212,215,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <AlertTriangle size={18} color="#B05070" />
          </div>
          <p style={{ color: "#9D9D9D", fontSize: "0.72rem", marginBottom: 4 }}>
            Pagos pendientes / vencidos
          </p>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              color: "#1A1A1A",
              lineHeight: 1,
            }}
          >
            {pendientesAlumnas.length}
          </p>
          <p style={{ color: "#9D9D9D", fontSize: "0.7rem", marginTop: 6 }}>
            requieren atención
          </p>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        {/* Payment Status Table */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "28px 32px",
            boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.2rem",
              color: "#1A1A1A",
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            Estado de Pagos
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F0EDE8" }}>
                {["Alumna", "Cuota", "Prox. Pago", "Estado"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "8px 10px",
                      fontSize: "0.65rem",
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
              {students.map((s, i) => (
                <tr
                  key={s.id}
                  style={{
                    borderBottom: i < students.length - 1 ? "1px solid #F8F6F4" : "none",
                  }}
                >
                  <td style={{ padding: "12px 10px" }}>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background:
                            i % 2 === 0
                              ? "linear-gradient(135deg, #C8B8D8, #E8DFF0)"
                              : "linear-gradient(135deg, #F2D4D7, #FAE8EA)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.6rem",
                          color: "#1A1A1A",
                          flexShrink: 0,
                        }}
                      >
                        {s.initials}
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "#1A1A1A" }}>
                        {s.name.split(" ")[0]}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 10px", fontSize: "0.78rem", color: "#9D9D9D" }}>
                    ${s.monthlyFee.toLocaleString("es-CL")}
                  </td>
                  <td style={{ padding: "12px 10px", fontSize: "0.78rem", color: "#1A1A1A" }}>
                    {new Date(s.nextPaymentDate).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 8px",
                        borderRadius: 20,
                        fontSize: "0.68rem",
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
                      {s.paymentStatus === "Al día" ? (
                        <CheckCircle2 size={10} />
                      ) : s.paymentStatus === "Pendiente" ? (
                        <AlertTriangle size={10} />
                      ) : (
                        <XCircle size={10} />
                      )}
                      {s.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reminders */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "28px 32px",
            boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Bell size={16} color="#C8B8D8" />
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.2rem",
                color: "#1A1A1A",
                fontWeight: 500,
              }}
            >
              Recordatorios de Pago
            </h3>
          </div>
          <p style={{ fontSize: "0.8rem", color: "#9D9D9D", marginBottom: 20 }}>
            Alumnas con pagos pendientes o vencidos que requieren recordatorio.
          </p>

          <div className="flex flex-col gap-4">
            {pendientesAlumnas.map((s, i) => {
              const sent = sentReminders.includes(s.id);
              return (
                <div
                  key={s.id}
                  style={{
                    padding: "16px 18px",
                    borderRadius: 12,
                    background:
                      s.paymentStatus === "Vencido"
                        ? "rgba(242,212,215,0.2)"
                        : "#FDFCFB",
                    border:
                      s.paymentStatus === "Vencido"
                        ? "1px solid rgba(242,212,215,0.6)"
                        : "1px solid #F0EDE8",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background:
                            i % 2 === 0
                              ? "linear-gradient(135deg, #C8B8D8, #E8DFF0)"
                              : "linear-gradient(135deg, #F2D4D7, #FAE8EA)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.65rem",
                          color: "#1A1A1A",
                          flexShrink: 0,
                        }}
                      >
                        {s.initials}
                      </div>
                      <div>
                        <p style={{ fontSize: "0.85rem", color: "#1A1A1A" }}>{s.name}</p>
                        <p style={{ fontSize: "0.7rem", color: "#9D9D9D" }}>{s.phone}</p>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 20,
                        fontSize: "0.68rem",
                        background:
                          s.paymentStatus === "Pendiente"
                            ? "rgba(200,184,216,0.35)"
                            : "rgba(242,212,215,0.6)",
                        color:
                          s.paymentStatus === "Pendiente" ? "#7B5EA7" : "#B05070",
                      }}
                    >
                      {s.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p style={{ fontSize: "0.72rem", color: "#9D9D9D" }}>
                        Próximo pago:{" "}
                        <span style={{ color: s.paymentStatus === "Vencido" ? "#B05070" : "#1A1A1A" }}>
                          {new Date(s.nextPaymentDate).toLocaleDateString("es-CL", {
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "#9D9D9D" }}>
                        Monto: ${s.monthlyFee.toLocaleString("es-CL")}
                      </p>
                    </div>
                    <button
                      onClick={() => sendReminder(s.id)}
                      disabled={sent}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 14px",
                        borderRadius: 8,
                        border: sent ? "none" : "1.5px solid #C8B8D8",
                        background: sent
                          ? "rgba(209,231,201,0.3)"
                          : "rgba(200,184,216,0.15)",
                        color: sent ? "#4A7C59" : "#7B5EA7",
                        fontSize: "0.75rem",
                        cursor: sent ? "default" : "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.2s",
                      }}
                    >
                      {sent ? (
                        <>
                          <CheckCircle2 size={12} />
                          Enviado
                        </>
                      ) : (
                        <>
                          <Send size={12} />
                          Recordar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Register Payment */}
          <div
            style={{
              marginTop: 24,
              padding: "18px 20px",
              borderRadius: 12,
              background: "linear-gradient(135deg, rgba(200,184,216,0.12), rgba(242,212,215,0.12))",
              border: "1.5px dashed #D4C5E2",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={14} color="#C8B8D8" />
              <p style={{ fontSize: "0.82rem", color: "#1A1A1A" }}>Registrar Pago Manual</p>
            </div>
            <div className="flex gap-2">
              <select
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1.5px solid #E8DFF0",
                  background: "#FFFFFF",
                  fontSize: "0.78rem",
                  color: "#9D9D9D",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                }}
              >
                <option value="">Seleccionar alumna...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => alert("Pago registrado (demo)")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                  color: "#1A1A1A",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                + Registrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
