export type PaymentStatus = "Al día" | "Pendiente" | "Vencido";
export type AttendanceStatus = "Presente" | "Ausente" | "Justificado";

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: "Pagado" | "Pendiente" | "Vencido";
  month: string;
}

export interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
  class: string;
}

export interface Student {
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
  paymentStatus: PaymentStatus;
  nextPaymentDate: string;
  lastPaymentDate: string;
  monthlyFee: number;
  emergencyContacts: EmergencyContact[];
  attendance: AttendanceRecord[];
  payments: Payment[];
  notes: string;
  activa: boolean;
}

export const students: Student[] = [
  {
    id: "1",
    name: "Valentina Torres",
    avatar: "",
    initials: "VT",
    matricula: "LFS-001",
    phone: "+56 9 8765 4321",
    email: "valentina.torres@gmail.com",
    birthDate: "1992-04-15",
    joinDate: "2024-01-10",
    schedule: "Lunes, Miércoles, Viernes — 9:00 AM",
    plan: "Plan Premium",
    paymentStatus: "Al día",
    nextPaymentDate: "2026-04-01",
    lastPaymentDate: "2026-03-01",
    monthlyFee: 65000,
    activa: true,
    emergencyContacts: [
      { name: "Carlos Torres", phone: "+56 9 1234 5678", relationship: "Esposo" },
      { name: "María González", phone: "+56 9 8765 1234", relationship: "Madre" },
    ],
    attendance: [
      { date: "2026-03-06", status: "Presente", class: "Pilates Matinal" },
      { date: "2026-03-05", status: "Presente", class: "Yoga Flow" },
      { date: "2026-03-04", status: "Ausente", class: "Pilates Matinal" },
      { date: "2026-03-03", status: "Presente", class: "Barre Fitness" },
      { date: "2026-03-02", status: "Presente", class: "Pilates Matinal" },
      { date: "2026-02-28", status: "Justificado", class: "Yoga Flow" },
      { date: "2026-02-27", status: "Presente", class: "Pilates Matinal" },
      { date: "2026-02-26", status: "Presente", class: "Barre Fitness" },
    ],
    payments: [
      { id: "p1", date: "2026-03-01", amount: 65000, method: "Transferencia", status: "Pagado", month: "Marzo 2026" },
      { id: "p2", date: "2026-02-01", amount: 65000, method: "Débito", status: "Pagado", month: "Febrero 2026" },
      { id: "p3", date: "2026-01-03", amount: 65000, method: "Transferencia", status: "Pagado", month: "Enero 2026" },
    ],
    notes: "Alumna destacada. Prefiere clases matinales.",
  },
  {
    id: "2",
    name: "Isadora Muñoz",
    avatar: "",
    initials: "IM",
    matricula: "LFS-002",
    phone: "+56 9 7654 3210",
    email: "isadora.munoz@hotmail.com",
    birthDate: "1995-09-22",
    joinDate: "2024-03-05",
    schedule: "Martes, Jueves — 7:00 AM",
    plan: "Plan Básico",
    paymentStatus: "Pendiente",
    nextPaymentDate: "2026-03-10",
    lastPaymentDate: "2026-02-10",
    monthlyFee: 45000,
    activa: true,
    emergencyContacts: [
      { name: "Sofía Muñoz", phone: "+56 9 3456 7890", relationship: "Hermana" },
    ],
    attendance: [
      { date: "2026-03-05", status: "Presente", class: "Pilates Reformer" },
      { date: "2026-03-03", status: "Ausente", class: "Pilates Reformer" },
      { date: "2026-02-27", status: "Presente", class: "Pilates Reformer" },
      { date: "2026-02-25", status: "Presente", class: "Pilates Reformer" },
      { date: "2026-02-20", status: "Ausente", class: "Pilates Reformer" },
    ],
    payments: [
      { id: "p4", date: "2026-02-10", amount: 45000, method: "Efectivo", status: "Pagado", month: "Febrero 2026" },
      { id: "p5", date: "2026-01-10", amount: 45000, method: "Efectivo", status: "Pagado", month: "Enero 2026" },
    ],
    notes: "Viene de rehabilitación postparto.",
  },
  {
    id: "3",
    name: "Catalina Reyes",
    avatar: "",
    initials: "CR",
    matricula: "LFS-003",
    phone: "+56 9 5432 1098",
    email: "cata.reyes@gmail.com",
    birthDate: "1988-12-03",
    joinDate: "2023-08-15",
    schedule: "Lunes, Miércoles, Viernes — 6:00 PM",
    plan: "Plan Premium",
    paymentStatus: "Al día",
    nextPaymentDate: "2026-04-05",
    lastPaymentDate: "2026-03-05",
    monthlyFee: 65000,
    activa: true,
    emergencyContacts: [
      { name: "Pedro Reyes", phone: "+56 9 6543 2109", relationship: "Padre" },
      { name: "Ana Martínez", phone: "+56 9 2109 8765", relationship: "Amiga" },
    ],
    attendance: [
      { date: "2026-03-06", status: "Presente", class: "Pilates Vespertino" },
      { date: "2026-03-04", status: "Presente", class: "Pilates Vespertino" },
      { date: "2026-03-02", status: "Presente", class: "Pilates Vespertino" },
      { date: "2026-02-28", status: "Presente", class: "Pilates Vespertino" },
      { date: "2026-02-26", status: "Ausente", class: "Pilates Vespertino" },
      { date: "2026-02-25", status: "Presente", class: "Yoga Nocturno" },
    ],
    payments: [
      { id: "p6", date: "2026-03-05", amount: 65000, method: "Transferencia", status: "Pagado", month: "Marzo 2026" },
      { id: "p7", date: "2026-02-05", amount: 65000, method: "Transferencia", status: "Pagado", month: "Febrero 2026" },
    ],
    notes: "Instructora certificada, asiste como alumna regular.",
  },
  {
    id: "4",
    name: "Fernanda Vásquez",
    avatar: "",
    initials: "FV",
    matricula: "LFS-004",
    phone: "+56 9 4321 0987",
    email: "fernanda.v@yahoo.com",
    birthDate: "2001-06-18",
    joinDate: "2025-01-20",
    schedule: "Sábado — 10:00 AM",
    plan: "Plan Mensual",
    paymentStatus: "Vencido",
    nextPaymentDate: "2026-02-20",
    lastPaymentDate: "2026-01-20",
    monthlyFee: 35000,
    activa: true,
    emergencyContacts: [
      { name: "Lucia Vásquez", phone: "+56 9 0987 6543", relationship: "Madre" },
    ],
    attendance: [
      { date: "2026-03-01", status: "Presente", class: "Pilates Fin de Semana" },
      { date: "2026-02-22", status: "Ausente", class: "Pilates Fin de Semana" },
      { date: "2026-02-15", status: "Presente", class: "Pilates Fin de Semana" },
      { date: "2026-02-08", status: "Presente", class: "Pilates Fin de Semana" },
    ],
    payments: [
      { id: "p8", date: "2026-01-20", amount: 35000, method: "Efectivo", status: "Pagado", month: "Enero 2026" },
      { id: "p9", date: "2026-02-20", amount: 35000, method: "", status: "Vencido", month: "Febrero 2026" },
    ],
    notes: "Alumna universitaria. Horario limitado.",
  },
  {
    id: "5",
    name: "Antonia Díaz",
    avatar: "",
    initials: "AD",
    matricula: "LFS-005",
    phone: "+56 9 3210 9876",
    email: "antonia.diaz@icloud.com",
    birthDate: "1985-02-28",
    joinDate: "2024-06-01",
    schedule: "Martes, Jueves — 8:00 AM",
    plan: "Plan Premium",
    paymentStatus: "Al día",
    nextPaymentDate: "2026-04-01",
    lastPaymentDate: "2026-03-01",
    monthlyFee: 65000,
    activa: true,
    emergencyContacts: [
      { name: "Jorge Díaz", phone: "+56 9 8765 0123", relationship: "Hermano" },
    ],
    attendance: [
      { date: "2026-03-05", status: "Presente", class: "Barre Fitness" },
      { date: "2026-03-03", status: "Presente", class: "Barre Fitness" },
      { date: "2026-02-27", status: "Justificado", class: "Barre Fitness" },
      { date: "2026-02-25", status: "Presente", class: "Barre Fitness" },
      { date: "2026-02-20", status: "Presente", class: "Barre Fitness" },
    ],
    payments: [
      { id: "p10", date: "2026-03-01", amount: 65000, method: "Transferencia", status: "Pagado", month: "Marzo 2026" },
      { id: "p11", date: "2026-02-01", amount: 65000, method: "Transferencia", status: "Pagado", month: "Febrero 2026" },
    ],
    notes: "Prefiere horario matutino. Muy puntual.",
  },
  {
    id: "6",
    name: "Renata Morales",
    avatar: "",
    initials: "RM",
    matricula: "LFS-006",
    phone: "+56 9 2109 8765",
    email: "renata.m@gmail.com",
    birthDate: "1998-11-07",
    joinDate: "2025-09-10",
    schedule: "Lunes, Miércoles — 7:30 PM",
    plan: "Plan Básico",
    paymentStatus: "Pendiente",
    nextPaymentDate: "2026-03-10",
    lastPaymentDate: "2026-02-10",
    monthlyFee: 45000,
    activa: true,
    emergencyContacts: [
      { name: "Paula Morales", phone: "+56 9 1098 7654", relationship: "Madre" },
    ],
    attendance: [
      { date: "2026-03-04", status: "Presente", class: "Yoga Flow" },
      { date: "2026-03-02", status: "Presente", class: "Yoga Flow" },
      { date: "2026-02-26", status: "Ausente", class: "Yoga Flow" },
      { date: "2026-02-24", status: "Presente", class: "Yoga Flow" },
    ],
    payments: [
      { id: "p12", date: "2026-02-10", amount: 45000, method: "Débito", status: "Pagado", month: "Febrero 2026" },
      { id: "p13", date: "2026-03-10", amount: 45000, method: "", status: "Pendiente", month: "Marzo 2026" },
    ],
    notes: "Nueva alumna. Gran potencial.",
  },
];

export const attendanceToday = [
  { studentId: "1", studentName: "Valentina Torres", class: "Pilates Matinal", time: "9:00 AM", status: "Presente" as AttendanceStatus },
  { studentId: "3", studentName: "Catalina Reyes", class: "Pilates Matinal", time: "9:00 AM", status: "Presente" as AttendanceStatus },
  { studentId: "5", studentName: "Antonia Díaz", class: "Barre Fitness", time: "8:00 AM", status: "Presente" as AttendanceStatus },
  { studentId: "6", studentName: "Renata Morales", class: "Yoga Flow", time: "7:30 PM", status: "Ausente" as AttendanceStatus },
  { studentId: "2", studentName: "Isadora Muñoz", class: "Pilates Reformer", time: "7:00 AM", status: "Presente" as AttendanceStatus },
  { studentId: "4", studentName: "Fernanda Vásquez", class: "Pilates Fin de Semana", time: "10:00 AM", status: "Ausente" as AttendanceStatus },
];