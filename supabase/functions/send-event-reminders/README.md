# Lembretes de evento (próxima sprint)

**pg_cron** (a cada minuto ou intervalo curto):

1. `SELECT * FROM scheduled_notifications WHERE sent_at IS NULL AND send_at <= now()`
2. Para cada linha (`reminder_24h` / `reminder_1h`):
   - Buscar `push_tokens` dos inscritos (`registrations`) com `notify_event_reminders = true`
   - Enviar via Expo Push API — mensagem: "Seu evento começa em breve."
3. Para `event_created`: notificar membros da igreja com `notify_new_events = true`
4. Atualizar `sent_at = now()` na linha processada

Ao publicar evento, inserir linhas em `scheduled_notifications` com `send_at` = `start_at - 24h`, `start_at - 1h` e imediato para `event_created`.
