import { NavLink, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  KeyRound,
  LogOut,
  Flower2,
  Home,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/estudio", icon: Home, label: "El Estudio" },
  { to: "/dashboard/alumnas", icon: Users, label: "Alumnas" },
  { to: "/dashboard/asistencia", icon: CalendarCheck, label: "Asistencia" },
  { to: "/dashboard/pagos", icon: CreditCard, label: "Pagos" },
  { to: "/dashboard/registro", icon: KeyRound, label: "Registro Rápido" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <aside
      className="flex flex-col h-screen sticky top-0"
      style={{
        width: "260px",
        minWidth: "260px",
        background: "#1A1A1A",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Logo */}
      <div
        className="flex flex-col items-center justify-center py-10 px-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="flex items-center justify-center mb-3"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C8B8D8 0%, #F2D4D7 100%)",
          }}
        >
          <Flower2 size={22} color="#1A1A1A" />
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "#FFFFFF",
            fontSize: "1.35rem",
            fontWeight: 400,
            letterSpacing: "0.08em",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          Lara Fit Studio
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          Admin Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 10,
                textDecoration: "none",
                transition: "all 0.2s ease",
                background: isActive
                  ? "linear-gradient(135deg, rgba(200,184,216,0.25) 0%, rgba(242,212,215,0.2) 100%)"
                  : "transparent",
                color: isActive ? "#E8DFF0" : "rgba(255,255,255,0.45)",
                borderLeft: isActive ? "2px solid #C8B8D8" : "2px solid transparent",
              }}
            >
              <Icon size={17} />
              <span style={{ fontSize: "0.875rem", letterSpacing: "0.02em" }}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-6" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3 px-3 pt-5 pb-3">
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "#1A1A1A",
            }}
          >
            LA
          </div>
          <div>
            <p style={{ color: "#FFFFFF", fontSize: "0.8rem" }}>{"Administradora"}</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem" }}>{"Admin"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "rgba(255,255,255,0.35)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: "0.8rem",
            transition: "color 0.2s",
            width: "100%",
          }}
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}