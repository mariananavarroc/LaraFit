import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Flower2, LogOut, User, Calendar, CalendarDays, CreditCard, Instagram, Facebook, MapPin, Clock } from "lucide-react";
import { es } from "date-fns/locale";
import { startOfDay } from "date-fns";

import { logout, getActiveSession, getUserData } from "../../../backend/auth";
import {
  submitStudentPaymentRequest,
  ensureStudentMatriculaIfMissing,
  recordPaymentReminderIfNeeded,
  createCita,
  listCitasForStudent,
  listAvailableClassNames,
  listConfirmedCitaSlotsForDay,
  listHorarioOptions,
  getAssignedHorarioIdByStudent,
  markSelfAttendanceByMatricula,
  type CitaRow,
  type HorarioOption,
} from "../../../backend/adminData";
import { Calendar as DayCalendar } from "./ui/calendar";
import { BibliotecaEntrenamientos } from "./alumna/BibliotecaEntrenamientos";
import { Notificaciones } from "./alumna/Notificaciones";
import { ProgresoAlumna } from "./alumna/ProgresoAlumna";

function citaEstadoAlumna(estado: string): { titulo: string; detalle: string; badgeBg: string; badgeColor: string } {
  const e = estado.toLowerCase();
  if (e === "solicitada") {
    return {
      titulo: "Cita pendiente de confirmación",
      detalle: "La administradora debe aceptar tu solicitud. Verás aquí cuando quede confirmada.",
      badgeBg: "rgba(200,184,216,0.35)",
      badgeColor: "#6B4E8A",
    };
  }
  if (e === "confirmada") {
    return {
      titulo: "Cita confirmada",
      detalle: "Tu cita quedó aceptada por el estudio.",
      badgeBg: "rgba(180, 220, 200, 0.45)",
      badgeColor: "#2E5C3C",
    };
  }
  if (e === "cancelada") {
    return {
      titulo: "Cita cancelada",
      detalle: "Esta cita ya no está vigente.",
      badgeBg: "rgba(220, 220, 220, 0.5)",
      badgeColor: "#666",
    };
  }
  return {
    titulo: estado,
    detalle: "",
    badgeBg: "rgba(200,184,216,0.2)",
    badgeColor: "#7B5EA7",
  };
}

