"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "./supabase-server";
import { supabaseAdmin } from "./supabase-admin";
import { getSession } from "./auth";
import type { Notificacion } from "@/types";

export async function getNotificaciones(): Promise<Notificacion[]> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("notificaciones")
    .select("*, alternativa_cancha:canchas!alternativa_cancha_id(nombre, color)")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false });

  if (!data?.length) return [];

  // Resolver perfiles de remitentes en una segunda query (FK apunta a auth.users, no a perfiles)
  const remitenteIds = [
    ...new Set(
      data
        .filter((n) => n.remitente_id)
        .map((n) => n.remitente_id as string)
    ),
  ];

  const remitenteMap = new Map<string, { id: string; nombre: string; avatar_url: string | null }>();
  if (remitenteIds.length > 0) {
    const { data: perfiles } = await supabaseAdmin
      .from("perfiles")
      .select("id, nombre, avatar_url")
      .in("id", remitenteIds);
    for (const p of perfiles ?? []) {
      remitenteMap.set(p.id, p);
    }
  }

  return data.map((n) => ({
    ...n,
    remitente: n.remitente_id ? (remitenteMap.get(n.remitente_id) ?? null) : null,
  })) as Notificacion[];
}

export async function getConteoNoLeidas(): Promise<number> {
  const user = await getSession();
  if (!user) return 0;

  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("notificaciones")
    .select("*", { count: "exact", head: true })
    .eq("usuario_id", user.id)
    .eq("leida", false);

  return count ?? 0;
}

export async function marcarTodasLeidas(): Promise<void> {
  const user = await getSession();
  if (!user) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("usuario_id", user.id)
    .eq("leida", false);
}

export async function aceptarAlternativa(
  notificacionId: string,
  _formData: FormData
) {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = await createSupabaseServerClient();

  const { data: notif } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("id", notificacionId)
    .eq("usuario_id", user.id)
    .single();

  if (!notif?.reserva_id || !notif.alternativa_cancha_id) return;
  if (notif.estado !== "pendiente") redirect("/reservas");

  const { data: reservaOrig } = await supabase
    .from("reservas")
    .select("fecha")
    .eq("id", notif.reserva_id)
    .single();

  if (!reservaOrig) return;

  // Crear nueva reserva con los datos alternativos
  await supabase.from("reservas").insert({
    cancha_id: notif.alternativa_cancha_id,
    usuario_id: user.id,
    fecha: reservaOrig.fecha,
    hora_inicio: notif.alternativa_hora_inicio,
    hora_fin: notif.alternativa_hora_fin,
    estado: "confirmada",
  });

  // Cancelar la reserva original
  await supabase
    .from("reservas")
    .update({ estado: "cancelada" })
    .eq("id", notif.reserva_id)
    .eq("usuario_id", user.id);

  await supabase
    .from("notificaciones")
    .update({ leida: true, estado: "aceptada" })
    .eq("id", notificacionId);

  revalidatePath("/notificaciones");
  revalidatePath("/reservas");
  redirect("/reservas");
}

export async function rechazarAlternativa(
  notificacionId: string,
  _formData: FormData
) {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = await createSupabaseServerClient();

  const { data: notif } = await supabase
    .from("notificaciones")
    .select("reserva_id, estado")
    .eq("id", notificacionId)
    .eq("usuario_id", user.id)
    .single();

  if (notif?.estado !== "pendiente") redirect("/reservas");

  if (notif?.reserva_id) {
    await supabase
      .from("reservas")
      .update({ estado: "cancelada" })
      .eq("id", notif.reserva_id)
      .eq("usuario_id", user.id);
  }

  await supabase
    .from("notificaciones")
    .update({ leida: true, estado: "rechazada" })
    .eq("id", notificacionId);

  revalidatePath("/notificaciones");
  revalidatePath("/reservas");
  redirect("/reservas");
}

export async function aceptarSolicitudAmistad(
  notificacionId: string,
  _formData: FormData
): Promise<void> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = await createSupabaseServerClient();

  const { data: notif } = await supabase
    .from("notificaciones")
    .select("amistad_id, estado")
    .eq("id", notificacionId)
    .eq("usuario_id", user.id)
    .single();

  if (!notif?.amistad_id || notif.estado !== "pendiente") {
    revalidatePath("/notificaciones");
    return;
  }

  const { data: amistad } = await supabase
    .from("amistades")
    .update({ estado: "aceptada" })
    .eq("id", notif.amistad_id)
    .eq("receptor_id", user.id)
    .select("solicitante_id")
    .single();

  if (amistad) {
    const { data: miperfil } = await supabaseAdmin
      .from("perfiles")
      .select("nombre")
      .eq("id", user.id)
      .single();

    await supabaseAdmin.from("notificaciones").insert({
      usuario_id: amistad.solicitante_id,
      tipo: "amistad_aceptada",
      titulo: "Solicitud aceptada",
      mensaje: `${miperfil?.nombre ?? "Un socio"} aceptó tu solicitud de amistad.`,
      remitente_id: user.id,
    });
  }

  await supabase
    .from("notificaciones")
    .update({ estado: "aceptada", leida: true })
    .eq("id", notificacionId);

  revalidatePath("/notificaciones");
  revalidatePath("/socios");
}

