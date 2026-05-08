import { supabase } from "./supabase";
import { createClient } from "@supabase/supabase-js";
import type { AttendanceStatus, PaymentStatus, Student } from "../src/app/data/mockData";

export type ClassScheduleCell = {
  day: string;
  name: string | null;
  type: string;
};

export type ClassScheduleRow = {
  time: string;
  classes: ClassScheduleCell[];
};

export type HorarioOption = {
  id: string;
  label: string;
};

type DbUser = {
  id_alumna: string;
  nombre: string | null;
  telefono: string | null;
  correo?: string | null;
  matricula: string | null;
  plan: string | null;
  horario: string | null;
  fecha_nacimiento: string | null;
  fecha_ingreso: string | null;
  estado_pago: PaymentStatus | null;
  proximo_pago: string | null;
  ultimo_pago: string | null;
  cuota_mensual: number | null;
  estado: boolean | null;
  contacto_emergencia?: string | null;
  notas?: string | null;
};

/** Parsea el texto guardado en `contacto_emergencia` (nombre · teléfono · parentesco). */
export function splitEmergencyContact(raw: string | null | undefined): {
  name: string;
  phone: string;
  relationship: string;
} {
  if (!raw?.trim()) {
    return { name: "", phone: "", relationship: "" };
  }
  const parts = raw.split(" · ").map((p) => p.trim());
  return {
    name: parts[0] ?? "",
    phone: parts[1] ?? "",
    relationship: parts[2] ?? "",
  };
}

function emergencyContactsFromDb(raw: string | null | undefined): Student["emergencyContacts"] {
  const { name, phone, relationship } = splitEmergencyContact(raw);
  if (!name && !phone && !relationship) {
    return [];
  }
  return [{ name: name || "—", phone: phone || "—", relationship: relationship || "—" }];
}

type DbPayment = {
  id?: string;
  id_pago?: string;
  id_alumna: string;
  fecha?: string;
  fecha_pago?: string;
  monto: number;
  metodo: string | null;
  metodo_pago?: string | null;
  estado?: "Pagado" | "Pendiente" | "Vencido";
  estado_pago?: "Pagado" | "Pendiente" | "Vencido";
  mes: string | null;
  mes_pago?: string | null;
};

type DbAttendance = {
  id_asistencia?: string;
  id_alumna: string;
  fecha?: string;
  fecha_asistencia?: string;
  id_horario?: string;
  clase?: string;
  clase_nombre?: string;
  estado: AttendanceStatus;
};

const attendanceTables = ["asistencias", "asistencia"] as const;
const isMissingColumnError = (message?: string) => {
  const m = (message || "").toLowerCase();
  return (
    (m.includes("could not find") && m.includes("column")) ||
    (m.includes("schema cache") && m.includes("column"))
  );
};

/** Nombre de columna citada en errores de PostgREST / Supabase por columna inexistente. */
function missingColumnNameFromError(message: string): string | null {
  const m1 = message.match(/Could not find the '([^']+)' column of/i);
  if (m1?.[1]) return m1[1];
  const m2 = message.match(/Could not find the "([^"]+)" column of/i);
  if (m2?.[1]) return m2[1];
  const m3 = message.match(/column ['"]([^'"]+)['"] of relation/i);
  if (m3?.[1]) return m3[1];
  return null;
}

const MATRICULA_SQL_HINT =
  'Falta la columna matricula en usuarios. En Supabase → SQL Editor ejecuta: alter table public.usuarios add column if not exists matricula text;';

function throwIfMatriculaColumnMissing(message?: string): void {
  const m = (message || "").toLowerCase();
  if (m.includes("matricula") && (m.includes("does not exist") || m.includes("could not find"))) {
    throw new Error(MATRICULA_SQL_HINT);
  }
}

/** Tabla aún no creada en Supabase o no expuesta al API (PostgREST). */
function isSupabaseTableUnavailableError(message?: string): boolean {
  const m = (message || "").toLowerCase();
  return (
    m.includes("does not exist") ||
    m.includes("relation") ||
    m.includes("schema cache") ||
    m.includes("could not find the table")
  );
}
/** Matrícula visible LFS-001 … LFS-999 */
export function normalizeMatriculaForCompare(raw: string): string {
  const t = raw.trim().toUpperCase().replace(/\s/g, "");
  const prefixed = t.match(/^LFS-(\d{1,3})$/);
  if (prefixed) {
    return `LFS-${prefixed[1].padStart(3, "0")}`;
  }
  const digits = t.match(/^(\d{1,3})$/);
  if (digits) {
    return `LFS-${digits[1].padStart(3, "0")}`;
  }
  return t;
}

export async function allocateNextMatricula(): Promise<string> {
  const { data, error } = await supabase.from("usuarios").select("*");
  if (error) {
    throwIfMatriculaColumnMissing(error.message);
    throw new Error(error.message);
  }
  let max = 0;
  for (const row of (data ?? []) as { matricula?: string | null }[]) {
    const m = row.matricula?.toUpperCase().match(/^LFS-(\d{3})$/);
    if (m) {
      max = Math.max(max, parseInt(m[1], 10));
    }
  }
  const next = max + 1;
  if (next > 999) {
    throw new Error("Límite de matrículas alcanzado (LFS-999).");
  }
  return `LFS-${String(next).padStart(3, "0")}`;
}

/** Asigna LFS-XXX si falta o el valor no cumple el formato de 3 dígitos. */
export async function ensureStudentMatriculaIfMissing(userId: string): Promise<string> {
  const { data: row, error } = await supabase.from("usuarios").select("*").eq("id_alumna", userId).maybeSingle();
  if (error) {
    throwIfMatriculaColumnMissing(error.message);
    throw new Error(error.message);
  }
  const m = (row as { matricula?: string | null } | null)?.matricula?.trim() ?? "";
  if (/^LFS-\d{3}$/i.test(m)) {
    return normalizeMatriculaForCompare(m);
  }
  const next = await allocateNextMatricula();
  const { error: upErr } = await supabase.from("usuarios").update({ matricula: next }).eq("id_alumna", userId);
  if (upErr) {
    throwIfMatriculaColumnMissing(upErr.message);
    throw new Error(upErr.message);
  }
  return next;
}

const paymentStatusFromDate = (nextPaymentDate?: string): PaymentStatus => {
  if (!nextPaymentDate) {
    return "Pendiente";
  }
  const today = new Date();
  const due = new Date(nextPaymentDate);
  const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) {
    return "Vencido";
  }
  if (days <= 3) {
    return "Pendiente";
  }
  return "Al día";
};

const initialsFromName = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");

const normalizeStudent = (user: DbUser): Student => {
  const name = user.nombre ?? "Sin nombre";
  const nextPaymentDate = user.proximo_pago ?? new Date().toISOString().split("T")[0];
  const lastPaymentDate = user.ultimo_pago ?? nextPaymentDate;
  const paymentStatus = user.estado_pago ?? paymentStatusFromDate(nextPaymentDate);

  return {
    id: user.id_alumna,
    name,
    avatar: "",
    initials: initialsFromName(name),
    matricula: user.matricula ? normalizeMatriculaForCompare(user.matricula) : "—",
    phone: user.telefono ?? "",
    email: user.correo ?? "",
    birthDate: user.fecha_nacimiento ?? "",
    joinDate: user.fecha_ingreso ?? new Date().toISOString().split("T")[0],
    schedule: user.horario ?? "Sin horario",
    plan: user.plan ?? "Plan Mensual",
    paymentStatus,
    nextPaymentDate,
    lastPaymentDate,
    monthlyFee: user.cuota_mensual ?? 0,
    emergencyContacts: emergencyContactsFromDb(user.contacto_emergencia),
    attendance: [],
    payments: [],
    notes: user.notas?.trim() ?? "",
    activa: user.estado ?? true,
  };
};

