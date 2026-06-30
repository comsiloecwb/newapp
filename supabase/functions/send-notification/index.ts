import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { church_id, title, body, data } = await req.json();
    if (!church_id || !title || !body) {
      return new Response(JSON.stringify({ error: 'church_id, title e body são obrigatórios' }), { status: 400 });
    }

    // verify caller is admin of this church
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });

    const { data: profile } = await userClient.from('profiles').select('role, church_id').eq('id', user.id).single();
    if (!profile || profile.church_id !== church_id || !['admin', 'editor'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Sem permissão' }), { status: 403 });
    }

    // fetch all push tokens for this church using service role
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('push_token')
      .eq('church_id', church_id)
      .not('push_token', 'is', null);

    const tokens = (profiles ?? [])
      .map((p: { push_token: string | null }) => p.push_token)
      .filter(Boolean) as string[];

    if (tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    // send via Expo Push API in chunks of 100
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
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
