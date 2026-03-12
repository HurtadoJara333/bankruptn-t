import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirige al login por defecto
  // El middleware manejará la redirección al dashboard si ya hay sesión
  redirect('/login');
}