export async function getAdminStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("rol", 2)
    .order("nombre", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return (data as DbUser[]).map(normalizeStudent);
}

/** Busca alumnas (rol=2) por ids. Útil para pantallas que parten desde asistencias/citas. */
export async function getStudentsByIds(ids: string[]): Promise<Student[]> {
  const cleanIds = Array.from(new Set(ids.map((x) => String(x).trim()).filter(Boolean)));
  if (cleanIds.length === 0) return [];

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("rol", 2)
    .in("id_alumna", cleanIds);
  if (error) {
    throw new Error(error.message);
  }
  return (data as DbUser[]).map(normalizeStudent);
}

export async function getPaymentsByStudent(): Promise<Record<string, Student["payments"]>> {
  let data: DbPayment[] | null = null;
  const firstTry = await supabase.from("pagos").select("*").order("fecha", { ascending: false });
  if (firstTry.error) {
    const secondTry = await supabase.from("pagos").select("*");
    if (secondTry.error) {
      throw new Error(secondTry.error.message);
    }
    data = secondTry.data as DbPayment[];
  } else {
    data = firstTry.data as DbPayment[];
  }

  return (data ?? []).reduce<Record<string, Student["payments"]>>((acc, item) => {
    const paymentDate = item.fecha ?? item.fecha_pago ?? new Date().toISOString().split("T")[0];
    const bucket = acc[item.id_alumna] ?? [];
    const payStatus = item.estado_pago ?? item.estado ?? "Pendiente";
    bucket.push({
      id: item.id ?? item.id_pago ?? `${item.id_alumna}-${paymentDate}`,
      date: paymentDate,
      amount: item.monto,
      method: item.metodo_pago ?? item.metodo ?? "",
      status: payStatus,
      month: item.mes_pago ?? item.mes ?? "",
    });
    acc[item.id_alumna] = bucket;
    return acc;
  }, {});
}

export async function getAttendanceForDate(date: string): Promise<DbAttendance[]> {
  for (const table of attendanceTables) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .gte("fecha", `${date}T00:00:00`)
      .lt("fecha", `${date}T23:59:59`);
    if (!error) {
      return data as DbAttendance[];
    }
  }
  return [];
}

export async function saveAttendanceForDate(
  date: string,
  records: Array<{ studentId: string; className: string; status: AttendanceStatus }>,
) {
  let lastErrorMessage = "";

  const studentIds = Array.from(new Set(records.map((record) => record.studentId)));
  const { data: inscriptions } = await supabase
    .from("inscripcion")
    .select("id_alumna,id_horario")
    .in("id_alumna", studentIds);
  const horarioByStudent = new Map<string, string>();
  for (const row of (inscriptions as Array<{ id_alumna: string; id_horario: string | null }> | null) ?? []) {
    if (row.id_horario) {
      horarioByStudent.set(row.id_alumna, row.id_horario);
    }
  }

  const { data: horarioFallback } = await supabase.from("horario").select("id_horario").limit(1).maybeSingle();
  const fallbackHorarioId = (horarioFallback as { id_horario?: string } | null)?.id_horario ?? null;

  const missingHorarioStudents = studentIds.filter(
    (studentId) => !horarioByStudent.get(studentId) && !fallbackHorarioId,
  );
  if (missingHorarioStudents.length > 0) {
    throw new Error(
      `Falta inscripcion para alumnas (id_alumna): ${missingHorarioStudents.join(", ")}. Debes crearla en tabla inscripcion.`,
    );
  }

  for (const table of attendanceTables) {
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .gte("fecha", `${date}T00:00:00`)
      .lt("fecha", `${date}T23:59:59`);

    if (deleteError) {
      lastErrorMessage = deleteError.message;
      continue;
    }

    const payload = records.map((record) => ({
      id_asistencia: globalThis.crypto?.randomUUID?.() ?? `${record.studentId}-${Date.now()}`,
      id_alumna: record.studentId,
      id_horario: horarioByStudent.get(record.studentId) ?? fallbackHorarioId,
      fecha: `${date}T12:00:00`,
      clase: record.className,
      estado: record.status,
    }));

    const { error } = await supabase.from(table).insert(payload);
    if (!error) {
      return;
    }
    lastErrorMessage = error.message;

    const fallbackPayload = records.map((record) => ({
      id_alumna: record.studentId,
      id_horario: horarioByStudent.get(record.studentId) ?? fallbackHorarioId,
      fecha: `${date}T12:00:00`,
      clase: record.className,
      estado: record.status,
    }));
    const { error: fallbackError } = await supabase.from(table).insert(fallbackPayload);
    if (!fallbackError) {
      return;
    }

    lastErrorMessage = fallbackError.message;

    const minimalPayload = records.map((record) => ({
      id_alumna: record.studentId,
      id_horario: horarioByStudent.get(record.studentId) ?? fallbackHorarioId,
      fecha: `${date}T12:00:00`,
      clase: record.className,
    }));
    const { error: minimalError } = await supabase.from(table).insert(minimalPayload);
    if (!minimalError) {
      return;
    }
    lastErrorMessage = minimalError.message;
  }
  throw new Error(
    lastErrorMessage || "No se pudo guardar asistencia. Revisa tabla de asistencia en Supabase.",
  );
}

export async function updateAttendanceStatusForDate(params: {
  date: string;
  updates: Array<{ studentId: string; status: AttendanceStatus }>;
}) {
  const { date, updates } = params;
  if (!updates || updates.length === 0) return;
  const fromIso = `${date}T00:00:00`;
  const toIso = `${date}T23:59:59`;
  let lastError = "";
  let anySuccess = false;

  for (const table of attendanceTables) {
    for (const u of updates) {
      try {
        const { error, data } = await supabase
          .from(table)
          .update({ estado: u.status })
          .eq("id_alumna", u.studentId)
          .gte("fecha", fromIso)
          .lt("fecha", toIso)
          .select("id_alumna");

        if (error) {
          if (isSupabaseTableUnavailableError(error.message)) {
            // Si no existe la tabla, probamos con la siguiente.
            continue;
          }
          lastError = error.message;
          continue;
        }

        if (data && data.length > 0) {
          anySuccess = true;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (isSupabaseTableUnavailableError(msg)) {
          continue;
        }
        lastError = msg;
      }
    }
  }

  if (!anySuccess && lastError) {
    throw new Error(lastError);
  }
}

export async function registerPayment(params: {
  studentId: string;
  amount: number;
  method: string;
  paymentDate: string;
}) {
  const { studentId, amount, method, paymentDate } = params;
  const nextDate = new Date(paymentDate);
  nextDate.setMonth(nextDate.getMonth() + 1);
  const nextPaymentDate = nextDate.toISOString().split("T")[0];

  const month = new Date(paymentDate).toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });

  const paymentId = globalThis.crypto?.randomUUID?.() ?? `${studentId}-${Date.now()}`;
  const firstInsert = await supabase.from("pagos").insert({
    id_pago: paymentId,
    id_alumna: studentId,
    fecha_pago: paymentDate,
    monto: amount,
    metodo_pago: method,
    estado_pago: "Pagado",
    mes_pago: month,
    vigencia: nextPaymentDate,
  });

  if (firstInsert.error) {
    const secondInsert = await supabase.from("pagos").insert({
      id_pago: paymentId,
      id_alumna: studentId,
      fecha_pago: paymentDate,
      monto: amount,
      vigencia: nextPaymentDate,
    });
    if (secondInsert.error) {
      throw new Error(secondInsert.error.message);
    }
  }

  const { error: userError } = await supabase
    .from("usuarios")
    .update({
      estado_pago: "Al día",
      ultimo_pago: paymentDate,
      proximo_pago: nextPaymentDate,
    })
    .eq("id_alumna", studentId);

  if (userError && !isMissingColumnError(userError.message)) {
    throw new Error(userError.message);
  }
}

