import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PalavraForm } from '@/components/PalavraForm';
import { BackButton } from '@/components/BackButton';
import { updatePalavra, deletePalavra } from '../actions';

export default async function EditarPalavraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: palavra } = await supabase
    .from('palavras').select('*').eq('id', id).single();

  if (!palavra) notFound();

  const updateAction = updatePalavra.bind(null, id);
  const deleteAction = deletePalavra.bind(null, id);

  return (
    <div className="p-8">
      <BackButton href="/palavras" label="Voltar para Palavras" />
      <div className="mb-8">
        <h1 className="text-white text-2xl font-semibold">Editar palavra</h1>
        <p className="text-stone-400 text-sm mt-1 truncate">{palavra.titulo}</p>
      </div>
      <PalavraForm
        palavra={palavra}
        action={updateAction}
        submitLabel="Salvar alterações"
        onDelete={deleteAction}
      />
    </div>
  );
}
