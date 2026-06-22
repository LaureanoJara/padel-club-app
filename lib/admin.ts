"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "./supabase-admin";
import { getSession } from "./auth";
import type { Cancha, ColorCancha, EquipamientoItem } from "@/types";

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type ReservaAdmin = {
  id: string;
  cancha_id: string;
  usuario_id: string | null;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: "pendiente" | "confirmada" | "cancelada" | "vencida";
  reserva_manual: boolean;
  nombre_visitante: string | null;
  created_at: string;
  canchas: { nombre: string; color: ColorCancha } | null;
  perfil_nombre: string;
  usuario_email: string;
};

export type ReservaManualState = { error?: string } | undefined;

export type CanchaConInfo = Cancha & { reservas_futuras: number };

export type CanchaState = { error?: string } | undefined;

export type SocioAdmin = {
  id: string;
  nombre: string;
  telefono: string | null;
  rol: "admin" | "socio";
  created_at: string;
  email: string;
};

// ─── Guard ──────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const { data: perfil } = await supabaseAdmin
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "admin") redirect("/");
  return user;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function getResumenHoy() {
  await requireAdmin();

  const today = new Date().toISOString().split("T")[0];

  const [{ data: reservasHoy }, { data: todasCanchas }] = await Promise.all([
    supabaseAdmin
      .from("reservas")
      .select("*, canchas(nombre, color)")
      .eq("fecha", today)
      .neq("estado", "cancelada")
      .neq("estado", "vencida")
      .order("hora_inicio"),
    supabaseAdmin.from("canchas").select("id").eq("activa", true),
  ]);

  const userIds = [
    ...new Set(
      (reservasHoy ?? [])
        .filter((r) => !r.reserva_manual && r.usuario_id)
        .map((r) => r.usuario_id as string)
    ),
  ];

  const { data: perfiles } = userIds.length
    ? await supabaseAdmin.from("perfiles").select("id, nombre").in("id", userIds)
    : { data: [] };

  const perfilesMap = Object.fromEntries(
    (perfiles ?? []).map((p) => [p.id, p.nombre as string])
  );

  const canchasOcupadas = new Set(
    (reservasHoy ?? []).map((r) => r.cancha_id)
  ).size;
  const totalCanchas = todasCanchas?.length ?? 0;

  return {
    totalReservasHoy: reservasHoy?.length ?? 0,
    canchasOcupadas,
    canchasLibres: totalCanchas - canchasOcupadas,
    reservasHoy: (reservasHoy ?? []).map((r) => ({
      ...r,
      perfil_nombre: r.reserva_manual
        ? ((r.nombre_visitante as string | null) ?? "Sin nombre")
        : (perfilesMap[r.usuario_id as string] ?? "Sin nombre"),
    })),
  };
}

// ─── Reservas ────────────────────────────────────────────────────────────────

export async function getTodasLasReservas(
  fecha?: string,
  canchaId?: string,
  incluirHistorial = false
): Promise<ReservaAdmin[]> {
  await requireAdmin();
  const today = new Date().toISOString().split("T")[0];

  let query = supabaseAdmin
    .from("reservas")
    .select("*, canchas(nombre, color)")
    .order("fecha", { ascending: false })
    .order("hora_inicio", { ascending: true });

  if (!incluirHistorial) {
    query = query.gte("fecha", today).neq("estado", "vencida");
  }

  if (fecha) query = query.eq("fecha", fecha);
  if (canchaId) query = query.eq("cancha_id", canchaId);

  const [{ data: reservas }, { data: authData }] = await Promise.all([
    query,
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (!reservas?.length) return [];

  const userIds = [
    ...new Set(
      reservas
        .filter((r) => !r.reserva_manual && r.usuario_id)
        .map((r) => r.usuario_id as string)
    ),
  ];

  const { data: perfiles } = userIds.length
    ? await supabaseAdmin.from("perfiles").select("id, nombre").in("id", userIds)
    : { data: [] };

  const perfilesMap = Object.fromEntries(
    (perfiles ?? []).map((p) => [p.id, p.nombre as string])
  );

  const emailsMap = Object.fromEntries(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? ""])
  );

  return reservas.map((r) => ({
    ...r,
    perfil_nombre: r.reserva_manual
      ? ((r.nombre_visitante as string | null) ?? "Sin nombre")
      : (perfilesMap[r.usuario_id as string] ?? "Sin nombre"),
    usuario_email: r.usuario_id ? (emailsMap[r.usuario_id] ?? "") : "",
  })) as ReservaAdmin[];
}

export async function cancelarReservaAdmin(
  reservaId: string,
  _formData: FormData
) {
  await requireAdmin();
  await supabaseAdmin
    .from("reservas")
    .update({ estado: "cancelada" })
    .eq("id", reservaId);
  revalidatePath("/admin/reservas");
  revalidatePath("/admin");
}

export async function eliminarReserva(
  reservaId: string,
  _formData: FormData
) {
  await requireAdmin();
  await supabaseAdmin.from("reservas").delete().eq("id", reservaId);
  revalidatePath("/admin/reservas");
}

export async function eliminarReservasCanceladas(_formData: FormData) {
  await requireAdmin();
  await supabaseAdmin.from("reservas").delete().eq("estado", "cancelada");
  revalidatePath("/admin/reservas");
}