export async function updateMembershipFee(studentId: string, monthlyFee: number) {
  const { error } = await supabase.from("usuarios").update({ cuota_mensual: monthlyFee }).eq("id_alumna", studentId);
  if (error && !isMissingColumnError(error.message)) {
    throw new Error(error.message);
  }
}

export type AdminStudentUpdateInput = {
  nombre?: string;
  correo?: string | null;
  telefono?: string | null;
  matricula?: string | null;
  plan?: string | null;
  horario?: string | null;
  fecha_nacimiento?: string | null;
  fecha_ingreso?: string | null;
  cuota_mensual?: number | null;
  estado_pago?: PaymentStatus | null;
  proximo_pago?: string | null;
  ultimo_pago?: string | null;
  estado?: boolean | null;
  contacto_emergencia?: string | null;
  notas?: string | null;
};

/** Actualiza ficha de alumna en `usuarios` (panel administrador). */
export async function updateAdminStudentProfile(studentId: string, input: AdminStudentUpdateInput): Promise<void> {
  const patch: Record<string, unknown> = {};

  if (input.nombre !== undefined) {
    patch.nombre = input.nombre.trim() || null;
  }
  if (input.correo !== undefined) {
    patch.correo = input.correo?.trim() || null;
  }
  if (input.telefono !== undefined) {
    patch.telefono = input.telefono?.trim() || null;
  }
  if (input.plan !== undefined) {
    patch.plan = input.plan?.trim() || null;
  }
  if (input.horario !== undefined) {
    patch.horario = input.horario?.trim() || null;
  }
  if (input.fecha_nacimiento !== undefined) {
    const v = input.fecha_nacimiento?.trim();
    patch.fecha_nacimiento = v || null;
  }
  if (input.fecha_ingreso !== undefined) {
    const v = input.fecha_ingreso?.trim();
    patch.fecha_ingreso = v || null;
  }
  if (input.cuota_mensual !== undefined) {
    patch.cuota_mensual = input.cuota_mensual;
  }
  if (input.estado_pago !== undefined) {
    patch.estado_pago = input.estado_pago;
  }
  if (input.proximo_pago !== undefined) {
    const v = input.proximo_pago?.trim();
    patch.proximo_pago = v ? v.split("T")[0] : null;
  }
  if (input.ultimo_pago !== undefined) {
    const v = input.ultimo_pago?.trim();
    patch.ultimo_pago = v ? v.split("T")[0] : null;
  }
  if (input.estado !== undefined) {
    patch.estado = input.estado;
  }
  if (input.contacto_emergencia !== undefined) {
    patch.contacto_emergencia = input.contacto_emergencia?.trim() || null;
  }
  if (input.notas !== undefined) {
    patch.notas = input.notas?.trim() || null;
  }

  if (input.matricula !== undefined && input.matricula !== null) {
    const normalized = normalizeMatriculaForCompare(String(input.matricula));
    if (!/^LFS-\d{3}$/i.test(normalized)) {
      throw new Error("Matrícula inválida. Usa el formato LFS-001 (tres números).");
    }
    const { data: taken, error: takenErr } = await supabase
      .from("usuarios")
      .select("id_alumna")
      .eq("matricula", normalized)
      .maybeSingle();
    if (takenErr) {
      throwIfMatriculaColumnMissing(takenErr.message);
      throw new Error(takenErr.message);
    }
    if (taken && (taken as { id_alumna: string }).id_alumna !== studentId) {
      throw new Error("Esa matrícula ya está en uso.");
    }
    patch.matricula = normalized;
  }

  if (Object.keys(patch).length === 0) {
    return;
  }

  let body: Record<string, unknown> = { ...patch };
  for (let attempt = 0; attempt < 30; attempt++) {
    if (Object.keys(body).length === 0) {
      return;
    }
    const { error } = await supabase.from("usuarios").update(body).eq("id_alumna", studentId);
    if (!error) {
      return;
    }
    throwIfMatriculaColumnMissing(error.message);
    if (!isMissingColumnError(error.message)) {
      throw new Error(error.message);
    }
    const badCol = missingColumnNameFromError(error.message);
    if (!badCol || !(badCol in body)) {
      throw new Error(error.message);
    }
    const { [badCol]: _removed, ...rest } = body;
    body = rest;
  }
  throw new Error(
    "No se pudo guardar: faltan varias columnas en la tabla usuarios. En Supabase → SQL Editor ejecuta el script supabase-add-usuarios-columns.sql del proyecto (o supabase-admin-schema.sql).",
  );
}

export async function getClassSchedule(): Promise<ClassScheduleRow[]> {
  const { data, error } = await supabase.from("horarios_clases").select("*").order("bloque_horario");
  if (error) {
    if (isSupabaseTableUnavailableError(error.message)) {
      return [];
    }
    throw new Error(error.message);
  }

  const grouped = new Map<string, ClassScheduleCell[]>();
  for (const row of data as Array<{ bloque_horario: string; dia: string; nombre_clase: string | null; tipo: string | null }>) {
    const list = grouped.get(row.bloque_horario) ?? [];
    list.push({
      day: row.dia,
      name: row.nombre_clase,
      type: row.tipo ?? "empty",
    });
    grouped.set(row.bloque_horario, list);
  }

  return Array.from(grouped.entries()).map(([time, classes]) => ({
    time,
    classes,
  }));
}

export async function getAttendanceByStudent(studentId: string): Promise<Student["attendance"]> {
  for (const table of attendanceTables) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id_alumna", studentId);
    if (!error) {
      return (data as DbAttendance[]).map((row) => ({
        date: row.fecha ?? row.fecha_asistencia ?? new Date().toISOString().split("T")[0],
        class: row.clase ?? row.clase_nombre ?? "Clase",
        status: row.estado,
      }));
    }
  }
  return [];
}

