import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRoleName(rol: string): string {
  const roles: Record<string, string> = {
    productor: 'Productor',
    reciclador: 'Reciclador',
    gestor: 'Gestor',
    admin: 'Administrador',
  };
  return roles[rol] || rol;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    aceptada: 'bg-blue-100 text-blue-800',
    rechazada: 'bg-red-100 text-red-800',
    completada: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusName(status: string): string {
  const statuses: Record<string, string> = {
    pendiente: 'Pendiente',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    completada: 'Completada',
  };
  return statuses[status] || status;
}
