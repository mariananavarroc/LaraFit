import { supabase } from "./supabase";

export type SignupResult = { success: true } | { success: false; error: string };

export async function signup(params: {
  nombre?: string;
  telefono?: string;
  email: string;
  password: string;
}): Promise<SignupResult> {
  const { nombre, telefono, email, password } = params;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  if (!authData.user) {
    return { success: false, error: "No se pudo crear el usuario." };
  }

  const { error: insertError } = await supabase.from("alumnas").insert({
    nombre: nombre || null,
    telefono: telefono || null,
    contacto_emergencia: "",
    estado: true,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return { success: true };
}