export async function createAdminStudent(params: {
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  plan?: string;
  schedule?: string;
  emergencyContact?: string;
  /** Opcional: 3 dígitos (ej. "042") o "LFS-042". Si se omite, se asigna la siguiente libre. */
  matricula?: string;
}) {
  const url = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
  const isolatedClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const tempPassword = `LaraFit-${Math.random().toString(36).slice(2)}A1!`;
  const { data: authData, error: authError } = await isolatedClient.auth.signUp({
    email: params.email,
    password: tempPassword,
  });
  if (authError || !authData.user) {
    if (authError?.message?.toLowerCase().includes("already registered")) {
      throw new Error(
        "Ese correo ya existe en Auth. Usa otro email o recupera acceso de esa cuenta para vincularla.",
      );
    }
    throw new Error(authError?.message || "No se pudo crear usuario en auth.");
  }

  const { error: insertError } = await supabase.from("usuarios").upsert({
    id_alumna: authData.user.id,
    nombre: params.name,
    telefono: params.phone || null,
    contacto_emergencia: params.emergencyContact || null,
    estado: true,
    rol: 2,
  }, { onConflict: "id_alumna" });
  if (insertError) {
    throw new Error(insertError.message);
  }

  let matriculaValue: string;
  if (params.matricula?.trim()) {
    matriculaValue = normalizeMatriculaForCompare(params.matricula);
    if (!/^LFS-\d{3}$/i.test(matriculaValue)) {
      throw new Error("Matrícula inválida. Usa 3 números (ej. 001) o el formato LFS-001.");
    }
    const { data: taken, error: takenErr } = await supabase
      .from("usuarios")
      .select("id_alumna")
      .eq("matricula", matriculaValue)
      .maybeSingle();
    if (takenErr) {
      throwIfMatriculaColumnMissing(takenErr.message);
      throw new Error(takenErr.message);
    }
    if (taken && (taken as { id_alumna: string }).id_alumna !== authData.user.id) {
      throw new Error("Esa matrícula ya está en uso.");
    }
  } else {
    matriculaValue = await allocateNextMatricula();
  }

  // Optional fields are best-effort because some schemas may not include these columns.
  const optionalProfileUpdate = await supabase
    .from("usuarios")
    .update({
      matricula: matriculaValue,
      plan: params.plan || "Plan Mensual",
      horario: params.schedule || null,
      fecha_nacimiento: params.birthDate || null,
    })
    .eq("id_alumna", authData.user.id);
  if (optionalProfileUpdate.error) {
    throwIfMatriculaColumnMissing(optionalProfileUpdate.error.message);
    if (!isMissingColumnError(optionalProfileUpdate.error.message)) {
      throw new Error(optionalProfileUpdate.error.message);
    }
  }

  const { data: firstSchedule, error: scheduleError } = await supabase
    .from("horario")
    .select("id_horario")
    .limit(1)
    .maybeSingle();

  if (!scheduleError) {
    const defaultScheduleId = (firstSchedule as { id_horario?: string } | null)?.id_horario;
    if (defaultScheduleId) {
      const { error: inscriptionError } = await supabase.from("inscripcion").insert({
        id_inscripcion: globalThis.crypto?.randomUUID?.() ?? `${authData.user.id}-${Date.now()}`,
        id_alumna: authData.user.id,
        id_horario: defaultScheduleId,
      });

      if (inscriptionError && !inscriptionError.message.toLowerCase().includes("duplicate")) {
        throw new Error(inscriptionError.message);
      }
    }
  }

  const { error: initialPaymentError } = await supabase.from("pagos").insert({
    id_pago: globalThis.crypto?.randomUUID?.() ?? `${authData.user.id}-initial-${Date.now()}`,
    id_alumna: authData.user.id,
    fecha_pago: new Date().toISOString().split("T")[0],
    vigencia: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
    monto: 0,
    estado_pago: "Pendiente",
    metodo_pago: "Pendiente",
    mes_pago: new Date().toLocaleDateString("es-CL", { month: "long", year: "numeric" }),
  });
  if (initialPaymentError && !initialPaymentError.message.toLowerCase().includes("column")) {
    throw new Error(initialPaymentError.message);
  }

  return { id: authData.user.id, temporaryPassword: tempPassword };
}

export async function markSelfAttendanceByMatricula(params: {
  userId: string;
  matricula: string;
  className: string;
  date?: string;
  horarioId?: string;
}) {
  const attendanceDate = params.date ?? toLocalISODate(new Date());
  const trimmedMatricula = params.matricula.trim();

  const { data: userData, error: userError } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id_alumna", params.userId)
    .maybeSingle();
  if (userError || !userData) {
    throw new Error("No se encontró la alumna.");
  }

  const user = userData as { matricula?: string | null; id_alumna: string };
  let expectedRaw = user.matricula?.trim() ?? "";
  if (!expectedRaw || !/^LFS-\d{3}$/i.test(expectedRaw)) {
    expectedRaw = await ensureStudentMatriculaIfMissing(params.userId);
  }
  if (normalizeMatriculaForCompare(trimmedMatricula) !== normalizeMatriculaForCompare(expectedRaw)) {
    throw new Error("La matrícula no coincide con tu cuenta.");
  }

  let idHorario = await getAssignedHorarioIdByStudent(params.userId);
  if (!idHorario && params.horarioId) {
    await assignHorarioToStudent(params.userId, params.horarioId);
    idHorario = params.horarioId;
  }
  if (!idHorario) {
    throw new Error("No tienes horario asignado. Selecciona uno antes de registrar asistencia.");
  }

  const payload = {
    id_asistencia: globalThis.crypto?.randomUUID?.() ?? `${params.userId}-${Date.now()}`,
    id_alumna: params.userId,
    id_horario: idHorario,
    fecha: `${attendanceDate}T12:00:00`,
    clase: params.className,
    estado: "Presente",
  };

  for (const table of attendanceTables) {
    await supabase
      .from(table)
      .delete()
      .eq("id_alumna", params.userId)
      .gte("fecha", `${attendanceDate}T00:00:00`)
      .lt("fecha", `${attendanceDate}T23:59:59`);

    const insertAttempt = await supabase.from(table).insert(payload);
    if (!insertAttempt.error) {
      return;
    }

    const fallbackPayload = {
      id_alumna: params.userId,
      id_horario: idHorario,
      fecha: `${attendanceDate}T12:00:00`,
      clase: params.className,
      estado: "Presente",
    };
    const fallbackAttempt = await supabase.from(table).insert(fallbackPayload);
    if (!fallbackAttempt.error) {
      return;
    }
  }

  throw new Error("No se pudo registrar asistencia.");
}

export async function listAvailableClassNames(): Promise<string[]> {
  const out = new Set<string>();
  const { data, error } = await supabase
    .from("horarios_clases")
    .select("nombre_clase")
    .not("nombre_clase", "is", null);
  if (!error) {
    for (const row of (data ?? []) as Array<{ nombre_clase?: string | null }>) {
      const name = row.nombre_clase?.trim();
      if (name) out.add(name);
    }
  } else if (!isSupabaseTableUnavailableError(error.message)) {
    throw new Error(error.message);
  }
  const fallback = ["Trampolín", "Fuerza", "Yoga Flow", "Pilates", "Funcional"];
  for (const name of fallback) out.add(name);
  return Array.from(out).sort((a, b) => a.localeCompare(b, "es"));
}

export type PendingPaymentRequest = {
  id: string;
  studentId: string;
  amount: number;
  method: string;
  requestDate: string;
};

