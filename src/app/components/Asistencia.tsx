import { useEffect, useMemo, useState } from "react";
import {
  getAttendanceForDate,
  listAttendanceRowsByDateRange,
  getPresentAttendanceDaysByStudent,
  updateAttendanceStatusForDate,
  listHorarioOptions,
  getStudentsByIds,
} from "../../../backend/adminData";
import { CheckCircle2, XCircle, CalendarDays, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";

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
  horario: string;
  status: "Presente" | "Ausente";
};

function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function Asistencia() {
  const [selectedClass, setSelectedClass] = useState("Todas las clases");
  const [date, setDate] = useState(toLocalISODate(new Date()));
  const [attendance, setAttendance] = useState<AttRecord[]>([]);
  const [presentByStudent, setPresentByStudent] = useState<Record<string, string[]>>({});
  const [nameFilter, setNameFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [horarioMap, setHorarioMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [savedAttendance, presentMap, horarios] = await Promise.all([
          getAttendanceForDate(date),
          getPresentAttendanceDaysByStudent(),
          listHorarioOptions(),
        ]);
        setPresentByStudent(presentMap);

        // Guardar el mapa de horarios para usar en la exportación
        const horarioMapTemp = new Map(horarios.map((h) => [h.id, h.label]));
        setHorarioMap(Object.fromEntries(horarioMapTemp));

        const ids = Array.from(new Set(savedAttendance.map((r) => r.id_alumna).filter(Boolean)));
        const students = await getStudentsByIds(ids);
        const studentById = new Map(students.map((s) => [s.id, s]));
        const rows = savedAttendance.map((saved) => {
          const student = studentById.get(saved.id_alumna);
          return {
            studentId: saved.id_alumna,
            studentName: student?.name ?? "Alumna",
            initials: student?.initials ?? "AL",
            class: (saved.clase ?? saved.clase_nombre ?? "Clase").trim(),
            horario: saved.id_horario ? horarioMapTemp.get(String(saved.id_horario)) ?? "—" : "—",
            status: saved.estado === "Presente" ? "Presente" : "Ausente",
          } satisfies AttRecord;
        });
        setAttendance(rows);
        setPendingUpdates({});
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cargar asistencia");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [date]);

  const filtered = useMemo(() => {
    const q = nameFilter.trim().toLowerCase();
    let rows =
      selectedClass === "Todas las clases"
        ? attendance
        : attendance.filter((a) => a.class === selectedClass);
    if (q) {
      rows = rows.filter((a) => a.studentName.toLowerCase().includes(q));
    }
    return rows;
  }, [attendance, selectedClass, nameFilter]);
  const classOptions = useMemo(
    () => ["Todas las clases", ...Array.from(new Set(attendance.map((a) => a.class))).sort((a, b) => a.localeCompare(b, "es"))],
    [attendance],
  );
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, "Presente" | "Ausente">>({});
  const [savingPending, setSavingPending] = useState(false);

  const markAttendanceLocal = (studentId: string, status: "Presente" | "Ausente") => {
    setAttendance((prev) => prev.map((a) => (a.studentId === studentId ? { ...a, status } : a)));
    setPendingUpdates((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRegisterAttendance = async () => {
    const updates = Object.entries(pendingUpdates).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    if (updates.length === 0) {
      alert("No hay cambios para registrar.");
      return;
    }

    setSavingPending(true);
    try {
      await updateAttendanceStatusForDate({ date, updates: updates as any });
      setPendingUpdates({});
      alert("Asistencia registrada.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo registrar la asistencia.");
    } finally {
      setSavingPending(false);
    }
  };

  const presentes = filtered.filter((a) => a.status === "Presente").length;
  const ausentes = filtered.filter((a) => a.status === "Ausente").length;

  const handleExportMonth = async () => {
    if (Object.keys(pendingUpdates).length > 0) {
      await handleRegisterAttendance();
    }
    const [y, m] = exportMonth.split("-").map(Number);
    if (!y || !m) {
      alert("Selecciona un mes válido.");
      return;
    }

    try {
      const first = `${y}-${String(m).padStart(2, "0")}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const last = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      console.log(`🔍 Obteniendo asistencia desde ${first} hasta ${last}`);

      // Obtener datos de la base de datos
      let rows = await listAttendanceRowsByDateRange({ fromDate: first, toDate: last });

      console.log(`📊 Datos obtenidos (${rows.length} registros):`, rows);

      if (rows.length === 0) {
        alert(`❌ No hay datos de asistencia para el período ${first} a ${last}.\n\nVerifica que:\n- Hay registros en la base de datos\n- Las fechas están correctas\n- Los registros pertenecen a este mes\n\nAbre la consola (F12) para ver más detalles.`);
        return;
      }

      // Ordenar por día en orden ascendente
      rows = rows.sort((a, b) => {
        const dateA = new Date(a.day.split("/").reverse().join("-")).getTime();
        const dateB = new Date(b.day.split("/").reverse().join("-")).getTime();
        return dateA - dateB;
      });

      // Transformar datos para Excel usando el horario del frontend
      const excelData = rows.map((r) => ({
        Alumna: r.studentName,
        Clase: r.className,
        Horario: horarioMap[r.horario || ""] || r.horario || "Sin horario",
        Estado: r.status,
        Día: r.day,
      }));

      console.log(`✅ Datos formateados para Excel:`, excelData);

      // Crear libro de Excel
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Configurar ancho de columnas
      const columnWidths = [
        { wch: 20 }, // Alumna
        { wch: 20 }, // Clase
        { wch: 20 }, // Horario
        { wch: 12 }, // Estado
        { wch: 12 }, // Día
      ];
      worksheet["!cols"] = columnWidths;

      // Crear estilos para el encabezado
      const headerStyle = {
        fill: { fgColor: { rgb: "FFF3F0EC" } },
        font: { bold: true, color: { rgb: "FF1A1A1A" } },
        alignment: { horizontal: "center", vertical: "center" },
      };

      // Aplicar estilos al encabezado
      const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!worksheet[address]) continue;
        worksheet[address].s = headerStyle;
      }

      // Crear libro de trabajo
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia");

      // Descargar archivo
      XLSX.writeFile(workbook, `asistencia-${exportMonth}.xlsx`);
      alert(`La asistencia se descargó correctamente.`);
    } catch (e) {
      console.error("❌ Error al descargar:", e);
      alert(e instanceof Error ? `Error: ${e.message}` : "Error al descargar el archivo. Revisa la consola (F12) para más detalles.");
    }
  };

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
              ) : null}
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

      {/* Class Filter + buscar alumna */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="search"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          placeholder="Buscar alumna por nombre…"
          style={{
            minWidth: 220,
            padding: "9px 14px",
            borderRadius: 10,
            border: "1.5px solid #E8E4DF",
            background: "#FFFFFF",
            fontSize: "0.82rem",
            color: "#1A1A1A",
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
          }}
        />
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
            {classOptions.map((c) => (
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

      {error && (
        <div style={{ marginBottom: 16, color: "#B05070", fontSize: "0.82rem" }}>
          {error}
        </div>
      )}

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
              {["Alumna", "Días cumplidos", "Clase", "Horario", "Estado", "Marcar Asistencia"].map((h) => (
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
              const days = presentByStudent[a.studentId] ?? [];
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
                          {a.studentId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", maxWidth: 280, verticalAlign: "top" }}>
                    <p style={{ fontSize: "0.72rem", color: "#7B5EA7", marginBottom: 6, fontWeight: 600 }}>
                      {days.length} día{days.length === 1 ? "" : "s"} con asistencia
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {days.length === 0 ? (
                        <span style={{ fontSize: "0.72rem", color: "#C0BAB4" }}>—</span>
                      ) : (
                        days.slice(0, 12).map((d) => (
                          <span
                            key={d}
                            style={{
                              fontSize: "0.65rem",
                              padding: "3px 8px",
                              borderRadius: 8,
                              background: "rgba(209,231,201,0.45)",
                              color: "#4A7C59",
                              border: "1px solid rgba(74,124,89,0.25)",
                            }}
                          >
                            {new Date(d + "T12:00:00").toLocaleDateString("es-CL", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        ))
                      )}
                      {days.length > 12 ? (
                        <span style={{ fontSize: "0.65rem", color: "#9D9D9D" }}>+{days.length - 12}</span>
                      ) : null}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: "0.82rem", color: "#9D9D9D" }}>
                    {a.class}
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: "0.82rem", color: "#9D9D9D" }}>
                    {a.horario}
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
                        background:
                          a.status === "Presente"
                            ? "rgba(209,231,201,0.4)"
                            : "rgba(242,212,215,0.4)",
                        color:
                          a.status === "Presente"
                            ? "#4A7C59"
                            : "#B05070",
                      }}
                    >
                      {a.status === "Presente" ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div className="flex items-center gap-2">
                      {(["Presente", "Ausente"] as ("Presente" | "Ausente")[]).map(
                        (s) => (
                          <button
                            key={s}
                            onClick={() => markAttendanceLocal(a.studentId, s)}
                            disabled={savingPending}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 8,
                              border:
                                a.status === s
                                  ? "1.5px solid " +
                                    (s === "Presente" ? "#7AC99A" : "#EAA0B0")
                                  : "1.5px solid #E8E4DF",
                              background:
                                a.status === s
                                  ? s === "Presente"
                                    ? "rgba(209,231,201,0.3)"
                                    : "rgba(242,212,215,0.3)"
                                  : "transparent",
                              color:
                                a.status === s
                                  ? s === "Presente"
                                    ? "#4A7C59"
                                    : "#B05070"
                                  : "#C0BAB4",
                              fontSize: "0.72rem",
                              cursor: "pointer",
                              fontFamily: "'DM Sans', sans-serif",
                              transition: "all 0.15s",
                              opacity: savingPending ? 0.7 : 1,
                            }}
                          >
                            {s}
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4 gap-2">
        <input
          type="month"
          value={exportMonth}
          onChange={(e) => setExportMonth(e.target.value)}
          style={{
            border: "1.5px solid #E8E4DF",
            borderRadius: 10,
            padding: "10px 12px",
            background: "#fff",
            fontSize: "0.82rem",
            color: "#1A1A1A",
          }}
        />
        <button
          onClick={handleExportMonth}
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E8E4DF",
            borderRadius: 12,
            padding: "11px 20px",
            cursor: "pointer",
            fontSize: "0.85rem",
            color: "#5C5650",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Descargar Excel
        </button>
        <button
          type="button"
          onClick={handleRegisterAttendance}
          disabled={savingPending || loading}
          style={{
            background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
            border: "none",
            borderRadius: 12,
            padding: "11px 24px",
            cursor: savingPending ? "default" : "pointer",
            fontSize: "0.85rem",
            color: "#1A1A1A",
            fontFamily: "'DM Sans', sans-serif",
            opacity: savingPending || loading ? 0.7 : 1,
          }}
        >
          {savingPending ? "Registrando..." : "Registrar Asistencia"}
        </button>
      </div>
    </div>
  );
}
