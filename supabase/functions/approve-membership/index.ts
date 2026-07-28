import {
  CORS_HEADERS,
  adminClient,
  authErrorResponse,
  getAuthContext,
  requireAdmin,
  requireSameTenant,
} from '../_shared/auth.ts';

// POST /functions/v1/approve-membership
// Body: { request_id: string, action: 'aprovado' | 'negado' }
// Requer: admin ou superadmin do mesmo tenant
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const ctx = await getAuthContext(req);
    requireAdmin(ctx);

    const { request_id, action } = await req.json();
    if (!request_id || !['aprovado', 'negado'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'request_id e action (aprovado|negado) são obrigatórios' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      );
    }

    const db = adminClient();

    const { data: solicitacao, error } = await db
      .from('membership_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (error || !solicitacao) {
      return new Response(JSON.stringify({ error: 'Solicitação não encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    requireSameTenant(ctx, solicitacao.tenant_id);

    await db
      .from('membership_requests')
      .update({ status: action })
      .eq('id', request_id);

    // Se aprovado, promove o usuário de visitor para member
    if (action === 'aprovado') {
      await db
        .from('users')
        .update({ role: 'member' })
        .eq('id', solicitacao.user_id)
        .eq('role', 'visitor');
    }

    return new Response(JSON.stringify({ ok: true, action }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (err) {
    return authErrorResponse(err);
  }
});
