import { redirect, notFound } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { EventoForm } from '@/components/EventoForm';
import { BackButton } from '@/components/BackButton';
import { updateEvento, deleteEvento } from '../actions';

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: evento } = await supabase
    .from('eventos').select('*').eq('id', id).single();

  if (!evento) notFound();

  const db = createAdminClient();
  const { count } = await db
    .from('inscricoes')
    .select('id', { count: 'exact', head: true })
    .eq('evento_id', id)
    .neq('status', 'cancelado');

  const updateAction = updateEvento.bind(null, id);
  const deleteAction = deleteEvento.bind(null, id);

  return (
    <div className="p-8 max-w-2xl">
      <BackButton href="/eventos" label="Voltar para Eventos" />
      <div className="mt-4 mb-6">
        <h1 className="text-white text-2xl font-semibold">{evento.titulo}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-stone-900 border border-stone-800 rounded-xl p-1 w-fit">
        <span className="px-5 py-2 rounded-lg bg-stone-700 text-white text-sm font-medium">
          Editar
        </span>
        <a
          href={`/eventos/${id}/inscritos`}
          className="px-5 py-2 rounded-lg text-stone-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          Inscritos
          {(count ?? 0) > 0 && (
            <span className="bg-amber-500 text-stone-950 text-xs font-bold px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </a>
      </div>

      <EventoForm
        evento={evento}
        action={updateAction}
        submitLabel="Salvar alterações"
        onDelete={deleteAction}
      />
    </div>
  );
}
