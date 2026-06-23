"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "./supabase-server";
import { supabaseAdmin } from "./supabase-admin";
import { getSession } from "./auth";
import type { SocioConAmistad, SocioPublico, EstadoAmistad } from "@/types";

function calcularEstado(
  amistad: { id: string; estado: string; solicitante_id: string } | null,
  userId: string
): { estado_amistad: EstadoAmistad; amistad_id: string | null } {
  if (!amistad) return { estado_amistad: "sin_relacion", amistad_id: null };
  if (amistad.estado === "aceptada") return { estado_amistad: "amigos", amistad_id: amistad.id };
  if (amistad.estado === "pendiente") {
    const soy = amistad.solicitante_id === userId;
    return {
      estado_amistad: soy ? "solicitud_enviada" : "solicitud_recibida",
      amistad_id: amistad.id,
    };
  }
  // rechazada → tratar como sin relación (puede reenviar solicitud)
  return { estado_amistad: "sin_relacion", amistad_id: amistad.id };
}

export async function getTodosLosSocios(): Promise<SocioConAmistad[]> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const [{ data: perfiles }, { data: amistades }] = await Promise.all([
    supabaseAdmin
      .from("perfiles")
      .select("id, nombre, apodo, posicion, avatar_url")
      .neq("id", user.id)
      .order("nombre"),
    supabaseAdmin
      .from("amistades")
      .select("id, solicitante_id, receptor_id, estado")
      .or(`solicitante_id.eq.${user.id},receptor_id.eq.${user.id}`)
      .order("created_at", { ascending: false }),
  ]);

  if (!perfiles?.length) return [];

  const amistadMap = new Map<string, { id: string; estado: string; solicitante_id: string }>();
  for (const a of amistades ?? []) {
    const otroId = a.solicitante_id === user.id ? a.receptor_id : a.solicitante_id;
    if (!amistadMap.has(otroId)) amistadMap.set(otroId, a); // primera = más reciente
  }

  return perfiles.map((p) => {
    const a = amistadMap.get(p.id) ?? null;
    const { estado_amistad, amistad_id } = calcularEstado(a, user.id);
    return { ...p, estado_amistad, amistad_id } as SocioConAmistad;
  });
}

export async function getSocio(id: string): Promise<SocioConAmistad | null> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  // Dos queries simples en lugar de OR con AND anidado (más confiable en Supabase JS)
  const [{ data: perfil }, { data: comoSolicitante }, { data: comoReceptor }] =
    await Promise.all([
      supabaseAdmin
        .from("perfiles")
        .select("id, nombre, apodo, posicion, avatar_url, pala, edad, altura, pareja_id, pareja_estado, categoria")
        .eq("id", id)
        .maybeSingle(),
      supabaseAdmin
        .from("amistades")
        .select("id, solicitante_id, receptor_id, estado")
        .eq("solicitante_id", user.id)
        .eq("receptor_id", id)
        .order("created_at", { ascending: false })
        .maybeSingle(),
      supabaseAdmin
        .from("amistades")
        .select("id, solicitante_id, receptor_id, estado")
        .eq("solicitante_id", id)
        .eq("receptor_id", user.id)
        .order("created_at", { ascending: false })
        .maybeSingle(),
    ]);

  if (!perfil) return null;

  const amistad = comoSolicitante ?? comoReceptor ?? null;
  const { estado_amistad, amistad_id } = calcularEstado(amistad, user.id);
  return { ...(perfil as SocioPublico), estado_amistad, amistad_id };
}

export async function enviarSolicitudAmistad(
  receptorId: string,
  _formData: FormData
): Promise<void> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  // Limpiar cualquier fila previa entre estos dos usuarios (rechazada, cancelada, etc.)
  await Promise.all([
    supabaseAdmin
      .from("amistades")
      .delete()
      .eq("solicitante_id", user.id)
      .eq("receptor_id", receptorId),
    supabaseAdmin
      .from("amistades")
      .delete()
      .eq("solicitante_id", receptorId)
      .eq("receptor_id", user.id),
  ]);

  const supabase = await createSupabaseServerClient();
  const { data: amistad } = await supabase
    .from("amistades")
    .insert({ solicitante_id: user.id, receptor_id: receptorId })
    .select("id")
    .single();

  if (amistad) {
    const { data: miperfil } = await supabaseAdmin
      .from("perfiles")
      .select("nombre")
      .eq("id", user.id)
      .single();

    const mensaje = `${miperfil?.nombre ?? "Un socio"} quiere ser tu amigo en el club.`;

    // Si ya existe notificación de este solicitante, actualizarla en lugar de duplicar
    const { data: notifExistente } = await supabaseAdmin
      .from("notificaciones")
      .select("id")
      .eq("usuario_id", receptorId)
      .eq("tipo", "solicitud_amistad")
      .eq("remitente_id", user.id)
      .maybeSingle();

    if (notifExistente) {
      await supabaseAdmin
        .from("notificaciones")
        .update({
          amistad_id: amistad.id,
          estado: "pendiente",
          leida: false,
          created_at: new Date().toISOString(),
          mensaje,
        })
        .eq("id", notifExistente.id);
    } else {
      await supabaseAdmin.from("notificaciones").insert({
        usuario_id: receptorId,
        tipo: "solicitud_amistad",
        titulo: "Nueva solicitud de amistad",
        mensaje,
        amistad_id: amistad.id,
        remitente_id: user.id,
      });
    }
  }

  revalidatePath("/socios");
  revalidatePath(`/socios/${receptorId}`);
}

