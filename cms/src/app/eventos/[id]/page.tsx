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
      <div className="mb-8">
        <h1 className="text-white text-2xl font-semibold">Editar evento</h1>
        <p className="text-stone-400 text-sm mt-1 truncate">{evento.titulo}</p>
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
