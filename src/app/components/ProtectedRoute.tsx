import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Flower2 } from "lucide-react";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8F6F4",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            <Flower2 size={24} color="#1A1A1A" />
          </div>
          <p style={{ color: "#C0BAB4", fontSize: "0.82rem" }}>Cargando...</p>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/mi-cuenta" replace />;
  return <Outlet />;
}