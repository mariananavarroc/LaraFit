import { createBrowserRouter } from "react-router";
import { Landing } from "./components/Landing";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { MiCuenta } from "./components/MiCuenta";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Alumnas } from "./components/Alumnas";
import { AlumnaProfile } from "./components/AlumnaProfile";
import { NuevaAlumna } from "./components/NuevaAlumna";
import { Asistencia } from "./components/Asistencia";
import { Pagos } from "./components/Pagos";
import { RegistroMatricula } from "./components/RegistroMatricula";
import { Estudio } from "./components/Estudio";
import { CitasAdmin } from "./components/CitasAdmin";

export const router = createBrowserRouter([
  // ── Pública ──
  { path: "/", Component: Landing },

  // ── Login unificado (detecta rol automáticamente) ──
  { path: "/login", Component: Login },

  // ── Alumnas ──
  { path: "/alumna/login", Component: Login },
  { path: "/alumna/registro", Component: Register },
  { path: "/mi-cuenta", Component: MiCuenta },

  // ── Admin auth ──
  { path: "/admin/login", Component: Login },
  { path: "/admin/registro", Component: Register },

  // ── Admin dashboard (protegido, solo role: admin) ──
  {
    path: "/dashboard",
    children: [
      {
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: "estudio", Component: Estudio },
          { path: "alumnas", Component: Alumnas },
          { path: "alumnas/nueva", Component: NuevaAlumna },
          { path: "alumnas/:id", Component: AlumnaProfile },
          { path: "asistencia", Component: Asistencia },
          { path: "citas", Component: CitasAdmin },
          { path: "pagos", Component: Pagos },
          { path: "registro", Component: RegistroMatricula },
        ],
      },
    ],
  },
]);