/** Solicitud de la alumna: queda en pagos como Pendiente sin actualizar membresía hasta que el admin apruebe. */
export async function submitStudentPaymentRequest(params: {
  userId: string;
  amount: number;
  method: string;
}) {
  const paymentDate = new Date().toISOString().split("T")[0];
  const month = new Date().toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });
  const vigenciaEnd = new Date(paymentDate);
  vigenciaEnd.setMonth(vigenciaEnd.getMonth() + 1);
  const vigencia = vigenciaEnd.toISOString().split("T")[0];
  const paymentId = globalThis.crypto?.randomUUID?.() ?? `${params.userId}-${Date.now()}`;

  const attempts: Record<string, unknown>[] = [
    {
      id_pago: paymentId,
      id_alumna: params.userId,
      fecha_pago: paymentDate,
      monto: params.amount,
      metodo_pago: params.method,
      estado_pago: "Pendiente",
      mes_pago: month,
      vigencia,
    },
    {
      id_pago: paymentId,
      id_alumna: params.userId,
      fecha: paymentDate,
      monto: params.amount,
      metodo_pago: params.method,
      estado_pago: "Pendiente",
      mes_pago: month,
      vigencia,
    },
    {
      id_pago: paymentId,
      id_alumna: params.userId,
      fecha_pago: paymentDate,
      monto: params.amount,
      estado_pago: "Pendiente",
      vigencia,
    },
    {
      id: paymentId,
      id_alumna: params.userId,
      fecha: paymentDate,
      monto: params.amount,
      metodo: params.method,
      estado: "Pendiente",
      mes: month,
      vigencia,
    },
  ];

  let lastMsg = "";
  for (const payload of attempts) {
    const res = await supabase.from("pagos").insert(payload);
    if (!res.error) {
      return;
    }
    lastMsg = res.error.message;
    const msg = res.error.message.toLowerCase();
    const retry =
      isMissingColumnError(res.error.message) ||
      msg.includes("could not find the") ||
      (msg.includes("column") && msg.includes("does not exist"));
    if (!retry) {
      throw new Error(res.error.message);
    }
  }
  throw new Error(lastMsg || "No se pudo registrar la solicitud de pago.");
}

async function fetchPaymentRowById(paymentId: string): Promise<Record<string, unknown> | null> {
  const byPago = await supabase.from("pagos").select("*").eq("id_pago", paymentId).maybeSingle();
  if (!byPago.error && byPago.data) {
    return byPago.data as Record<string, unknown>;
  }
  const byId = await supabase.from("pagos").select("*").eq("id", paymentId).maybeSingle();
  if (!byId.error && byId.data) {
    return byId.data as Record<string, unknown>;
  }
  return null;
}

export async function getPendingStudentPaymentRequests(): Promise<PendingPaymentRequest[]> {
  const { data, error } = await supabase.from("pagos").select("*");
  if (error) {
    throw new Error(error.message);
  }
  const rows = (data ?? []) as Record<string, unknown>[];
  return rows
    .map((row) => {
      const estado = (row.estado_pago ?? row.estado) as string | undefined;
      const monto = Number(row.monto ?? 0);
      const id = (row.id_pago ?? row.id) as string | undefined;
      const id_alumna = row.id_alumna as string | undefined;
      const fecha = (row.fecha_pago ?? row.fecha) as string | undefined;
      const metodo = String(row.metodo_pago ?? row.metodo ?? "");
      if (estado !== "Pendiente" || monto <= 0 || !id || !id_alumna) {
        return null;
      }
      return {
        id,
        studentId: id_alumna,
        amount: monto,
        method: metodo,
        requestDate: fecha ?? "",
      };
    })
    .filter(Boolean) as PendingPaymentRequest[];
}

function buildPagosIdFilters(paymentId: string, row: Record<string, unknown>): { key: "id_pago" | "id"; val: string }[] {
  const out: { key: "id_pago" | "id"; val: string }[] = [];
  const add = (key: "id_pago" | "id", val: unknown) => {
    if (val === undefined || val === null) return;
    const s = String(val).trim();
    if (!s) return;
    if (!out.some((e) => e.key === key && e.val === s)) {
      out.push({ key, val: s });
    }
  };
  add("id_pago", row.id_pago);
  add("id", row.id);
  add("id_pago", paymentId);
  add("id", paymentId);
  return out;
}

async function paymentRowIsPagado(paymentId: string): Promise<boolean> {
  const check = await fetchPaymentRowById(paymentId);
  const st = (check?.estado_pago ?? check?.estado) as string | undefined;
  return st === "Pagado";
}

async function updatePagosRowApproved(
  paymentId: string,
  row: Record<string, unknown>,
  month: string,
  nextPaymentDate: string,
): Promise<{ ok: boolean; detail?: string }> {
  const filters = buildPagosIdFilters(paymentId, row);
  if (filters.length === 0) {
    return { ok: false, detail: "La fila de pago no tiene id ni id_pago." };
  }

  const patches: Record<string, unknown>[] = [
    { estado_pago: "Pagado", mes_pago: month, vigencia: nextPaymentDate },
    { estado_pago: "Pagado", mes_pago: month },
    { estado: "Pagado", mes: month, vigencia: nextPaymentDate },
    { estado: "Pagado", mes: month },
  ];

  let lastMeaningfulError: string | undefined;

  for (const patch of patches) {
    for (const { key, val } of filters) {
      const { data, error } = await supabase.from("pagos").update(patch).eq(key, val).select("*");
      if (error) {
        const msg = error.message.toLowerCase();
        lastMeaningfulError = error.message;
        if (
          isMissingColumnError(error.message) ||
          (msg.includes("column") && msg.includes("does not exist")) ||
          msg.includes("could not find the")
        ) {
          continue;
        }
        if (msg.includes("permission") || msg.includes("policy") || msg.includes("rls") || msg.includes("jwt")) {
          return {
            ok: false,
            detail:
              "Supabase bloqueó el UPDATE (RLS). Añade una política que permita actualizar pagos al rol que usa la app (p. ej. for all to anon using (true) with check (true)), o usa el service role en backend.",
          };
        }
        continue;
      }
      if (data && data.length > 0) {
        return { ok: true };
      }
      if (await paymentRowIsPagado(paymentId)) {
        return { ok: true };
      }
    }
  }

  return {
    ok: false,
    detail:
      lastMeaningfulError ||
      "Ningún UPDATE afectó filas. Comprueba que id_pago/id coinciden con la tabla y que RLS permite UPDATE y SELECT en pagos.",
  };
}

/** Confirma la solicitud: marca el pago como Pagado y extiende la membresía en usuarios. */
export async function approvePendingStudentPayment(paymentId: string) {
  const row = await fetchPaymentRowById(paymentId);
  if (!row) {
    throw new Error("Solicitud no encontrada.");
  }

  const estado = (row.estado_pago ?? row.estado) as string | undefined;
  const monto = Number(row.monto ?? 0);
  if (estado !== "Pendiente" || monto <= 0) {
    throw new Error("Esta solicitud ya no está pendiente.");
  }

  const studentId = row.id_alumna as string;
  const paymentDate = (row.fecha_pago ?? row.fecha ?? new Date().toISOString().split("T")[0]) as string;

  const nextDate = new Date(paymentDate);
  nextDate.setMonth(nextDate.getMonth() + 1);
  const nextPaymentDate = nextDate.toISOString().split("T")[0];
  const month = new Date(paymentDate).toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });

  const { ok, detail } = await updatePagosRowApproved(paymentId, row, month, nextPaymentDate);
  if (!ok) {
    throw new Error(
      detail ||
        "No se pudo marcar el pago como aceptado. Revisa políticas RLS y columnas id / id_pago en pagos.",
    );
  }

  const { error: userError } = await supabase
    .from("usuarios")
    .update({
      estado_pago: "Al día",
      ultimo_pago: paymentDate,
      proximo_pago: nextPaymentDate,
    })
    .eq("id_alumna", studentId);

  if (userError && !isMissingColumnError(userError.message)) {
    throw new Error(userError.message);
  }
}

