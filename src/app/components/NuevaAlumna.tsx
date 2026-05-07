import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Save, UserPlus } from "lucide-react";
import { createAdminStudent } from "../../../backend/adminData";

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "0.72rem",
          color: "#9D9D9D",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 10,
          border: "1.5px solid #E8E4DF",
          background: "#FDFCFB",
          fontSize: "0.85rem",
          color: "#1A1A1A",
          fontFamily: "'DM Sans', sans-serif",
          outline: "none",
          transition: "border 0.2s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.border = "1.5px solid #C8B8D8")}
        onBlur={(e) => (e.target.style.border = "1.5px solid #E8E4DF")}
      />
    </div>
  );
}

export function NuevaAlumna() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    plan: "Plan Premium",
    schedule: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRel: "",
    notes: "",
    /** Solo números, hasta 3 dígitos (ej. 42 → LFS-042). Vacío = asignación automática. */
    matriculaDigits: "",
  });

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      alert("Nombre y email son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      const digits = form.matriculaDigits.replace(/\D/g, "").slice(0, 3);
      const result = await createAdminStudent({
        name: form.name,
        email: form.email,
        phone: form.phone,
        birthDate: form.birthDate,
        plan: form.plan,
        schedule: form.schedule,
        emergencyContact: [form.emergencyName, form.emergencyPhone, form.emergencyRel]
          .filter(Boolean)
          .join(" · "),
        matricula: digits.length > 0 ? digits : undefined,
      });
      alert(
        `Alumna registrada en base de datos.\nID: ${result.id}\nPassword temporal: ${result.temporaryPassword}`,
      );
      navigate("/dashboard/alumnas");
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo registrar la alumna.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: 900 }}>
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
        Volver
      </button>

      <div className="flex items-center gap-4 mb-8">
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
          <UserPlus size={20} color="#1A1A1A" />
        </div>
        <div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.8rem",
              fontWeight: 400,
              color: "#1A1A1A",
            }}
          >
            Registrar Nueva Alumna
          </h1>
          <p style={{ color: "#9D9D9D", fontSize: "0.82rem" }}>
            Completa la información para incorporar una nueva alumna al estudio.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Personal Data */}
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
              marginBottom: 24,
              fontWeight: 500,
            }}
          >
            Datos Personales
          </h3>
          <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <Field label="Nombre completo" placeholder="Ej. Valentina Torres" value={form.name} onChange={set("name")} />
            <Field label="Email" placeholder="correo@ejemplo.com" type="email" value={form.email} onChange={set("email")} />
            <Field label="Celular" placeholder="+56 9 1234 5678" value={form.phone} onChange={set("phone")} />
            <Field label="Fecha de nacimiento" placeholder="" type="date" value={form.birthDate} onChange={set("birthDate")} />
          </div>
          <div style={{ marginTop: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.72rem",
                color: "#9D9D9D",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Matrícula (3 números, opcional)
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "0.85rem", color: "#7B5EA7", fontWeight: 500 }}>LFS-</span>
              <input
                value={form.matriculaDigits}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    matriculaDigits: e.target.value.replace(/\D/g, "").slice(0, 3),
                  }))
                }
                placeholder="001"
                maxLength={3}
                style={{
                  width: 96,
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #E8E4DF",
                  background: "#FDFCFB",
                  fontSize: "0.85rem",
                  color: "#1A1A1A",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                }}
              />
            </div>
            <p style={{ fontSize: "0.72rem", color: "#C0BAB4", marginTop: 8 }}>
              Si lo dejas vacío, se asigna el siguiente número disponible (LFS-001 … LFS-999).
            </p>
          </div>
        </div>

        {/* Plan & Schedule */}
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
              marginBottom: 24,
              fontWeight: 500,
            }}
          >
            Plan & Horario
          </h3>
          <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.72rem",
                  color: "#9D9D9D",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Plan
              </label>
              <select
                value={form.plan}
                onChange={(e) => set("plan")(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #E8E4DF",
                  background: "#FDFCFB",
                  fontSize: "0.85rem",
                  color: "#1A1A1A",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                }}
              >
                <option>Plan Básico</option>
                <option>Plan Mensual</option>
                <option>Plan Premium</option>
              </select>
            </div>
            <Field label="Horario" placeholder="Ej. Lunes, Miércoles — 9:00 AM" value={form.schedule} onChange={set("schedule")} />
          </div>
        </div>

        {/* Emergency */}
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
              marginBottom: 24,
              fontWeight: 500,
            }}
          >
            Contacto de Emergencia
          </h3>
          <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <Field label="Nombre" placeholder="Nombre del contacto" value={form.emergencyName} onChange={set("emergencyName")} />
            <Field label="Teléfono" placeholder="+56 9 1234 5678" value={form.emergencyPhone} onChange={set("emergencyPhone")} />
            <Field label="Relación" placeholder="Ej. Madre, Esposo..." value={form.emergencyRel} onChange={set("emergencyRel")} />
          </div>
        </div>

        {/* Notes */}
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
              marginBottom: 24,
              fontWeight: 500,
            }}
          >
            Notas Adicionales
          </h3>
          <textarea
            placeholder="Observaciones, condiciones de salud relevantes, preferencias..."
            value={form.notes}
            onChange={(e) => set("notes")(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 10,
              border: "1.5px solid #E8E4DF",
              background: "#FDFCFB",
              fontSize: "0.85rem",
              color: "#1A1A1A",
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate("/dashboard/alumnas")}
            style={{
              padding: "11px 24px",
              borderRadius: 10,
              border: "1.5px solid #E8E4DF",
              background: "transparent",
              color: "#9D9D9D",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: "11px 28px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
              color: "#1A1A1A",
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'DM Sans', sans-serif",
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={14} />
            {saving ? "Guardando..." : "Guardar Alumna"}
          </button>
        </div>
      </div>
    </div>
  );
}