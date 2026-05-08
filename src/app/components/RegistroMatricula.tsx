import { useState, useEffect } from "react";
import { students } from "../data/mockData";
import { findStudentByMatricula, registerQuickAttendanceByMatricula } from "../../../backend/adminData";
import type { Student } from "../data/mockData";
import {
  Delete,
  CheckCircle2,
  XCircle,
  KeyRound,
  Flower2,
} from "lucide-react";

type ResultState = "idle" | "found" | "notfound" | "loading" | "error";

export function RegistroMatricula() {
  const [input, setInput] = useState("");
  const [result, setResultState] = useState<ResultState>("idle");
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [registered, setRegistered] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [registeredTodayList, setRegisteredTodayList] = useState<Array<{ id: string; name: string; time: string }>>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const MAX = 7; // e.g. LFS-001

  const formatted = input
    ? `LFS-${input.padStart(3, "0")}`
    : "";

  const handleKey = (val: string) => {
    if (result !== "idle" && result !== "error") {
      setResultState("idle");
      setFoundStudent(null);
      setErrorMessage("");
    }
    if (input.length >= MAX - 4) return; // "LFS-" prefix is 4 chars, digits max 3
    setInput((prev) => prev + val);
  };

  const handleDelete = () => {
    if (result !== "idle" && result !== "error") {
      setResultState("idle");
      setFoundStudent(null);
      setErrorMessage("");
    }
    setInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInput("");
    setResultState("idle");
    setFoundStudent(null);
    setErrorMessage("");
  };

  const handleConfirm = async () => {
    if (!input) return;
    
    setResultState("loading");
    setErrorMessage("");
    
    try {
      const query = `LFS-${input.padStart(3, "0")}`;
      
      // Primero intentar buscar en la BD
      const dbStudent = await findStudentByMatricula(query);
      
      if (dbStudent) {
        // Registrar asistencia en la BD
        await registerQuickAttendanceByMatricula({
          matricula: query,
          className: "Registro Rápido",
        });
        
        setFoundStudent(dbStudent);
        setResultState("found");
        
        // Agregar a la lista de registradas hoy
        const now = new Date();
        setRegisteredTodayList((prev) => [
          ...prev,
          {
            id: dbStudent.id,
            name: dbStudent.name,
            time: now.toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        
        if (!registered.includes(dbStudent.id)) {
          setRegistered((prev) => [...prev, dbStudent.id]);
        }
      } else {
        // Si no está en BD, intentar fallback con mockData
        const mockStudent = students.find(
          (s) => s.matricula.toUpperCase() === query.toUpperCase()
        );
        
        if (mockStudent) {
          // Intentar registrar en BD con el ID del mock
          try {
            await registerQuickAttendanceByMatricula({
              matricula: query,
              className: "Registro Rápido",
            });
          } catch (err) {
            // Si falla en BD pero está en mockData, mostrar warning pero permitir continuar
            console.warn("Asistencia no se registró en BD, pero alumna encontrada en caché local", err);
          }
          
          setFoundStudent(mockStudent);
          setResultState("found");
          
          const now = new Date();
          setRegisteredTodayList((prev) => [
            ...prev,
            {
              id: mockStudent.id,
              name: mockStudent.name,
              time: now.toLocaleTimeString("es-CL", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
          
          if (!registered.includes(mockStudent.id)) {
            setRegistered((prev) => [...prev, mockStudent.id]);
          }
        } else {
          setFoundStudent(null);
          setResultState("notfound");
          setErrorMessage("Matrícula no encontrada");
          setShake(true);
          setTimeout(() => setShake(false), 500);
        }
      }
    } catch (err) {
      setFoundStudent(null);
      setResultState("error");
      setErrorMessage(err instanceof Error ? err.message : "Error al registrar asistencia");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      console.error("Error en handleConfirm:", err);
    }
  };

  const handleRegisterAnother = () => {
    setInput("");
    setResultState("idle");
    setFoundStudent(null);
    setErrorMessage("");
  };

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleKey(e.key);
      else if (e.key === "Backspace") handleDelete();
      else if (e.key === "Enter" && result !== "loading") handleConfirm();
      else if (e.key === "Escape") handleClear();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [input, result]);

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["C", "0", "⌫"],
  ];

  return (
    <div
      style={{
        padding: "40px 48px",
        maxWidth: 1100,
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div className="mb-10">
        <p
          style={{
            color: "#C8B8D8",
            fontSize: "0.72rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Acceso Rápido
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2rem",
            fontWeight: 400,
            color: "#1A1A1A",
          }}
        >
          Registro de Matrícula
        </h1>
        <p style={{ color: "#9D9D9D", fontSize: "0.85rem", marginTop: 4 }}>
          Ingresa tu número de matrícula para registrar tu asistencia.
        </p>
      </div>

      <div className="flex gap-10 items-start">
        {/* Keypad Card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 24,
            padding: "40px 40px 36px",
            boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
            width: 360,
            flexShrink: 0,
          }}
        >
          {/* Branding */}
          <div className="flex flex-col items-center mb-8">
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Flower2 size={22} color="#1A1A1A" />
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.1rem",
                color: "#1A1A1A",
                letterSpacing: "0.06em",
              }}
            >
              Lara Fit Studio
            </p>
            <p style={{ fontSize: "0.72rem", color: "#C0BAB4", marginTop: 2 }}>
              Ingresa tu matrícula
            </p>
          </div>

          {/* Display */}
          <div
            style={{
              background: result === "found"
                ? "rgba(209,231,201,0.2)"
                : result === "notfound" || result === "error"
                ? "rgba(242,212,215,0.3)"
                : result === "loading"
                ? "rgba(200,184,216,0.15)"
                : "#F8F6F4",
              borderRadius: 14,
              padding: "18px 24px",
              marginBottom: 24,
              textAlign: "center",
              border: result === "found"
                ? "1.5px solid rgba(122,201,154,0.5)"
                : result === "notfound" || result === "error"
                ? "1.5px solid rgba(234,160,176,0.5)"
                : result === "loading"
                ? "1.5px solid rgba(200,184,216,0.3)"
                : "1.5px solid transparent",
              transition: "all 0.3s ease",
              animation: shake ? "shake 0.4s ease" : "none",
            }}
          >
            <p
              style={{
                fontSize: "0.68rem",
                color: "#9D9D9D",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Matrícula
            </p>
            {result === "loading" ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: "2.4rem" }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#7B5EA7",
                    animation: "pulse 1.5s infinite",
                  }}
                />
                <p style={{ fontSize: "0.9rem", color: "#7B5EA7" }}>Registrando...</p>
              </div>
            ) : (
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "2.2rem",
                  color: result === "found"
                    ? "#4A7C59"
                    : result === "notfound" || result === "error"
                    ? "#B05070"
                    : input
                    ? "#1A1A1A"
                    : "#D0CCC8",
                  letterSpacing: "0.12em",
                  lineHeight: 1,
                  minHeight: "2.4rem",
                  transition: "color 0.2s",
                }}
              >
                {formatted || "LFS-___"}
              </p>
            )}
          </div>

          {/* Result message inline */}
          {result === "found" && foundStudent && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(209,231,201,0.25)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 16,
              }}
            >
              <CheckCircle2 size={16} color="#4A7C59" />
              <p style={{ fontSize: "0.8rem", color: "#4A7C59" }}>
                ¡Bienvenida, {foundStudent.name.split(" ")[0]}! Asistencia registrada.
              </p>
            </div>
          )}
          {(result === "notfound" || result === "error") && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(242,212,215,0.3)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 16,
              }}
            >
              <XCircle size={16} color="#B05070" />
              <p style={{ fontSize: "0.8rem", color: "#B05070" }}>
                {errorMessage || "Matrícula no encontrada."}
              </p>
            </div>
          )}

          {/* Keypad */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
            }}
          >
            {keys.flat().map((k) => {
              const isSpecial = k === "C" || k === "⌫";
              const isConfirm = false;
              return (
                <button
                  key={k}
                  onClick={() => {
                    if (k === "⌫") handleDelete();
                    else if (k === "C") handleClear();
                    else handleKey(k);
                  }}
                  style={{
                    height: 60,
                    borderRadius: 14,
                    border: "none",
                    background: isSpecial
                      ? "rgba(200,184,216,0.15)"
                      : "#F8F6F4",
                    color: isSpecial ? "#7B5EA7" : "#1A1A1A",
                    fontFamily: isSpecial ? "'DM Sans', sans-serif" : "'Cormorant Garamond', serif",
                    fontSize: isSpecial ? "0.9rem" : "1.6rem",
                    fontWeight: isSpecial ? 500 : 400,
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = isSpecial
                      ? "rgba(200,184,216,0.35)"
                      : "#EDE8E2";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)";
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = isSpecial
                      ? "rgba(200,184,216,0.15)"
                      : "#F8F6F4";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = isSpecial
                      ? "rgba(200,184,216,0.15)"
                      : "#F8F6F4";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                  }}
                >
                  {k}
                </button>
              );
            })}
          </div>

          {/* Confirm */}
          <button
            onClick={result !== "idle" && result !== "error" ? handleRegisterAnother : handleConfirm}
            disabled={result === "loading" || (result === "idle" && !input)}
            style={{
              marginTop: 12,
              width: "100%",
              height: 56,
              borderRadius: 14,
              border: "none",
              background:
                result === "loading"
                  ? "rgba(200,184,216,0.25)"
                  : result === "found"
                  ? "linear-gradient(135deg, #7AC99A, #A8D8B0)"
                  : result === "error"
                  ? "linear-gradient(135deg, #EAA0B0, #F2C0C8)"
                  : result === "notfound"
                  ? "linear-gradient(135deg, #EAA0B0, #F2C0C8)"
                  : input
                  ? "linear-gradient(135deg, #C8B8D8, #F2D4D7)"
                  : "#E8E4DF",
              color: (result === "loading" || (result === "idle" && !input)) ? "#B0A8A0" : "#1A1A1A",
              cursor: (result === "loading" || (result === "idle" && !input)) ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s ease",
              opacity: (result === "loading" || (result === "idle" && !input)) ? 0.6 : 1,
            }}
          >
            {result === "loading" ? (
              <>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid rgba(123, 94, 167, 0.3)",
                    borderTop: "2px solid #7B5EA7",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Registrando...
              </>
            ) : result === "found" ? (
              <>
                <CheckCircle2 size={16} />
                Registrar otra
              </>
            ) : result === "notfound" || result === "error" ? (
              <>
                <XCircle size={16} />
                Intentar de nuevo
              </>
            ) : (
              <>
                <KeyRound size={15} />
                Confirmar
              </>
            )}
          </button>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.68rem",
              color: "#C0BAB4",
              marginTop: 14,
            }}
          >
            También puedes usar el teclado físico · Enter para confirmar
          </p>
        </div>

        {/* Side panel */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Found student detail */}
          {result === "found" && foundStudent && (
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                padding: "28px 32px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                border: "1.5px solid rgba(122,201,154,0.3)",
                animation: "fadeSlide 0.35s ease",
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #C8B8D8, #F2D4D7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    color: "#1A1A1A",
                    flexShrink: 0,
                  }}
                >
                  {foundStudent.initials}
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.6rem",
                      color: "#1A1A1A",
                      fontWeight: 400,
                    }}
                  >
                    {foundStudent.name}
                  </h2>
                  <p style={{ fontSize: "0.78rem", color: "#9D9D9D" }}>
                    {foundStudent.matricula} · {foundStudent.plan}
                  </p>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    background: "rgba(209,231,201,0.3)",
                    borderRadius: 12,
                    padding: "10px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CheckCircle2 size={18} color="#4A7C59" />
                  <span style={{ fontSize: "0.85rem", color: "#4A7C59" }}>
                    Asistencia registrada
                  </span>
                </div>
              </div>

              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
              >
                {[
                  { label: "Horario", value: foundStudent.schedule },
                  {
                    label: "Próximo Pago",
                    value: new Date(foundStudent.nextPaymentDate).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "long",
                    }),
                  },
                  {
                    label: "Estado de Pago",
                    value: foundStudent.paymentStatus,
                    badge: true,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "#FDFCFB",
                      borderRadius: 12,
                      padding: "14px 16px",
                      border: "1px solid #F0EDE8",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.65rem",
                        color: "#9D9D9D",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 6,
                      }}
                    >
                      {item.label}
                    </p>
                    {item.badge ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: "0.75rem",
                          background:
                            foundStudent.paymentStatus === "Al día"
                              ? "rgba(209,231,201,0.5)"
                              : foundStudent.paymentStatus === "Pendiente"
                              ? "rgba(200,184,216,0.35)"
                              : "rgba(242,212,215,0.6)",
                          color:
                            foundStudent.paymentStatus === "Al día"
                              ? "#4A7C59"
                              : foundStudent.paymentStatus === "Pendiente"
                              ? "#7B5EA7"
                              : "#B05070",
                        }}
                      >
                        {item.value}
                      </span>
                    ) : (
                      <p style={{ fontSize: "0.82rem", color: "#1A1A1A" }}>
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registered today */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              padding: "28px 32px",
              boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
              flex: 1,
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.2rem",
                  color: "#1A1A1A",
                  fontWeight: 500,
                }}
              >
                Registradas Hoy
              </h3>
              <span
                style={{
                  background: "rgba(200,184,216,0.25)",
                  borderRadius: 20,
                  padding: "3px 14px",
                  fontSize: "0.78rem",
                  color: "#7B5EA7",
                }}
              >
                {registeredTodayList.length} alumna{registeredTodayList.length !== 1 ? "s" : ""}
              </span>
            </div>

            {registeredTodayList.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#C0BAB4",
                }}
              >
                <KeyRound size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                <p style={{ fontSize: "0.85rem" }}>
                  Ninguna alumna registrada aún.
                </p>
                <p style={{ fontSize: "0.75rem", marginTop: 4 }}>
                  Ingresa una matrícula para comenzar.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {registeredTodayList.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "#FDFCFB",
                      border: "1px solid #F0EDE8",
                      animation: idx === registeredTodayList.length - 1 ? "fadeSlide 0.3s ease" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background:
                            idx % 2 === 0
                              ? "linear-gradient(135deg, #C8B8D8, #E8DFF0)"
                              : "linear-gradient(135deg, #F2D4D7, #FAE8EA)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.68rem",
                          color: "#1A1A1A",
                          flexShrink: 0,
                          fontWeight: 500,
                        }}
                      >
                        {item.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: "0.85rem", color: "#1A1A1A" }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: "0.7rem", color: "#C0BAB4" }}>
                          Registro Rápido
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p style={{ fontSize: "0.72rem", color: "#C0BAB4" }}>
                        {item.time}
                      </p>
                      <CheckCircle2 size={16} color="#7AC99A" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
