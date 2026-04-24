import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getAlumnaById } from "../../../backend/alumnas";
import type { Student } from "../data/mockData";
import {
  ChevronLeft,
  Phone,
  Mail,
  Calendar,
  Clock,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Edit2,
  X,
  Save,
} from "lucide-react";

export function AlumnaProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [inactiva, setInactiva] = useState(false);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    email: '',
    plan: '',
    schedule: '',
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAlumnaById(id)
      .then((studentData) => {
        setStudent(studentData);
        // Inicializar datos de edición
        if (studentData) {
          setEditData({
            name: studentData.name,
            phone: studentData.phone,
            email: studentData.email,
            plan: studentData.plan,
            schedule: studentData.schedule,
          });
        }
      })
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEditar = () => {
    setMostrarEditar(true);
  };

  const handleGuardarCambios = async () => {
    if (!student) return;

    setGuardando(true);
    try {
      // Aquí iría la lógica para actualizar en Supabase
      // Por ahora solo simulamos
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualizar el estado local
      setStudent({
        ...student,
        name: editData.name,
        phone: editData.phone,
        email: editData.email,
        plan: editData.plan,
        schedule: editData.schedule,
      });

      setMostrarEditar(false);
      alert('Cambios guardados correctamente');
    } catch (error) {
      alert('Error al guardar cambios');
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelarEdicion = () => {
    // Resetear datos de edición
    if (student) {
      setEditData({
        name: student.name,
        phone: student.phone,
        email: student.email,
        plan: student.plan,
        schedule: student.schedule,
      });
    }
    setMostrarEditar(false);
  };

  if (loading) {
    return (
      <div style={{ padding: 40, color: "#9D9D9D", textAlign: "center" }}>
        Cargando alumna...
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ padding: 40, color: "#9D9D9D", textAlign: "center" }}>
        Alumna no encontrada.
      </div>
    );
  }

  const presentCount = student.attendance.filter((a) => a.status === "Presente").length;
  const totalCount = student.attendance.length;
  const attendancePct = Math.round((presentCount / totalCount) * 100);

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1100 }}>
      {/* Back */}
      <button
        onClick={() => navigate("/dashboard/alumnas")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#9D9D9D",
          fontSize: "0.82rem",
          marginBottom: 28,
          fontFamily: "'DM Sans', sans-serif",
          padding: 0,
        }}
      >
        <ChevronLeft size={15} />
        Volver a Alumnas
      </button>

      {/* Profile Header */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          padding: "32px 40px",
          boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            color: "#1A1A1A",
            flexShrink: 0,
          }}
        >
          {student.initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.8rem",
                fontWeight: 400,
                color: "#1A1A1A",
              }}
            >
              {student.name}
            </h1>
            <span
              style={{
                padding: "3px 12px",
                borderRadius: 20,
                fontSize: "0.72rem",
                background:
                  student.paymentStatus === "Al día"
                    ? "rgba(209,231,201,0.5)"
                    : student.paymentStatus === "Pendiente"
                    ? "rgba(200,184,216,0.35)"
                    : "rgba(242,212,215,0.6)",
                color:
                  student.paymentStatus === "Al día"
                    ? "#4A7C59"
                    : student.paymentStatus === "Pendiente"
                    ? "#7B5EA7"
                    : "#B05070",
              }}
            >
              Pago {student.paymentStatus}
            </span>
          </div>
          <p style={{ color: "#9D9D9D", fontSize: "0.82rem" }}>
            {student.matricula} · Ingresó el{" "}
            {new Date(student.joinDate).toLocaleDateString("es-CL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Botones Editar e Inactivar */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleEditar}
            style={{
              background: "transparent",
              border: "1.5px solid #E8DFF0",
              borderRadius: 10,
              padding: "9px 18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: "0.82rem",
              color: "#7B5EA7",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Edit2 size={13} />
            Editar
          </button>

          <button
            onClick={() => setMostrarAlerta(true)}
            style={{
              background: inactiva ? "rgba(209,231,201,0.3)" : "rgba(242,212,215,0.3)",
              border: inactiva ? "1.5px solid rgba(209,231,201,0.8)" : "1.5px solid #F2D4D7",
              borderRadius: 10,
              padding: "9px 18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: "0.82rem",
              color: inactiva ? "#4A7C59" : "#B05070",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {inactiva ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            {inactiva ? "Reactivar" : "Inactivar"}
          </button>
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Personal Info */}
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
              fontSize: "1.1rem",
              color: "#1A1A1A",
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            Información Personal
          </h3>
          <div className="flex flex-col gap-4">
            <InfoRow icon={Phone} label="Celular" value={student.phone} />
            <InfoRow icon={Mail} label="Email" value={student.email} />
            <InfoRow
              icon={Calendar}
              label="Fecha de Nacimiento"
              value={new Date(student.birthDate).toLocaleDateString("es-CL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <InfoRow icon={Clock} label="Horario" value={student.schedule} />
            <InfoRow icon={CreditCard} label="Plan" value={student.plan} />

            {/* Estado Activa / Inactiva */}
            <div className="flex items-start gap-3">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(200,184,216,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {inactiva ? (
                  <XCircle size={13} color="#C8B8D8" />
                ) : (
                  <CheckCircle2 size={13} color="#C8B8D8" />
                )}
              </div>
              <div>
                <p style={{ fontSize: "0.72rem", color: "#9D9D9D", letterSpacing: "0.04em" }}>
                  Estado
                </p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 4,
                    padding: "3px 12px",
                    borderRadius: 20,
                    fontSize: "0.72rem",
                    background: inactiva
                      ? "rgba(242,212,215,0.4)"
                      : "rgba(209,231,201,0.5)",
                    color: inactiva ? "#B05070" : "#4A7C59",
                  }}
                >
                  {inactiva ? "Inactiva" : "Activa"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
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
              fontSize: "1.1rem",
              color: "#1A1A1A",
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            Estado de Pago
          </h3>

          <div
            style={{
              background:
                student.paymentStatus === "Al día"
                  ? "rgba(209,231,201,0.25)"
                  : student.paymentStatus === "Pendiente"
                  ? "rgba(200,184,216,0.2)"
                  : "rgba(242,212,215,0.4)",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {student.paymentStatus === "Al día" ? (
              <CheckCircle2 size={20} color="#4A7C59" />
            ) : student.paymentStatus === "Pendiente" ? (
              <AlertTriangle size={20} color="#7B5EA7" />
            ) : (
              <XCircle size={20} color="#B05070" />
            )}
            <div>
              <p style={{ fontSize: "0.85rem", color: "#1A1A1A", marginBottom: 2 }}>
                {student.paymentStatus === "Al día"
                  ? "Pagos al corriente"
                  : student.paymentStatus === "Pendiente"
                  ? "Pago pendiente de confirmación"
                  : "Pago vencido — requiere atención"}
              </p>
              <p style={{ fontSize: "0.72rem", color: "#9D9D9D" }}>
                Cuota mensual: ${student.monthlyFee.toLocaleString("es-CL")}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <span style={{ fontSize: "0.8rem", color: "#9D9D9D" }}>Último pago</span>
              <span style={{ fontSize: "0.8rem", color: "#1A1A1A" }}>
                {new Date(student.lastPaymentDate).toLocaleDateString("es-CL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: "0.8rem", color: "#9D9D9D" }}>Próximo pago</span>
              <span
                style={{
                  fontSize: "0.8rem",
                  color:
                    new Date(student.nextPaymentDate) < new Date()
                      ? "#B05070"
                      : "#1A1A1A",
                }}
              >
                {new Date(student.nextPaymentDate).toLocaleDateString("es-CL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #F0EDE8", marginTop: 20, paddingTop: 20 }}>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#9D9D9D",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Historial de pagos
            </p>
            <div className="flex flex-col gap-2">
              {student.payments.map((p) => (
                <div key={p.id} className="flex justify-between items-center">
                  <div>
                    <p style={{ fontSize: "0.8rem", color: "#1A1A1A" }}>{p.month}</p>
                    {p.method && (
                      <p style={{ fontSize: "0.7rem", color: "#C0BAB4" }}>{p.method}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: "0.82rem", color: "#1A1A1A" }}>
                      ${p.amount.toLocaleString("es-CL")}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 20,
                        fontSize: "0.68rem",
                        background:
                          p.status === "Pagado"
                            ? "rgba(209,231,201,0.5)"
                            : p.status === "Pendiente"
                            ? "rgba(200,184,216,0.35)"
                            : "rgba(242,212,215,0.6)",
                        color:
                          p.status === "Pagado"
                            ? "#4A7C59"
                            : p.status === "Pendiente"
                            ? "#7B5EA7"
                            : "#B05070",
                      }}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
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
              fontSize: "1.1rem",
              color: "#1A1A1A",
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            Contactos de Emergencia
          </h3>
          <div className="flex flex-col gap-4">
            {student.emergencyContacts.map((ec, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  background: "#FDFCFB",
                  borderRadius: 10,
                  border: "1px solid #F0EDE8",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background:
                      i === 0
                        ? "rgba(200,184,216,0.3)"
                        : "rgba(242,212,215,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    color: "#1A1A1A",
                    flexShrink: 0,
                  }}
                >
                  {ec.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: "0.85rem", color: "#1A1A1A" }}>{ec.name}</p>
                  <p style={{ fontSize: "0.72rem", color: "#9D9D9D" }}>{ec.relationship}</p>
                </div>
                <p style={{ fontSize: "0.8rem", color: "#7B5EA7" }}>{ec.phone}</p>
              </div>
            ))}
          </div>
          {student.notes && (
            <div
              style={{
                marginTop: 20,
                padding: "14px 16px",
                background: "rgba(200,184,216,0.1)",
                borderRadius: 10,
                borderLeft: "3px solid #C8B8D8",
              }}
            >
              <p style={{ fontSize: "0.72rem", color: "#9D9D9D", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Notas
              </p>
              <p style={{ fontSize: "0.82rem", color: "#1A1A1A" }}>{student.notes}</p>
            </div>
          )}
        </div>

        {/* Attendance */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "28px 32px",
            boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.1rem",
                color: "#1A1A1A",
                fontWeight: 500,
              }}
            >
              Asistencia Reciente
            </h3>
            <div
              style={{
                background: "rgba(200,184,216,0.2)",
                borderRadius: 20,
                padding: "4px 14px",
                fontSize: "0.8rem",
                color: "#7B5EA7",
              }}
            >
              {attendancePct}% asistencia
            </div>
          </div>

          <div style={{ height: 4, background: "#F0EDE8", borderRadius: 4, marginBottom: 20 }}>
            <div
              style={{
                height: "100%",
                borderRadius: 4,
                background: "linear-gradient(90deg, #C8B8D8, #F2D4D7)",
                width: `${attendancePct}%`,
                transition: "width 0.5s ease",
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            {student.attendance.slice(0, 6).map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between"
                style={{ padding: "10px 14px", borderRadius: 10, background: "#FDFCFB" }}
              >
                <div className="flex items-center gap-3">
                  {a.status === "Presente" ? (
                    <CheckCircle2 size={15} color="#4A7C59" />
                  ) : a.status === "Justificado" ? (
                    <MinusCircle size={15} color="#7B5EA7" />
                  ) : (
                    <XCircle size={15} color="#C0BAB4" />
                  )}
                  <div>
                    <p style={{ fontSize: "0.8rem", color: "#1A1A1A" }}>{a.class}</p>
                    <p style={{ fontSize: "0.7rem", color: "#C0BAB4" }}>
                      {new Date(a.date).toLocaleDateString("es-CL", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color:
                      a.status === "Presente"
                        ? "#4A7C59"
                        : a.status === "Justificado"
                        ? "#7B5EA7"
                        : "#C0BAB4",
                  }}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal confirmar inactivar / reactivar */}
      {mostrarAlerta && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              padding: "36px 40px",
              maxWidth: 400,
              width: "90%",
              boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: inactiva ? "rgba(209,231,201,0.4)" : "rgba(242,212,215,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              {inactiva ? (
                <CheckCircle2 size={24} color="#4A7C59" />
              ) : (
                <XCircle size={24} color="#B05070" />
              )}
            </div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.3rem",
                fontWeight: 400,
                color: "#1A1A1A",
                marginBottom: 8,
              }}
            >
              {inactiva ? `¿Reactivar a ${student.name}?` : `¿Inactivar a ${student.name}?`}
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#9D9D9D", marginBottom: 28 }}>
              {inactiva
                ? "La alumna volverá a estar activa en el estudio."
                : "La alumna quedará marcada como inactiva en el estudio."}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => setMostrarAlerta(false)}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "1.5px solid #E8DFF0",
                  background: "transparent",
                  color: "#9D9D9D",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setInactiva(!inactiva);
                  setMostrarAlerta(false);
                }}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: inactiva ? "rgba(209,231,201,0.6)" : "rgba(242,212,215,0.6)",
                  color: inactiva ? "#4A7C59" : "#B05070",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {inactiva ? "Sí, reactivar" : "Sí, inactivar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de edición */}
      {mostrarEditar && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              padding: "32px 40px",
              maxWidth: 500,
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", color: "#1A1A1A" }}>
                Editar Alumna
              </h2>
              <button
                onClick={handleCancelarEdicion}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9D9D9D",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", color: "#9D9D9D", marginBottom: 8 }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "1.5px solid #E8E4DF",
                    fontSize: "0.9rem",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.72rem", color: "#9D9D9D", marginBottom: 8 }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "1.5px solid #E8E4DF",
                    fontSize: "0.9rem",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.72rem", color: "#9D9D9D", marginBottom: 8 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "1.5px solid #E8E4DF",
                    fontSize: "0.9rem",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.72rem", color: "#9D9D9D", marginBottom: 8 }}>
                  Plan
                </label>
                <select
                  value={editData.plan}
                  onChange={(e) => setEditData({ ...editData, plan: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "1.5px solid #E8E4DF",
                    fontSize: "0.9rem",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <option value="Plan Básico">Plan Básico</option>
                  <option value="Plan Premium">Plan Premium</option>
                  <option value="Plan Mensual">Plan Mensual</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.72rem", color: "#9D9D9D", marginBottom: 8 }}>
                  Horario
                </label>
                <select
                  value={editData.schedule}
                  onChange={(e) => setEditData({ ...editData, schedule: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "1.5px solid #E8E4DF",
                    fontSize: "0.9rem",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <option value="Lunes, Miércoles, Viernes — 9:00 AM">Lunes, Miércoles, Viernes — 9:00 AM</option>
                  <option value="Martes, Jueves — 7:00 AM">Martes, Jueves — 7:00 AM</option>
                  <option value="Lunes, Miércoles, Viernes — 6:00 PM">Lunes, Miércoles, Viernes — 6:00 PM</option>
                  <option value="Sábado — 10:00 AM">Sábado — 10:00 AM</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <button
                onClick={handleCancelarEdicion}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: 10,
                  border: "1.5px solid #E8E4DF",
                  background: "transparent",
                  color: "#9D9D9D",
                  fontSize: "0.9rem",
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarCambios}
                disabled={guardando}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: guardando ? "#E8E4DF" : "#C8B8D8",
                  color: guardando ? "#9D9D9D" : "#FFFFFF",
                  fontSize: "0.9rem",
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: guardando ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {guardando ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "rgba(200,184,216,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={13} color="#C8B8D8" />
      </div>
      <div>
        <p style={{ fontSize: "0.72rem", color: "#9D9D9D", letterSpacing: "0.04em" }}>
          {label}
        </p>
        <p style={{ fontSize: "0.85rem", color: "#1A1A1A", marginTop: 1 }}>{value}</p>
      </div>
    </div>
  );
}