export async function aceptarAmistad(
  amistadId: string,
  _formData: FormData
): Promise<void> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = await createSupabaseServerClient();
  const { data: amistad } = await supabase
    .from("amistades")
    .update({ estado: "aceptada" })
    .eq("id", amistadId)
    .eq("receptor_id", user.id)
    .select("solicitante_id")
    .single();

  if (amistad) {
    const { data: miperfil } = await supabaseAdmin
      .from("perfiles")
      .select("nombre")
      .eq("id", user.id)
      .single();

    await Promise.all([
      // Marcar la notificación que recibió el receptor como aceptada
      supabaseAdmin
        .from("notificaciones")
        .update({ estado: "aceptada", leida: true })
        .eq("amistad_id", amistadId)
        .eq("tipo", "solicitud_amistad"),
      // Notificar al solicitante que fue aceptado
      supabaseAdmin.from("notificaciones").insert({
        usuario_id: amistad.solicitante_id,
        tipo: "amistad_aceptada",
        titulo: "Solicitud aceptada",
        mensaje: `${miperfil?.nombre ?? "Un socio"} aceptó tu solicitud de amistad.`,
        remitente_id: user.id,
      }),
    ]);
  }

  revalidatePath("/socios");
  revalidatePath("/notificaciones");
}

export async function rechazarAmistad(
  amistadId: string,
  _formData: FormData
): Promise<void> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const [{ data: amistad }, { data: miperfil }] = await Promise.all([
    supabaseAdmin
      .from("amistades")
      .select("solicitante_id")
      .eq("id", amistadId)
      .eq("receptor_id", user.id)
      .single(),
    supabaseAdmin.from("perfiles").select("nombre").eq("id", user.id).single(),
  ]);

  const supabase = await createSupabaseServerClient();

  const ops: Promise<unknown>[] = [
    supabaseAdmin
      .from("notificaciones")
      .update({ estado: "rechazada", leida: true })
      .eq("amistad_id", amistadId)
      .eq("tipo", "solicitud_amistad"),
    supabase
      .from("amistades")
      .update({ estado: "rechazada" })
      .eq("id", amistadId)
      .eq("receptor_id", user.id),
  ];

  if (amistad?.solicitante_id) {
    ops.push(
      supabaseAdmin.from("notificaciones").insert({
        usuario_id: amistad.solicitante_id,
        tipo: "amistad_rechazada",
        titulo: "Solicitud de amistad rechazada",
        mensaje: `${miperfil?.nombre ?? "Un socio"} rechazó tu solicitud de amistad`,
        remitente_id: user.id,
      })
    );
  }

  await Promise.all(ops);

  revalidatePath("/socios");
  revalidatePath("/notificaciones");
}

export async function eliminarAmistad(
  amistadId: string,
  _formData: FormData
): Promise<void> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = await createSupabaseServerClient();

  // Leer IDs antes de eliminar para poder limpiar amistad_aceptada (no tiene amistad_id)
  const { data: amistad } = await supabaseAdmin
    .from("amistades")
    .select("solicitante_id, receptor_id")
    .eq("id", amistadId)
    .single();

  if (amistad) {
    const { solicitante_id, receptor_id } = amistad;
    // Las tres deletes en paralelo, antes de eliminar la amistad
    // (solicitud_amistad usa amistad_id que quedaría NULL con ON DELETE SET NULL)
    await Promise.all([
      supabaseAdmin
        .from("notificaciones")
        .delete()
        .eq("amistad_id", amistadId)
        .eq("tipo", "solicitud_amistad"),
      supabaseAdmin
        .from("notificaciones")
        .delete()
        .eq("tipo", "amistad_aceptada")
        .eq("usuario_id", solicitante_id)
        .eq("remitente_id", receptor_id),
      supabaseAdmin
        .from("notificaciones")
        .delete()
        .eq("tipo", "amistad_aceptada")
        .eq("usuario_id", receptor_id)
        .eq("remitente_id", solicitante_id),
    ]);
  }

  await supabase
    .from("amistades")
    .delete()
    .eq("id", amistadId)
    .or(`solicitante_id.eq.${user.id},receptor_id.eq.${user.id}`);

  revalidatePath("/socios");
  revalidatePath("/notificaciones");
}

export async function getAmigosAceptados(): Promise<SocioPublico[]> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const { data: amistades } = await supabaseAdmin
    .from("amistades")
    .select("solicitante_id, receptor_id")
    .or(`solicitante_id.eq.${user.id},receptor_id.eq.${user.id}`)
    .eq("estado", "aceptada");

  if (!amistades?.length) return [];

  const amigoIds = amistades.map((a) =>
    a.solicitante_id === user.id ? a.receptor_id : a.solicitante_id
  );

  const { data: perfiles } = await supabaseAdmin
    .from("perfiles")
    .select("id, nombre, apodo, avatar_url")
    .in("id", amigoIds)
    .order("nombre");

  return (perfiles ?? []) as SocioPublico[];
}

export async function getParejaInfo(
  parejaId: string
): Promise<{ id: string; nombre: string; avatar_url: string | null } | null> {
  const { data } = await supabaseAdmin
    .from("perfiles")
    .select("id, nombre, avatar_url")
    .eq("id", parejaId)
    .single();
  return data ?? null;
}
