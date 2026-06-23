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

export type TipoNotificacion =
  | "confirmada"
  | "rechazada"
  | "propuesta_alternativa"
  | "solicitud_amistad"
  | "amistad_aceptada"
  | "amistad_rechazada"
  | "solicitud_pareja"
  | "pareja_aceptada"
  | "pareja_eliminada"
  | "pareja_rechazada";

export type EstadoAmistad =
  | "sin_relacion"
  | "solicitud_enviada"
  | "solicitud_recibida"
  | "amigos";

export interface SocioPublico {
  id: string;
  nombre: string;
  apodo?: string | null;
  posicion?: "drive" | "reves" | "ambas" | null;
  avatar_url?: string | null;
  pala?: string | null;
  edad?: number | null;
  altura?: number | null;
  pareja_id?: string | null;
  pareja_estado?: "pendiente" | "aceptada" | null;
  categoria?: "1era" | "2da" | "3era" | "4ta" | "5ta" | "6ta" | "7ma" | "8va" | null;
}

export interface SocioConAmistad extends SocioPublico {
  amistad_id?: string | null;
  estado_amistad: EstadoAmistad;
}

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
  amistad_id: string | null;
  remitente_id: string | null;
  remitente: { id: string; nombre: string; avatar_url: string | null } | null;
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
  pareja_id?: string | null;
  pareja_estado?: "pendiente" | "aceptada" | null;
  categoria?: "1era" | "2da" | "3era" | "4ta" | "5ta" | "6ta" | "7ma" | "8va" | null;
  created_at: string;
}
