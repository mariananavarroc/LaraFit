import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Student, type PaymentStatus } from "../data/mockData";
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
  Save,
} from "lucide-react";
import {
  getAdminStudents,
  getAttendanceByStudent,
  getPaymentsByStudent,
  updateAdminStudentProfile,
} from "../../../backend/adminData";

function toDateInputValue(iso: string | undefined | null): string {
  if (!iso?.trim()) return "";
  const d = iso.includes("T") ? iso.split("T")[0] : iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : "";
}

function formatDisplayDate(iso: string | undefined | null): string {
  if (!iso?.trim()) return "—";
  const t = Date.parse(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(t)) return "—";
  return new Date(t).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type EditFormState = {
  nombre: string;
  correo: string;
  telefono: string;
  matricula: string;
  birthDate: string;
  joinDate: string;
  horario: string;
  plan: string;
  cuota: string;
  estadoPago: PaymentStatus;
  ultimoPago: string;
  proximoPago: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRel: string;
  notas: string;
};

function studentToEditForm(s: Student): EditFormState {
  const ec0 = s.emergencyContacts[0];
  const clean = (v: string | undefined) => (v && v !== "—" ? v : "");
  const mat = s.matricula === "—" ? "" : s.matricula;
  return {
    nombre: s.name,
    correo: s.email,
    telefono: s.phone,
    matricula: mat,
    birthDate: toDateInputValue(s.birthDate),
    joinDate: toDateInputValue(s.joinDate),
    horario: s.schedule === "Sin horario" ? "" : s.schedule,
    plan: s.plan,
    cuota: String(s.monthlyFee ?? 0),
    estadoPago: s.paymentStatus,
    ultimoPago: toDateInputValue(s.lastPaymentDate),
    proximoPago: toDateInputValue(s.nextPaymentDate),
    emergencyName: ec0 ? clean(ec0.name) : "",
    emergencyPhone: ec0 ? clean(ec0.phone) : "",
    emergencyRel: ec0 ? clean(ec0.relationship) : "",
    notas: s.notes,
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1.5px solid #E8E4DF",
  background: "#FDFCFB",
  fontSize: "0.82rem",
  color: "#1A1A1A",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.7rem",
  color: "#9D9D9D",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 6,
};

export function AlumnaProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const [inactiva, setInactiva] = useState(false);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingEstado, setSavingEstado] = useState(false);

  const reloadStudent = useCallback(
    async (opts?: { quiet?: boolean }) => {
      if (!id) {
        setStudent(null);
        setLoading(false);
        return;
      }
      if (!opts?.quiet) setLoading(true);
      try {
        const [students, paymentsByStudent, attendance] = await Promise.all([
          getAdminStudents(),
          getPaymentsByStudent(),
          getAttendanceByStudent(id),
        ]);
        const found = students.find((item) => item.id === id) ?? null;
        if (found) {
          const merged: Student = {
            ...found,
            payments: paymentsByStudent[id] ?? [],
            attendance,
          };
          setStudent(merged);
          setInactiva(!merged.activa);
        } else {
          setStudent(null);
        }
      } catch {
        setStudent(null);
      } finally {
        if (!opts?.quiet) setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    void reloadStudent();
  }, [reloadStudent]);

  const openEdit = () => {
    if (!student) return;
    setEditForm(studentToEditForm(student));
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditForm(null);
  };

  const handleSaveEdit = async () => {
    if (!student || !editForm || !id) return;
    const fee = Number(String(editForm.cuota).replace(/\D/g, ""));
    if (Number.isNaN(fee) || fee < 0) {
      alert("Indica una cuota mensual válida.");
      return;
    }
    if (!editForm.nombre.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      await updateAdminStudentProfile(id, {
        nombre: editForm.nombre.trim(),
        correo: editForm.correo.trim() || null,
        telefono: editForm.telefono.trim() || null,
        matricula: editForm.matricula.trim() || undefined,
        plan: editForm.plan.trim() || null,
        horario: editForm.horario.trim() || null,
        fecha_nacimiento: editForm.birthDate.trim() || null,
        fecha_ingreso: editForm.joinDate.trim() || null,
        cuota_mensual: fee,
        estado_pago: editForm.estadoPago,
        ultimo_pago: editForm.ultimoPago.trim() || null,
        proximo_pago: editForm.proximoPago.trim() || null,
        contacto_emergencia:
          [editForm.emergencyName, editForm.emergencyPhone, editForm.emergencyRel].filter(Boolean).join(" · ") || null,
        notas: editForm.notas.trim() || null,
      });
      await reloadStudent({ quiet: true });
      setEditing(false);
      setEditForm(null);
      alert("Datos actualizados.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const confirmEstadoChange = async () => {
    if (!student || !id) return;
    setSavingEstado(true);
    try {
      await updateAdminStudentProfile(id, { estado: inactiva });
      await reloadStudent({ quiet: true });
      setMostrarAlerta(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo actualizar el estado.");
    } finally {
      setSavingEstado(false);
    }
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
  const attendancePct = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;

  const setField = (key: keyof EditFormState) => (v: string) => {
    setEditForm((f) => (f ? { ...f, [key]: v } : f));
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1100 }}>
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
          flexWrap: "wrap",
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
        <div className="flex-1" style={{ minWidth: 200 }}>
          <div className="flex items-center gap-3 mb-1" style={{ flexWrap: "wrap" }}>
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
            {student.matricula} · Ingresó el {formatDisplayDate(student.joinDate)}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => (editing ? cancelEdit() : openEdit())}
            style={{
              background: editing ? "rgba(200,184,216,0.25)" : "transparent",
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
            {editing ? "Cerrar edición" : "Editar"}
          </button>

          <button
            type="button"
            onClick={() => setMostrarAlerta(true)}
            disabled={savingEstado}
            style={{
              background: inactiva ? "rgba(209,231,201,0.3)" : "rgba(242,212,215,0.3)",
              border: inactiva ? "1.5px solid rgba(209,231,201,0.8)" : "1.5px solid #F2D4D7",
              borderRadius: 10,
              padding: "9px 18px",
              cursor: savingEstado ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: "0.82rem",
              color: inactiva ? "#4A7C59" : "#B05070",
              fontFamily: "'DM Sans', sans-serif",
              opacity: savingEstado ? 0.7 : 1,
            }}
          >
            {inactiva ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            {inactiva ? "Reactivar" : "Inactivar"}
          </button>
        </div>
      </div>

      {editing && editForm && (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "28px 32px",
            boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
            marginBottom: 20,
            border: "1px solid #E8DFF0",
          }}
        >
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.15rem",
              color: "#1A1A1A",
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            Editar información
          </h3>
          <p style={{ fontSize: "0.78rem", color: "#9D9D9D", marginBottom: 22, maxWidth: 720 }}>
            El correo aquí es el registrado en la ficha (<code style={{ fontSize: "0.75rem" }}>correo</code> en base de
            datos). El inicio de sesión sigue ligado al correo de Supabase Auth salvo que lo cambies desde el panel de
            Supabase.
          </p>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input style={inputStyle} value={editForm.nombre} onChange={(e) => setField("nombre")(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Correo (ficha)</label>
              <input style={inputStyle} type="email" value={editForm.correo} onChange={(e) => setField("correo")(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Celular</label>
              <input style={inputStyle} value={editForm.telefono} onChange={(e) => setField("telefono")(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Matrícula (LFS-001)</label>
              <input style={inputStyle} value={editForm.matricula} onChange={(e) => setField("matricula")(e.target.value)} placeholder="LFS-001" />
            </div>
            <div>
              <label style={labelStyle}>Fecha de nacimiento</label>
              <input style={inputStyle} type="date" value={editForm.birthDate} onChange={(e) => setField("birthDate")(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Fecha de ingreso</label>
              <input style={inputStyle} type="date" value={editForm.joinDate} onChange={(e) => setField("joinDate")(e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Horario / días de clase</label>
              <input
                style={inputStyle}
                value={editForm.horario}
                onChange={(e) => setField("horario")(e.target.value)}
                placeholder="Ej. Lun y Mié 19:00"
              />
            </div>
            <div>
              <label style={labelStyle}>Plan</label>
              <input style={inputStyle} value={editForm.plan} onChange={(e) => setField("plan")(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Cuota mensual</label>
              <input style={inputStyle} value={editForm.cuota} onChange={(e) => setField("cuota")(e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label style={labelStyle}>Estado de pago</label>
              <select
                style={inputStyle}
                value={editForm.estadoPago}
                onChange={(e) =>
                  setEditForm((f) => (f ? { ...f, estadoPago: e.target.value as PaymentStatus } : f))
                }
              >
                <option value="Al día">Al día</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Vencido">Vencido</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Último pago</label>
              <input style={inputStyle} type="date" value={editForm.ultimoPago} onChange={(e) => setField("ultimoPago")(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Próximo pago</label>
              <input style={inputStyle} type="date" value={editForm.proximoPago} onChange={(e) => setField("proximoPago")(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Contacto emergencia — nombre</label>
              <input style={inputStyle} value={editForm.emergencyName} onChange={(e) => setField("emergencyName")(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Contacto emergencia — teléfono</label>
              <input style={inputStyle} value={editForm.emergencyPhone} onChange={(e) => setField("emergencyPhone")(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Contacto emergencia — parentesco</label>
              <input style={inputStyle} value={editForm.emergencyRel} onChange={(e) => setField("emergencyRel")(e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Notas internas</label>
              <textarea
                style={{ ...inputStyle, minHeight: 88, resize: "vertical" }}
                value={editForm.notas}
                onChange={(e) => setField("notas")(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={saving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 22px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                color: "#1A1A1A",
                fontSize: "0.85rem",
                cursor: saving ? "default" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                opacity: saving ? 0.75 : 1,
              }}
            >
              <Save size={16} />
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              style={{
                padding: "10px 22px",
                borderRadius: 10,
                border: "1.5px solid #E8E4DF",
                background: "transparent",
                color: "#9D9D9D",
                fontSize: "0.85rem",
                cursor: saving ? "default" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
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
            <InfoRow icon={Phone} label="Celular" value={student.phone || "—"} />
            <InfoRow icon={Mail} label="Email" value={student.email || "—"} />
            <InfoRow icon={Calendar} label="Fecha de Nacimiento" value={formatDisplayDate(student.birthDate)} />
            <InfoRow icon={Clock} label="Horario" value={student.schedule || "—"} />
            <InfoRow icon={CreditCard} label="Plan" value={student.plan || "—"} />

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
                {inactiva ? <XCircle size={13} color="#C8B8D8" /> : <CheckCircle2 size={13} color="#C8B8D8" />}
              </div>
              <div>
                <p style={{ fontSize: "0.72rem", color: "#9D9D9D", letterSpacing: "0.04em" }}>Estado</p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 4,
                    padding: "3px 12px",
                    borderRadius: 20,
                    fontSize: "0.72rem",
                    background: inactiva ? "rgba(242,212,215,0.4)" : "rgba(209,231,201,0.5)",
                    color: inactiva ? "#B05070" : "#4A7C59",
                  }}
                >
                  {inactiva ? "Inactiva" : "Activa"}
                </span>
              </div>
            </div>
          </div>
        </div>

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
              <span style={{ fontSize: "0.8rem", color: "#1A1A1A" }}>{formatDisplayDate(student.lastPaymentDate)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: "0.8rem", color: "#9D9D9D" }}>Próximo pago</span>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: new Date(student.nextPaymentDate) < new Date() ? "#B05070" : "#1A1A1A",
                }}
              >
                {formatDisplayDate(student.nextPaymentDate)}
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
                    {p.method && <p style={{ fontSize: "0.7rem", color: "#C0BAB4" }}>{p.method}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: "0.82rem", color: "#1A1A1A" }}>${p.amount.toLocaleString("es-CL")}</span>
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
                          p.status === "Pagado" ? "#4A7C59" : p.status === "Pendiente" ? "#7B5EA7" : "#B05070",
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
            {student.emergencyContacts.length === 0 ? (
              <p style={{ fontSize: "0.82rem", color: "#9D9D9D" }}>Sin contacto de emergencia registrado.</p>
            ) : (
              student.emergencyContacts.map((ec, i) => (
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
                      background: i === 0 ? "rgba(200,184,216,0.3)" : "rgba(242,212,215,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      color: "#1A1A1A",
                      flexShrink: 0,
                    }}
                  >
                    {ec.name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: "0.85rem", color: "#1A1A1A" }}>{ec.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "#9D9D9D" }}>{ec.relationship}</p>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#7B5EA7" }}>{ec.phone}</p>
                </div>
              ))
            )}
          </div>
          {student.notes ? (
            <div
              style={{
                marginTop: 20,
                padding: "14px 16px",
                background: "rgba(200,184,216,0.1)",
                borderRadius: 10,
                borderLeft: "3px solid #C8B8D8",
              }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#9D9D9D",
                  marginBottom: 4,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Notas
              </p>
              <p style={{ fontSize: "0.82rem", color: "#1A1A1A" }}>{student.notes}</p>
            </div>
          ) : null}
        </div>

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
                      a.status === "Presente" ? "#4A7C59" : a.status === "Justificado" ? "#7B5EA7" : "#C0BAB4",
                  }}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
              {inactiva ? <CheckCircle2 size={24} color="#4A7C59" /> : <XCircle size={24} color="#B05070" />}
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
                type="button"
                onClick={() => setMostrarAlerta(false)}
                disabled={savingEstado}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "1.5px solid #E8DFF0",
                  background: "transparent",
                  color: "#9D9D9D",
                  fontSize: "0.82rem",
                  cursor: savingEstado ? "default" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmEstadoChange()}
                disabled={savingEstado}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: inactiva ? "rgba(209,231,201,0.6)" : "rgba(242,212,215,0.6)",
                  color: inactiva ? "#4A7C59" : "#B05070",
                  fontSize: "0.82rem",
                  cursor: savingEstado ? "default" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: savingEstado ? 0.75 : 1,
                }}
              >
                {savingEstado ? "Guardando…" : inactiva ? "Sí, reactivar" : "Sí, inactivar"}
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
        <p style={{ fontSize: "0.72rem", color: "#9D9D9D", letterSpacing: "0.04em" }}>{label}</p>
        <p style={{ fontSize: "0.85rem", color: "#1A1A1A", marginTop: 1 }}>{value}</p>
      </div>
    </div>
  );
}