export async function rechazarSolicitudAmistad(
  notificacionId: string,
  _formData: FormData
): Promise<void> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = await createSupabaseServerClient();

  const { data: notif } = await supabase
    .from("notificaciones")
    .select("amistad_id, estado, remitente_id")
    .eq("id", notificacionId)
    .eq("usuario_id", user.id)
    .single();

  if (!notif?.amistad_id || notif.estado !== "pendiente") {
    revalidatePath("/notificaciones");
    return;
  }

  const { data: miperfil } = await supabaseAdmin
    .from("perfiles")
    .select("nombre")
    .eq("id", user.id)
    .single();

  const solicitanteId = notif.remitente_id;

  await Promise.all([
    supabase
      .from("amistades")
      .update({ estado: "rechazada" })
      .eq("id", notif.amistad_id)
      .eq("receptor_id", user.id),
    supabase
      .from("notificaciones")
      .update({ estado: "rechazada", leida: true })
      .eq("id", notificacionId),
    solicitanteId
      ? supabaseAdmin.from("notificaciones").insert({
          usuario_id: solicitanteId,
          tipo: "amistad_rechazada",
          titulo: "Solicitud de amistad rechazada",
          mensaje: `${miperfil?.nombre ?? "Un socio"} rechazó tu solicitud de amistad`,
          remitente_id: user.id,
        })
      : Promise.resolve(),
  ]);

  revalidatePath("/notificaciones");
}

export async function aceptarSolicitudPareja(
  notificacionId: string,
  remitenteId: string,
  _formData: FormData
): Promise<void> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  // Leer perfil del receptor para saber si ya tiene pareja aceptada
  const { data: receptorPerfil } = await supabaseAdmin
    .from("perfiles")
    .select("pareja_id, pareja_estado, nombre")
    .eq("id", user.id)
    .single();

  const anteriorParejaId =
    receptorPerfil?.pareja_estado === "aceptada" &&
    receptorPerfil.pareja_id !== remitenteId
      ? receptorPerfil.pareja_id
      : null;

  // Si había una pareja previa, limpiarla antes de crear el nuevo vínculo
  if (anteriorParejaId) {
    await Promise.all([
      supabaseAdmin
        .from("perfiles")
        .update({ pareja_id: null, pareja_estado: null })
        .eq("id", anteriorParejaId)
        .eq("pareja_id", user.id),
      supabaseAdmin.from("notificaciones").insert({
        usuario_id: anteriorParejaId,
        tipo: "pareja_eliminada",
        titulo: "Pareja eliminada",
        mensaje: `${receptorPerfil?.nombre ?? "Un socio"} ya no es tu pareja favorita`,
        remitente_id: user.id,
      }),
      supabaseAdmin
        .from("notificaciones")
        .delete()
        .eq("usuario_id", anteriorParejaId)
        .eq("tipo", "pareja_aceptada")
        .eq("remitente_id", user.id),
    ]);
  }

  // Vincular nueva pareja
  await Promise.all([
    supabaseAdmin
      .from("perfiles")
      .update({ pareja_id: remitenteId, pareja_estado: "aceptada" })
      .eq("id", user.id),
    supabaseAdmin
      .from("perfiles")
      .update({ pareja_estado: "aceptada" })
      .eq("id", remitenteId),
    supabaseAdmin
      .from("notificaciones")
      .update({ estado: "aceptada", leida: true })
      .eq("id", notificacionId),
  ]);

  await supabaseAdmin.from("notificaciones").insert({
    usuario_id: remitenteId,
    tipo: "pareja_aceptada",
    titulo: "Solicitud de pareja aceptada",
    mensaje: `${receptorPerfil?.nombre ?? "Un socio"} aceptó ser tu pareja favorita 🎾`,
    remitente_id: user.id,
  });

  revalidatePath("/notificaciones");
  revalidatePath("/perfil");
}

export async function rechazarSolicitudPareja(
  notificacionId: string,
  remitenteId: string,
  _formData: FormData
): Promise<void> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const { data: miperfil } = await supabaseAdmin
    .from("perfiles")
    .select("nombre")
    .eq("id", user.id)
    .single();

  await Promise.all([
    supabaseAdmin
      .from("perfiles")
      .update({ pareja_id: null, pareja_estado: null })
      .eq("id", remitenteId),
    supabaseAdmin
      .from("notificaciones")
      .update({ estado: "rechazada", leida: true })
      .eq("id", notificacionId),
    supabaseAdmin.from("notificaciones").insert({
      usuario_id: remitenteId,
      tipo: "pareja_rechazada",
      titulo: "Solicitud de pareja rechazada",
      mensaje: `${miperfil?.nombre ?? "Un socio"} rechazó tu solicitud de pareja favorita`,
      remitente_id: user.id,
    }),
  ]);

  revalidatePath("/notificaciones");
  revalidatePath("/perfil");
}
