import {
  CORS_HEADERS,
  adminClient,
  authErrorResponse,
  getAuthContext,
  requireAdmin,
  requireSameTenant,
} from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const ctx = await getAuthContext(req);
    requireAdmin(ctx);

    const { tenant_id, title, body, data } = await req.json();
    if (!tenant_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'tenant_id, title e body são obrigatórios' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      );
    }

    requireSameTenant(ctx, tenant_id);

    const db = adminClient();
    const { data: users } = await db
      .from('users')
      .select('push_token')
      .eq('tenant_id', tenant_id)
      .eq('notify_new_events', true)
      .not('push_token', 'is', null);

    const tokens = (users ?? [])
      .map((u: { push_token: string | null }) => u.push_token)
      .filter(Boolean) as string[];

    if (tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Expo Push API aceita até 100 mensagens por request
    const chunks: string[][] = [];
    for (let i = 0; i < tokens.length; i += 100) chunks.push(tokens.slice(i, i + 100));

    let sent = 0;
    for (const chunk of chunks) {
      const messages = chunk.map((to) => ({ to, title, body, data: data ?? {}, sound: 'default' }));
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(messages),
      });
      if (res.ok) sent += chunk.length;
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (err) {
    return authErrorResponse(err);
  }
});
