import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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

  const updateAction = updateEvento.bind(null, id);
  const deleteAction = deleteEvento.bind(null, id);

  return (
    <div className="p-8">
      <BackButton href="/eventos" label="Voltar para Eventos" />
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-semibold">Editar evento</h1>
          <p className="text-stone-400 text-sm mt-1 truncate">{evento.titulo}</p>
        </div>
        <a
          href={`/eventos/${id}/inscritos`}
          className="shrink-0 text-sm bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Ver inscritos →
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
