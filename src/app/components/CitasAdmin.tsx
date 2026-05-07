import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Calendar, CheckCircle2, Clock } from "lucide-react";
import { acceptCitaById, listAllCitasForAdmin, type CitaAdminRow } from "../../../backend/adminData";

function estadoLabelAdmin(estado: string) {
  const e = estado.toLowerCase();
  if (e === "solicitada") return "Pendiente de confirmar";
  if (e === "confirmada") return "Confirmada";
  if (e === "cancelada") return "Cancelada";
  return estado;
}

export function CitasAdmin() {
  const navigate = useNavigate();
  const [allCitas, setAllCitas] = useState<CitaAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const pending = allCitas
    .filter((c) => c.estado.toLowerCase() === "solicitada")
    .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  const historial = allCitas.filter((c) => c.estado.toLowerCase() !== "solicitada");

  const load = async () => {
    setLoading(true);
    try {
      setAllCitas(await listAllCitasForAdmin(180));
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudieron cargar las citas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleAccept = async (id: string) => {
    setBusyId(id);
    try {
      await acceptCitaById(id);
      await load();
      alert("Cita confirmada.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo confirmar.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: 900, fontFamily: "'DM Sans', sans-serif" }}>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
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
          padding: 0,
        }}
      >
        <ChevronLeft size={15} />
        Volver al panel
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Calendar size={22} color="#1A1A1A" />
        </div>
        <div>
          <p style={{ color: "#C8B8D8", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
            Agenda
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, color: "#1A1A1A", margin: 0 }}>
            Citas
          </h1>
          <p style={{ color: "#9D9D9D", fontSize: "0.85rem", marginTop: 4 }}>
            Pendientes por confirmar y registro de citas ya gestionadas (día, hora, motivo y estado).
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "24px 28px",
            boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
            border: "1px solid #F0EDE8",
          }}
        >
          <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>
            Pendientes de confirmar
          </p>
          {loading ? (
            <p style={{ color: "#9D9D9D", fontSize: "0.85rem" }}>Cargando…</p>
          ) : pending.length === 0 ? (
            <p style={{ color: "#9D9D9D", fontSize: "0.85rem" }}>No hay citas pendientes de confirmación.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {pending.map((c) => {
                const dt = new Date(c.fecha_hora);
                const busy = busyId === c.id;
                return (
                  <li
                    key={c.id}
                    style={{
                      padding: "18px 20px",
                      borderRadius: 12,
                      border: "1px solid #F0EDE8",
                      background: "#FDFCFB",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 14,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "0.95rem", color: "#1A1A1A", fontWeight: 600, marginBottom: 6 }}>{c.studentName}</p>
                      <p style={{ fontSize: "0.8rem", color: "#7B5EA7", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <Calendar size={14} />
                        {dt.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "#1A1A1A", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <Clock size={14} color="#9D9D9D" />
                        {dt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p style={{ fontSize: "0.65rem", color: "#9D9D9D", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 6, marginBottom: 4 }}>
                        Motivo
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "#5C5650", maxWidth: 520 }}>{c.motivo?.trim() ? c.motivo : "Sin motivo indicado"}</p>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAccept(c.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 20px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                        color: "#1A1A1A",
                        fontSize: "0.82rem",
                        cursor: busy ? "default" : "pointer",
                        opacity: busy ? 0.7 : 1,
                      }}
                    >
                      <CheckCircle2 size={16} />
                      {busy ? "Guardando…" : "Aceptar cita"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "24px 28px",
            boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
            border: "1px solid #F0EDE8",
          }}
        >
          <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>
            Citas agendadas (historial)
          </p>
          {loading ? null : historial.length === 0 ? (
            <p style={{ color: "#9D9D9D", fontSize: "0.85rem" }}>Aún no hay citas confirmadas o canceladas en el registro reciente.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#9D9D9D", borderBottom: "1px solid #F0EDE8" }}>
                    <th style={{ padding: "10px 8px", fontWeight: 500 }}>Alumna</th>
                    <th style={{ padding: "10px 8px", fontWeight: 500 }}>Día</th>
                    <th style={{ padding: "10px 8px", fontWeight: 500 }}>Hora</th>
                    <th style={{ padding: "10px 8px", fontWeight: 500 }}>Motivo</th>
                    <th style={{ padding: "10px 8px", fontWeight: 500 }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((c) => {
                    const dt = new Date(c.fecha_hora);
                    return (
                      <tr key={c.id} style={{ borderBottom: "1px solid #F8F5F2", color: "#1A1A1A" }}>
                        <td style={{ padding: "12px 8px", fontWeight: 600 }}>{c.studentName}</td>
                        <td style={{ padding: "12px 8px", whiteSpace: "nowrap" }}>
                          {dt.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td style={{ padding: "12px 8px" }}>{dt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</td>
                        <td style={{ padding: "12px 8px", maxWidth: 280, color: "#5C5650" }}>{c.motivo?.trim() ? c.motivo : "—"}</td>
                        <td style={{ padding: "12px 8px" }}>{estadoLabelAdmin(c.estado)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
