import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = { title: 'Crear cuenta · TaskFlow AI' };

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
