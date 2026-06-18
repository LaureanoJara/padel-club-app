"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "./supabase-server";
import { getSession } from "./auth";
import type { Cancha, Reserva } from "@/types";

export type ReservaConCancha = Reserva & {
  canchas: { nombre: string } | null;
};

export type ReservaState = { error?: string } | undefined;

export async function getCanchas(): Promise<Cancha[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("canchas")
    .select("*")
    .eq("activa", true)
    .order("nombre");
  return data ?? [];
}

export async function getHorariosOcupados(
  canchaId: string,
  fecha: string
): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("reservas")
    .select("hora_inicio")
    .eq("cancha_id", canchaId)
    .eq("fecha", fecha)
    .neq("estado", "cancelada");
  return data?.map((r) => r.hora_inicio as string) ?? [];
}

export async function crearReserva(
  prevState: ReservaState,
  formData: FormData
): Promise<ReservaState> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const canchaId = formData.get("cancha_id") as string;
  const fecha = formData.get("fecha") as string;
  const horaInicio = formData.get("hora_inicio") as string;
  const horaFin = formData.get("hora_fin") as string;

  if (!canchaId || !fecha || !horaInicio || !horaFin) {
    return { error: "Seleccioná una cancha, fecha y horario para continuar." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reservas").insert({
    cancha_id: canchaId,
    usuario_id: user.id,
    fecha,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    estado: "confirmada",
  });

  if (error) {
    return { error: "No se pudo crear la reserva. Intentá de nuevo." };
  }

  redirect("/reservas");
}

export async function getMisReservas(): Promise<ReservaConCancha[]> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("reservas")
    .select("*, canchas(nombre)")
    .eq("usuario_id", user.id)
    .order("fecha", { ascending: false })
    .order("hora_inicio", { ascending: true });

  return (data as ReservaConCancha[]) ?? [];
}

export async function cancelarReserva(reservaId: string, _formData: FormData) {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("reservas")
    .update({ estado: "cancelada" })
    .eq("id", reservaId)
    .eq("usuario_id", user.id);

  revalidatePath("/reservas");
}
