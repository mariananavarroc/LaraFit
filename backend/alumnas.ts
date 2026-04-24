import { supabase } from "./supabase";

type UsuarioRow = {
  id_alumna: string;
  created_at: string | null;
  nombre: string;
  telefono: string | null;
  contacto_emergencia: string | null;
  estado: boolean;
  rol: number;
};

type AttendanceStatus = "Presente" | "Ausente" | "Justificado";
type PaymentStatus = "Pagado" | "Pendiente" | "Vencido";

type StudentData = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  matricula: string;
  phone: string;
  email: string;
  birthDate: string;
  joinDate: string;
  schedule: string;
  plan: string;
  paymentStatus: "Al día" | "Pendiente" | "Vencido";
  nextPaymentDate: string;
  lastPaymentDate: string;
  monthlyFee: number;
  emergencyContacts: Array<{ name: string; phone: string; relationship: string }>;
  attendance: Array<{ date: string; status: AttendanceStatus; class: string }>;
  payments: Array<{ id: string; date: string; amount: number; method: string; status: PaymentStatus; month: string }>;
  notes: string;
  activa: boolean;
};

const scheduleOptions = [
  "Lunes, Miércoles, Viernes — 9:00 AM",
  "Martes, Jueves — 7:00 AM",
  "Lunes, Miércoles, Viernes — 6:00 PM",
  "Sábado — 10:00 AM",
  "Martes, Jueves — 8:00 AM",
  "Lunes, Miércoles — 7:30 PM",
];

const plans = ["Plan Premium", "Plan Básico", "Plan Mensual"];
const monthlyFees = [65000, 45000, 35000, 55000];
const classOptions = ["Pilates Matinal", "Pilates Reformer", "Yoga Flow", "Barre Fitness", "Pilates Vespertino", "Pilates Fin de Semana", "Yoga Nocturno"];

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "AL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateString: string | null, fallbackDays = 0) {
  const date = dateString ? new Date(dateString) : new Date();
  date.setDate(date.getDate() + fallbackDays);
  return date.toISOString().split("T")[0];
}

function getAttendance(name: string, index: number) {
  return Array.from({ length: 6 }, (_, i) => ({
    date: formatDate(null, -(i + 1)),
    class: classOptions[(index + i) % classOptions.length],
    status: i % 5 === 4 ? "Ausente" : i % 6 === 3 ? "Justificado" : "Presente",
  })) as Array<{ date: string; status: AttendanceStatus; class: string }>;
}

function getPayments(index: number, estado: boolean) {
  const amounts = [65000, 45000, 35000];
  return Array.from({ length: 3 }, (_, i) => ({
    id: `p-${index * 3 + i + 1}`,
    date: formatDate(null, -(i + 1) * 30),
    amount: amounts[i % amounts.length],
    method: i % 2 === 0 ? "Transferencia" : "Débito",
    status: i === 0 && !estado ? "Pendiente" : "Pagado",
    month: new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000).toLocaleString("es-CL", {
      month: "long",
      year: "numeric",
    }),
  })) as Array<{ id: string; date: string; amount: number; method: string; status: PaymentStatus; month: string }>;
}

function mapUsuarioToStudent(row: UsuarioRow, index: number): StudentData {
  const name = row.nombre || "Alumna";
  const active = row.estado ?? false;
  const plan = plans[index % plans.length];
  const schedule = scheduleOptions[index % scheduleOptions.length];
  const monthlyFee = monthlyFees[index % monthlyFees.length];
  const joinDate = formatDate(row.created_at, 0);
  const nextPaymentDate = formatDate(row.created_at, 30);

  return {
    id: row.id_alumna,
    name,
    avatar: "",
    initials: getInitials(name),
    matricula: `LFS-${String(index + 1).padStart(3, "0")}`,
    phone: row.telefono || "No disponible",
    email: "",
    birthDate: formatDate(row.created_at, -365),
    joinDate,
    schedule,
    plan,
    paymentStatus: active ? "Al día" : "Pendiente",
    nextPaymentDate,
    lastPaymentDate: joinDate,
    monthlyFee,
    emergencyContacts: [
      {
        name: row.contacto_emergencia || "Contacto de emergencia no registrado",
        phone: row.telefono || "No disponible",
        relationship: "Contacto",
      },
    ],
    attendance: getAttendance(name, index),
    payments: getPayments(index, active),
    notes: row.contacto_emergencia ? `Contacto de emergencia: ${row.contacto_emergencia}` : "No hay notas adicionales.",
    activa: active,
  };
}

export async function getAlumnas() {
  const { data, error } = await supabase.from("usuarios").select("*").eq("rol", 2);
  if (error || !data) {
    console.error("Error al obtener alumnas:", error);
    return [] as StudentData[];
  }
  return data.map((row, index) => mapUsuarioToStudent(row as UsuarioRow, index));
}

export async function getAlumnaById(id: string) {
  const { data, error } = await supabase.from("usuarios").select("*").eq("id_alumna", id).single();
  if (error || !data) {
    console.error("Error al obtener alumna por id:", error);
    return null;
  }
  return mapUsuarioToStudent(data as UsuarioRow, 0);
}

export async function getAlumnaByMatricula(matricula: string) {
  const students = await getAlumnas();
  return students.find((student) => student.matricula.toLowerCase() === matricula.toLowerCase()) || null;
}

export async function createAlumna(params: {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  plan: string;
  schedule: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRel: string;
  notes: string;
}) {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const { name, phone, emergencyName, emergencyPhone } = params;
  const contacto = [emergencyName, emergencyPhone].filter(Boolean).join(" | ") || null;

  const { error } = await supabase.from("usuarios").insert({
    id_alumna: id,
    nombre: name,
    telefono: phone || null,
    contacto_emergencia: contacto,
    estado: true,
    rol: 2,
  });

  if (error) {
    console.error("Error al crear alumna:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
