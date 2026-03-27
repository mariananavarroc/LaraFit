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

  const { error: insertError } = await supabase.from("usuarios").insert({
    nombre: nombre || null,
    telefono: telefono || null,
    contacto_emergencia: null,
    estado: true,
    rol: 2,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return { success: true };
}


export async function login(email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  return { success: true, data: authData }
}


export async function getUserData(id: string) {
  const { data } = await supabase.from("usuarios").select("*").eq("id_alumna", id).single()

  if (!data) {
    return null;
  } else {
    return data;
  }
}