export function MiCuenta() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("500");
  const [paymentMethod, setPaymentMethod] = useState("Transferencia");
  const [savingPayment, setSavingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<
  "inicio" | "cita" | "biblioteca" | "notificaciones" | "progreso"
>("inicio");
  const [reminder, setReminder] = useState<{ shown: boolean; message: string | null } | null>(null);
  const [miCitas, setMiCitas] = useState<CitaRow[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [citaMotivo, setCitaMotivo] = useState("");
  const [savingCita, setSavingCita] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedAttendanceClass, setSelectedAttendanceClass] = useState("");
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [availableHorarios, setAvailableHorarios] = useState<HorarioOption[]>([]);
  const [selectedHorarioId, setSelectedHorarioId] = useState("");
  const [selectedAttendanceDay, setSelectedAttendanceDay] = useState<Date | undefined>(new Date());
  const [confirmedSlots, setConfirmedSlots] = useState<string[]>([]);

  const timeSlots = useMemo(() => {
    const out: string[] = [];
    for (let h = 8; h <= 20; h++) {
      out.push(`${String(h).padStart(2, "0")}:00`);
    }
    return out;
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const sessionData = await getActiveSession();
      if (!sessionData) {
        navigate("/login");
        return;
      } else {
        setSession(sessionData);
      }

      const userData = await getUserData(sessionData.id);
      if (!userData) {
        navigate("/login");
        return;
      }
      try {
        const matriculaOk = await ensureStudentMatriculaIfMissing(sessionData.id);
        const merged = { ...userData, matricula: matriculaOk };
        setUser(merged);
        const fee = merged.cuota_mensual;
        if (fee != null && Number(fee) > 0) {
          setPaymentAmount(String(fee));
        }
        const rem = await recordPaymentReminderIfNeeded({
          userId: sessionData.id,
          proximoPago: merged.proximo_pago,
        });
        setReminder(rem);
        const classNames = await listAvailableClassNames();
        setAvailableClasses(classNames);
        if (classNames.length > 0) {
          setSelectedAttendanceClass(classNames[0]);
        }
        const horarios = await listHorarioOptions();
        setAvailableHorarios(horarios);
        const assignedHorario = await getAssignedHorarioIdByStudent(sessionData.id);
        if (assignedHorario && horarios.some((h) => h.id === assignedHorario)) {
          setSelectedHorarioId(assignedHorario);
        } else if (horarios.length > 0) {
          setSelectedHorarioId(horarios[0].id);
        } else {
          setSelectedHorarioId("");
        }
        setMiCitas(await listCitasForStudent(sessionData.id));
      } catch (e) {
        alert(e instanceof Error ? e.message : "No se pudo preparar tu cuenta.");
        navigate("/login");
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (activeTab !== "cita" || !session?.id) return;
    void listCitasForStudent(session.id).then(setMiCitas).catch(() => {});
  }, [activeTab, session?.id]);

  useEffect(() => {
    if (!session?.id) return;
    const refreshCitas = () => {
      void listCitasForStudent(session.id).then(setMiCitas).catch(() => {});
    };
    window.addEventListener("focus", refreshCitas);
    return () => window.removeEventListener("focus", refreshCitas);
  }, [session?.id]);

  useEffect(() => {
    if (!selectedDay) {
      setConfirmedSlots([]);
      return;
    }
    const day = `${selectedDay.getFullYear()}-${String(selectedDay.getMonth() + 1).padStart(2, "0")}-${String(selectedDay.getDate()).padStart(2, "0")}`;
    void listConfirmedCitaSlotsForDay(day)
      .then(setConfirmedSlots)
      .catch(() => setConfirmedSlots([]));
  }, [selectedDay]);

  const citasPendientesUsuario = useMemo(
    () => miCitas.filter((c) => c.estado.toLowerCase() === "solicitada"),
    [miCitas],
  );

  const handleLogout = async () => {
    const error = await logout();
    navigate("/");
  };

  const handleSubmitPayment = async () => {
    const amount = Number(paymentAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      alert("Ingresa un monto de pago válido.");
      return;
    }
    setSavingPayment(true);
    try {
      await submitStudentPaymentRequest({
        userId: session.id,
        amount,
        method: paymentMethod,
      });
      alert(
        "Solicitud enviada. La administradora confirmará tu pago; tu membresía se actualizará cuando lo apruebe.",
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo enviar la solicitud.");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleAgendarCita = async () => {
    if (!selectedDay || !selectedTime || !session) {
      alert("Elige un día en el calendario y una hora.");
      return;
    }
    const [hh, mm] = selectedTime.split(":").map(Number);
    const dt = new Date(selectedDay);
    dt.setHours(hh, mm, 0, 0);
    if (dt < new Date()) {
      alert("La fecha y hora deben ser futuras.");
      return;
    }
    setSavingCita(true);
    try {
      await createCita({
        userId: session.id,
        fechaHoraIso: dt.toISOString(),
        motivo: citaMotivo.trim() || undefined,
      });
      setMiCitas(await listCitasForStudent(session.id));
      setCitaMotivo("");
      setSelectedTime(null);
      alert("Cita registrada. El estudio la confirmará.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo agendar.");
    } finally {
      setSavingCita(false);
    }
  };

  const handleRegisterAttendance = async () => {
    if (!session?.id || !selectedAttendanceClass || !selectedAttendanceDay) {
      alert("Selecciona día, clase y horario para registrar tu asistencia.");
      return;
    }
    setSavingAttendance(true);
    try {
      const day = `${selectedAttendanceDay.getFullYear()}-${String(selectedAttendanceDay.getMonth() + 1).padStart(2, "0")}-${String(selectedAttendanceDay.getDate()).padStart(2, "0")}`;
      await markSelfAttendanceByMatricula({
        userId: session.id,
        matricula: user.matricula,
        className: selectedAttendanceClass,
        date: day,
        horarioId: selectedHorarioId || undefined,
      });
      alert("Asistencia registrada correctamente.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo registrar tu asistencia.");
    } finally {
      setSavingAttendance(false);
    }
  };

  const membershipEndLabel = user?.proximo_pago
    ? new Date(user.proximo_pago).toLocaleDateString("es-CL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  if (!user || !session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F8F6F4",
          fontFamily: "'DM Sans', sans-serif",
          display: "grid",
          placeItems: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            width: "min(520px, 100%)",
            background: "rgba(253,252,251,0.95)",
            border: "1px solid #F0EDE8",
            borderRadius: 20,
            padding: "28px 26px",
            boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Flower2 size={18} color="#1A1A1A" />
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: "0.7rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#9D9D9D",
              }}
            >
              Mi cuenta
            </p>
            <p style={{ margin: "8px 0 0", fontSize: "0.95rem", color: "#1A1A1A" }}>Cargando tu información…</p>
            <div style={{ marginTop: 14, height: 3, borderRadius: 999, background: "#F0EDE8", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: "40%",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                  animation: "mi-cuenta-loading 1.1s ease-in-out infinite",
                }}
              />
            </div>
            <style>
              {`
                @keyframes mi-cuenta-loading {
                  0% { transform: translateX(-60%); opacity: 0.65; }
                  50% { transform: translateX(40%); opacity: 1; }
                  100% { transform: translateX(140%); opacity: 0.65; }
                }
              `}
            </style>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F6F4",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>
        {`
          .cita-slots-scroll::-webkit-scrollbar { width: 8px; }
          .cita-slots-scroll::-webkit-scrollbar-track { background: #F3F0EC; border-radius: 999px; }
          .cita-slots-scroll::-webkit-scrollbar-thumb { background: #D9D1C8; border-radius: 999px; }
          .cita-slots-scroll::-webkit-scrollbar-thumb:hover { background: #C8BDB1; }
        `}
      </style>
      {/* Nav */}
      <nav
        style={{
          background: "rgba(253,252,251,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #F0EDE8",
          padding: "0 40px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Flower2 size={14} color="#1A1A1A" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#1A1A1A", letterSpacing: "0.04em" }}>
            Lara Fit Studio
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: "0.82rem", color: "#9D9D9D" }}>
            Hola, <strong style={{ color: "#1A1A1A" }}>{user.nombre.split(" ")[0]}</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: "1.5px solid #E8E4DF",
              background: "transparent",
              cursor: "pointer",
              fontSize: "0.78rem",
              color: "#6B6560",
            }}
          >
            <LogOut size={13} />
            Salir
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 32px" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            borderBottom: "1px solid #E8E4DF",
            paddingBottom: 4,
          }}
        >
         {(
  [
    { id: "inicio" as const, label: "Inicio" },
    { id: "cita" as const, label: "Citas" },
    { id: "biblioteca" as const, label: "Biblioteca" },
    { id: "notificaciones" as const, label: "Notificaciones" },
    { id: "progreso" as const, label: "Progreso" },
  ]
).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontFamily: "'DM Sans', sans-serif",
                background: activeTab === t.id ? "linear-gradient(135deg, #C8B8D8, #F2D4D7)" : "transparent",
                color: activeTab === t.id ? "#1A1A1A" : "#9D9D9D",
                fontWeight: activeTab === t.id ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "inicio" && reminder?.shown && reminder.message && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(200,184,216,0.2), rgba(242,212,215,0.25))",
              border: "1.5px solid rgba(123, 94, 167, 0.35)",
              borderRadius: 16,
              padding: "18px 22px",
              marginBottom: 24,
            }}
          >
            <p style={{ fontSize: "0.72rem", color: "#7B5EA7", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>
              Recordatorio de membresía
            </p>
            <p style={{ fontSize: "0.88rem", color: "#1A1A1A", lineHeight: 1.5, margin: 0 }}>{reminder.message}</p>
          </div>
        )}

        {activeTab === "inicio" && citasPendientesUsuario.length > 0 && (
          <div
            style={{
              background: "#FFF9F0",
              border: "1.5px solid rgba(200, 160, 100, 0.35)",
              borderRadius: 16,
              padding: "18px 22px",
              marginBottom: 24,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div>
              <p style={{ fontSize: "0.72rem", color: "#A67C52", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>
                Citas pendientes
              </p>
              <p style={{ fontSize: "0.88rem", color: "#1A1A1A", lineHeight: 1.5, margin: 0 }}>
                Tienes {citasPendientesUsuario.length} cita{citasPendientesUsuario.length === 1 ? "" : "s"} pendiente
                {citasPendientesUsuario.length === 1 ? "" : "s"} de confirmación por el estudio.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("cita")}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                color: "#1A1A1A",
                fontSize: "0.82rem",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
              }}
            >
              Ver mis citas
            </button>
          </div>
        )}

        {activeTab === "cita" && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: "28px 28px",
              boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
              border: "1px solid #F0EDE8",
              marginBottom: 28,
            }}
          >
            <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>
              Mis citas
            </p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 400, color: "#1A1A1A", marginBottom: 16 }}>
              Citas agendadas
            </h3>
            {miCitas.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "#9D9D9D", marginBottom: 28 }}>Aún no tienes citas. Solicita una abajo con día, hora y motivo.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 28, display: "flex", flexDirection: "column", gap: 14 }}>
                {[...miCitas]
                  .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())
                  .map((c) => {
                    const dt = new Date(c.fecha_hora);
                    const st = citaEstadoAlumna(c.estado);
                    return (
                      <li
                        key={c.id}
                        style={{
                          padding: "16px 18px",
                          borderRadius: 12,
                          border: "1px solid #F0EDE8",
                          background: "#FDFCFB",
                        }}
                      >
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: 20,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              letterSpacing: "0.04em",
                              background: st.badgeBg,
                              color: st.badgeColor,
                            }}
                          >
                            {st.titulo}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.88rem", color: "#1A1A1A", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 8 }}>
                          <Calendar size={16} color="#7B5EA7" />
                          {dt.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <p style={{ fontSize: "0.82rem", color: "#5C5650", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
                          <Clock size={15} color="#9D9D9D" />
                          {dt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p style={{ fontSize: "0.65rem", color: "#9D9D9D", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Motivo</p>
                        <p style={{ fontSize: "0.82rem", color: "#1A1A1A", margin: 0 }}>{c.motivo?.trim() ? c.motivo : "Sin motivo indicado"}</p>
                        {st.detalle ? (
                          <p style={{ fontSize: "0.75rem", color: "#9D9D9D", marginTop: 10, marginBottom: 0, lineHeight: 1.45 }}>{st.detalle}</p>
                        ) : null}
                      </li>
                    );
                  })}
              </ul>
            )}

            <div style={{ borderTop: "1px solid #F0EDE8", paddingTop: 24, marginBottom: 8 }}>
              <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>
                Nueva solicitud
              </p>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 400, color: "#1A1A1A", marginBottom: 20 }}>
                Solicitar cita en el estudio
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
              <div>
                <p style={{ fontSize: "0.78rem", color: "#9D9D9D", marginBottom: 10 }}>Día</p>
                <div style={{ border: "1px solid #F0EDE8", borderRadius: 12, overflow: "hidden" }}>
                  <DayCalendar
                    mode="single"
                    selected={selectedDay}
                    onSelect={setSelectedDay}
                    locale={es}
                    disabled={{ before: startOfDay(new Date()) }}
                  />
                </div>
              </div>
              <div>
                <p style={{ fontSize: "0.78rem", color: "#9D9D9D", marginBottom: 10 }}>Hora</p>
                <div
                  className="cita-slots-scroll"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                    maxHeight: 280,
                    overflowY: "auto",
                    paddingRight: 4,
                    scrollbarWidth: "thin",
                    scrollbarColor: "#D9D1C8 #F3F0EC",
                  }}
                >
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      disabled={confirmedSlots.includes(slot)}
                      style={{
                        padding: "8px 6px",
                        borderRadius: 8,
                        border: selectedTime === slot ? "2px solid #7B5EA7" : "1px solid #E8E4DF",
                        background: confirmedSlots.includes(slot)
                          ? "rgba(230,230,230,0.8)"
                          : selectedTime === slot
                          ? "rgba(200,184,216,0.25)"
                          : "#FDFCFB",
                        fontSize: "0.75rem",
                        cursor: confirmedSlots.includes(slot) ? "not-allowed" : "pointer",
                        color: confirmedSlots.includes(slot) ? "#A8A29D" : "#1A1A1A",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <Clock size={12} style={{ verticalAlign: "middle", marginRight: 4, opacity: 0.6 }} />
                      {slot}{confirmedSlots.includes(slot) ? " (ocupado)" : ""}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: "0.78rem", color: "#9D9D9D", marginTop: 16, marginBottom: 8 }}>
                  Motivo o tipo de visita (opcional)
                </p>
                <input
                  value={citaMotivo}
                  onChange={(e) => setCitaMotivo(e.target.value)}
                  placeholder="Ej. entrenamiento, primera clase, consulta…"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1.5px solid #E8E4DF",
                    background: "#FDFCFB",
                    fontSize: "0.82rem",
                    marginBottom: 16,
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={handleAgendarCita}
                  disabled={savingCita}
                  style={{
                    padding: "12px 22px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                    color: "#1A1A1A",
                    fontSize: "0.85rem",
                    cursor: savingCita ? "default" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    opacity: savingCita ? 0.7 : 1,
                  }}
                >
                  {savingCita ? "Guardando..." : "Enviar solicitud de cita"}
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === "biblioteca" && <BibliotecaEntrenamientos />}

        {activeTab === "notificaciones" && <Notificaciones />}

        {activeTab === "progreso" && <ProgresoAlumna />}
        {activeTab === "inicio" && (
          <>
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1A1A1A 0%, #2D2030 100%)",
            borderRadius: 20,
            padding: "36px 40px",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(200,184,216,0.07)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative", zIndex: 1 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                color: "#1A1A1A",
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {user.nombre.charAt(0) || "A"}
            </div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                Mi cuenta
              </p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: "#FFFFFF", fontSize: "1.8rem", fontWeight: 400 }}>
                {user.nombre}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: 2 }}>{session.email}</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.76rem", marginTop: 4, letterSpacing: "0.08em" }}>
                Matrícula: {user.matricula ?? "—"}
              </p>
            </div>
          </div>
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              background: "rgba(200,184,216,0.15)",
              border: "1px solid rgba(200,184,216,0.2)",
              color: "#C8B8D8",
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              position: "relative",
              zIndex: 1,
            }}
          >
            Alumna activa
          </div>
        </div>

        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
          {[
            {
              icon: User,
              label: "Datos personales",
              value: session.email || "—",
              sub: "Correo registrado",
            },
            {
              icon: Calendar,
              label: "Miembro desde",
              value: user.created_at
                ? new Date(user.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })
                : "—",
              sub: "Fecha de registro",
            },
            {
              icon: CreditCard,
              label: "Plan actual",
              value: user.plan || "Plan mensual",
              sub: "Cuota y modalidad",
            },
            {
              icon: CalendarDays,
              label: "Membresía hasta",
              value: membershipEndLabel,
              sub: "Fin del período pagado",
            },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                padding: "22px 24px",
                boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
                border: "1px solid #F0EDE8",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(200,184,216,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={14} color="#7B5EA7" />
                </div>
                <p style={{ fontSize: "0.72rem", color: "#9D9D9D", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</p>
              </div>
              <p style={{ fontSize: "0.95rem", color: "#1A1A1A", marginBottom: 2 }}>{value}</p>
              <p style={{ fontSize: "0.72rem", color: "#C0BAB4" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Horario rápido */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "22px 28px",
            boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
            border: "1px solid #F0EDE8",
            marginBottom: 20,
          }}
        >
          <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>
            Asistencia
          </p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 400, color: "#1A1A1A", marginBottom: 8 }}>
            Registrar asistencia de hoy
          </h3>
          <p style={{ fontSize: "0.78rem", color: "#9D9D9D", marginBottom: 14, lineHeight: 1.45 }}>
            Elige el día, la clase y la hora disponible para registrar tu asistencia.
          </p>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: "0.78rem", color: "#9D9D9D", marginBottom: 10 }}>Día</p>
            <div
              style={{
                border: "1px solid #F0EDE8",
                borderRadius: 12,
                overflow: "hidden",
                width: "fit-content",
                maxWidth: "100%",
              }}
            >
              <DayCalendar
                mode="single"
                selected={selectedAttendanceDay}
                onSelect={setSelectedAttendanceDay}
                locale={es}
                disabled={{ after: startOfDay(new Date()), before: startOfDay(new Date(new Date().setDate(new Date().getDate() - 30))) }}
              />
            </div>
            <p style={{ fontSize: "0.72rem", color: "#C0BAB4", marginTop: 8, marginBottom: 0, lineHeight: 1.45 }}>
              Puedes registrar hasta 30 días hacia atrás (y no fechas futuras).
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {availableClasses.map((className) => {
              const active = selectedAttendanceClass === className;
              return (
                <button
                  key={className}
                  type="button"
                  onClick={() => setSelectedAttendanceClass(className)}
                  style={{
                    borderRadius: 999,
                    padding: "7px 14px",
                    border: active ? "1.5px solid #B796CF" : "1px solid #E8E4DF",
                    background: active ? "linear-gradient(135deg, rgba(200,184,216,0.35), rgba(242,212,215,0.35))" : "#FDFCFB",
                    color: active ? "#3F334A" : "#6F6862",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  {className}
                </button>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
            <select
              value={selectedHorarioId}
              onChange={(e) => setSelectedHorarioId(e.target.value)}
              disabled={availableHorarios.length === 0}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1.5px solid #E8E4DF",
                background: "#FDFCFB",
                fontSize: "0.82rem",
                color: "#1A1A1A",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            >
              {availableHorarios.length === 0 ? (
                <option value="">No hay horarios disponibles</option>
              ) : (
                availableHorarios.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.label}
                  </option>
                ))
              )}
            </select>
            <button
              onClick={handleRegisterAttendance}
              disabled={savingAttendance || !selectedAttendanceClass || !selectedAttendanceDay}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                color: "#1A1A1A",
                fontSize: "0.82rem",
                cursor: savingAttendance ? "default" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                opacity: savingAttendance ? 0.7 : 1,
              }}
            >
              {savingAttendance ? "Guardando..." : "Registrar asistencia"}
            </button>
          </div>
        </div>

        {/* Horario rápido */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "28px 28px",
            boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
            border: "1px solid #F0EDE8",
            marginBottom: 20,
          }}
        >
          <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>
            Próximas clases
          </p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 400, color: "#1A1A1A", marginBottom: 18 }}>
            Esta semana
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { day: "Lunes", time: "07:10 – 08:00", class: "Trampolín", color: "rgba(200,184,216,0.25)", textColor: "#7B5EA7" },
              { day: "Miércoles", time: "19:00 – 20:00", class: "Fuerza", color: "rgba(212,197,226,0.35)", textColor: "#6B4E8A" },
              { day: "Viernes", time: "08:10 – 09:00", class: "Trampolín", color: "rgba(200,184,216,0.25)", textColor: "#7B5EA7" },
            ].map((item) => (
              <div
                key={item.day}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "#FDFCFB",
                  border: "1px solid #F0EDE8",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: item.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Calendar size={16} color={item.textColor} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "#1A1A1A" }}>{item.day}</p>
                    <p style={{ fontSize: "0.72rem", color: "#9D9D9D" }}>{item.time}</p>
                  </div>
                </div>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    background: item.color,
                    color: item.textColor,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {item.class}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pago membresía */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "22px 28px",
            boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
            border: "1px solid #F0EDE8",
            marginBottom: 20,
          }}
        >
          <p style={{ color: "#C8B8D8", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>
            Pagos
          </p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 400, color: "#1A1A1A", marginBottom: 8 }}>
            Pagar membresía
          </h3>
          <p style={{ fontSize: "0.78rem", color: "#9D9D9D", marginBottom: 16, lineHeight: 1.45 }}>
            Tu membresía está vigente hasta <strong style={{ color: "#1A1A1A" }}>{membershipEndLabel}</strong>. Al pulsar{" "}
            <strong>Pagar</strong> envías la solicitud; la administradora la revisará y confirmará antes de actualizar tu
            cuenta.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10 }}>
            <input
              type="number"
              min={1}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Monto"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1.5px solid #E8E4DF",
                background: "#FDFCFB",
                fontSize: "0.82rem",
                color: "#1A1A1A",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1.5px solid #E8E4DF",
                background: "#FDFCFB",
                fontSize: "0.82rem",
                color: "#1A1A1A",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            >
              <option>Transferencia</option>
              <option>Efectivo</option>
              <option>Tarjeta</option>
            </select>
            <button
              onClick={handleSubmitPayment}
              disabled={savingPayment}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                color: "#1A1A1A",
                fontSize: "0.82rem",
                cursor: savingPayment ? "default" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                opacity: savingPayment ? 0.7 : 1,
              }}
            >
              {savingPayment ? "Enviando..." : "Pagar"}
            </button>
          </div>
        </div>

        {/* Contacto rápido */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "22px 28px",
            boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
            border: "1px solid #F0EDE8",
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: "0.72rem", color: "#9D9D9D", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              ¿Necesitas ayuda?
            </p>
            <p style={{ fontSize: "0.88rem", color: "#1A1A1A" }}>Contáctanos en nuestras redes o al +56 9 1234 5678</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(200,56,138,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Instagram size={16} color="#C8378A" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(24,119,242,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Facebook size={16} color="#1877F2" />
            </a>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(200,184,216,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin size={16} color="#7B5EA7" />
            </a>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
