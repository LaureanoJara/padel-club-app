"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server";
import { supabaseAdmin } from "./supabase-admin";

export type AuthState =
  | { error?: string; success?: boolean }
  | undefined;

export async function signIn(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  redirect("/");
}

export async function signUp(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!nombre || !email || !password) {
    return { error: "Todos los campos son requeridos." };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Este email ya está registrado." };
    }
    return { error: error.message };
  }

  if (data.user) {
    await crearPerfil(data.user.id, nombre);
  }

  redirect("/");
}

export async function crearPerfil(userId: string, nombre: string) {
  const { error } = await supabaseAdmin.from("perfiles").insert({
    id: userId,
    nombre,
    rol: "socio",
  });
  if (error) {
    console.error("Error al crear perfil:", error.message);
  }
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
