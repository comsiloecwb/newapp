-- Garante que a tabela inscricoes está na publication do Realtime.
-- Necessário para o app assistir mudanças de status via postgres_changes
-- (ex: InscricaoScreen esperando o webhook do Stripe ou o admin confirmar manualmente).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'inscricoes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE inscricoes;
  END IF;
END $$;
