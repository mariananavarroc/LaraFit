import { useEffect, useState } from "react";
import { CalendarDays, CalendarCheck2, Clock, Users } from "lucide-react";
import {
  cancelClassReservation,
  listAvailableClassSessions,
  reserveClassSession,
  type AvailableClassSession,
} from "../../../../backend/adminData";

function localDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ReservasClases() {
  const [selectedDate, setSelectedDate] = useState(() => localDateInputValue(new Date()));
  const [sessions, setSessions] = useState<AvailableClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    listAvailableClassSessions(selectedDate)
      .then((availableSessions) => {
        if (active) setSessions(availableSessions);
      })
      .catch((reason: unknown) => {
        if (active) {
          setSessions([]);
          setError(reason instanceof Error ? reason.message : "No se pudieron consultar las clases.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedDate]);

  const refreshSessions = async () => {
    setError(null);
    setSessions(await listAvailableClassSessions(selectedDate));
  };

  const handleReserve = async (session: AvailableClassSession) => {
    setBusyId(session.id);
    setError(null);
    try {
      await reserveClassSession(session.id, selectedDate);
      await refreshSessions();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo reservar la clase.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (session: AvailableClassSession) => {
    if (!session.reservationId) return;
    setBusyId(session.id);
    setError(null);
    try {
      await cancelClassReservation(session.reservationId);
      await refreshSessions();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cancelar la reservación.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #1A1A1A 0%, #302635 100%)",
          borderRadius: 20,
          padding: "30px 32px",
          marginBottom: 20,
          color: "#FFFFFF",
        }}
      >
        <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
          Horarios y reservaciones
        </p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 400, margin: "0 0 8px" }}>
          Clases disponibles
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", lineHeight: 1.5, margin: 0 }}>
          Consulta los horarios y cupos, y administra tus reservaciones para cada clase.
        </p>
      </div>

      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #F0EDE8",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <label htmlFor="class-session-date" style={{ color: "#6B6560", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarDays size={16} color="#7B5EA7" />
          Fecha de clase
        </label>
        <input
          id="class-session-date"
          type="date"
          min={localDateInputValue(new Date())}
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          style={{
            padding: "9px 12px",
            border: "1px solid #E8E4DF",
            borderRadius: 10,
            background: "#FDFCFB",
            color: "#1A1A1A",
            font: "inherit",
          }}
        />
      </div>

      {error && (
        <div role="alert" style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 10, background: "#FFF4F4", border: "1px solid #E8B8B8", color: "#8C3B3B", fontSize: "0.82rem" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 28, textAlign: "center", color: "#9D9D9D", background: "#FFFFFF", border: "1px solid #F0EDE8", borderRadius: 16 }}>
          Consultando horarios y cupos…
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ padding: 28, textAlign: "center", color: "#9D9D9D", background: "#FFFFFF", border: "1px solid #F0EDE8", borderRadius: 16 }}>
          No hay clases programadas para esta fecha.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
          {sessions.map((session) => {
            const reserved = Boolean(session.reservationId);
            const busy = busyId === session.id;
            const full = session.available <= 0;
            return (
              <article
                key={session.id}
                style={{
                  padding: 20,
                  border: reserved ? "1px solid rgba(123,94,167,0.45)" : "1px solid #F0EDE8",
                  borderRadius: 14,
                  background: reserved ? "linear-gradient(135deg, rgba(200,184,216,0.14), rgba(242,212,215,0.16))" : "#FFFFFF",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.035)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                  <div>
                    <h3 style={{ color: "#1A1A1A", fontSize: "1rem", fontWeight: 600, margin: "0 0 6px" }}>
                      {session.className}
                    </h3>
                    <p style={{ color: "#9D9D9D", fontSize: "0.74rem", margin: 0 }}>{session.day}</p>
                  </div>
                  {reserved && <CalendarCheck2 size={19} color="#7B5EA7" aria-label="Reservada" />}
                </div>

                <div style={{ display: "grid", gap: 9, color: "#6B6560", fontSize: "0.8rem", marginBottom: 18 }}>
                  <p style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                    <Clock size={15} color="#9D9D9D" />
                    {session.time}
                  </p>
                  <p style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                    <Users size={15} color="#9D9D9D" />
                    {session.available} de {session.capacity} cupos disponibles
                  </p>
                </div>

                <button
                  type="button"
                  disabled={busy || (!reserved && full)}
                  onClick={() => (reserved ? handleCancel(session) : handleReserve(session))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "none",
                    borderRadius: 10,
                    background: reserved ? "#F4EEEE" : full ? "#EEEAE6" : "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                    color: reserved ? "#8C3B3B" : full ? "#9D9D9D" : "#1A1A1A",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: busy || (!reserved && full) ? "default" : "pointer",
                    opacity: busy ? 0.7 : 1,
                  }}
                >
                  {busy ? "Guardando…" : reserved ? "Cancelar reservación" : full ? "Sin cupos" : "Reservar lugar"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
