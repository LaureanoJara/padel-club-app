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
  const categoriaRaw = (formData.get("categoria") as string).trim();

  const edad = edadStr ? parseInt(edadStr, 10) : null;
  const altura = alturaStr ? parseFloat(alturaStr) : null;
  const posicion =
    posicionRaw && ["drive", "reves", "ambas"].includes(posicionRaw)
      ? posicionRaw
      : null;
  const CATEGORIAS = ["1era", "2da", "3era", "4ta", "5ta", "6ta", "7ma", "8va"];
  const categoria = CATEGORIAS.includes(categoriaRaw) ? categoriaRaw : null;

  if (edad !== null && (isNaN(edad) || edad < 5 || edad > 99)) {
    return { error: "La edad debe ser un número entre 5 y 99." };
  }
  if (altura !== null && (isNaN(altura) || altura < 1.0 || altura > 2.5)) {
    return { error: "La altura debe ser un valor válido entre 1.00 y 2.50 m." };
  }

  const updateData: Record<string, unknown> = { apodo, edad, altura, posicion, pala, categoria };

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

export async function enviarSolicitudPareja(
  prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const receptorId = (formData.get("receptorId") as string).trim();
  if (!receptorId) return { error: "Elegí un amigo para enviar la solicitud." };

  // supabaseAdmin para bypass de RLS en columnas nuevas (pareja_id / pareja_estado)
  const { error: errorPerfil } = await supabaseAdmin
    .from("perfiles")
    .update({ pareja_id: receptorId, pareja_estado: "pendiente" })
    .eq("id", user.id);

  if (errorPerfil) return { error: "No se pudo enviar la solicitud. Intentá de nuevo." };

  const { data: miperfil } = await supabaseAdmin
    .from("perfiles")
    .select("nombre")
    .eq("id", user.id)
    .single();

  await supabaseAdmin.from("notificaciones").insert({
    usuario_id: receptorId,
    tipo: "solicitud_pareja",
    titulo: "Solicitud de pareja",
    mensaje: `${miperfil?.nombre ?? "Un socio"} te eligió como pareja favorita en el club 🎾`,
    remitente_id: user.id,
  });

  const { data: perfilActualizado } = await supabaseAdmin
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  revalidatePath("/perfil");
  return { success: true, perfil: perfilActualizado as Perfil };
}

export async function cancelarSolicitudPareja(
  prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const { data: perfil } = await supabaseAdmin
    .from("perfiles")
    .select("pareja_id")
    .eq("id", user.id)
    .single();

  if (perfil?.pareja_id) {
    await supabaseAdmin
      .from("notificaciones")
      .delete()
      .eq("usuario_id", perfil.pareja_id)
      .eq("remitente_id", user.id)
      .eq("tipo", "solicitud_pareja");
  }

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("perfiles")
    .update({ pareja_id: null, pareja_estado: null })
    .eq("id", user.id);

  const { data: perfilActualizado } = await supabaseAdmin
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  revalidatePath("/perfil");
  return { success: true, perfil: perfilActualizado as Perfil };
}

export async function eliminarPareja(
  prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const { data: perfil } = await supabaseAdmin
    .from("perfiles")
    .select("pareja_id, nombre")
    .eq("id", user.id)
    .single();

  const parejaId = perfil?.pareja_id;

  const supabase = await createSupabaseServerClient();
  const updates: Promise<unknown>[] = [
    supabase
      .from("perfiles")
      .update({ pareja_id: null, pareja_estado: null })
      .eq("id", user.id),
  ];

  if (parejaId) {
    updates.push(
      supabaseAdmin
        .from("perfiles")
        .update({ pareja_id: null, pareja_estado: null })
        .eq("id", parejaId)
        .eq("pareja_id", user.id)
    );
  }

  await Promise.all(updates);

  if (parejaId) {
    await supabaseAdmin.from("notificaciones").insert({
      usuario_id: parejaId,
      tipo: "pareja_eliminada",
      titulo: "Pareja eliminada",
      mensaje: `${perfil?.nombre ?? "Un socio"} te eliminó como pareja favorita.`,
      remitente_id: user.id,
    });
  }

  const { data: perfilActualizado } = await supabaseAdmin
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  revalidatePath("/perfil");
  revalidatePath("/socios");
  return { success: true, perfil: perfilActualizado as Perfil };
}
