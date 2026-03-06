import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "alumna";
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

const STORAGE_KEY = "larafit_users";
const SESSION_KEY = "larafit_session";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "alumna";
  createdAt: string;
}

// Admin semilla — siempre disponible para demo
const SEED_ADMIN: StoredUser = {
  id: "admin-seed-001",
  name: "Lara Administradora",
  email: "admin@larafit.cl",
  password: "admin123",
  role: "admin",
  createdAt: "2024-01-01T00:00:00.000Z",
};

function getUsers(): StoredUser[] {
  try {
    const stored: StoredUser[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    // Asegurar que el admin semilla siempre esté
    if (!stored.find((u) => u.id === SEED_ADMIN.id)) {
      return [SEED_ADMIN, ...stored];
    }
    return stored;
  } catch {
    return [SEED_ADMIN];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Asegurar seed al inicializar
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as StoredUser[];
    if (!stored.find((u) => u.id === SEED_ADMIN.id)) {
      saveUsers([SEED_ADMIN, ...stored]);
    }
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) setUser(JSON.parse(session));
    } catch {}
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 700));
    const users = getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { success: false, error: "Correo o contraseña incorrectos." };
    const { password: _, ...userData } = found;
    setUser(userData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return { success: true, role: userData.role };
  };

  const register = async (name: string, email: string, password: string, role: "admin" | "alumna") => {
    await new Promise((r) => setTimeout(r, 700));
    const users = getUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "Este correo ya está registrado." };
    }
    const newUser: StoredUser = {
      id: `u-${Date.now()}`,
      name,
      email,
      password,
      role,
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    const { password: _, ...userData } = newUser;
    setUser(userData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