/** Rechaza una solicitud pendiente (elimina el registro o lo anula para que no vuelva a la cola). */
export async function rejectPendingStudentPayment(paymentId: string) {
  const row = await fetchPaymentRowById(paymentId);
  if (!row) {
    throw new Error("Solicitud no encontrada.");
  }
  const estado = (row.estado_pago ?? row.estado) as string | undefined;
  const monto = Number(row.monto ?? 0);
  if (estado !== "Pendiente" || monto <= 0) {
    throw new Error("Esta solicitud ya no está pendiente.");
  }

  for (const key of ["id_pago", "id"] as const) {
    const del = await supabase.from("pagos").delete().eq(key, paymentId);
    if (!del.error) {
      return;
    }
  }

  for (const key of ["id_pago", "id"] as const) {
    const attempts: Record<string, unknown>[] = [
      { monto: 0, estado_pago: "Vencido", mes_pago: "Rechazado por administración" },
      { monto: 0, estado: "Vencido", mes: "Rechazado" },
      { monto: 0 },
    ];
    for (const patch of attempts) {
      const { error } = await supabase.from("pagos").update(patch).eq(key, paymentId);
      if (!error) {
        return;
      }
      const msg = error.message.toLowerCase();
      if (!isMissingColumnError(error.message) && !(msg.includes("column") && msg.includes("does not exist"))) {
        break;
      }
    }
  }

  throw new Error("No se pudo rechazar el pago. Revisa permisos RLS en la tabla pagos.");
}

export type CitaRow = {
  id: string;
  id_alumna: string;
  fecha_hora: string;
  motivo: string | null;
  estado: string;
};

const CITAS_SQL_HINT =
  "Crea la tabla citas en Supabase (SQL Editor): abre el archivo supabase-add-citas-table.sql del proyecto y ejecuta todo el script.";

function getUtcBoundsForLocalDay(dateIso: string): { fromIso: string; toIso: string } {
  const [y, m, d] = dateIso.split("-").map(Number);
  const start = new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
  const end = new Date(y, (m ?? 1) - 1, d ?? 1, 23, 59, 59, 999);
  return { fromIso: start.toISOString(), toIso: end.toISOString() };
}

function getMinuteSlotBounds(iso: string): { fromIso: string; toIso: string } {
  const base = new Date(iso);
  base.setSeconds(0, 0);
  const next = new Date(base);
  next.setMinutes(next.getMinutes() + 1);
  return { fromIso: base.toISOString(), toIso: next.toISOString() };
}

function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function horarioLabelFromRow(row: Record<string, unknown>): string {
  const explicit =
    String(row.nombre_horario ?? row.nombre ?? row.descripcion ?? row.horario ?? "").trim();
  if (explicit) return explicit;
  const dia = String(row.dia ?? row.dia_semana ?? "").trim();
  const from = String(row.hora_inicio ?? row.inicio ?? "").trim();
  const to = String(row.hora_fin ?? row.fin ?? "").trim();
  const franja = [from, to].filter(Boolean).join(" - ");
  const built = [dia, franja].filter(Boolean).join(" ");
  return built || "Horario";
}

export async function listHorarioOptions(): Promise<HorarioOption[]> {
  const extractRepresentativeTime = (
    row: Record<string, unknown>,
  ): { hour: number; minute: number } | null => {
    const candidates = [
      row.hora,
      row.hora_inicio,
      row.inicio,
      row.bloque_horario,
      row.horario,
      row.nombre_horario,
      row.nombre,
      row.descripcion,
    ].map((v) => (v == null ? "" : String(v)));
    const combined = candidates.join(" ");
    const matches = Array.from(combined.matchAll(/(\d{1,2}):(\d{2})/g));
    if (matches.length === 0) return null;
    // Preferimos el "último" HH:MM (ej. 07:10-08:00 -> 08:00) para que el rango coincida.
    const last = matches[matches.length - 1];
    const hour = Number(last[1]);
    const minute = Number(last[2]);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return { hour, minute };
  };

  const hourToLabel = (hour: number, minute: number) => {
    const hh = String(hour).padStart(2, "0");
    const mm = String(minute).padStart(2, "0");
    return minute === 0 ? `${hh}:00` : `${hh}:${mm}`;
  };

  type Candidate = { id: string; key: string; order: number; label: string };
  const dedupeCandidates = (cands: Candidate[]): Candidate[] => {
    const map = new Map<string, Candidate>();
    for (const c of cands) {
      if (!map.has(c.key)) map.set(c.key, c);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.order === b.order ? a.label.localeCompare(b.label, "es") : a.order - b.order,
    );
  };

  // Preferimos tabla `horario` si existe.
  const { data: hData, error: hErr } = await supabase.from("horario").select("*").limit(500);
  if (!hErr && (hData ?? []).length > 0) {
    const cands = ((hData ?? []) as Record<string, unknown>[]).map((row) => {
      const id = String(row.id_horario ?? row.id ?? "").trim();
      if (!id) return null;
      const t = extractRepresentativeTime(row);
      const labelFromRow = horarioLabelFromRow(row);
      const label = t ? hourToLabel(t.hour, t.minute) : labelFromRow;
      const key = t ? `time-${label}` : `label-${labelFromRow}`;
      const order = t ? t.hour * 60 + t.minute : 9999;
      return { id, key, order, label } satisfies Candidate;
    }).filter(Boolean) as Candidate[];
    return dedupeCandidates(cands).map((c) => ({ id: c.id, label: c.label }));
  }

  // Fallback con `horarios_clases`.
  const { data: hcData, error: hcErr } = await supabase.from("horarios_clases").select("*").limit(500);
  if (hcErr) {
    if (isSupabaseTableUnavailableError(hcErr.message)) {
      return [];
    }
    throw new Error(hcErr.message);
  }
  const cands = ((hcData ?? []) as Record<string, unknown>[]).map((row) => {
    const id = String(row.id ?? "").trim();
    if (!id) return null;
    const t = extractRepresentativeTime(row);
    const labelFromRow = horarioLabelFromRow(row);
    const label = t ? hourToLabel(t.hour, t.minute) : labelFromRow;
    const key = t ? `time-${label}` : `label-${labelFromRow}`;
    const order = t ? t.hour * 60 + t.minute : 9999;
    return { id, key, order, label } satisfies Candidate;
  }).filter(Boolean) as Candidate[];

  return dedupeCandidates(cands).map((c) => ({ id: c.id, label: c.label }));
}

export async function getAssignedHorarioIdByStudent(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("inscripcion")
    .select("id_horario")
    .eq("id_alumna", userId)
    .limit(1)
    .maybeSingle();
  return ((data as { id_horario?: string | null } | null)?.id_horario ?? null) || null;
}

export async function assignHorarioToStudent(userId: string, horarioId: string): Promise<void> {
  const existing = await supabase
    .from("inscripcion")
    .select("id_inscripcion,id")
    .eq("id_alumna", userId)
    .limit(1)
    .maybeSingle();
  const row = existing.data as { id_inscripcion?: string; id?: string } | null;

  if (!existing.error && row) {
    const pk = row.id_inscripcion ?? row.id;
    if (pk) {
      const up1 = await supabase.from("inscripcion").update({ id_horario: horarioId }).eq("id_inscripcion", pk);
      if (!up1.error) return;
      const up2 = await supabase.from("inscripcion").update({ id_horario: horarioId }).eq("id", pk);
      if (!up2.error) return;
    }
    const up3 = await supabase.from("inscripcion").update({ id_horario: horarioId }).eq("id_alumna", userId);
    if (!up3.error) return;
  }

  const insId = globalThis.crypto?.randomUUID?.() ?? `${userId}-${Date.now()}`;
  const ins1 = await supabase.from("inscripcion").insert({
    id_inscripcion: insId,
    id_alumna: userId,
    id_horario: horarioId,
  });
  if (ins1.error) {
    const ins2 = await supabase.from("inscripcion").insert({
      id: insId,
      id_alumna: userId,
      id_horario: horarioId,
    });
    if (ins2.error) throw new Error(ins2.error.message);
  }
}

