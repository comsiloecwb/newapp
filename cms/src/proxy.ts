import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Subdomínios reservados que não mapeiam para nenhuma igreja
const RESERVED = new Set(['www', 'cms', 'app', 'api', 'admin', 'mail']);

function parseTenantSlug(request: NextRequest): string | null {
  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0]; // remove porta
  const parts = hostname.split('.');

  // Ex: siloe.localhost → ['siloe', 'localhost'] → slug = 'siloe'
  // Ex: localhost         → ['localhost']          → sem slug
  // Ex: siloe.cms.inovacaopray.com → ['siloe', 'cms', ...] → slug = 'siloe'
  // Ex: cms.inovacaopray.com       → ['cms', ...]          → reservado
  if (parts.length < 2) return null;

  const sub = parts[0];
  if (RESERVED.has(sub)) return null;

  return sub;
}

async function fetchTenantBySlug(slug: string): Promise<{ id: string; nome: string } | null> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tenants?slug=eq.${encodeURIComponent(slug)}&select=id,nome&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] ?? null;
}

export async function proxy(request: NextRequest) {
  // --- Roteamento por subdomínio ---
  const slug = parseTenantSlug(request);
  let tenantId: string | null = null;

  if (slug) {
    const tenant = await fetchTenantBySlug(slug);
    // Slug desconhecido: trata como superadmin (Inovacao Pray) em vez de redirecionar
    if (tenant) tenantId = tenant.id;
  }

  // Injeta o tenant no header para os Server Components lerem
  const requestHeaders = new Headers(request.headers);
  if (tenantId) requestHeaders.set('x-tenant-id', tenantId);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  // --- Auth via Supabase SSR ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/login')) {
    if (user) return NextResponse.redirect(new URL('/dashboard', request.url));
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
  }

  if (pathname.startsWith('/superadmin') && profile.role !== 'superadmin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
