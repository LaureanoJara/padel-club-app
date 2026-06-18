export interface Cancha {
  id: string;
  nombre: string;
  descripcion: string;
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
  estado: "pendiente" | "confirmada" | "cancelada";
  reserva_manual: boolean;
  nombre_visitante: string | null;
  created_at: string;
}

export interface Perfil {
  id: string;
  nombre: string;
  telefono: string;
  rol: "admin" | "jugador";
  created_at: string;
}