export async function listConfirmedCitaSlotsForDay(dateIso: string): Promise<string[]> {
  const { fromIso, toIso } = getUtcBoundsForLocalDay(dateIso);
  const { data, error } = await supabase
    .from("citas")
    .select("fecha_hora")
    .eq("estado", "confirmada")
    .gte("fecha_hora", fromIso)
    .lte("fecha_hora", toIso);
  if (error) {
    if (isSupabaseTableUnavailableError(error.message)) return [];
    throw new Error(error.message);
  }
  const out = new Set<string>();
  for (const row of (data ?? []) as Array<{ fecha_hora?: string | null }>) {
    if (!row.fecha_hora) continue;
    const dt = new Date(row.fecha_hora);
    out.add(`${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`);
  }
  return Array.from(out).sort();
}

export async function createCita(params: { userId: string; fechaHoraIso: string; motivo?: string }) {
  const slot = new Date(params.fechaHoraIso).toISOString();
  const { fromIso, toIso } = getMinuteSlotBounds(slot);
  const blocked = await supabase
    .from("citas")
    .select("id_cita,id")
    .eq("estado", "confirmada")
    .gte("fecha_hora", fromIso)
    .lt("fecha_hora", toIso)
    .limit(1)
    .maybeSingle();
  if (!blocked.error && blocked.data) {
    throw new Error("Ese horario ya está confirmado para otra cita. Elige otra fecha u hora.");
  }

  const attempts: Record<string, unknown>[] = [
    {
      id_alumna: params.userId,
      fecha_hora: slot,
      motivo: params.motivo ?? null,
      estado: "solicitada",
    },
    {
      id_alumna: params.userId,
      fecha_hora: slot,
      motivo: params.motivo ?? null,
    },
  ];
  let lastMsg = "";
  for (const payload of attempts) {
    const res = await supabase.from("citas").insert(payload);
    if (!res.error) {
      return;
    }
    lastMsg = res.error.message;
    if (!isMissingColumnError(res.error.message) && !isSupabaseTableUnavailableError(res.error.message)) {
      throw new Error(res.error.message);
    }
  }
  if (isSupabaseTableUnavailableError(lastMsg)) {
    throw new Error(CITAS_SQL_HINT);
  }
  throw new Error(lastMsg || CITAS_SQL_HINT);
}

export async function listCitasForStudent(userId: string): Promise<CitaRow[]> {
  const { data, error } = await supabase
    .from("citas")
    .select("*")
    .eq("id_alumna", userId)
    .order("fecha_hora", { ascending: true });
  if (error) {
    if (isSupabaseTableUnavailableError(error.message)) {
      return [];
    }
    throw new Error(error.message);
  }
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id_cita ?? row.id ?? ""),
    id_alumna: row.id_alumna as string,
    fecha_hora: String(row.fecha_hora ?? ""),
    motivo: (row.motivo as string) ?? null,
    estado: String(row.estado ?? "solicitada"),
  }));
}

export type CitaAdminRow = CitaRow & { studentName: string };

function normalizeAttendanceDayValue(raw: unknown): string | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    if (raw.includes("T")) {
      const dt = new Date(raw);
      if (Number.isNaN(dt.getTime())) return raw.slice(0, 10);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    return raw.slice(0, 10);
  }
  return null;
}

/** Días (YYYY-MM-DD) en que cada alumna figura como Presente en asistencias. */
export async function getPresentAttendanceDaysByStudent(): Promise<Record<string, string[]>> {
  const byStudent: Record<string, Set<string>> = {};
  const add = (studentId: string, day: string | null) => {
    if (!day) return;
    byStudent[studentId] = byStudent[studentId] ?? new Set();
    byStudent[studentId].add(day);
  };

  for (const table of attendanceTables) {
    const { data, error } = await supabase
      .from(table)
      .select("id_alumna,fecha,fecha_asistencia,estado");
    if (error) {
      continue;
    }
    for (const row of (data ?? []) as Record<string, unknown>[]) {
      if (String(row.estado) !== "Presente") continue;
      const id = row.id_alumna as string | undefined;
      if (!id) continue;
      const day =
        normalizeAttendanceDayValue(row.fecha) ?? normalizeAttendanceDayValue(row.fecha_asistencia);
      add(id, day);
    }
  }

  return Object.fromEntries(
    Object.entries(byStudent).map(([id, set]) => [id, Array.from(set).sort((a, b) => b.localeCompare(a))]),
  );
}

async function mapCitaRowsToAdmin(rows: Record<string, unknown>[]): Promise<CitaAdminRow[]> {
  const ids = [...new Set(rows.map((r) => r.id_alumna as string).filter(Boolean))];
  const names: Record<string, string> = {};
  if (ids.length > 0) {
    const { data: users } = await supabase.from("usuarios").select("id_alumna,nombre").in("id_alumna", ids);
    for (const u of (users ?? []) as { id_alumna?: string; nombre?: string | null }[]) {
      if (u.id_alumna) {
        names[u.id_alumna] = u.nombre ?? "Alumna";
      }
    }
  }
  return rows.map((row) => {
    const idAlumna = row.id_alumna as string;
    return {
      id: String(row.id_cita ?? row.id ?? ""),
      id_alumna: idAlumna,
      fecha_hora: String(row.fecha_hora ?? ""),
      motivo: (row.motivo as string) ?? null,
      estado: String(row.estado ?? "solicitada"),
      studentName: names[idAlumna] ?? "Alumna",
    };
  });
}

export async function listPendingCitasForAdmin(): Promise<CitaAdminRow[]> {
  const { data, error } = await supabase
    .from("citas")
    .select("*")
    .eq("estado", "solicitada")
    .order("fecha_hora", { ascending: true });
  if (error) {
    if (isSupabaseTableUnavailableError(error.message)) {
      return [];
    }
    throw new Error(error.message);
  }
  return mapCitaRowsToAdmin((data ?? []) as Record<string, unknown>[]);
}

/** Todas las citas recientes (admin): día, hora, motivo, estado y alumna. */
export async function listAllCitasForAdmin(limit = 150): Promise<CitaAdminRow[]> {
  const { data, error } = await supabase
    .from("citas")
    .select("*")
    .order("fecha_hora", { ascending: false })
    .limit(limit);
  if (error) {
    if (isSupabaseTableUnavailableError(error.message)) {
      return [];
    }
    throw new Error(error.message);
  }
  return mapCitaRowsToAdmin((data ?? []) as Record<string, unknown>[]);
}

export async function acceptCitaById(citaId: string) {
  const c1 = await supabase
    .from("citas")
    .select("id_cita,id,fecha_hora")
    .or(`id_cita.eq.${citaId},id.eq.${citaId}`)
    .maybeSingle();
  const cita = c1.data as { id_cita?: string; id?: string; fecha_hora?: string } | null;
  if (!c1.error && cita?.fecha_hora) {
    const slot = new Date(cita.fecha_hora).toISOString();
    const { fromIso, toIso } = getMinuteSlotBounds(slot);
    const sameSlot = await supabase
      .from("citas")
      .select("id_cita,id")
      .eq("estado", "confirmada")
      .gte("fecha_hora", fromIso)
      .lt("fecha_hora", toIso);
    const sameRows = (sameSlot.data ?? []) as Array<{ id_cita?: string; id?: string }>;
    const selfId = cita.id_cita ?? cita.id ?? citaId;
    const occupiedByOther = sameRows.some((r) => (r.id_cita ?? r.id) !== selfId);
    if (occupiedByOther) {
      throw new Error("No se puede confirmar: ese horario ya está ocupado por otra cita confirmada.");
    }
  }

  const u1 = await supabase.from("citas").update({ estado: "confirmada" }).eq("id_cita", citaId).select("id_cita");
  if (!u1.error && u1.data && u1.data.length > 0) {
    return;
  }
  const u2 = await supabase.from("citas").update({ estado: "confirmada" }).eq("id", citaId).select("id");
  if (!u2.error && u2.data && u2.data.length > 0) {
    return;
  }
  throw new Error(u2.error?.message || u1.error?.message || "No se pudo confirmar la cita.");
}

