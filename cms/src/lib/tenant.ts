import { headers } from 'next/headers';
import { createAdminClient } from './supabase/server';

export interface TenantBranding {
  id: string;
  nome: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
}

const INOVACAO_PRAY: TenantBranding = {
  id: '',
  nome: 'Inovacao Pray',
  slug: 'inovacao-pray',
  logo_url: null,
  primary_color: '#F59E0B',
  secondary_color: '#78350F',
};

async function fetchBrandingById(tenantId: string): Promise<TenantBranding> {
  const db = createAdminClient();
  const { data } = await db
    .from('tenants')
    .select('id, nome, slug, logo_url, primary_color, secondary_color')
    .eq('id', tenantId)
    .single();
  return data ?? INOVACAO_PRAY;
}

// Branding para a página de login e superadmin:
// 1. Header x-tenant-id (injetado pelo proxy via subdomínio)
// 2. NEXT_PUBLIC_CMS_TENANT_ID (env var para deploy dedicado)
// 3. Inovacao Pray (painel superadmin padrão)
export async function getCmsBranding(): Promise<TenantBranding> {
  const hdrs = await headers();
  const tenantId = hdrs.get('x-tenant-id') ?? process.env.NEXT_PUBLIC_CMS_TENANT_ID;
  if (!tenantId) return INOVACAO_PRAY;
  return fetchBrandingById(tenantId);
}

// Branding do usuário logado (dashboard/sidebar)
export async function getUserTenantBranding(tenantId: string | null): Promise<TenantBranding> {
  if (!tenantId) return INOVACAO_PRAY;
  return fetchBrandingById(tenantId);
}
