import { createClient } from 'jsr:@supabase/supabase-js@2';

export type UserRole = 'superadmin' | 'admin' | 'member' | 'visitor';

export interface AuthContext {
  userId: string;
  tenantId: string;
  role: UserRole;
  isLider: boolean;
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

// Valida o JWT e retorna o contexto do usuário (role, tenant, is_lider)
export async function getAuthContext(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new AuthError('Token não informado', 401);

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) throw new AuthError('Token inválido ou expirado', 401);

  const { data: profile, error: profileError } = await userClient
    .from('users')
    .select('tenant_id, role, is_lider')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) throw new AuthError('Perfil não encontrado', 403);

  return {
    userId: user.id,
    tenantId: profile.tenant_id,
    role: profile.role as UserRole,
    isLider: profile.is_lider,
  };
}

// Lança erro se o usuário não tiver um dos roles informados
export function requireRole(ctx: AuthContext, ...roles: UserRole[]): void {
  if (!roles.includes(ctx.role)) {
    throw new AuthError(`Requer papel: ${roles.join(' ou ')}`, 403);
  }
}

// admin ou superadmin
export function requireAdmin(ctx: AuthContext): void {
  requireRole(ctx, 'admin', 'superadmin');
}

// apenas superadmin (dono do produto)
export function requireSuperAdmin(ctx: AuthContext): void {
  requireRole(ctx, 'superadmin');
}

// líder de célula/grupo (ou admin/superadmin passam automaticamente)
export function requireLider(ctx: AuthContext): void {
  if (ctx.role === 'admin' || ctx.role === 'superadmin') return;
  if (!ctx.isLider) throw new AuthError('Requer líder ou admin', 403);
}

// garante que o usuário pertence ao tenant solicitado (superadmin é isento)
export function requireSameTenant(ctx: AuthContext, tenantId: string): void {
  if (ctx.role === 'superadmin') return;
  if (ctx.tenantId !== tenantId) throw new AuthError('Acesso negado a este tenant', 403);
}

// Converte AuthError (ou qualquer erro) em Response JSON
export function authErrorResponse(err: unknown): Response {
  if (err instanceof AuthError) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.status,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
  console.error(err);
  return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// Retorna o client com service role (para operações que bypassam RLS)
export function adminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}