/** Registra aviso en BD (si existe la tabla) y devuelve el mensaje cuando faltan ≤7 días para proximo_pago. */
export async function recordPaymentReminderIfNeeded(params: {
  userId: string;
  proximoPago: string | null | undefined;
}): Promise<{ shown: boolean; message: string | null }> {
  const proximo = params.proximoPago?.split("T")[0];
  if (!proximo) {
    return { shown: false, message: null };
  }
  const due = new Date(proximo + "T12:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due0 = new Date(due);
  due0.setHours(0, 0, 0, 0);
  const days = Math.ceil((due0.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days > 7 || days < 0) {
    return { shown: false, message: null };
  }
  const label = due.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
  const message =
    days === 0
      ? `Tu membresía vence hoy (${label}). Renueva tu pago enviando la solicitud desde esta cuenta.`
      : `Tu membresía vence el ${label} (en ${days} día${days === 1 ? "" : "s"}). Recuerda renovar para seguir con tus clases.`;

  const { data: existing, error: selErr } = await supabase
    .from("avisos_usuario")
    .select("id")
    .eq("id_alumna", params.userId)
    .eq("tipo", "pago_proximo")
    .eq("referencia_fecha", proximo)
    .maybeSingle();

  if (!selErr && !existing) {
    await supabase.from("avisos_usuario").insert({
      id_alumna: params.userId,
      tipo: "pago_proximo",
      mensaje: message,
      referencia_fecha: proximo,
    });
  }

  return { shown: true, message };
}

export type AttendanceExportRow = {
  studentName: string;
  className: string;
  horario?: string;
  status: string;
  day: string;
  hour: string;
};

export async function listAttendanceRowsByDateRange(params: {
  fromDate: string;
  toDate: string;
}): Promise<AttendanceExportRow[]> {
  const { fromDate, toDate } = params;

  let rows: DbAttendance[] = [];

  const fetchRowsFromTable = async (table: string): Promise<DbAttendance[]> => {
    try {
      // Intenta con todas las columnas posibles
      let { data, error } = await supabase
        .from(table)
        .select("*");

      if (error) {
        console.error(`Error fetching from ${table}:`, error.message);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Filtrar por rango de fechas en memoria
      return (data as any[]).filter((row) => {
        const dateStr = (row.fecha_asistencia ?? row.fecha ?? row.created_at ?? "").split("T")[0];
        return dateStr >= fromDate && dateStr <= toDate;
      }).map(row => ({
        id_alumna: row.id_alumna,
        id_asistencia: row.id_asistencia,
        id_horario: row.id_horario,
        clase: row.clase,
        clase_nombre: row.clase_nombre,
        fecha: row.fecha,
        fecha_asistencia: row.fecha_asistencia,
        estado: row.estado,
      }));
    } catch (err) {
      console.error(`Exception fetching from ${table}:`, err);
      return [];
    }
  };

  for (const table of attendanceTables) {
    const current = await fetchRowsFromTable(table);
    if (current.length > 0) {
      rows = rows.concat(current);
      break; // Si encontramos datos en una tabla, no buscamos en la siguiente
    }
  }

  if (rows.length === 0) {
    return [];
  }

  const ids = [...new Set(rows.map((r) => r.id_alumna).filter(Boolean))];
  const nameById = new Map<string, string>();
  if (ids.length > 0) {
    const { data: users } = await supabase.from("usuarios").select("id_alumna,nombre").in("id_alumna", ids);
    for (const u of (users ?? []) as Array<{ id_alumna?: string; nombre?: string | null }>) {
      if (u.id_alumna) nameById.set(u.id_alumna, u.nombre?.trim() || "Alumna");
    }
  }

  const horarioIds = [...new Set(rows.map((r) => r.id_horario).filter(Boolean) as string[])];
  const horarioStartById = new Map<string, string>();
  const horarioLabelById = new Map<string, string>();
  if (horarioIds.length > 0) {
    const { data: hRows, error: hErr } = await supabase
      .from("horario")
      .select("id_horario,nombre_horario,dia,hora_inicio,hora_fin,inicio,fin,horario")
      .in("id_horario", horarioIds);

    if (!hErr) {
      for (const h of (hRows ?? []) as Array<Record<string, unknown>>) {
        const id = String((h as any).id_horario ?? "").trim();
        const raw = String((h as any).hora_inicio ?? (h as any).inicio ?? "").trim();
        const m = raw.match(/(\d{1,2}):(\d{2})/);
        if (id) {
          horarioLabelById.set(id, horarioLabelFromRow(h));
          if (m) horarioStartById.set(id, `${m[1].padStart(2, "0")}:${m[2]}`);
        }
      }
    } else {
      // Fallback si los ids corresponden a `horarios_clases.id` (o si `horario` no existe).
      const { data: hcRows, error: hcErr } = await supabase.from("horarios_clases").select("*").limit(500);
      if (!hcErr) {
        for (const h of (hcRows ?? []) as Array<Record<string, unknown>>) {
          const id = String((h as any).id ?? "").trim();
          const bloque = String((h as any).bloque_horario ?? "").trim();
          const dia = String((h as any).dia ?? "").trim();
          const nombre = String((h as any).nombre_clase ?? "").trim();
          const labelParts = [dia, bloque].filter(Boolean).join(" - ");
          const label = nombre ? `${labelParts}${labelParts ? " · " : ""}${nombre}` : labelParts || "Horario";
          if (id) horarioLabelById.set(id, label);
          if (bloque) horarioLabelById.set(bloque, label);

          const m = bloque.match(/(\d{1,2}):(\d{2})/);
          if (m) {
            if (id) horarioStartById.set(id, `${m[1].padStart(2, "0")}:${m[2]}`);
            if (bloque) horarioStartById.set(bloque, `${m[1].padStart(2, "0")}:${m[2]}`);
          }
        }
      }
    }
  }

  return rows.map((row) => {
    const rawAsistencia = String(row.fecha_asistencia ?? row.fecha ?? "");
    const dt = rawAsistencia && rawAsistencia.includes("T") ? new Date(rawAsistencia) : null;
    const day =
      dt ? dt.toLocaleDateString("es-CL") : rawAsistencia ? String(rawAsistencia).slice(0, 10) : "";
    
    // Obtener horario, si no existe devolver el id como fallback
    let horarioLabel = row.id_horario ? horarioLabelById.get(String(row.id_horario)) : undefined;
    if (!horarioLabel && row.id_horario) {
      horarioLabel = String(row.id_horario); // Usar el ID como fallback si no encuentra el label
    }
    
    return {
      studentName: nameById.get(row.id_alumna) ?? "Alumna",
      className: (row.clase ?? row.clase_nombre ?? "Clase").trim(),
      status: row.estado,
      day,
      horario: horarioLabel || "Sin horario",
      hour: "",
    };
  });
}
