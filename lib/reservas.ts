"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "./supabase-server";
import { getSession } from "./auth";
import type { Cancha, ColorCancha, Reserva, EquipamientoItem } from "@/types";

export type ReservaConCancha = Reserva & {
  canchas: { nombre: string; color: ColorCancha } | null;
  equipamiento: EquipamientoItem[];
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

  const palaCantidad = parseInt((formData.get("pala_cantidad") as string) || "0", 10);
  const pelotaCantidad = parseInt((formData.get("pelota_cantidad") as string) || "0", 10);
  const nota = ((formData.get("equipamiento_nota") as string) || "").trim() || null;

  const supabase = await createSupabaseServerClient();
  const { data: reservaData, error } = await supabase
    .from("reservas")
    .insert({
      cancha_id: canchaId,
      usuario_id: user.id,
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      estado: "confirmada",
    })
    .select("id")
    .single();

  if (error) {
    return { error: "No se pudo crear la reserva. Intentá de nuevo." };
  }

  const items = [
    palaCantidad > 0 && { item: "pala", cantidad: palaCantidad },
    pelotaCantidad > 0 && { item: "pelotas", cantidad: pelotaCantidad },
  ].filter(Boolean) as { item: string; cantidad: number }[];

  if (items.length > 0) {
    const { error: eqError } = await supabase
      .from("equipamiento_solicitudes")
      .insert(
        items.map((it) => ({
          reserva_id: reservaData.id,
          tipo: "equipamiento",
          item: it.item,
          cantidad: it.cantidad,
          nota,
        }))
      );

    if (eqError) {
      await supabase.from("reservas").delete().eq("id", reservaData.id);
      return { error: "No se pudo registrar el equipamiento. Intentá de nuevo." };
    }
  }

  redirect("/reservas");
}

export async function getMisReservas(): Promise<ReservaConCancha[]> {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("reservas")
    .select("*, canchas(nombre, color)")
    .eq("usuario_id", user.id)
    .gte("fecha", today)
    .neq("estado", "vencida")
    .order("fecha", { ascending: false })
    .order("hora_inicio", { ascending: true });

  const reservas = data ?? [];
  const reservaIds = reservas.map((r) => r.id);

  const { data: equip } = reservaIds.length
    ? await supabase
        .from("equipamiento_solicitudes")
        .select("id, reserva_id, item, cantidad, nota")
        .in("reserva_id", reservaIds)
        .eq("tipo", "equipamiento")
    : { data: [] };

  const equipMap = (equip ?? []).reduce<Record<string, EquipamientoItem[]>>(
    (acc, e) => {
      if (!acc[e.reserva_id]) acc[e.reserva_id] = [];
      acc[e.reserva_id].push({
        id: e.id,
        item: e.item,
        cantidad: e.cantidad,
        nota: e.nota,
      });
      return acc;
    },
    {}
  );

  return reservas.map((r) => ({
    ...r,
    equipamiento: equipMap[r.id] ?? [],
  })) as ReservaConCancha[];
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
