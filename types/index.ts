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
  estado: "pendiente" | "confirmada" | "cancelada" | "vencida";
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

export interface Perfil {
  id: string;
  nombre: string;
  telefono: string;
  rol: "admin" | "jugador";
  created_at: string;
}
