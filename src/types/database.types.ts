export type UserRole = 'productor' | 'reciclador' | 'gestor' | 'admin';

export type SolicitudStatus = 'pendiente' | 'aceptada' | 'rechazada' | 'completada';

export interface Profile {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  telefono?: string;
  direccion?: string;
  created_at: string;
  updated_at: string;
}

export interface Residuo {
  id: string;
  productor_id: string;
  tipo: string;
  cantidad_kg: number;
  descripcion?: string;
  disponible: boolean;
  fecha_generacion: string;
  created_at: string;
  updated_at: string;
  productor?: Profile;
}

export interface Solicitud {
  id: string;
  residuo_id: string;
  solicitante_id: string;
  productor_id: string;
  status: SolicitudStatus;
  mensaje?: string;
  fecha_recoleccion?: string;
  created_at: string;
  updated_at: string;
  residuo?: Residuo;
  solicitante?: Profile;
  productor?: Profile;
}

export interface Transaccion {
  id: string;
  solicitud_id: string;
  cantidad_procesada_kg: number;
  notas?: string;
  fecha_completado: string;
  created_at: string;
  solicitud?: Solicitud;
}

export interface Metrica {
  total_residuos_kg: number;
  total_entregas: number;
  total_productores: number;
  total_gestores: number;
  residuos_mes_actual: number;
  entregas_mes_actual: number;
}

export interface Database {
  public: {
    Tables: any;
  };
}
