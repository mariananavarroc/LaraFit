import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { getActiveSession, getUserData } from "../../../backend/auth";
import { Flower2 } from "lucide-react";

type AccessState =
  | "loading"
  | "allowed"
  | "unauthenticated"
  | "forbidden";

export function ProtectedRoute() {
  const [accessState, setAccessState] =
    useState<AccessState>("loading");

  useEffect(() => {
    let active = true;

    const checkAccess = async () => {
      try {
        const sessionUser = await getActiveSession();

        if (!active) return;

        if (!sessionUser) {
          setAccessState("unauthenticated");
          return;
        }

        const profile = await getUserData(sessionUser.id);

        if (!active) return;

        if (!profile || profile.rol !== 1) {
          setAccessState("forbidden");
          return;
        }

        setAccessState("allowed");
      } catch (error) {
        console.error("Error verificando acceso:", error);

        if (active) {
          setAccessState("unauthenticated");
        }
      }
    };

    checkAccess();

    return () => {
      active = false;
    };
  }, []);

  if (accessState === "loading") {
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
              background:
                "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Flower2 size={24} color="#1A1A1A" />
          </div>

          <p
            style={{
              color: "#C0BAB4",
              fontSize: "0.82rem",
            }}
          >
            Verificando acceso...
          </p>
        </div>
      </div>
    );
  }

  if (accessState === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (accessState === "forbidden") {
    return <Navigate to="/mi-cuenta" replace />;
  }

  return <Outlet />;
}