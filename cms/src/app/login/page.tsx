import { Suspense } from 'react';
import { getCmsBranding } from '@/lib/tenant';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  const branding = await getCmsBranding();

  return (
    <Suspense>
      <LoginForm
        nome={branding.nome}
        logoUrl={branding.logo_url}
        primaryColor={branding.primary_color}
      />
    </Suspense>
  );
}
