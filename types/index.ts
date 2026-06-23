export type ColorCancha = "azul" | "violeta" | "roja";

export interface Cancha {
  id: string;
  nombre: string;
  color: ColorCancha;
  activa: boolean;
  created_at: string;
}

export interface Reserva {
  id: string;
  cancha_id: string;
  usuario_id: string | null;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: "pendiente" | "confirmada" | "cancelada" | "rechazada" | "vencida";
  reserva_manual: boolean;
  nombre_visitante: string | null;
  created_at: string;
}

export interface EquipamientoItem {
  id: string;
  item: string;
  cantidad: number;
  nota: string | null;
}

export type TipoNotificacion = "confirmada" | "rechazada" | "propuesta_alternativa";

export type EstadoNotificacion = "pendiente" | "aceptada" | "rechazada";

export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  reserva_id: string | null;
  alternativa_cancha_id: string | null;
  alternativa_hora_inicio: string | null;
  alternativa_hora_fin: string | null;
  leida: boolean;
  estado: EstadoNotificacion;
  created_at: string;
  alternativa_cancha: { nombre: string; color: ColorCancha } | null;
}

export interface Perfil {
  id: string;
  nombre: string;
  telefono: string;
  rol: "admin" | "jugador";
  apodo?: string;
  edad?: number;
  altura?: number;
  posicion?: "drive" | "reves" | "ambas";
  pala?: string;
  avatar_url?: string;
  created_at: string;
}
