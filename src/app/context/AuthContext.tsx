import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getActiveSession, login as supabaseLogin, signup as supabaseSignup, logout as supabaseLogout, getUserData } from "../../../backend/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "alumna";
  phone?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: "admin" | "alumna"; error?: string }>;
  register: (name: string, email: string, password: string, role: "admin" | "alumna") => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const session = await getActiveSession();
      if (session) {
        const userData = await getUserData(session.id);
        if (userData) {
          setUser({
            id: userData.id_alumna,
            name: userData.nombre || "Usuario",
            email: session.email || "",
            role: userData.rol === 1 ? "admin" : "alumna",
            phone: userData.telefono || undefined,
            createdAt: userData.created_at || new Date().toISOString(),
          });
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await supabaseLogin(email, password);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const session = await getActiveSession();
    if (session) {
      const userData = await getUserData(session.id);
      if (userData) {
        const userObj: User = {
          id: userData.id_alumna,
          name: userData.nombre || "Usuario",
          email: session.email || "",
          role: userData.rol === 1 ? "admin" : "alumna",
          phone: userData.telefono || undefined,
          createdAt: userData.created_at || new Date().toISOString(),
        };
        setUser(userObj);
        return { success: true, role: userObj.role };
      }
    }
    return { success: false, error: "Error al obtener datos del usuario." };
  };

  const register = async (name: string, email: string, password: string, role: "admin" | "alumna") => {
    const result = await supabaseSignup({
      nombre: name,
      email,
      password,
      telefono: undefined,
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  };

  const logout = async () => {
    await supabaseLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
