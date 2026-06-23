"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "./supabase-server";
import { supabaseAdmin } from "./supabase-admin";
import { getSession } from "./auth";
import type { Perfil } from "@/types";

export type PerfilState =
  | { error?: string; success?: boolean; perfil?: Perfil }
  | undefined;

export async function getPerfil(): Promise<Perfil | null> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const { data } = await supabaseAdmin
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as Perfil) ?? null;
}

export async function getAvatarUrl(): Promise<string | null> {
  const user = await getSession();
  if (!user) return null;

  const { data } = await supabaseAdmin
    .from("perfiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  return data?.avatar_url ?? null;
}

// Sube la imagen al bucket 'avatares' en la carpeta del usuario
// y retorna la URL pública. Ruta: {userId}/avatar (sin extensión, upsert).
export async function subirAvatar(archivo: File): Promise<string | null> {
  const user = await getSession();
  if (!user) return null;

  const path = `${user.id}/avatar`;
  const arrayBuffer = await archivo.arrayBuffer();

  const { error } = await supabaseAdmin.storage
    .from("avatares")
    .upload(path, arrayBuffer, {
      contentType: archivo.type,
      upsert: true,
    });

  if (error) return null;

  const { data } = supabaseAdmin.storage.from("avatares").getPublicUrl(path);
  return data.publicUrl;
}

export async function actualizarPerfil(
  prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const apodo = (formData.get("apodo") as string).trim() || null;
  const edadStr = (formData.get("edad") as string).trim();
  const alturaStr = (formData.get("altura") as string).trim();
  const posicionRaw = (formData.get("posicion") as string).trim();
  const pala = (formData.get("pala") as string).trim() || null;

  const edad = edadStr ? parseInt(edadStr, 10) : null;
  const altura = alturaStr ? parseFloat(alturaStr) : null;
  const posicion =
    posicionRaw && ["drive", "reves", "ambas"].includes(posicionRaw)
      ? posicionRaw
      : null;

  if (edad !== null && (isNaN(edad) || edad < 5 || edad > 99)) {
    return { error: "La edad debe ser un número entre 5 y 99." };
  }
  if (altura !== null && (isNaN(altura) || altura < 1.0 || altura > 2.5)) {
    return { error: "La altura debe ser un valor válido entre 1.00 y 2.50 m." };
  }

  const updateData: Record<string, unknown> = { apodo, edad, altura, posicion, pala };

  const avatarFile = formData.get("avatar") as File | null;
  if (avatarFile && avatarFile.size > 0) {
    const url = await subirAvatar(avatarFile);
    if (!url) {
      return { error: "No se pudo subir la foto de perfil. Intentá de nuevo." };
    }
    updateData.avatar_url = url;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("perfiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: "No se pudo guardar el perfil. Intentá de nuevo." };
  }

  const { data: perfilActualizado } = await supabaseAdmin
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  revalidatePath("/perfil");
  return { success: true, perfil: perfilActualizado as Perfil };
}
