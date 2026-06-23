"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "./supabase-server";
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

  return (data ?? []) as Notificacion[];
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