// ─── Canchas ─────────────────────────────────────────────────────────────────

export async function getCanchasAdmin(): Promise<CanchaConInfo[]> {
  await requireAdmin();

  const today = new Date().toISOString().split("T")[0];
  const { data: canchas } = await supabaseAdmin
    .from("canchas")
    .select("*")
    .order("nombre");

  if (!canchas?.length) return [];

  return Promise.all(
    canchas.map(async (c) => {
      const { count } = await supabaseAdmin
        .from("reservas")
        .select("*", { count: "exact", head: true })
        .eq("cancha_id", c.id)
        .neq("estado", "cancelada")
        .gte("fecha", today);
      return { ...c, reservas_futuras: count ?? 0 } as CanchaConInfo;
    })
  );
}

export async function crearCancha(
  prevState: CanchaState,
  formData: FormData
): Promise<CanchaState> {
  await requireAdmin();

  const nombre = (formData.get("nombre") as string)?.trim();
  const color = (formData.get("color") as string)?.trim();

  if (!nombre) return { error: "El nombre de la cancha es requerido." };
  if (!color) return { error: "Seleccioná un color para la cancha." };

  const { error } = await supabaseAdmin.from("canchas").insert({
    nombre,
    color,
    activa: true,
  });

  if (error) return { error: "No se pudo crear la cancha. Intentá de nuevo." };

  revalidatePath("/admin/canchas");
  redirect("/admin/canchas");
}

export async function toggleCanchaActiva(
  canchaId: string,
  activa: boolean,
  _formData: FormData
) {
  await requireAdmin();
  await supabaseAdmin
    .from("canchas")
    .update({ activa: !activa })
    .eq("id", canchaId);
  revalidatePath("/admin/canchas");
}

export async function eliminarCancha(
  canchaId: string,
  _formData: FormData
) {
  await requireAdmin();
  await supabaseAdmin.from("canchas").delete().eq("id", canchaId);
  revalidatePath("/admin/canchas");
}

// ─── Socios ──────────────────────────────────────────────────────────────────

export async function getTodosLosSocios(): Promise<SocioAdmin[]> {
  await requireAdmin();

  const [{ data: perfiles }, { data: authData }] = await Promise.all([
    supabaseAdmin
      .from("perfiles")
      .select("id, nombre, telefono, rol, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const emailsMap = Object.fromEntries(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? ""])
  );

  return (perfiles ?? []).map((p) => ({
    ...p,
    email: emailsMap[p.id] ?? "",
  })) as SocioAdmin[];
}

export async function cambiarRolUsuario(
  usuarioId: string,
  nuevoRol: "socio" | "admin",
  _formData: FormData
) {
  const currentUser = await requireAdmin();

  // Un admin no puede quitarse su propio rol
  if (currentUser.id === usuarioId && nuevoRol === "socio") return;

  await supabaseAdmin
    .from("perfiles")
    .update({ rol: nuevoRol })
    .eq("id", usuarioId);

  revalidatePath("/admin/socios");
}

// ─── Equipamiento ────────────────────────────────────────────────────────────

export async function getEquipamientoReserva(
  reservaId: string
): Promise<EquipamientoItem[]> {
  await requireAdmin();
  const { data } = await supabaseAdmin
    .from("equipamiento_solicitudes")
    .select("id, item, cantidad, nota")
    .eq("reserva_id", reservaId)
    .eq("tipo", "equipamiento");
  return (data ?? []) as EquipamientoItem[];
}

export async function getEquipamientoParaReservas(
  reservaIds: string[]
): Promise<Record<string, EquipamientoItem[]>> {
  await requireAdmin();
  if (!reservaIds.length) return {};
  const { data } = await supabaseAdmin
    .from("equipamiento_solicitudes")
    .select("reserva_id, id, item, cantidad, nota")
    .in("reserva_id", reservaIds)
    .eq("tipo", "equipamiento");
  return (data ?? []).reduce<Record<string, EquipamientoItem[]>>((acc, e) => {
    if (!acc[e.reserva_id]) acc[e.reserva_id] = [];
    acc[e.reserva_id].push({ id: e.id, item: e.item, cantidad: e.cantidad, nota: e.nota });
    return acc;
  }, {});
}

// ─── Reservas manuales ───────────────────────────────────────────────────────

export async function crearReservaManual(
  prevState: ReservaManualState,
  formData: FormData
): Promise<ReservaManualState> {
  await requireAdmin();

  const nombreVisitante = (formData.get("nombre_visitante") as string)?.trim();
  const canchaId = formData.get("cancha_id") as string;
  const fecha = formData.get("fecha") as string;
  const horaInicio = formData.get("hora_inicio") as string;
  const horaFin = formData.get("hora_fin") as string;

  if (!nombreVisitante) return { error: "El nombre del visitante es requerido." };
  if (!canchaId || !fecha || !horaInicio || !horaFin) {
    return { error: "Seleccioná cancha, fecha y horario para continuar." };
  }

  const { error } = await supabaseAdmin.from("reservas").insert({
    cancha_id: canchaId,
    usuario_id: null,
    fecha,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    estado: "confirmada",
    reserva_manual: true,
    nombre_visitante: nombreVisitante,
  });

  if (error) return { error: "No se pudo registrar la reserva. Intentá de nuevo." };

  redirect("/admin/reservas");
}
