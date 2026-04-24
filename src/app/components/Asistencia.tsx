import { useEffect, useState } from "react";
import { getAlumnas } from "../../../backend/alumnas";
import { getAsistencia, createMultipleAsistencia, type AttendanceRecord } from "../../../backend/asistencia";
import type { Student } from "../data/mockData";
import { CheckCircle2, XCircle, CalendarDays, ChevronDown, Save } from "lucide-react";

const classes = [
  "Todas las clases",
  "Pilates Matinal",
  "Pilates Reformer",
  "Pilates Vespertino",
  "Pilates Fin de Semana",
  "Barre Fitness",
  "Yoga Flow",
  "Yoga Nocturno",
];

const today = new Date().toLocaleDateString("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

type AttRecord = {
  studentId: string;
  studentName: string;
  initials: string;
  class: string;
  present: boolean;
};

export function Asistencia() {
  const [selectedClass, setSelectedClass] = useState("Todas las clases");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, [date]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const [studentsData, attendanceData] = await Promise.all([
        getAlumnas(),
        getAsistencia(date)
      ]);

      setStudents(studentsData);

      // Create attendance records for all students
      const attendanceMap = new Map(attendanceData.map(a => [`${a.id_alumna}-${a.fecha}`, a]));

      const attendanceRecords = studentsData.map((s, i) => {
        const existing = attendanceMap.get(`${s.id}-${date}`);
        return {
          studentId: s.id,
          studentName: s.name,
          initials: s.initials,
          class: s.schedule.split("—")[1]?.trim().includes("9:00")
            ? "Pilates Matinal"
            : s.schedule.includes("Reformer")
            ? "Pilates Reformer"
            : s.schedule.includes("6:00 PM")
            ? "Pilates Vespertino"
            : s.schedule.includes("Sábado")
            ? "Pilates Fin de Semana"
            : ["Barre Fitness", "Yoga Flow", "Pilates Matinal", "Yoga Nocturno"][i % 4],
          present: !!existing, // true si ya existe un registro de asistencia
        };
      });

      setAttendance(attendanceRecords);
    } catch (error) {
      console.error('Error loading attendance:', error);
      setStudents([]);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      // Solo guardar asistencia para estudiantes presentes
      const attendanceToSave = attendance
        .filter(a => a.present)
        .map(a => ({
          id_alumna: a.studentId,
          fecha: date,
          // No incluir estado ni clase por ahora
        }));

      if (attendanceToSave.length === 0) {
        alert('No hay asistencia para guardar');
        setSaving(false);
        return;
      }

      const result = await createMultipleAsistencia(attendanceToSave);
      if (result.success) {
        alert('Asistencia guardada correctamente');
        // Recargar asistencia para mostrar los datos guardados
        loadAttendance();
      } else {
        alert('Error al guardar asistencia: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error al guardar asistencia');
    } finally {
      setSaving(false);
    }
  };
  const toggleAttendance = (studentId: string, present: boolean) => {
    setAttendance((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, present } : a))
    );
  };

  const filtered =
    selectedClass === "Todas las clases"
      ? attendance
      : attendance.filter((a) => a.class === selectedClass || selectedClass === "General");

  const presentes = filtered.filter((a) => a.present).length;
  const ausentes = filtered.filter((a) => !a.present).length;

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1100 }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p style={{ color: "#C8B8D8", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
            Control
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              fontWeight: 400,
              color: "#1A1A1A",
            }}
          >
            Asistencia
          </h1>
          <p style={{ color: "#9D9D9D", fontSize: "0.85rem", marginTop: 4, textTransform: "capitalize" }}>
            {today}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={saveAttendance}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: saving ? "#E8E4DF" : "#C8B8D8",
              color: saving ? "#9D9D9D" : "#FFFFFF",
              border: "none",
              borderRadius: 12,
              padding: "10px 16px",
              fontSize: "0.85rem",
              fontFamily: "'DM Sans', sans-serif",
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
              transition: "all 0.2s",
            }}
          >
            <Save size={14} />
            {saving ? "Guardando..." : "Guardar Asistencia"}
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#FFFFFF",
              borderRadius: 12,
              padding: "10px 16px",
              boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
            }}
          >
            <CalendarDays size={14} color="#C8B8D8" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: "0.85rem",
                color: "#1A1A1A",
                background: "transparent",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        {[
          { label: "Presentes", value: presentes, color: "rgba(209,231,201,0.4)", text: "#4A7C59" },
          { label: "Ausentes", value: ausentes, color: "rgba(242,212,215,0.5)", text: "#B05070" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "20px 24px",
              boxShadow: "0 1px 10px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: item.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.label === "Presentes" ? (
                <CheckCircle2 size={20} color={item.text} />
              ) : item.label === "Ausentes" ? (
                <XCircle size={20} color={item.text} />
              ) : (
                <MinusCircle size={20} color={item.text} />
              )}
            </div>
            <div>
              <p style={{ fontSize: "0.72rem", color: "#9D9D9D" }}>{item.label}</p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.8rem",
                  color: "#1A1A1A",
                  lineHeight: 1,
                  marginTop: 2,
                }}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Class Filter */}
      <div className="flex items-center gap-3 mb-6">
        <div
          style={{
            position: "relative",
            display: "inline-block",
          }}
        >
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{
              appearance: "none",
              padding: "9px 36px 9px 16px",
              borderRadius: 10,
              border: "1.5px solid #E8E4DF",
              background: "#FFFFFF",
              fontSize: "0.82rem",
              color: "#1A1A1A",
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {classes.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            color="#9D9D9D"
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          />
        </div>
      </div>

      {/* Attendance Table */}
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
              {["Alumna", "Clase", "Presente", "Marcar Asistencia"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "14px 24px",
                    fontSize: "0.68rem",
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
            {filtered.map((a, i) => {
              const student = students.find((s) => s.id === a.studentId);
              return (
                <tr
                  key={a.studentId}
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid #F8F6F4" : "none",
                  }}
                >
                  <td style={{ padding: "16px 24px" }}>
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 34,
                          height: 34,
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
                          flexShrink: 0,
                        }}
                      >
                        {a.initials}
                      </div>
                      <div>
                        <p style={{ fontSize: "0.85rem", color: "#1A1A1A" }}>{a.studentName}</p>
                        <p style={{ fontSize: "0.72rem", color: "#C0BAB4" }}>
                          {student?.matricula}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: "0.82rem", color: "#9D9D9D" }}>
                    {a.class}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: "0.75rem",
                        background: a.present ? "rgba(209,231,201,0.4)" : "rgba(242,212,215,0.4)",
                        color: a.present ? "#4A7C59" : "#B05070",
                      }}
                    >
                      {a.present ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {a.present ? "Presente" : "Ausente"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <input
                      type="checkbox"
                      checked={a.present}
                      onChange={(e) => toggleAttendance(a.studentId, e.target.checked)}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: "2px solid #E8E4DF",
                        background: a.present ? "#7AC99A" : "transparent",
                        cursor: "pointer",
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => alert("¡Asistencia guardada! (demo)")}
          style={{
            background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
            border: "none",
            borderRadius: 12,
            padding: "11px 28px",
            cursor: "pointer",
            fontSize: "0.85rem",
            color: "#1A1A1A",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Guardar Asistencia
        </button>
      </div>
    </div>
  );
}
